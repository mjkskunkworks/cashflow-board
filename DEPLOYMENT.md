# Cloudflare Pages Deployment Guide

## Quick Deploy Steps

### Option 1: Git Integration (Recommended - Automatic)
If your Cloudflare Pages project is connected to GitHub, deployments happen automatically when you push to the main branch.

**Steps:**
1. Make sure all your changes are committed:
   ```bash
   git add .
   git commit -m "Your commit message"
   ```

2. Push to GitHub:
   ```bash
   git push origin main
   ```

3. Cloudflare Pages will automatically:
   - Detect the push
   - Build your project using `npm run build`
   - Deploy the `dist` folder
   - Make it live at your Cloudflare Pages URL

**To check your Cloudflare Pages dashboard:**
- Go to: https://dash.cloudflare.com/
- Navigate to: Workers & Pages → Your project name
- View deployment status and logs

---

### Option 2: Wrangler CLI (Manual)
If you prefer manual deployments or don't have Git integration set up:

**Prerequisites:**
1. Install Wrangler CLI:
   ```bash
   npm install -g wrangler
   ```

2. Login to Cloudflare:
   ```bash
   wrangler login
   ```

**Deployment Steps:**
1. Build your project:
   ```bash
   npm run build
   ```

2. Deploy to Cloudflare Pages:
   ```bash
   wrangler pages deploy dist
   ```

**Note:** You'll need your Cloudflare account ID and project name. If you don't have a `wrangler.toml` file, you can create one or pass the project name as a flag:
   ```bash
   wrangler pages deploy dist --project-name=cashflow-board
   ```

---

## Build Configuration

Your project is configured with:
- **Build command:** `npm run build`
- **Build output directory:** `dist` (Vite default)
- **Node version:** Check Cloudflare Pages settings (usually auto-detected)

---

## Finding Your Cloudflare Pages Project

If you don't remember your Cloudflare Pages project details:

1. **Check Cloudflare Dashboard:**
   - Visit: https://dash.cloudflare.com/
   - Go to: Workers & Pages → Pages
   - Look for a project named "cashflow-board" or similar

2. **Check GitHub Integration:**
   - Your GitHub repo: https://github.com/mjkskunkworks/cashflow-board
   - Cloudflare Pages might be connected to this repo automatically

3. **Check Your Email:**
   - Look for Cloudflare Pages deployment notifications

---

## Troubleshooting

**If deployments fail:**
- Check build logs in Cloudflare Pages dashboard
- Ensure `npm run build` works locally
- Verify Node.js version matches Cloudflare Pages environment
- Check that all dependencies are in `package.json` (not just devDependencies)

**If you need to set up Cloudflare Pages from scratch:**
1. Go to Cloudflare Dashboard → Workers & Pages → Create application → Pages
2. Connect your GitHub repository: `mjkskunkworks/cashflow-board`
3. Configure:
   - Framework preset: Vite
   - Build command: `npm run build`
   - Build output directory: `dist`
   - Root directory: `/` (or leave default)

---

## Quick Reference Commands

```bash
# Build locally to test
npm run build

# Check build output
ls -la dist/

# Deploy via Git (automatic)
git add .
git commit -m "Deploy latest changes"
git push origin main

# Deploy via Wrangler (manual)
npm run build
wrangler pages deploy dist --project-name=cashflow-board
```
