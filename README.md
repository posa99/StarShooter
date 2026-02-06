# Space Shooter - Arcade Game

A complete, fully-functional arcade game built with vanilla HTML, CSS, and JavaScript. Play on desktop with keyboard controls, or on mobile with touch controls. Install as a Progressive Web App (PWA) for offline play on Android, iOS, and desktop!

## Features

### Gameplay
- **Classic Arcade Experience**: Destroy alien invaders and earn points
- **Progressive Difficulty**: Waves get harder with faster enemies and different types
- **Three Enemy Types**: Basic, Fast, and Tank enemies with unique properties
- **Score System**: Earn points for each enemy destroyed
- **Health System**: Lose health when enemies reach you - game over at 0 HP
- **Wave System**: Advance through increasingly challenging waves

### Controls
- **Desktop**: 
  - Arrow Keys or WASD to move
  - Mouse position to aim
  - Spacebar to shoot
- **Mobile**: 
  - Tap and hold to move
  - Tap zone to shoot (or auto-shoot while moving)

### User Interface
- **Responsive Design**: Works on mobile, tablet, and desktop
- **Dark/Light Mode**: Toggle between themes in settings
- **High Score Tracking**: Automatically saves your top 10 scores
- **Sound Effects**: Toggle on/off, with procedurally-generated sounds
- **Game States**: Start, Playing, Paused, Game Over screens

### Progressive Web App (PWA)
- **Install on Any Device**: Add to home screen on Android/iOS or desktop
- **Offline Play**: Game works completely offline
- **App-Like Experience**: Fullscreen, no browser UI (on mobile)
- **Fast Loading**: Service Worker caching for instant launch
- **Touch-Friendly**: Optimized for all screen sizes

## 📁 Project Structure

```
space-shooter/
├── index.html              # Main HTML file
├── manifest.json           # PWA configuration
├── service-worker.js       # Offline caching & PWA features
├── css/
│   └── style.css           # All styles (responsive, dark/light mode)
├── js/
│   ├── game.js            # Main game engine & loop
│   ├── player.js          # Player/ship class
│   ├── enemy.js           # Enemy class with types
│   ├── bullet.js          # Projectile class
│   └── utils.js           # Utilities & audio system
├── assets/
│   ├── icons/             # App icons (auto-generated SVGs)
│   └── sounds/            # Optional: audio files
└── README.md              # This file
```

## Getting Started

### Run Locally
1. Clone or download the game files
2. Open `index.html` in a modern web browser
3. Click "START GAME" to begin playing!

### Deploy Online

#### GitHub Pages
```bash
# 1. Create a repository on GitHub
# 2. Push all files to the repository
git add .
git commit -m "Add Space Shooter game"
git push origin main

# 3. Go to Settings → Pages → Select 'main' branch
# Your game is now live at: https://yourusername.github.io/repo-name/
```

#### Netlify (Recommended)
```bash
# 1. Connect your GitHub repository to Netlify
# 2. Set build settings:
#    - Build command: (leave empty)
#    - Publish directory: .

# OR drag and drop the folder:
# - Go to netlify.com
# - Drag the 'space-shooter' folder into the drop zone
# Your game is instantly live!
```

#### Vercel
```bash
# 1. Install Vercel CLI:
npm install -g vercel

# 2. Deploy:
vercel

# 3. Follow prompts and select the project directory
# Your game is deployed!
```

## How to Play

### Game Objective
Survive as long as possible by destroying alien enemies. Each wave gets harder!

### Scoring
- **Basic Enemy**: 25 + (Wave × 5) points
- **Fast Enemy**: 50 + (Wave × 10) points
- **Tank Enemy**: 100 + (Wave × 20) points

### Tips for High Score
1. **Wave 1-2**: Perfect for learning - take your time
2. **Wave 3+**: Movement becomes critical - use smooth, predictive aiming
3. **Tank Enemies**: Require 3 hits - focus fire to break them down
4. **Resource Management**: Don't waste bullets on distant enemies

## Settings

Access settings from the main menu:

