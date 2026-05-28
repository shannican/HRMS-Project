const Info = require('../models/info'); 
const nodemailer = require('nodemailer'); 
 
// Setup mail transporter 
const transporter = nodemailer.createTransport({
  host: 'smtp.hostinger.com', // Ya aapke email provider ka SMTP server
  port: 465,                  // Usually 465 for SSL or 587 for TLS
  secure: true,               // true for 465, false for 587
  auth: {
    user: 'sales@hltechindia.com',
    pass: '#Sales@151090',
  },
});


// Beautiful Admin Email Template
const getAdminEmailTemplate = (formData) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Customer Inquiry</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background-color: #f5f7fa;
                color: #333;
                line-height: 1.6;
            }
            
            .container {
                max-width: 600px;
                margin: 0 auto;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                padding: 30px;
            }
            
            .email-wrapper {
                background: white;
                border-radius: 15px;
                box-shadow: 0 20px 40px rgba(0,0,0,0.1);
                overflow: hidden;
            }
            
            .header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 30px;
                text-align: center;
            }
            
            .header h1 {
                font-size: 28px;
                margin-bottom: 10px;
                font-weight: 700;
            }
            
            .header p {
                font-size: 16px;
                opacity: 0.9;
            }
            
            .content {
                padding: 40px 30px;
            }
            
            .customer-info {
                background: #f8f9ff;
                border-radius: 10px;
                padding: 25px;
                margin-bottom: 30px;
                border-left: 4px solid #667eea;
            }
            
            .info-row {
                display: flex;
                margin-bottom: 15px;
                align-items: center;
            }
            
            .info-label {
                font-weight: 600;
                color: #4a5568;
                min-width: 140px;
                font-size: 14px;
            }
            
            .info-value {
                color: #2d3748;
                font-size: 14px;
                flex: 1;
            }
            
            .project-brief {
                background: white;
                border: 2px solid #e2e8f0;
                border-radius: 8px;
                padding: 20px;
                margin-top: 20px;
            }
            
            .project-brief h3 {
                color: #667eea;
                margin-bottom: 15px;
                font-size: 18px;
            }
            
            .project-brief p {
                color: #4a5568;
                line-height: 1.6;
            }
            
            .status-badges {
                display: flex;
                gap: 10px;
                margin-top: 20px;
                flex-wrap: wrap;
            }
            
            .badge {
                padding: 8px 16px;
                border-radius: 20px;
                font-size: 12px;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            
            .badge-success {
                background: #10b981;
                color: white;
            }
            
            .badge-warning {
                background: #f59e0b;
                color: white;
            }
            
            .footer {
                background: #f7fafc;
                padding: 20px 30px;
                text-align: center;
                border-top: 1px solid #e2e8f0;
            }
            
            .footer p {
                color: #718096;
                font-size: 14px;
            }
            
            .priority-high {
                background: #fee2e2;
                border-left-color: #ef4444;
            }
            
            @media (max-width: 600px) {
                .container {
                    padding: 20px 15px;
                }
                
                .info-row {
                    flex-direction: column;
                    align-items: flex-start;
                }
                
                .info-label {
                    margin-bottom: 5px;
                }
                
                .status-badges {
                    justify-content: center;
                }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="email-wrapper">
                <div class="header">
                    <h1>🚀 New Customer Inquiry</h1>
                    <p>A potential client has submitted a project inquiry</p>
                </div>
                
                <div class="content">
                    <div class="customer-info">
                        <div class="info-row">
                            <span class="info-label">👤 Name:</span>
                            <span class="info-value"><strong>${formData.firstName}</strong></span>
                        </div>
                        
                        <div class="info-row">
                            <span class="info-label">📧 Email:</span>
                            <span class="info-value">${formData.email}</span>
                        </div>
                        
                        <div class="info-row">
                            <span class="info-label">📱 Phone:</span>
                            <span class="info-value">${formData.countryCode} ${formData.phone}</span>
                        </div>
                        
                        <div class="info-row">
                            <span class="info-label">🛠️ Service:</span>
                            <span class="info-value"><strong>${formData.service}</strong></span>
                        </div>
                        
                        <div class="info-row">
                            <span class="info-label">💰 Budget Range:</span>
                            <span class="info-value"><strong>${formData.budgetRange}</strong></span>
                        </div>
                        
                        <div class="info-row">
                            <span class="info-label">📅 Submitted:</span>
                            <span class="info-value">${new Date().toLocaleString()}</span>
                        </div>
                    </div>
                    
                    <div class="project-brief">
                        <h3>📋 Project Brief</h3>
                        <p>${formData.projectBrief}</p>
                    </div>
                    
                    <div class="status-badges">
                        <span class="badge ${formData.includesNDA ? 'badge-success' : 'badge-warning'}">
                            ${formData.includesNDA ? '✅ NDA Required' : '⚠️ No NDA'}
                        </span>
                        <span class="badge ${formData.agreeTerms ? 'badge-success' : 'badge-warning'}">
                            ${formData.agreeTerms ? '✅ Terms Agreed' : '⚠️ Terms Not Agreed'}
                        </span>
                    </div>
                </div>
                
                <div class="footer">
                    <p><strong>HL Tech India Pvt. Ltd.</strong> | CRM System</p>
                    <p>Please respond to this inquiry within 24 hours for best customer experience.</p>
                </div>
            </div>
        </div>
    </body>
    </html>
  `;
};

// Beautiful Client Auto-Reply Template
const getClientEmailTemplate = (formData) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Thank You for Your Inquiry</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background-color: #f0f2f5;
                color: #333;
                line-height: 1.6;
            }
            
            .container {
                max-width: 600px;
                margin: 0 auto;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                padding: 30px;
            }
            
            .email-wrapper {
                background: white;
                border-radius: 15px;
                box-shadow: 0 25px 50px rgba(0,0,0,0.15);
                overflow: hidden;
            }
            
            .header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 40px 30px;
                text-align: center;
                position: relative;
            }
            
            .header::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="white" opacity="0.1"/><circle cx="75" cy="75" r="1" fill="white" opacity="0.1"/><circle cx="50" cy="10" r="0.5" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
                opacity: 0.1;
            }
            
            .header-content {
                position: relative;
                z-index: 1;
            }
            
            .header h1 {
                font-size: 32px;
                margin-bottom: 15px;
                font-weight: 700;
            }
            
            .header p {
                font-size: 18px;
                opacity: 0.9;
            }
            
            .content {
                padding: 40px 30px;
            }
            
            .welcome-message {
                text-align: center;
                margin-bottom: 40px;
            }
            
            .welcome-message h2 {
                color: #2d3748;
                font-size: 28px;
                margin-bottom: 15px;
            }
            
            .welcome-message p {
                color: #4a5568;
                font-size: 16px;
                margin-bottom: 10px;
            }
            
            .inquiry-summary {
                background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
                border-radius: 12px;
                padding: 30px;
                margin: 30px 0;
                border: 1px solid #e2e8f0;
            }
            
            .inquiry-summary h3 {
                color: #667eea;
                margin-bottom: 20px;
                font-size: 20px;
                display: flex;
                align-items: center;
                gap: 10px;
            }
            
            .summary-item {
                display: flex;
                margin-bottom: 12px;
                align-items: center;
            }
            
            .summary-label {
                font-weight: 600;
                color: #4a5568;
                min-width: 120px;
                font-size: 14px;
            }
            
            .summary-value {
                color: #2d3748;
                font-size: 14px;
                flex: 1;
            }
            
            .next-steps {
                background: #f0fff4;
                border: 2px solid #10b981;
                border-radius: 12px;
                padding: 25px;
                margin: 30px 0;
            }
            
            .next-steps h3 {
                color: #065f46;
                margin-bottom: 15px;
                font-size: 18px;
            }
            
            .next-steps ul {
                list-style: none;
                padding: 0;
            }
            
            .next-steps li {
                color: #047857;
                margin-bottom: 8px;
                padding-left: 25px;
                position: relative;
            }
            
            .next-steps li::before {
                content: '✓';
                position: absolute;
                left: 0;
                color: #10b981;
                font-weight: bold;
            }
            
            .contact-info {
                background: #fef7ff;
                border: 2px solid #a855f7;
                border-radius: 12px;
                padding: 25px;
                text-align: center;
                margin: 30px 0;
            }
            
            .contact-info h3 {
                color: #6b21a8;
                margin-bottom: 15px;
                font-size: 18px;
            }
            
            .contact-info p {
                color: #7c2d92;
                margin-bottom: 8px;
            }
            
            .footer {
                background: linear-gradient(135deg, #1a202c 0%, #2d3748 100%);
                color: white;
                padding: 30px;
                text-align: center;
            }
            
            .footer h3 {
                margin-bottom: 15px;
                font-size: 24px;
            }
            
            .footer p {
                opacity: 0.8;
                margin-bottom: 8px;
            }
            
            .social-links {
                margin-top: 20px;
                display: flex;
                justify-content: center;
                gap: 15px;
            }
            
            .social-links a {
                color: white;
                text-decoration: none;
                padding: 8px 12px;
                background: rgba(255,255,255,0.1);
                border-radius: 6px;
                transition: background 0.3s ease;
            }
            
            .social-links a:hover {
                background: rgba(255,255,255,0.2);
            }
            
            @media (max-width: 600px) {
                .container {
                    padding: 20px 15px;
                }
                
                .header {
                    padding: 30px 20px;
                }
                
                .header h1 {
                    font-size: 24px;
                }
                
                .welcome-message h2 {
                    font-size: 22px;
                }
                
                .summary-item {
                    flex-direction: column;
                    align-items: flex-start;
                }
                
                .summary-label {
                    margin-bottom: 5px;
                }
                
                .social-links {
                    flex-direction: column;
                    gap: 10px;
                }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="email-wrapper">
                <div class="header">
                    <div class="header-content">
                        <h1>🎉 Thank You!</h1>
                        <p>We've received your project inquiry</p>
                    </div>
                </div>
                
                <div class="content">
                    <div class="welcome-message">
                        <h2>Hello ${formData.firstName}! 👋</h2>
                        <p>Thank you for choosing HL Tech India for your project needs.</p>
                        <p>We're excited to learn about your project and help bring your vision to life!</p>
                    </div>
                    
                    <div class="inquiry-summary">
                        <h3>📋 Your Inquiry Summary</h3>
                        
                        <div class="summary-item">
                            <span class="summary-label">Service:</span>
                            <span class="summary-value"><strong>${formData.service}</strong></span>
                        </div>
                        
                        <div class="summary-item">
                            <span class="summary-label">Budget Range:</span>
                            <span class="summary-value"><strong>${formData.budgetRange}</strong></span>
                        </div>
                        
                        <div class="summary-item">
                            <span class="summary-label">Submitted:</span>
                            <span class="summary-value">${new Date().toLocaleDateString()}</span>
                        </div>
                    </div>
                    
                    <div class="next-steps">
                        <h3>🚀 What Happens Next?</h3>
                        <ul>
                            <li>Our team will review your project requirements within 24 hours</li>
                            <li>We'll prepare a detailed proposal tailored to your needs</li>
                            <li>One of our project managers will contact you within 2-3 business days</li>
                            <li>We'll schedule a consultation call to discuss your project in detail</li>
                        </ul>
                    </div>
                    
                    <div class="contact-info">
                        <h3>📞 Need Immediate Assistance?</h3>
                        <p><strong>Email:</strong> sales@hltechindia.com</p>
                        <p><strong>Phone:</strong> +91 XXX XXX XXXX</p>
                        <p>Our team is available Monday-Friday, 9 AM - 6 PM IST</p>
                    </div>
                </div>
                
                <div class="footer">
                    <h3>HL Tech India Pvt. Ltd.</h3>
                    <p>Transforming Ideas into Digital Solutions</p>
                    <p>Web Development | Mobile Apps | Digital Marketing</p>
                    
                    <div class="social-links">
                        <a href="#">Website</a>
                        <a href="#">LinkedIn</a>
                        <a href="#">Twitter</a>
                    </div>
                </div>
            </div>
        </div>
    </body>
    </html>
  `;
};
 
exports.sendEmails = async (req, res) => { 
  try { 
    const formData = req.body; 
 
    // Save to database 
    const savedInfo = await Info.create(formData); 
 
    // Email to HL Tech team with beautiful template
    const adminMailOptions = { 
      from: 'sales@hltechindia.com', 
      to: 'sales@hltechindia.com', 
      subject: `🚀 New Customer Inquiry from ${formData.firstName} - ${formData.service}`, 
      html: getAdminEmailTemplate(formData)
    }; 
 
    // Auto-reply to client with beautiful template
    const clientMailOptions = { 
      from: 'sales@hltechindia.com', 
      to: formData.email, 
      subject: '🎉 Thank you for your inquiry – HL Tech India', 
      html: getClientEmailTemplate(formData)
    }; 
 
    await transporter.sendMail(adminMailOptions); 
    await transporter.sendMail(clientMailOptions); 
 
    res.status(200).json({ 
      message: 'Query saved and emails sent successfully',
      queryId: savedInfo._id
    }); 
  } catch (err) { 
    console.error('Email/DB Error:', err); 
    res.status(500).json({ error: 'Failed to process request' }); 
  } 
}; 
 
exports.getAllEmails = async (req, res) => { 
  try { 
    const allQueries = await Info.find().sort({ createdAt: -1 }); 
    res.status(200).json(allQueries); 
  } catch (err) { 
    res.status(500).json({ error: 'Failed to fetch queries' }); 
  } 
};