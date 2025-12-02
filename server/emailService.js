const nodemailer = require('nodemailer');
require('dotenv').config();

// Create transporter
const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

const sendAlertEmail = async (to, additionalEmail, riskLevel, predictionType, recommendations) => {
    try {
        const recipients = [to];
        if (additionalEmail) recipients.push(additionalEmail);

        const riskColor = riskLevel === 'high' ? '#ef4444' : riskLevel === 'medium' ? '#f59e0b' : '#10b981';

        const mailOptions = {
            from: process.env.EMAIL_FROM || 'Health Prediction System <noreply@healthprediction.com>',
            to: recipients.join(', '),
            subject: `Health Prediction Result: ${riskLevel.toUpperCase()} Risk Detected`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <h1 style="color: #1e293b; margin: 0;">Health Prediction Result</h1>
                        <p style="color: #64748b;">${predictionType.charAt(0).toUpperCase() + predictionType.slice(1)} Analysis</p>
                    </div>
                    
                    <div style="background-color: ${riskColor}20; border-left: 5px solid ${riskColor}; padding: 20px; border-radius: 5px; margin-bottom: 30px;">
                        <h2 style="color: ${riskColor}; margin: 0 0 10px 0;">Risk Level: ${riskLevel.toUpperCase()}</h2>
                        <p style="margin: 0; color: #334155;">Based on the analysis of your health metrics.</p>
                    </div>

                    <div style="margin-bottom: 30px;">
                        <h3 style="color: #1e293b; border-bottom: 2px solid #f1f5f9; padding-bottom: 10px;">Recommended Actions</h3>
                        <ul style="color: #475569; line-height: 1.6;">
                            ${recommendations.map(rec => `<li><strong>${rec.title}:</strong> ${rec.description}</li>`).join('')}
                        </ul>
                    </div>

                    <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #94a3b8; font-size: 12px;">
                        <p>This is an automated alert from your Health Prediction System.</p>
                        <p>Please consult with a medical professional for accurate diagnosis.</p>
                    </div>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Email sent:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('❌ Error sending email:', error);
        return { success: false, error: error.message };
    }
};

module.exports = { sendAlertEmail };
