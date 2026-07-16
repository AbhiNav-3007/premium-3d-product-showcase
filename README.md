# Bolly – Premium Interactive 3D Haircare Landing Page

An immersive, high-end 3D single-product showcase built with HTML5, Vanilla CSS, Vanilla JavaScript, and **Three.js (WebGL)**. Designed to deliver a tactile, interactive, and visually stunning digital experience.

🔗 **Live Demo**: [https://premium-3d-product-showcase.vercel.app](https://premium-3d-product-showcase.vercel.app)

---

## ✨ Key Features

### 1. ⚙️ Interactive Actuator Lotion Pump Mechanism
- Custom-modeled 3D dispenser closure matching **24-410 standard neck finish specifications** (matte whitish-grey plastic texture, ribbed threaded base collar, smooth actuator, and cylindrical plunger stem).
- Fully interactive **dispensing trigger**: clicking the cap fires a physical pump animation, activates liquid morphing, and dispenses a soap drop to unlock the product's active formula features.

### 2. 🌀 Scroll-Driven Section Transitions (Camera Interpolation)
- Dynamic camera positioning and bottle scale/rotation interpolation synced to scroll positions.
- The 3D container moves and rotates fluidly as you navigate down the page, framing features, ingredients, benefits, reviews, and CTA layouts.

### 3. 🫧 Active Ingredients Orbit & Details Panel
- Interactive ingredient bubbles floating around the bottle container.
- Includes **instant hover expansion**, **click-to-lock states**, and a **dedicated glassmorphic panel** to display active compounds, eliminating the rapid cursor-flickering commonly found in basic layouts.
- Automatically resets all bubbles back to their original circular orbits when you scroll out of the section.

### 4. 🔄 Tactile Physics & Drag Control
- Premium slow continuous auto-rotation (`0.065 rad/s`).
- **Cursor-Hover Deceleration**: The bottle automatically slows its spin to `0.012 rad/s` when hovered over, making clickable elements easy to target.
- **Auto-Resume Inactivity Timer**: Custom dragging and swipe controls allow you to inspect the bottle freely. Auto-rotation gracefully resumes after 2 seconds of mouse/touch release.

### 5. 🔊 Interactive Auditory Elements
- Uses immersive sound clips (pump presses, tick hovers, chiming success tones, and looping ambient foam lather soundscapes) to deepen engagement.

### 6. 📱 Responsive Layout & Media Queries
- High-end mobile/tablet support with fluid typography, responsive grids, and layout scaling. The detailed cards adjust from side positions (desktop) to bottom-center panels (mobile).

---

## 📁 Project Structure

```text
├── index.html          # Core page layout, semantic structure, and navigation
├── css/
│   └── styles.css      # Glassmorphic components, grid systems, and media queries
└── js/
    ├── three-scene.js  # WebGL scene initialization, lathe geometry, and lights
    ├── app.js          # Interaction handling, poses interpolation, and physics
    └── sounds.js       # Audio effects engine
```

---

## 🚀 How to Run Locally

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/AbhiNav-3007/premium-3d-product-showcase.git
   cd premium-3d-product-showcase
   ```

2. **Start a Local Server:**
   Since Three.js requires an HTTP context to load local modules and handle WebGL textures securely, run a simple server:
   - **Using Node.js:**
     ```bash
     npx http-server -p 8000
     ```
   - **Using Python:**
     ```bash
     python -m http.server 8000
     ```
   - **Or use VS Code's Live Server extension.**

3. **Open in Browser:**
   Go to `http://localhost:8000` to interact with the project!
