"""
Script to add 'Consult Doctor' button to result.html files
"""
import re

def add_consult_button_cardiovascular():
    file_path = r'c:\Users\MADHU\cdv\cardivascular\templates\result.html'
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Find and replace the actions div
    old_pattern = r'<a href="/advice/\{\{ data\.level \}\}" class="btn primary">View Advice</a>'
    new_content = '''<a href="/advice/{{ data.level }}" class="btn">View Advice</a>
                <a href="http://localhost:3000/consultation?riskLevel={{ 'low' if data.level <= 1 else 'medium' if data.level == 2 else 'high' }}&predictionType=cardiovascular"
                    class="btn primary">Consult Doctor</a>'''
    
    content = re.sub(old_pattern, new_content, content)
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print("✅ Added Consult Doctor button to cardiovascular/templates/result.html")

def add_consult_button_diabetic():
    file_path = r'c:\Users\MADHU\cdv\Diabetic\templates\result.html'
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Find and replace the actions div
    old_pattern = r'<a href="/advice/\{\{ data\.level \}\}" class="btn primary">View Advice</a>'
    new_content = '''<a href="/advice/{{ data.level }}" class="btn">View Advice</a>
                <a href="http://localhost:3000/consultation?riskLevel={{ 'low' if data.level <= 1 else 'medium' if data.level == 2 else 'high' }}&predictionType=diabetic"
                    class="btn primary">Consult Doctor</a>'''
    
    content = re.sub(old_pattern, new_content, content)
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print("✅ Added Consult Doctor button to Diabetic/templates/result.html")

if __name__ == "__main__":
    print("Adding Consult Doctor buttons to result pages...")
    add_consult_button_cardiovascular()
    add_consult_button_diabetic()
    print("\n✅ Done! Restart the Python servers for changes to take effect.")
