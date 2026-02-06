# Deployment Guide - Space Shooter Game

Complete instructions for deploying your game to GitHub Pages, Netlify, or Vercel.

## 📋 Pre-Deployment Checklist

- [ ] Test game locally in different browsers (Chrome, Firefox, Safari, Edge)
- [ ] Test on mobile devices (iPhone, Android)
- [ ] Test PWA installation on all platforms
- [ ] Verify offline functionality (disable network)
- [ ] Check high score saving and persistence
- [ ] Test sound toggle functionality
- [ ] Verify dark/light mode switching
- [ ] Test all game states (menu, playing, paused, gameover)

## 🌐 Option 1: Deploy on GitHub Pages (Fastest)

### Prerequisites
- GitHub account
- Git installed on your computer
- VS Code or terminal

### Steps

**1. Create a GitHub Repository**
```bash
# Go to github.com and click "New repository"
# Name: space-shooter (or any name)
# Choose Public
# Click "Create repository"
```

**2. Initialize Git & Push Files**
```bash
cd /path/to/your/space-shooter/folder

# Initialize git
git init

# Add remote repository (replace with your GitHub URL)
git remote add origin https://github.com/YOUR-USERNAME/space-shooter.git

# Add all files
git add .

# Commit files
git commit -m "Initial commit - Space Shooter arcade game"

# Push to GitHub
git push -u origin main
```

**3. Enable GitHub Pages**
- Go to your repository on GitHub
- Click "Settings" → "Pages"
- Under "Source", select "Deploy from a branch"
- Select "main" branch
- Click "Save"
- Wait 1-2 minutes for deployment

**4. Access Your Game**
```
Your game is live at: https://YOUR-USERNAME.github.io/space-shooter/
```

### GitHub Pages Configuration

Your game automatically works with the following structure:
- `index.html` at root (entry point)
- All assets load with relative paths (`./css/`, `./js/`, etc.)
- Service Worker works automatically

✅ **Free hosting, auto-HTTPS, custom domain support**

---

## Option 2: Deploy on Netlify (Recommended)

### Why Netlify?
- Better build configuration
- Instant redeploys
- Better PWA support
- Environmental variables support
- Edge functions (advanced)

### Method A: Connect GitHub (Best Practice)

**1. Create Netlify Account**
- Go to netlify.com
- Click "Sign up"
- Choose "Sign up with GitHub"
- Authorize Netlify

**2. Create New Site**
- Click "New site from Git"
- Choose "GitHub"
- Search for your "space-shooter" repository
- Click "Deploy site"

**3. Build Settings** (usually auto-detected)
- Build command: (leave empty)
- Publish directory: `.`
- Click "Deploy"

**4. Access Your Game**
```
Your game is live at: https://your-site-name.netlify.app
```

**5. Custom Domain** (Optional)
- Go to Site settings → Domain management
- Click "Add custom domain"
- Follow domain setup instructions

### Method B: Drag & Drop Deploy

**1. Prepare Files**
- Ensure all files are in one folder
- Include: `index.html`, `manifest.json`, `service-worker.js`, `css/`, `js/`

**2. Deploy**
- Go to netlify.com (already signed in)
- Drag your folder into the drop zone
- Wait for automatic deployment
- Share link appears instantly!

### Netlify Configuration File (Optional)

Create `netlify.toml` for advanced settings:

```toml
[build]
  command = ""
  publish = "."

[[headers]]
  for = "/*"
  [headers.values]
    Cache-Control = "public, max-age=3600"

[[headers]]
  for = "/service-worker.js"
  [headers.values]
    Cache-Control = "public, max-age=0, must-revalidate"

[[headers]]
  for = "/manifest.json"
  [headers.values]
    Cache-Control = "public, max-age=0, must-revalidate"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

✅ **Easiest setup, excellent PWA support, free tier generous**

---

## Option 3: Deploy on Vercel

### Prerequisites
- Vercel account (vercel.com)
- GitHub connected

### Steps

**1. Create Vercel Account**
- Go to vercel.com
- Click "Sign up"
- Choose "Continue with GitHub"
- Authorize Vercel

**2. Deploy Project**
- Click "New Project"
- Select your "space-shooter" repository
- Click "Import"
- Framework preset: "Other"
- Click "Deploy"

**3. Configure (if needed)**
- Build command: (leave empty)
- Output directory: `.`
- Environment variables: (none needed)

**4. Access Your Game**
```
Your game is live at: https://space-shooter.vercel.app
```

### Vercel Configuration (Optional)

Create `vercel.json`:

```json
{
  "buildCommand": "",
  "outputDirectory": ".",
  "framework": null,
  "headers": [
    {
      "source": "/service-worker.js",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=0, must-revalidate"
        }
      ]
    },
    {
      "source": "/manifest.json",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=0, must-revalidate"
        }
      ]
    }
  ]
}
```

✅ **Fast deployment, excellent performance, free tier good**

---

## 🏠 Option 4: Self-Hosted / Own Server

### Using Apache / Nginx

**Apache (.htaccess)**
```apache
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteBase /
    RewriteRule ^index\.html$ - [L]
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule . /index.html [L]
</IfModule>

