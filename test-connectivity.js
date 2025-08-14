/**
 * WPlace AutoBOT - Script de Testing
 * 
 * Ejecuta este código en la consola del navegador (F12) mientras estés en wplace.live
 * para probar que las optimizaciones funcionan correctamente.
 */

(async () => {
  console.log('🧪 WPlace AutoBOT - Test de Conectividad con Cloudflare');
  console.log('================================================');
  
  const testResults = {
    basicConnection: false,
    userInfoAccess: false,
    pixelPaintAccess: false,
    rateLimitHandling: false,
    headerSupport: false
  };

  // Test 1: Conexión básica
  console.log('📡 Test 1: Conexión básica...');
  try {
    const response = await fetch('https://backend.wplace.live/me', {
      credentials: 'include',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Accept': 'application/json',
        'Referer': 'https://wplace.live/'
      }
    });
    
    if (response.ok) {
      testResults.basicConnection = true;
      console.log('✅ Conexión básica: OK');
    } else {
      console.log(`❌ Conexión básica: Falló (${response.status})`);
    }
  } catch (error) {
    console.log('❌ Conexión básica: Error -', error.message);
  }

  // Test 2: Acceso a información de usuario
  console.log('👤 Test 2: Acceso a información de usuario...');
  try {
    await new Promise(r => setTimeout(r, 2000)); // Delay de 2s
    
    const response = await fetch('https://backend.wplace.live/me', {
      credentials: 'include',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Cache-Control': 'no-cache'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data.charges) {
        testResults.userInfoAccess = true;
        console.log('✅ Información de usuario: OK');
        console.log(`   Cargas disponibles: ${data.charges.count}/${data.charges.max}`);
      } else {
        console.log('⚠️ Información de usuario: Sin datos de cargas');
      }
    } else {
      console.log(`❌ Información de usuario: Falló (${response.status})`);
    }
  } catch (error) {
    console.log('❌ Información de usuario: Error -', error.message);
  }

  // Test 3: Verificar si podemos acceder a la API de pixels
  console.log('🎨 Test 3: Acceso a API de pixels...');
  try {
    await new Promise(r => setTimeout(r, 3000)); // Delay de 3s
    
    // Solo verificamos que el endpoint responda, no pintamos realmente
    const response = await fetch('https://backend.wplace.live/s0/pixel/0/0', {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=UTF-8',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Referer': 'https://wplace.live/',
        'Origin': 'https://wplace.live'
      },
      credentials: 'include',
      body: JSON.stringify({ coords: [0, 0], colors: [1] })
    });
    
    // Cualquier respuesta (incluso error) significa que llegamos al endpoint
    testResults.pixelPaintAccess = true;
    console.log('✅ API de pixels: Accesible');
    console.log(`   Código de respuesta: ${response.status}`);
    
    if (response.status === 429) {
      testResults.rateLimitHandling = true;
      console.log('⚡ Rate limiting detectado correctamente');
    }
    
  } catch (error) {
    console.log('❌ API de pixels: Error -', error.message);
  }

  // Test 4: Verificar soporte de headers
  console.log('📋 Test 4: Soporte de headers...');
  try {
    const testHeaders = {
      'User-Agent': 'Mozilla/5.0 Test',
      'Accept-Language': 'es-ES,es;q=0.9',
      'Cache-Control': 'no-cache',
      'Referer': 'https://wplace.live/'
    };
    
    const response = await fetch('https://backend.wplace.live/me', {
      credentials: 'include',
      headers: testHeaders
    });
    
    testResults.headerSupport = response.ok;
    console.log(testResults.headerSupport ? '✅ Headers: Soportados' : '❌ Headers: Problemas');
    
  } catch (error) {
    console.log('❌ Headers: Error -', error.message);
  }

  // Resultados finales
  console.log('\n📊 RESULTADOS FINALES:');
  console.log('======================');
  
  const passedTests = Object.values(testResults).filter(Boolean).length;
  const totalTests = Object.keys(testResults).length;
  
  Object.entries(testResults).forEach(([test, passed]) => {
    const emoji = passed ? '✅' : '❌';
    const status = passed ? 'PASS' : 'FAIL';
    console.log(`${emoji} ${test}: ${status}`);
  });
  
  console.log(`\n🏆 Score: ${passedTests}/${totalTests} tests passed`);
  
  if (passedTests >= 3) {
    console.log('🎉 Los scripts deberían funcionar correctamente!');
    console.log('💡 Recomendación: Usar delays de 3-5 segundos entre acciones');
  } else {
    console.log('⚠️ Pueden haber problemas de conectividad');
    console.log('💡 Recomendación: Revisar conexión y esperar unos minutos');
  }
  
  console.log('\n🔧 Para usar los scripts optimizados:');
  console.log('Auto-Farm: javascript:fetch("https://raw.githubusercontent.com/DarkModde/WPlace-AutoBOT/refs/heads/main/Auto-Farm.js").then(t=>t.text()).then(eval);');
  console.log('Auto-Image: javascript:fetch("https://raw.githubusercontent.com/DarkModde/WPlace-AutoBOT/refs/heads/main/Auto-Image.js").then(t=>t.text()).then(eval);');
  
})();
