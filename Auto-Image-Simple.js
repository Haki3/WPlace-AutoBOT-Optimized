(async () => {
  const CONFIG = {
    PAINT_DELAY: 6000,
    REQUEST_DELAY: 4000,
    MAX_RETRIES: 3,
    BACKOFF_DELAY: 30000,
    THEME: {
      primary: '#000000',
      secondary: '#111111',
      accent: '#222222',
      text: '#ffffff',
      highlight: '#775ce3',
      error: '#ff0000',
      success: '#00ff00'
    }
  };

  const sleep = ms => new Promise(r => setTimeout(r, ms));

  class WPlaceService {
    constructor() {
      this.baseUrl = 'https://backend.wplace.live';
    }

    async makeRequest(url, options = {}) {
      try {
        await sleep(CONFIG.REQUEST_DELAY);
        
        // Sin headers adicionales para evitar CORS
        const response = await fetch(url, {
          credentials: 'include',
          ...options
        });

        if (response.status === 429 || response.status === 403) {
          console.log('⚠️ Blocked by Cloudflare, waiting...');
          await sleep(CONFIG.BACKOFF_DELAY);
          return null;
        }
        
        if (response.status >= 500) {
          console.log('🔄 Server error, retrying...');
          await sleep(10000);
          return null;
        }

        return await response.json();
      } catch (error) {
        console.error('Request failed:', error.message);
        await sleep(12000);
        return null;
      }
    }

    async getPixels(x, y, width, height) {
      const url = `${this.baseUrl}/s0/pixel/${x}/${y}/${width}/${height}`;
      return this.makeRequest(url);
    }

    async paintPixel(x, y, colors) {
      const url = `${this.baseUrl}/s0/pixel/${x}/${y}`;
      return this.makeRequest(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=UTF-8'
        },
        body: JSON.stringify({ coords: [0, 0], colors: colors })
      });
    }

    async getUserData() {
      return this.makeRequest(`${this.baseUrl}/me`);
    }
  }

  class PixelPlacerUI {
    constructor() {
      this.state = {
        isRunning: false,
        pixels: [],
        currentPixel: 0,
        stats: {
          painted: 0,
          errors: 0,
          charges: 0,
          maxCharges: 80
        },
        userInfo: null
      };
      
      this.service = new WPlaceService();
      this.init();
    }

    init() {
      this.createStylesheet();
      this.createUI();
      this.loadUserData();
    }

    createStylesheet() {
      const style = document.createElement('style');
      style.textContent = `
        .pixel-placer-container {
          position: fixed;
          top: 50px;
          right: 20px;
          width: 280px;
          background: ${CONFIG.THEME.primary};
          border: 1px solid ${CONFIG.THEME.accent};
          border-radius: 10px;
          font-family: Arial, sans-serif;
          color: ${CONFIG.THEME.text};
          box-shadow: 0 4px 20px rgba(0,0,0,0.6);
          z-index: 10001;
          overflow: hidden;
        }
        
        .pixel-placer-header {
          background: linear-gradient(45deg, ${CONFIG.THEME.secondary}, ${CONFIG.THEME.accent});
          padding: 15px;
          text-align: center;
          border-bottom: 1px solid ${CONFIG.THEME.accent};
        }
        
        .pixel-placer-content {
          padding: 15px;
        }
        
        .pixel-btn {
          width: 100%;
          padding: 12px;
          margin: 8px 0;
          border: none;
          border-radius: 6px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          font-size: 14px;
        }
        
        .pixel-btn-primary {
          background: linear-gradient(45deg, ${CONFIG.THEME.highlight}, #a855f7);
          color: white;
        }
        
        .pixel-btn-danger {
          background: linear-gradient(45deg, ${CONFIG.THEME.error}, #dc2626);
          color: white;
        }
        
        .pixel-stats {
          background: ${CONFIG.THEME.secondary};
          padding: 12px;
          border-radius: 6px;
          margin: 12px 0;
          font-size: 13px;
          border: 1px solid ${CONFIG.THEME.accent};
        }
        
        .pixel-status {
          padding: 10px;
          border-radius: 6px;
          text-align: center;
          margin: 10px 0;
          font-weight: 600;
          font-size: 13px;
        }
        
        .status-ready { background: rgba(34, 197, 94, 0.1); color: ${CONFIG.THEME.success}; }
        .status-running { background: rgba(59, 130, 246, 0.1); color: #3b82f6; }
        .status-error { background: rgba(239, 68, 68, 0.1); color: ${CONFIG.THEME.error}; }
        
        .image-upload {
          width: 100%;
          padding: 8px;
          border: 2px dashed ${CONFIG.THEME.accent};
          border-radius: 6px;
          text-align: center;
          margin: 10px 0;
          cursor: pointer;
          transition: all 0.3s;
        }
        
        .image-upload:hover {
          border-color: ${CONFIG.THEME.highlight};
          background: rgba(119, 92, 227, 0.1);
        }
        
        .coords-input {
          display: flex;
          gap: 10px;
          margin: 10px 0;
        }
        
        .coords-input input {
          flex: 1;
          padding: 8px;
          border: 1px solid ${CONFIG.THEME.accent};
          border-radius: 4px;
          background: ${CONFIG.THEME.secondary};
          color: ${CONFIG.THEME.text};
        }
      `;
      
      document.head.appendChild(style);
    }

    createUI() {
      const container = document.createElement('div');
      container.className = 'pixel-placer-container';
      
      container.innerHTML = `
        <div class="pixel-placer-header">
          <h3 style="margin: 0;">🎨 WPlace Image Placer</h3>
        </div>
        <div class="pixel-placer-content">
          <div class="image-upload" onclick="document.getElementById('imageInput').click()">
            📁 Click to upload image
            <input type="file" id="imageInput" accept="image/*" style="display: none;">
          </div>
          
          <div class="coords-input">
            <input type="number" id="startX" placeholder="Start X" value="742">
            <input type="number" id="startY" placeholder="Start Y" value="1148">
          </div>
          
          <button id="startBtn" class="pixel-btn pixel-btn-primary">
            ▶️ Start Placing
          </button>
          
          <button id="stopBtn" class="pixel-btn pixel-btn-danger" style="display: none;">
            ⏹️ Stop Placing
          </button>
          
          <div class="pixel-stats" id="statsPanel">
            <div id="userStats">Loading user data...</div>
          </div>
          
          <div id="statusPanel" class="pixel-status status-ready">
            Ready to place pixels
          </div>
        </div>
      `;

      document.body.appendChild(container);
      this.bindEvents();
    }

    bindEvents() {
      const imageInput = document.getElementById('imageInput');
      const startBtn = document.getElementById('startBtn');
      const stopBtn = document.getElementById('stopBtn');

      imageInput.addEventListener('change', (e) => this.handleImageUpload(e));
      startBtn.addEventListener('click', () => this.startPlacing());
      stopBtn.addEventListener('click', () => this.stopPlacing());
    }

    handleImageUpload(event) {
      const file = event.target.files[0];
      if (!file) return;

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        canvas.width = Math.min(img.width, 200);
        canvas.height = Math.min(img.height, 200);
        
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        this.processImage(imageData);
      };

      img.src = URL.createObjectURL(file);
    }

    processImage(imageData) {
      this.state.pixels = [];
      const { data, width, height } = imageData;
      
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const index = (y * width + x) * 4;
          const r = data[index];
          const g = data[index + 1];
          const b = data[index + 2];
          const a = data[index + 3];

          if (a > 128) {
            const color = this.rgbToWPlaceColor(r, g, b);
            if (color > 0) {
              this.state.pixels.push({ x, y, color });
            }
          }
        }
      }

      this.updateStatus(`Image processed: ${this.state.pixels.length} pixels`, 'ready');
    }

    rgbToWPlaceColor(r, g, b) {
      const colors = [
        [255, 255, 255], [228, 228, 228], [136, 136, 136], [78, 78, 78], 
        [0, 0, 0], [244, 179, 174], [255, 167, 209], [255, 184, 184],
        [255, 214, 53], [229, 217, 182], [148, 224, 68], [2, 190, 1],
        [0, 211, 221], [0, 131, 199], [0, 0, 234], [207, 110, 228],
        [130, 0, 128], [35, 31, 32], [109, 72, 47], [254, 164, 96],
        [229, 149, 0], [160, 106, 66], [96, 64, 40], [245, 68, 54],
        [238, 82, 83], [170, 0, 59], [149, 0, 58], [186, 85, 211],
        [126, 237, 86], [36, 80, 164], [54, 144, 234], [81, 233, 244]
      ];

      let closestColor = 0;
      let minDistance = Infinity;

      for (let i = 0; i < colors.length; i++) {
        const [cr, cg, cb] = colors[i];
        const distance = Math.sqrt((r-cr)**2 + (g-cg)**2 + (b-cb)**2);
        
        if (distance < minDistance) {
          minDistance = distance;
          closestColor = i;
        }
      }

      return closestColor;
    }

    async startPlacing() {
      if (this.state.pixels.length === 0) {
        this.updateStatus('Please upload an image first!', 'error');
        return;
      }

      this.state.isRunning = true;
      this.state.currentPixel = 0;
      
      document.getElementById('startBtn').style.display = 'none';
      document.getElementById('stopBtn').style.display = 'block';
      
      this.updateStatus('Starting pixel placement...', 'running');
      this.placingLoop();
    }

    stopPlacing() {
      this.state.isRunning = false;
      document.getElementById('startBtn').style.display = 'block';
      document.getElementById('stopBtn').style.display = 'none';
      this.updateStatus('Placement stopped', 'ready');
    }

    async placingLoop() {
      while (this.state.isRunning && this.state.currentPixel < this.state.pixels.length) {
        await this.loadUserData();
        
        if (this.state.stats.charges < 1) {
          this.updateStatus(`No charges available. Waiting...`, 'error');
          await sleep(30000);
          continue;
        }

        const pixel = this.state.pixels[this.state.currentPixel];
        const startX = parseInt(document.getElementById('startX').value) || 742;
        const startY = parseInt(document.getElementById('startY').value) || 1148;
        
        const result = await this.service.paintPixel(
          startX + pixel.x,
          startY + pixel.y,
          [pixel.color]
        );

        if (result?.painted === 1) {
          this.state.stats.painted++;
          this.state.currentPixel++;
          this.updateStatus(`Painted pixel ${this.state.currentPixel}/${this.state.pixels.length}`, 'running');
        } else if (result === null) {
          this.state.stats.errors++;
          this.updateStatus('Connection blocked, waiting...', 'error');
          await sleep(25000);
        } else {
          this.state.stats.errors++;
          this.updateStatus('Failed to paint pixel', 'error');
        }

        this.updateStats();
        await sleep(CONFIG.PAINT_DELAY);
      }

      if (this.state.currentPixel >= this.state.pixels.length) {
        this.updateStatus('Image placement completed!', 'ready');
        this.stopPlacing();
      }
    }

    async loadUserData() {
      const userData = await this.service.getUserData();
      if (userData) {
        this.state.userInfo = userData;
        this.state.stats.charges = Math.floor(userData.charges.count);
        this.state.stats.maxCharges = Math.floor(userData.charges.max);
        this.updateStats();
      }
    }

    updateStats() {
      const statsPanel = document.getElementById('userStats');
      if (statsPanel && this.state.userInfo) {
        statsPanel.innerHTML = `
          👤 User: ${this.state.userInfo.name}<br>
          🎨 Painted: ${this.state.stats.painted}<br>
          ❌ Errors: ${this.state.stats.errors}<br>
          ⚡ Charges: ${this.state.stats.charges}/${this.state.stats.maxCharges}<br>
          📍 Progress: ${this.state.currentPixel}/${this.state.pixels.length}
        `;
      }
    }

    updateStatus(message, type) {
      const statusPanel = document.getElementById('statusPanel');
      if (statusPanel) {
        statusPanel.textContent = message;
        statusPanel.className = `pixel-status status-${type}`;
      }
    }
  }

  // Initialize the pixel placer
  new PixelPlacerUI();
})();
