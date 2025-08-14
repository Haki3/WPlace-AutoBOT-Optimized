# 🚀 WPlace AutoBOT - Versión Optimizada para Cloudflare

> **Herramientas optimizadas para funcionar correctamente con la protección de Cloudflare de WPlace**

## 📋 Optimizaciones Implementadas

### 🔧 Auto-Farm.js
- ✅ **Delay aumentado**: De 1s a 3s entre requests
- ✅ **Request delay**: 2s adicional antes de cada request
- ✅ **Headers mejorados**: User-Agent y headers realistas 
- ✅ **Manejo de rate limiting**: Detección automática de códigos 429/403
- ✅ **Backoff progresivo**: Esperas más largas cuando hay bloqueos
- ✅ **Mejor manejo de errores**: Recovery automático de conexiones fallidas

### 🎨 Auto-Image.js  
- ✅ **Paint delay**: 3.5s entre pinturas de pixels
- ✅ **Request delay**: 2.5s antes de cada request
- ✅ **Sistema de reintentos**: Hasta 3 intentos con backoff exponencial
- ✅ **Headers completos**: User-Agent, Referer, Origin y más headers
- ✅ **Detección de bloqueos**: Manejo inteligente de rate limits de CF
- ✅ **Logging mejorado**: Mejor información de debugging

## ⚡ Configuración Recomendada

### Velocidades Seguras para Cloudflare:
- **Auto-Farm**: ~1 request cada 5-6 segundos (incluye delays internos)
- **Auto-Image**: ~1 pixel cada 6-8 segundos (incluye verificaciones)

### 🛡️ Protección Anti-Detección:
- Headers de navegador real
- Delays variables para parecer humano
- Manejo inteligente de errores
- Respeto a rate limits del servidor

## 📖 Instrucciones de Uso

### 🎯 Auto-Farm (Subir Level)
```js
javascript:fetch("https://raw.githubusercontent.com/DarkModde/WPlace-AutoBOT/refs/heads/main/Auto-Farm.js").then(t=>t.text()).then(eval);
```

### 🖼️ Auto-Image (Pixel Art)  
```js
javascript:fetch("https://raw.githubusercontent.com/DarkModde/WPlace-AutoBOT/refs/heads/main/Auto-Image.js").then(t=>t.text()).then(eval);
```

## ⚠️ Recomendaciones Importantes

1. **No ejecutar múltiples instancias** - Usa solo un script a la vez
2. **Monitorear la consola** - Revisa los logs para detectar bloqueos  
3. **Pausar si hay errores** - Si ves muchos fallos, para y espera
4. **Usar VPN si es necesario** - Cambia IP si quedas bloqueado temporalmente
5. **No modificar delays** - Los tiempos están optimizados para CF

## 🔍 Solución de Problemas

### Si el script se detiene:
1. Revisa la consola del navegador (F12)
2. Busca mensajes de "Rate limited" o "Blocked"
3. Espera 5-10 minutos antes de reintentar
4. Considera cambiar IP si persiste

### Si aparecen muchos errores 429/403:
1. El script ya maneja estos errores automáticamente
2. Simplemente espera - se auto-recuperará
3. Evita recargar la página constantemente

## 🔄 Changelog v2.0

- 🔧 **Delays optimizados** para evitar rate limiting
- 🛡️ **Headers mejorados** para parecer tráfico legítimo  
- ⚡ **Auto-recovery** de bloqueos temporales
- 📊 **Mejor logging** para debugging
- 🎯 **Backoff inteligente** cuando hay problemas
- 🔄 **Sistema de reintentos** robusto

---

**💡 Tip**: Estos scripts ahora funcionan de manera más lenta pero más estable. La paciencia es clave para evitar ser detectado por Cloudflare.
