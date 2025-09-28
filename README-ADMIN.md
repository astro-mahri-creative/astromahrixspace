# 🚀 Astro Mahri Space - CMS Admin Access Guide

## 🎛️ **Admin Login Credentials**

### **Primary Admin User**

- **Username/Email**: `astro_admin@astromahri.space`
- **Password**: `cosmic_cms_2025`
- **Role**: Full Admin Access

### **Secondary Admin User**

- **Username/Email**: `admin@astromahri.space`
- **Password**: `cosmicadmin2024`
- **Role**: Full Admin Access

## 🌟 **How to Access the CMS Admin Panel**

### **Step 1: Start the Application**

Using VS Code Tasks (Recommended):

1. Press `Ctrl+Shift+P`
2. Type "Tasks: Run Task"
3. Select "Start Full Stack"

Or manually:

```bash
# Backend (Port 5000)
npm run dev

# Frontend (Port 3002)
npm start --prefix frontend
```

### **Step 2: Access the Frontend**

Open your browser and navigate to:

```
http://localhost:3002
```

### **Step 3: Login as Admin**

1. Click "Sign In" in the top navigation
2. Enter admin credentials:
   - Email: `astro_admin@astromahri.space`
   - Password: `cosmic_cms_2025`
3. Click "Sign In"

### **Step 4: Access CMS Dashboard**

Once logged in as admin, you'll see an "Admin" dropdown in the navigation:

1. Click on "Admin" dropdown
2. Select "CMS Control"
3. You'll be taken to the cosmic CMS dashboard at `/cms`

## 🎨 **CMS Features Available**

### **📊 CMS Dashboard** (`/cms`)

- Real-time content statistics
- Recent activity monitoring
- Quick action buttons
- System status indicators
- Navigation to all CMS sections

### **👨‍🎨 Artist Management** (`/cms/artists`)

- Create and manage artist profiles
- Portfolio management
- Social links and bio information
- Status publishing controls

### **🎵 Product Management** (`/cms/products`)

- Enhanced product catalog management
- Rich media and pricing controls
- Gaming unlock configurations
- Bulk operations for multiple products

### **📱 Media Library** (`/cms/media`)

- Centralized media management
- Tags and metadata organization
- Multi-format support

### **🏆 Achievement System** (`/cms/achievements`)

- Gaming achievement creation
- Unlock condition configuration
- Points and rarity settings

### **⚙️ Site Configuration** (`/cms/config`)

- Global site settings
- SEO and metadata management
- Theme and layout controls

## 🔒 **Security Features**

- **JWT Authentication**: Secure token-based authentication
- **Role-Based Access**: Admin-only route protection
- **Session Management**: Automatic logout on token expiration
- **API Security**: All CMS endpoints require admin authentication

## 🎯 **CMS API Endpoints**

All admin CMS functions are available via REST API:

```bash
# Dashboard Analytics
GET /api/cms/dashboard

# Artist Management
GET/POST/PUT/DELETE /api/cms/artists

# Product Management
GET/POST/PUT/DELETE /api/cms/products
POST /api/cms/products/bulk

# Media Management
GET/POST/PUT/DELETE /api/cms/media

# Achievement Management
GET/POST/PUT/DELETE /api/cms/achievements

# Site Configuration
GET/PUT /api/cms/config
```

## 🚨 **Troubleshooting Admin Access**

### **Can't See Admin Menu?**

- Ensure you're logged in with an admin account
- Check that `isAdmin: true` in the user record
- Clear browser cache and refresh

### **CMS Routes Not Working?**

- Verify both frontend (3002) and backend (5000) are running
- Check browser console for JavaScript errors
- Ensure database connection is active

### **Authentication Issues?**

- Verify JWT token is being sent in requests
- Check token expiration in browser localStorage
- Re-login if token has expired

### **Database Connection Issues?**

- Ensure MongoDB is running
- Check connection string in environment variables
- Verify seeder has run with admin users

## 🔄 **Reset Admin Password**

If you need to reset the admin password:

1. **Via Database**: Direct MongoDB update
2. **Via Seeder**: Run `npm run data:destroy` then `npm run data:import`
3. **Via API**: Use user management endpoints

## 🎮 **Gaming Integration**

The CMS integrates with the gaming system:

- **Achievement Unlocks**: Configure unlock conditions
- **Content Rewards**: Set score-based content access
- **Dynamic Content**: Real-time content visibility based on game progress

## 🚀 **Production Deployment**

For production deployment:

1. Set secure admin passwords in environment variables
2. Configure proper JWT secrets
3. Enable HTTPS for all admin access
4. Set up proper backup procedures
5. Configure monitoring and logging

---

**🌟 Welcome to the Astro Mahri Space CMS!**
Manage your cosmic content from the year 2121 with this retro-futuristic interface.
