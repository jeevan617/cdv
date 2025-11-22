import os
import torch
from torch.utils.data import DataLoader
from torch import nn, optim
from tqdm import tqdm
from torchvision import transforms, models
from PIL import Image
import pandas as pd

# ------------------------------
# CONFIG
# ------------------------------
CSV_FILE = "pateint.csv"               # CSV with filename + 14 features
IMAGE_FOLDER = "Processed_Images"      # Folder with renamed images
CHECKPOINT_FOLDER = "checkpoints"      # Folder to save model
os.makedirs(CHECKPOINT_FOLDER, exist_ok=True)

BATCH_SIZE = 16
EPOCHS = 10
LR = 1e-4

DEVICE = "mps" if torch.backends.mps.is_available() else "cpu"
print("Using device:", DEVICE)

# ------------------------------
# DATASET
# ------------------------------
class RetinaDataset(torch.utils.data.Dataset):
    def __init__(self, csv_file, image_folder):
        self.df = pd.read_csv(csv_file)
        self.image_folder = image_folder
        self.features = ['age','sex','cp','trestbps','chol','fbs','restecg',
                         'thalach','exang','oldpeak','slope','ca','thal','target']
        self.transform = transforms.Compose([
            transforms.Resize((224,224)),
            transforms.ToTensor(),
            transforms.Normalize([0.5, 0.5, 0.5],[0.5, 0.5, 0.5])
        ])
    
    def __len__(self):
        return len(self.df)
    
    def __getitem__(self, idx):
        row = self.df.iloc[idx]
        img_path = os.path.join(self.image_folder, row['filename'])
        image = Image.open(img_path).convert("RGB")
        image = self.transform(image)
        
        # Convert all feature columns to numeric, replace NaN with 0
        labels = row[self.features].apply(pd.to_numeric, errors='coerce').fillna(0).values
        labels = torch.tensor(labels, dtype=torch.float)
        
        return image, labels

# ------------------------------
# MODEL
# ------------------------------
class MultiOutputResNet(nn.Module):
    def __init__(self, num_outputs=14):
        super().__init__()
        self.backbone = models.resnet50(weights=models.ResNet50_Weights.IMAGENET1K_V2)
        in_features = self.backbone.fc.in_features
        self.backbone.fc = nn.Identity()
        self.fc = nn.Sequential(
            nn.Linear(in_features, 256),
            nn.ReLU(),
            nn.Linear(256, num_outputs)
        )
    
    def forward(self, x):
        x = self.backbone(x)
        x = self.fc(x)
        return x

# ------------------------------
# TRAINING
# ------------------------------
dataset = RetinaDataset(CSV_FILE, IMAGE_FOLDER)
loader = DataLoader(dataset, batch_size=BATCH_SIZE, shuffle=True)

model = MultiOutputResNet(num_outputs=14).to(DEVICE)
criterion = nn.MSELoss()
optimizer = optim.Adam(model.parameters(), lr=LR)

for epoch in range(EPOCHS):
    model.train()
    total_loss = 0
    loop = tqdm(loader, desc=f"Epoch {epoch+1}/{EPOCHS}")
    
    for images, labels in loop:
        images, labels = images.to(DEVICE), labels.to(DEVICE)
        optimizer.zero_grad()
        outputs = model(images)
        loss = criterion(outputs, labels)
        loss.backward()
        optimizer.step()
        total_loss += loss.item()
        loop.set_postfix(loss=loss.item())
    
    print(f"Epoch {epoch+1}/{EPOCHS}  Total Loss: {total_loss/len(loader):.4f}")

# Save model
torch.save(model.state_dict(), os.path.join(CHECKPOINT_FOLDER, "retina_multioutput.pth"))
print("✅ Training finished! Model saved in 'checkpoints/'")