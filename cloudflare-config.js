/**
 * WPlace AutoBOT - Configuración de Cloudflare
 * 
 * Este archivo contiene todas las configuraciones optimizadas para trabajar
 * con la protección de Cloudflare de WPlace.
 */

const CLOUDFLARE_CONFIG = {
  // === DELAYS PRINCIPALES ===
  DELAYS: {
    FARM_MAIN: 3000,        // Delay principal entre acciones de farming (3s)
    FARM_REQUEST: 2000,     // Delay antes de cada request de farming (2s)
    IMAGE_PAINT: 3500,      // Delay entre pinturas de pixels (3.5s)
    IMAGE_REQUEST: 2500,    // Delay antes de cada request de imagen (2.5s)
    ERROR_BACKOFF: 5000,    // Delay base cuando hay errores (5s)
    RATE_LIMIT_WAIT: 15000, // Espera cuando hay rate limit 429 (15s)
    BLOCKED_WAIT: 30000,    // Espera cuando hay bloqueo 403 (30s)
  },

  // === CONFIGURACIÓN DE REQUESTS ===
  REQUESTS: {
    MAX_RETRIES: 3,         // Máximo número de reintentos
    TIMEOUT: 10000,         // Timeout de requests (10s)
    
    // Headers optimizados para parecer tráfico legítimo
    HEADERS: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'application/json, text/plain, */*',
      'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
      'Accept-Encoding': 'gzip, deflate, br',
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
      'Referer': 'https://wplace.live/',
      'Origin': 'https://wplace.live',
      'Sec-Ch-Ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
      'Sec-Ch-Ua-Mobile': '?0',
      'Sec-Ch-Ua-Platform': '"macOS"',
      'Sec-Fetch-Dest': 'empty',
      'Sec-Fetch-Mode': 'cors',
      'Sec-Fetch-Site': 'same-origin'
    }
  },

  // === CÓDIGOS DE RESPUESTA ===
  HTTP_CODES: {
    RATE_LIMITED: 429,      // Too Many Requests
    FORBIDDEN: 403,         // Forbidden (Cloudflare block)
    OK: 200,               // Success
    INTERNAL_ERROR: 500,   // Server error
    BAD_GATEWAY: 502,      // Bad Gateway
    SERVICE_UNAVAILABLE: 503 // Service Unavailable
  },

  // === CONFIGURACIÓN DE SEGURIDAD ===
  SECURITY: {
    JITTER_RANGE: 0.2,     // Variación aleatoria en delays (±20%)
    MIN_SESSION_TIME: 300000, // Tiempo mínimo de sesión (5 min)
    MAX_SESSION_TIME: 1800000, // Tiempo máximo de sesión (30 min)
    COOL_DOWN_BETWEEN_SESSIONS: 600000, // Pausa entre sesiones (10 min)
  },

  // === MENSAJES DE LOG ===
  MESSAGES: {
    RATE_LIMITED: 'Rate limited by Cloudflare, waiting...',
    BLOCKED: 'Blocked by Cloudflare, waiting longer...',
    REQUEST_FAILED: 'Request failed, retrying with backoff...',
    SESSION_ENDED: 'Session ended, taking a break...',
    RECOVERING: 'Recovering from errors, adjusting delays...'
  }
};

/**
 * Función para aplicar jitter (variación aleatoria) a delays
 * Hace que los tiempos sean menos predecibles
 */
function applyJitter(baseDelay) {
  const jitter = CLOUDFLARE_CONFIG.SECURITY.JITTER_RANGE;
  const variance = baseDelay * jitter;
  const randomVariance = (Math.random() * 2 - 1) * variance;
  return Math.max(1000, Math.floor(baseDelay + randomVariance));
}

/**
 * Función para calcular delay exponencial en caso de errores
 */
function calculateBackoffDelay(attempt, baseDelay) {
  return Math.min(baseDelay * Math.pow(2, attempt), 60000); // Máximo 1 minuto
}

/**
 * Función para determinar si necesitamos una pausa larga
 */
function shouldTakeLongBreak(errorCount, timeRunning) {
  return errorCount > 5 || timeRunning > CLOUDFLARE_CONFIG.SECURITY.MAX_SESSION_TIME;
}

// Exportar configuración para uso en los scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    CLOUDFLARE_CONFIG,
    applyJitter,
    calculateBackoffDelay,
    shouldTakeLongBreak
  };
}
