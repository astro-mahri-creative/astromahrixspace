import React from "react";
import "./AdminCredentials.css";

export default function AdminCredentials() {
  const credentials = [
    {
      name: "astro_admin",
      email: "astro_admin@astromahri.space",
      password: "cosmic_cms_2025",
      role: "CMS Admin",
    },
    {
      name: "Astro Mahri",
      email: "admin@astromahri.space",
      password: "cosmicadmin2024",
      role: "System Admin",
    },
  ];

  const handleCopyCredentials = (creds) => {
    const text = `Email: ${creds.email}\nPassword: ${creds.password}`;
    navigator.clipboard.writeText(text).then(() => {
      alert("Credentials copied to clipboard!");
    });
  };

  return (
    <div className="admin-credentials">
      <div className="credentials-header">
        <h3>🚀 Admin Access Credentials</h3>
        <p>Use these credentials to access the CMS Admin Panel</p>
      </div>

      <div className="credentials-list">
        {credentials.map((cred, index) => (
          <div key={index} className="credential-card">
            <div className="credential-info">
              <h4>{cred.name}</h4>
              <p className="role">{cred.role}</p>
              <div className="credential-details">
                <div className="credential-field">
                  <label>Email:</label>
                  <code>{cred.email}</code>
                </div>
                <div className="credential-field">
                  <label>Password:</label>
                  <code>{cred.password}</code>
                </div>
              </div>
            </div>
            <div className="credential-actions">
              <button
                onClick={() => handleCopyCredentials(cred)}
                className="btn btn-sm btn-outline"
                title="Copy credentials"
              >
                <i className="fa fa-copy"></i> Copy
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="access-instructions">
        <h4>🎯 Quick Access Steps:</h4>
        <ol>
          <li>Copy credentials above</li>
          <li>Click "Sign In" in the top navigation</li>
          <li>Paste email and password</li>
          <li>After login, click "Admin" → "CMS Control"</li>
          <li>Enjoy the cosmic CMS interface! 🌟</li>
        </ol>
      </div>

      <div className="security-note">
        <p>
          <strong>🔒 Security Note:</strong> These are development credentials.
          In production, use secure passwords and proper authentication.
        </p>
      </div>
    </div>
  );
}
