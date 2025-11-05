# AgriCatalog Deployment Guide

## Complete Step-by-Step Guide to Deploy on GitHub Pages

### Prerequisites
- Git installed on your computer
- Node.js and npm installed (download from nodejs.org)
- GitHub account
- Your repository: https://github.com/projectquicksilver/digi-agri-knowledge-hub

---

## 🚀 Deployment Steps

### Step 1: Set Up Your Local Project

```bash
# Clone your repository (if you haven't already)
git clone https://github.com/projectquicksilver/digi-agri-knowledge-hub.git
cd digi-agri-knowledge-hub

# If you already have the repo, navigate to it
cd digi-agri-knowledge-hub
```

### Step 2: Initialize React App (if not already done)

**Option A: If the folder is empty or you're starting fresh:**
```bash
npx create-react-app .
```

**Option B: If folder has files, use a temporary directory:**
```bash
npx create-react-app temp-app
# Then copy necessary files over (src, public folders)
```

### Step 3: Install Required Dependencies

```bash
# Install Tailwind CSS
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init

# Install other dependencies
npm install xlsx lucide-react

# Install gh-pages for deployment
npm install --save-dev gh-pages
```

### Step 4: Replace Project Files

Copy these files to your project (I've provided them in the outputs):

1. **src/App.js** - Main application file
2. **src/App.css** - Styles with Tailwind directives
3. **tailwind.config.js** - Tailwind configuration
4. **postcss.config.js** - PostCSS configuration
5. **package.json** - Dependencies and scripts (UPDATE the homepage URL with your repo name)

### Step 5: Add Your Excel File

```bash
# Place your agrihubdb.xlsx file in the public folder
# Copy it to: public/agrihubdb.xlsx
```

**Important:** The Excel file must be in the `public` folder, NOT the `src` folder!

### Step 6: Update package.json

Make sure your `package.json` has the correct homepage:

```json
{
  "homepage": "https://projectquicksilver.github.io/digi-agri-knowledge-hub",
  ...
}
```

### Step 7: Test Locally

```bash
# Start the development server
npm start
```

This will open http://localhost:3000 in your browser. Test that:
- ✅ The page loads
- ✅ Products display correctly
- ✅ Filters work
- ✅ Images load (if URLs are valid)

### Step 8: Build the Project

```bash
# Create production build
npm run build
```

This creates a `build` folder with optimized files.

### Step 9: Deploy to GitHub Pages

```bash
# Deploy to GitHub Pages
npm run deploy
```

This command will:
1. Build your project
2. Create/update the `gh-pages` branch
3. Push the build to GitHub

### Step 10: Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings**
3. Scroll to **Pages** (left sidebar)
4. Under **Source**, select:
   - Branch: `gh-pages`
   - Folder: `/ (root)`
5. Click **Save**

### Step 11: Wait and Access

- GitHub Pages takes 1-5 minutes to deploy
- Access your site at: `https://projectquicksilver.github.io/digi-agri-knowledge-hub`

---

## 📁 Final Project Structure

```
digi-agri-knowledge-hub/
├── public/
│   ├── index.html
│   ├── agrihubdb.xlsx          ← Your Excel file HERE
│   └── favicon.ico
├── src/
│   ├── App.js                  ← Main React component
│   ├── App.css                 ← Styles
│   ├── index.js
│   └── index.css
├── package.json                ← Dependencies & scripts
├── tailwind.config.js          ← Tailwind config
├── postcss.config.js           ← PostCSS config
└── README.md
```

---

## 🔄 Updating Your Site

### To Update Product Data:
1. Update `public/agrihubdb.xlsx` with new products
2. Commit and push:
   ```bash
   git add public/agrihubdb.xlsx
   git commit -m "Update product database"
   git push origin main
   ```
3. Redeploy:
   ```bash
   npm run deploy
   ```

### To Update Code:
1. Make changes to your code
2. Test locally: `npm start`
3. Commit and push to main branch
4. Deploy: `npm run deploy`

---

## ⚠️ Common Issues and Solutions

### Issue 1: "npm command not found"
**Solution:** Install Node.js from https://nodejs.org

### Issue 2: Excel file not loading
**Solutions:**
- Make sure `agrihubdb.xlsx` is in the `public` folder
- Check the browser console for errors (F12)
- Verify the file has the correct column names

### Issue 3: Blank page after deployment
**Solutions:**
- Check `package.json` has correct homepage URL
- Verify gh-pages branch exists
- Check GitHub Pages settings are correct
- Clear browser cache

### Issue 4: Images not displaying
**Solutions:**
- Verify image URLs in Excel are valid and accessible
- Check browser console for CORS errors
- Test image URLs directly in browser

### Issue 5: "Failed to compile" errors
**Solutions:**
- Delete `node_modules` folder
- Delete `package-lock.json`
- Run `npm install` again
- Run `npm start`

---

## 🛠️ Command Cheat Sheet

```bash
# Development
npm start              # Run development server
npm run build          # Create production build
npm test               # Run tests

# Deployment
npm run deploy         # Deploy to GitHub Pages

# Git commands
git add .              # Stage all changes
git commit -m "msg"    # Commit changes
git push origin main   # Push to main branch

# Troubleshooting
npm install            # Install dependencies
rm -rf node_modules    # Remove node_modules
rm package-lock.json   # Remove lock file
```

---

## 📝 Excel File Format

Your `agrihubdb.xlsx` must have these columns:
- S.No
- Company Name
- Product Name
- Brand Name
- Description of the Product
- Product Type
- Sub-Type
- Applied Seasons
- Suitable Crops
- Benefits
- Dosage (Unit/acre)
- Application Method
- Pack Sizes
- Price Range
- Available In (States)
- Organic/Certified
- Product Image Link
- Source URL
- Notes

---

## 🎉 Success!

Once deployed, your site will be live at:
**https://projectquicksilver.github.io/digi-agri-knowledge-hub**

Users can:
- Browse products from your Excel database
- Filter by company, type, crops, brand, etc.
- View product details and images
- Switch between grid and list views
- Click links to source URLs

---

## 📧 Need Help?

If you encounter issues:
1. Check the browser console (F12 → Console tab)
2. Check GitHub Actions tab for build errors
3. Verify all files are in correct locations
4. Make sure Excel file has correct format

Happy Deploying! 🚀🌱
