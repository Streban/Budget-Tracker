# 🚀 Deploying to Vercel with PIN Authentication

Your Budget Tracker app is now ready to deploy to Vercel with secure PIN authentication! Here's how to set it up:

## 📋 Prerequisites

- A Vercel account (free tier works fine)
- Your project pushed to GitHub/GitLab/Bitbucket
- The Vercel CLI installed (optional but recommended)

## 🔧 Step 1: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard
1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "New Project"
3. Import your Budget Tracker repository
4. Click "Deploy" (it will deploy but the PIN won't work yet)

### Option B: Deploy via CLI
```bash
# Install Vercel CLI globally
npm install -g vercel

# Deploy your project
vercel

# Follow the prompts to link your project
```

## 🔐 Step 2: Set Up Environment Variable

### Via Vercel Dashboard (Recommended)
1. Go to your project dashboard on Vercel
2. Click on the **"Settings"** tab
3. Navigate to **"Environment Variables"** in the sidebar
4. Click **"Add New"**
5. Set the following:
   - **Name**: `BUDGET_TRACKER_PIN`
   - **Value**: `8981` (or your preferred 4-digit PIN)
   - **Environment**: Select **Production**, **Preview**, and **Development**
6. Click **"Save"**

### Via Vercel CLI
```bash
# Add environment variable for all environments
vercel env add BUDGET_TRACKER_PIN

# When prompted:
# - Enter your PIN (e.g., 8981)
# - Select all environments (Production, Preview, Development)
```

## 🔄 Step 3: Redeploy

After adding the environment variable, you need to redeploy:

### Via Dashboard
1. Go to your project's **"Deployments"** tab
2. Click the **"..."** menu on the latest deployment
3. Select **"Redeploy"**

### Via CLI
```bash
vercel --prod
```

## ✅ Step 4: Test Your Deployment

1. Visit your Vercel deployment URL
2. You should see the PIN authentication screen
3. Enter your PIN (default: `8981`)
4. You should be able to access all Budget Tracker screens

## 🔒 Security Features on Vercel

✅ **Environment variables are encrypted at rest**  
✅ **PIN is never exposed in client-side code**  
✅ **Server-side validation via API routes**  
✅ **Automatic HTTPS on all deployments**  
✅ **24-hour session persistence**

## 🛠️ Changing Your PIN

To change your PIN after deployment:

1. Go to your Vercel project settings
2. Navigate to Environment Variables
3. Find `BUDGET_TRACKER_PIN`
4. Click the "..." menu and select "Edit"
5. Enter your new 4-digit PIN
6. Save and redeploy

## 🌐 Custom Domain (Optional)

To use a custom domain:

1. In your Vercel project settings
2. Go to the "Domains" section
3. Add your custom domain
4. Follow the DNS configuration instructions

## 📱 Preview Deployments

Every branch and pull request will automatically get its own preview deployment with the same PIN protection!

## 🔍 Troubleshooting

### PIN Authentication Not Working
- Ensure `BUDGET_TRACKER_PIN` environment variable is set
- Check that you've redeployed after adding the variable
- Verify the variable is set for the correct environment (Production/Preview)

### Environment Variable Not Found
```bash
# Check if environment variable is set
vercel env ls

# Pull environment variables to local development
vercel env pull
```

### API Route Issues
- Make sure your API route is at `app/api/auth/route.ts`
- Check the Vercel Functions logs in your dashboard

## 📊 Vercel Features Your App Uses

- **Serverless Functions**: For PIN authentication API
- **Environment Variables**: For secure PIN storage
- **Automatic Deployments**: From your Git repository
- **Preview Deployments**: For testing changes
- **Edge Network**: For fast global access

## 💡 Pro Tips

1. **Multiple PINs**: You can create different PINs for different environments
2. **Team Access**: Use Vercel teams to manage access to environment variables
3. **Monitoring**: Use Vercel Analytics to monitor your app usage
4. **Performance**: Your app benefits from Vercel's global CDN

---

Your Budget Tracker is now securely deployed on Vercel with PIN authentication! 🎉

The PIN `8981` will protect all your financial data, and the authentication will persist for 24 hours per session. 