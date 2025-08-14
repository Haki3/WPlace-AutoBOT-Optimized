# 🔧 Guía de Solución de Problemas CORS

## ❌ Problema Actual
Los usuarios reportan errores de CORS al usar los scripts:
- "Request header field cache-control is not allowed by Access-Control-Allow-Headers"
- HTTP 403 Forbidden desde Cloudflare

## ✅ Soluciones Implementadas

### 1. Versión Simplificada (Recomendada)
Se han creado versiones ultra-simplificadas:
- `Auto-Farm-Simple.js` - Solo headers básicos, delays largos
- `Auto-Image-Simple.js` - Versión completamente limpia

**Características:**
- Sin headers personalizados (solo Content-Type cuando necesario)
- Delays aumentados: 6s general, 4s entre requests
- Backoff de 30s cuando hay bloqueo
- Sin detección de ubicación automática

### 2. Como Usar las Versiones Simplificadas

#### Opción A: Bookmarklet Directo
```javascript
javascript:(function(){var s=document.createElement('script');s.src='https://raw.githubusercontent.com/Haki3/WPlace-AutoBOT-Optimized/main/Auto-Farm-Simple.js';document.head.appendChild(s);})();
```

#### Opción B: Copiar y Pegar
1. Ve a: https://github.com/Haki3/WPlace-AutoBOT-Optimized
2. Abre `Auto-Farm-Simple.js`
3. Copia todo el código
4. Pégalo en la consola del navegador en wplace.live

### 3. Configuración Recomendada

**Para evitar bloqueos:**
- Usa solo las versiones "Simple"
- No modifiques los delays (están optimizados)
- Si te bloquean, espera 30+ minutos antes de reintentar
- Usa el script en horarios de menor tráfico

**Headers seguros:**
```javascript
// ✅ PERMITIDO
headers: {
  'Content-Type': 'text/plain;charset=UTF-8'
}

// ❌ PROHIBIDO
headers: {
  'User-Agent': '...',
  'Cache-Control': '...',
  'Accept-Encoding': '...'
}
```

### 4. Debugging

Si sigues teniendo problemas:

1. **Abre DevTools** (F12)
2. **Ve a Console** y busca errores
3. **Verifica Network** para ver requests bloqueados

**Errores comunes:**
- `403 Forbidden` = Cloudflare te bloqueó, espera más tiempo
- `CORS error` = Headers prohibidos, usa versión Simple
- `429 Too Many Requests` = Reduce velocidad, aumenta delays

### 5. Fallback Manual

Si nada funciona, puedes usar el método manual:
1. Ve a wplace.live
2. Abre DevTools → Console
3. Pega este código mínimo:

```javascript
// Código ultra-básico para test
fetch('https://backend.wplace.live/me', {credentials: 'include'})
  .then(r => r.json())
  .then(data => console.log('✅ API funciona:', data))
  .catch(e => console.log('❌ Error:', e));
```

## 📞 Soporte

Si los problemas persisten:
1. Usa solo las versiones `-Simple.js`
2. Espera 30+ minutos entre intentos
3. Prueba en modo incógnito
4. Verifica que estés logueado en wplace.live

**Última actualización:** Las versiones Simple están diseñadas específicamente para resolver problemas de CORS y bloqueos de Cloudflare.
