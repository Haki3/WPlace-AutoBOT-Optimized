(async () => {
  const CONFIG = {
    START_X: 742,
    START_Y: 1148,
    PIXELS_PER_LINE: 100,
    DELAY: 6000, // 6 segundos para máxima seguridad
    REQUEST_DELAY: 4000, // 4 segundos antes de cada request
    THEME: {
      primary: '#000000',
      secondary: '#111111',
      accent: '#222222',
      text: '#ffffff',
      highlight: '#775ce3',
      success: '#00ff00',
      error: '#ff0000'
    }
  };

  const state = {
    running: false,
    paintedCount: 0,
    charges: { count: 0, max: 80, cooldownMs: 30000 },
    userInfo: null,
    lastPixel: null,
    minimized: false,
    menuOpen: false,
    language: 'en'
  };

  const sleep = ms => new Promise(r => setTimeout(r, ms));

  const fetchAPI = async (url, options = {}) => {
    try {
      // Delay antes de cada request
      await sleep(CONFIG.REQUEST_DELAY);
      
      // Sin headers adicionales para evitar CORS completamente
      const res = await fetch(url, {
        credentials: 'include',
        ...options
      });
      
      // Verificar respuesta
      if (res.status === 429 || res.status === 403) {
        console.log('⚠️ Blocked by Cloudflare, waiting 30s...');
        await sleep(30000); // Esperar 30 segundos
        return null;
      }
      
      if (res.status === 500 || res.status === 502) {
        console.log('🔄 Server error, retrying in 10s...');
        await sleep(10000);
        return null;
      }
      
      return await res.json();
    } catch (e) {
      console.log('❌ Request failed:', e.message);
      await sleep(12000); // Esperar 12 segundos
      return null;
    }
  };

  const getRandomPosition = () => ({
    x: Math.floor(Math.random() * CONFIG.PIXELS_PER_LINE),
    y: Math.floor(Math.random() * CONFIG.PIXELS_PER_LINE)
  });

  const paintPixel = async (x, y) => {
    const randomColor = Math.floor(Math.random() * 31) + 1;
    return await fetchAPI(`https://backend.wplace.live/s0/pixel/${CONFIG.START_X}/${CONFIG.START_Y}`, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
      body: JSON.stringify({ coords: [x, y], colors: [randomColor] })
    });
  };

  const getCharge = async () => {
    const data = await fetchAPI('https://backend.wplace.live/me');
    if (data) {
      state.userInfo = data;
      state.charges = {
        count: Math.floor(data.charges.count),
        max: Math.floor(data.charges.max),
        cooldownMs: data.charges.cooldownMs
      };
      if (state.userInfo.level) {
        state.userInfo.level = Math.floor(state.userInfo.level);
      }
    }
    return state.charges;
  };

  const paintLoop = async () => {
    while (state.running) {
      const { count, cooldownMs } = state.charges;
      
      if (count < 1) {
        updateUI(`⌛ No charges. Waiting ${Math.ceil(cooldownMs/1000)}s...`, 'status');
        await sleep(cooldownMs);
        await getCharge();
        continue;
      }

      const randomPos = getRandomPosition();
      const paintResult = await paintPixel(randomPos.x, randomPos.y);
      
      if (paintResult?.painted === 1) {
        state.paintedCount++;
        state.lastPixel = { 
          x: CONFIG.START_X + randomPos.x,
          y: CONFIG.START_Y + randomPos.y,
          time: new Date() 
        };
        state.charges.count--;
        
        const effect = document.getElementById('paintEffect');
        if (effect) {
          effect.style.animation = 'pulse 0.5s';
          setTimeout(() => effect.style.animation = '', 500);
        }
        
        updateUI('✅ Pixel painted!', 'success');
      } else if (paintResult === null) {
        updateUI('⚠️ Connection blocked, waiting...', 'error');
        await sleep(25000); // Esperar 25s si hay bloqueo
      } else {
        updateUI('❌ Failed to paint', 'error');
      }

      await sleep(CONFIG.DELAY);
      updateStats();
    }
  };

  const createUI = () => {
    if (state.menuOpen) return;
    state.menuOpen = true;

    const style = document.createElement('style');
    style.textContent = `
      @keyframes pulse {
        0% { box-shadow: 0 0 0 0 rgba(0, 255, 0, 0.7); }
        70% { box-shadow: 0 0 0 10px rgba(0, 255, 0, 0); }
        100% { box-shadow: 0 0 0 0 rgba(0, 255, 0, 0); }
      }
      .wplace-bot-panel {
        position: fixed;
        top: 20px;
        right: 20px;
        width: 250px;
        background: ${CONFIG.THEME.primary};
        border: 1px solid ${CONFIG.THEME.accent};
        border-radius: 8px;
        padding: 15px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.5);
        z-index: 9999;
        font-family: Arial, sans-serif;
        color: ${CONFIG.THEME.text};
      }
      .wplace-controls {
        margin-bottom: 15px;
      }
      .wplace-btn {
        width: 100%;
        padding: 10px;
        border: none;
        border-radius: 6px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
      }
      .wplace-btn-primary {
        background: ${CONFIG.THEME.accent};
        color: white;
      }
      .wplace-btn-stop {
        background: ${CONFIG.THEME.error};
        color: white;
      }
      .wplace-stats {
        background: ${CONFIG.THEME.secondary};
        padding: 12px;
        border-radius: 6px;
        margin-bottom: 15px;
        font-size: 14px;
      }
      .wplace-status {
        padding: 8px;
        border-radius: 4px;
        text-align: center;
        font-size: 13px;
      }
      .status-default {
        background: rgba(255,255,255,0.1);
      }
      .status-success {
        background: rgba(0, 255, 0, 0.1);
        color: ${CONFIG.THEME.success};
      }
      .status-error {
        background: rgba(255, 0, 0, 0.1);
        color: ${CONFIG.THEME.error};
      }
      #paintEffect {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        border-radius: 8px;
      }
    `;
    document.head.appendChild(style);

    const panel = document.createElement('div');
    panel.className = 'wplace-bot-panel';
    panel.innerHTML = `
      <div id="paintEffect"></div>
      <h3 style="margin-top: 0;">🎨 WPlace Auto-Farm</h3>
      <div class="wplace-controls">
        <button id="toggleBtn" class="wplace-btn wplace-btn-primary">
          ▶️ Start Farming
        </button>
      </div>
      
      <div class="wplace-stats">
        <div id="statsArea">Loading...</div>
      </div>
      
      <div id="statusText" class="wplace-status status-default">
        Ready to start farming
      </div>
    `;
    
    document.body.appendChild(panel);
    
    const toggleBtn = panel.querySelector('#toggleBtn');
    
    toggleBtn.addEventListener('click', () => {
      state.running = !state.running;
      
      if (state.running) {
        toggleBtn.innerHTML = '⏹️ Stop Farming';
        toggleBtn.classList.remove('wplace-btn-primary');
        toggleBtn.classList.add('wplace-btn-stop');
        updateUI('🚀 Farming started!', 'success');
        paintLoop();
      } else {
        toggleBtn.innerHTML = '▶️ Start Farming';
        toggleBtn.classList.add('wplace-btn-primary');
        toggleBtn.classList.remove('wplace-btn-stop');
        updateUI('⏸️ Farming paused', 'default');
      }
    });
  };

  window.updateUI = (message, type = 'default') => {
    const statusText = document.querySelector('#statusText');
    if (statusText) {
      statusText.textContent = message;
      statusText.className = `wplace-status status-${type}`;
    }
  };

  window.updateStats = async () => {
    await getCharge();
    const statsArea = document.querySelector('#statsArea');
    if (statsArea && state.userInfo) {
      statsArea.innerHTML = `
        👤 User: ${state.userInfo.name}<br>
        🎨 Pixels: ${state.paintedCount}<br>
        ⚡ Charges: ${Math.floor(state.charges.count)}/${Math.floor(state.charges.max)}<br>
        ⭐ Level: ${state.userInfo?.level || '0'}
      `;
    }
  };

  // Inicializar sin detección de ubicación para evitar problemas de CORS
  state.language = 'en';
  createUI();
  await getCharge();
  updateStats();
})();
