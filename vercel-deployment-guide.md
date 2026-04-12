# Deployment Guide - Vercel + MongoDB Atlas

## **Part 1: Setup MongoDB Atlas (Database)**

1. **Create MongoDB Atlas Account**
   - Go to https://www.mongodb.com/cloud/atlas
   - Sign up (free tier available)
   - Create a new project

2. **Create a Database Cluster**
   - Choose "M0 Sandbox" (free tier, 512 MB storage)
   - Select your region (closest to your users)
   - Wait for cluster to deploy (5-10 minutes)

3. **Create Database User**
   - Go to "Database Access"
   - Click "Add New Database User"
   - Username: (your choice)
   - Password: (strong password - copy it!)
   - Click "Add New Database User"

4. **Get Connection String**
   - Go to "Database Deployment" > "Connect"
   - Click "Drivers"
   - Copy the connection string: `mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority`
   - Replace `<password>` with your actual password

5. **Whitelist Access**
   - Go to "Network Access"
   - Click "Add IP Address"
   - Select "Allow Access from Anywhere" (0.0.0.0/0) for development
   - Or add specific IPs if you want more security

---

## **Part 2: Deploy Backend to Vercel**

### **A. Install Vercel CLI (if not already installed)**
```bash
npm install -g vercel
```

### **B. Prepare Backend for Deployment**

1. **Update server.js to handle Vercel**
   - Your `server.js` looks good, but make sure it exports the app
   - If it doesn't have `app.listen()`, add it:

```javascript
// At the end of server.js
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Export for Vercel
module.exports = app;
```

### **C. Deploy Backend**

1. **Navigate to Backend folder**
```bash
cd Backend
```

2. **Login to Vercel**
```bash
vercel login
```

3. **Deploy**
```bash
vercel
```

Follow the prompts:
- Project name: `web-truyen-backend` (or your choice)
- Framework: `Other`
- Root directory: `.` (current)
- Build command: `npm install`
- Output directory: `./`

### **D. Add Environment Variables to Vercel Backend**

1. Go to https://vercel.com → Your Project → Settings → Environment Variables
2. Add these variables:

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | Your MongoDB connection string |
| `JWT_SECRET` | A secure random string (use `openssl rand -base64 32`) |
| `ALLOWED_ORIGINS` | `https://your-frontend.vercel.app` (add after deploying frontend) |
| `R2_ACCOUNT_ID` | Your Cloudflare R2 account ID |
| `R2_ACCESS_KEY_ID` | Your R2 access key |
| `R2_SECRET_ACCESS_KEY` | Your R2 secret key |
| `R2_BUCKET_NAME` | Your R2 bucket name |
| `SENDGRID_API_KEY` | Your SendGrid API key (if using email) |
| `VNPAY_MERCHANT_ID` | Your VNPay merchant ID |
| `VNPAY_HASH_SECRET` | Your VNPay secret |
| `NODE_ENV` | `production` |

3. **Redeploy after adding variables:**
```bash
vercel --prod
```

---

## **Part 3: Deploy Frontend to Vercel**

### **A. Update Frontend Configuration**

1. **Update `Client/src/api/apiClient.js`**
   - Make sure the API base URL uses your backend URL:

```javascript
const API_BASE_URL = process.env.VITE_API_BASE_URL || 'http://localhost:5000';
// When deployed: https://your-backend.vercel.app
```

2. **Create `.env.production` in Client folder**
```
VITE_API_BASE_URL=https://your-backend.vercel.app
```

### **B. Deploy Frontend**

1. **Navigate to Client folder**
```bash
cd Client
```

2. **Deploy to Vercel**
```bash
vercel
```

Follow the prompts:
- Project name: `web-truyen-client` (or your choice)
- Framework: `Vite`
- Root directory: `.`
- Build command: `npm run build`
- Output directory: `dist`

### **C. Update Frontend URL in Backend Environment Variables**

1. After frontend is deployed, go to backend project settings
2. Update `ALLOWED_ORIGINS` to include your frontend URL:
```
https://your-frontend.vercel.app
```

3. Redeploy backend:
```bash
vercel --prod
```

---

## **Verification Checklist**

- [ ] MongoDB Atlas cluster is running
- [ ] Backend deployed to Vercel
- [ ] Frontend deployed to Vercel
- [ ] Environment variables are set correctly
- [ ] CORS is configured for frontend URL
- [ ] Test API call from frontend: `curl https://your-backend.vercel.app/api/comics`
- [ ] Login works on deployed site
- [ ] Database operations work (create/read/update)

---

## **Common Issues & Solutions**

### **CORS Error**
- **Issue**: Frontend can't reach backend
- **Solution**: Make sure `ALLOWED_ORIGINS` includes your frontend URL

### **Database Connection Failed**
- **Issue**: Can't connect to MongoDB
- **Solution**: 
  - Check `DATABASE_URL` is correct
  - Verify IP whitelist in MongoDB Atlas includes Vercel IPs (use 0.0.0.0/0)

### **Timeout Issues**
- **Issue**: Vercel functions timeout (API too slow)
- **Solution**: Optimize database queries, add indexes, or upgrade to paid Vercel plan

### **Build Failed**
- **Issue**: Deployment fails
- **Solution**: Check logs on Vercel dashboard, ensure all dependencies are in package.json

---

## **Next Steps (Optional)**

- Set up custom domain
- Enable auto-deploy on GitHub push
- Set up SSL certificates
- Configure CDN for static assets
- Add monitoring/logging