<FilesMatch "\.(js|css|html|json)$">
    Header set Cache-Control "public, max-age=3600"
</FilesMatch>

<FilesMatch "service-worker\.js">
    Header set Cache-Control "public, max-age=0, must-revalidate"
</FilesMatch>

<FilesMatch "manifest\.json">
    Header set Cache-Control "public, max-age=0, must-revalidate"
</FilesMatch>
```

**Nginx**
```nginx
server {
    listen 80;
    server_name spaceshooter.com;
    root /var/www/space-shooter;
    
    # Enable gzip compression
    gzip on;
    gzip_types text/html text/css text/javascript application/javascript application/json;
    
    # Set cache headers
    location ~* \.(js|css|html)$ {
        expires 1h;
        add_header Cache-Control "public, max-age=3600";
    }
    
    # Don't cache service worker
    location = /service-worker.js {
        add_header Cache-Control "public, max-age=0, must-revalidate";
    }
    
    # Don't cache manifest
    location = /manifest.json {
        add_header Cache-Control "public, max-age=0, must-revalidate";
    }
    
    # Serve index.html for any 404
    error_page 404 /index.html;
}
```

---

## Testing PWA Installation

### Android
1. Deploy game to live URL
2. Open URL in Chrome browser
3. Look for install prompt (or tap menu ⋮ → "Install app")
4. Game installs to home screen
5. Tap icon to play in fullscreen

### iOS
1. Deploy game to live URL
2. Open URL in Safari browser
3. Tap Share button (bottom of screen)
4. Tap "Add to Home Screen"
5. Name: "Space Shooter"
6. Tap "Add"
7. Game installs to home screen

### Desktop (Windows/Mac)
1. Deploy game to live URL
2. Open in Chrome/Edge
3. Look for install icon (usually in address bar)
4. Click install
5. Game launches as standalone application

---

## ✅ Post-Deployment Checklist

- [ ] Game loads and plays
- [ ] All UI elements work
- [ ] Sound effects work
- [ ] High scores save and persist
- [ ] Dark/Light mode toggle works
- [ ] PWA installs successfully
- [ ] Game works offline
- [ ] All game states function correctly
- [ ] Mobile controls work on touch devices
- [ ] No console errors

## 🐛 Troubleshooting

### Game doesn't load
- Check browser console for errors (F12)
- Verify all files are uploaded
- Clear browser cache (Ctrl+Shift+Delete)
- Try different browser

### Service Worker issues
- Check "Application" tab in DevTools
- Unregister all Service Workers
- Clear cache storage
- Restart browser

### PWA won't install
- Ensure HTTPS (all hosts use this)
- Verify manifest.json loads (check Network tab)
- Verify service-worker.js loads
- Try in Chrome/Edge (best support)

### High scores not saving
- Check localStorage in DevTools (Application tab)
- Verify browser allows localStorage
- Check browser isn't in private/incognito mode

---

## Quick Deploy Command Reference

```bash
# GitHub Pages (after pushing to GitHub)
# Just enable Pages in repository settings - automatic!

# Netlify (local)
npm install netlify-cli -g
netlify deploy --dir=.

# Vercel (local)
npm install vercel -g
vercel

# Python HTTP Server (local testing)
python -m http.server 8000
# Open http://localhost:8000

# Node.js HTTP Server (local testing)
npx http-server
# Open http://localhost:8080
```

---

## Performance Tips

1. **Minify Code** (Optional)
   - Use online minifiers or build tools
   - Reduces file size by 30-40%

2. **Enable GZIP Compression**
   - Most hosts do this automatically
   - Reduces transfer size by 70%

3. **Set Cache Headers**
   - Service Worker handles caching
   - Static assets cache for 1 hour

4. **Use CDN** (Advanced)
   - Netlify/Vercel use global CDN
   - GitHub Pages uses GitHub's CDN

---

## 🎉 Success!

Your Space Shooter game is now live and playable worldwide!

**Share your game:**
- Tweet the link
- Add to GitHub profile README
- Post on gaming forums
- Challenge friends!

**Next Steps:**
- Add more features
- Collect feedback
- Monitor usage
- Iterate and improve!

Happy gaming!