- **Sound Effects**: Toggle procedurally-generated sounds on/off
- **Dark Mode**: Switch between dark and light themes
- **Mobile Controls**: Show visual touch zone on mobile
- **High Scores**: View your top 10 scores and clear history
- **Install App**: Install the game as a PWA on your device

## Install as App

### Android
1. Open the game in Chrome
2. Tap the menu (⋮) → "Install app"
3. Tap "Install"
4. Game appears on home screen!

### iOS
1. Open the game in Safari
2. Tap Share button
3. Tap "Add to Home Screen"
4. Tap "Add"
5. Game appears on home screen!

### Desktop (Windows/Mac)
1. Open the game in Chrome/Edge
2. Click the install icon in the address bar (down arrow or square icon)
3. Click "Install"
4. Game launches as a standalone app!

## Technical Details

### Architecture
- **Vanilla JavaScript**: No frameworks or dependencies
- **HTML5 Canvas**: Hardware-accelerated 2D graphics
- **Web Audio API**: Procedurally-generated sound effects
- **Service Worker**: Offline support and caching
- **LocalStorage**: High score persistence

### Performance
- **60 FPS**: Smooth animations on all devices
- **Responsive Canvas**: Adapts to any screen size
- **Efficient Rendering**: Only redraws changed elements
- **Asset Optimization**: SVG icons, no external files

### Browser Support
- ✅ Chrome 88+
- ✅ Firefox 85+
- ✅ Safari 14+
- ✅ Edge 88+
- ✅ Mobile browsers (Android Chrome, iOS Safari, etc.)

## Customization

### Change Colors
Edit the CSS variables in `css/style.css`:
```css
:root {
    --color-primary: #00d4ff;      /* Cyan */
    --color-accent: #ff006e;       /* Pink */
    --color-success: #00ff88;      /* Green */
    --color-warning: #ffaa00;      /* Orange */
    --color-danger: #ff3333;       /* Red */
}
```

### Adjust Difficulty
In `js/game.js`:
```javascript
// Spawn delay (lower = more enemies)
this.enemySpawnDelay = Math.max(30, 80 - this.wave * 5);

// Modify enemy properties in js/enemy.js
// Adjust player speed in js/player.js
```

### Add New Sounds
In `js/utils.js` `AudioManager` class, add new methods:
```javascript
playCustomSound(ctx, now) {
    // Create oscillator and gain nodes
    // Define frequency, gain envelope, timing
}
```

## Game Mechanics

### Enemy Waves
- Each wave increases difficulty
- More enemies spawn as waves progress
- Enemy spawn rate increases (shorter delays)
- Enemy types become more varied

### Collision Detection
- Circle-to-circle collision for all objects
- Pixel-perfect hit detection
- No lag or desync issues

### Scoring Formula
```
Total Score = Sum of (Enemy Score for each destroyed enemy)
Enemy Score = Base Score × (1 + Wave Bonus)
```

## 🔒 Privacy & Data

- **No External Servers**: Everything runs locally
- **No Tracking**: No analytics or user tracking
- **No Ads**: Completely ad-free
- **Local Storage Only**: High scores saved in browser only
- **No Personal Data**: No login or account system

## 🐛 Known Issues & Limitations

1. **Audio Context**: May require user interaction first (click/tap)
2. **iOS Limitations**: Fullscreen on iOS is limited by Safari
3. **Large Screens**: Game maintains aspect ratio (may have letterboxing)
4. **Offline Icons**: SVG icons used instead of PNG for file size

## Future Enhancements

- Power-ups and bonuses
- Different game modes (endless, timed, etc.)
- Leaderboards with cloud sync
- Customizable ship appearance
- New enemy types and behaviors
- Multiplayer (WebSocket-based)
- Achievements and badges

## 📝 License

Free to use, modify, and distribute. No attribution required!

## 🤝 Contributing

Found a bug or have a feature request? Feel free to improve this game!

### How to Contribute
1. Fork or clone the repository
2. Make your changes
3. Test thoroughly on multiple devices
4. Submit a pull request or share your improvements

## 📧 Support

For questions or issues:
1. Check the README and code comments
2. Test in different browsers
3. Clear browser cache if experiencing issues
4. Try reinstalling the app

---

**Enjoy the game! Defend Earth from the alien invaders!**
# StarShooter
