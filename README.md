# Golden Maple Landscaping Website

A static HTML/CSS/JavaScript website for Golden Maple Landscaping, featuring premium outdoor design and construction services.

## Local Development

### ⚠️ Important: Local Server Required

**This site uses root-relative links (e.g., `/investment-levels.html`) and MUST be served via a local HTTP server.**

**DO NOT open HTML files directly in a browser using `file://` protocol** — links will not work correctly.

### Quick Start

#### Option 1: Python HTTP Server (Recommended)

1. Open a terminal/command prompt
2. Navigate to the project root directory:
   ```bash
   cd "C:\Users\yorki\Golden Maple Landscaping with anti gravity"
   ```
3. Start the server:
   ```bash
   python -m http.server 8000
   ```
4. Open your browser and navigate to:
   ```
   http://localhost:8000
   ```

#### Option 2: VS Code Live Server

1. Install the "Live Server" extension in VS Code
2. Right-click on `index.html`
3. Select "Open with Live Server"
4. The site will open automatically in your browser

#### Option 3: Node.js http-server

1. Install http-server globally (if not already installed):
   ```bash
   npm install -g http-server
   ```
2. Navigate to the project root directory
3. Start the server:
   ```bash
   http-server -p 8000
   ```
4. Open `http://localhost:8000` in your browser

### Testing Investment Levels Page

After starting a local server, verify the Investment Levels page loads correctly:

```
http://localhost:8000/investment-levels.html
```

### Why Root-Relative Links?

Root-relative links (starting with `/`) are used for:
- Production deployment compatibility
- Consistent routing across all pages
- Netlify deployment requirements

These links work correctly when served via HTTP/HTTPS but will fail when using `file://` protocol.

### Project Structure

```
.
├── index.html                    # Homepage
├── investment-levels.html        # Investment Levels page
├── contact.html                  # Contact form
├── resources.html                # Resources/Blog page
├── pages/                        # Subdirectory pages
│   ├── about.html
│   ├── process.html
│   ├── gallery.html
│   ├── services/                 # Service detail pages
│   └── ...
├── css/                          # Stylesheets
├── New website pictures 2026 revised/    # Image assets
└── script.js                     # JavaScript
```

### Deployment

This site is configured for Netlify deployment:
- `netlify.toml` specifies publish directory as root (`.`)
- All root-relative links work correctly in production
- No build process required (static site)

### Notes

- All internal navigation uses root-relative paths for production compatibility
- Asset paths (CSS, images, JS) use relative paths where appropriate
- The site is fully static with no backend dependencies

