// Task 3: Promise Combinators (8 minutos)
// Promise combinators permiten manejar múltiples promises de manera eficiente.

// Promise.all - Todas las Promises
// Ejecutar múltiples operaciones en paralelo
async function cargarDatosDashboard() {
  try {
    const [usuarios, productos, pedidos] = await Promise.all([
      fetch('/api/usuarios').then(r => r.json()),
      fetch('/api/productos').then(r => r.json()),
      fetch('/api/pedidos').then(r => r.json())
    ]);

    console.log('Dashboard cargado:', {
      usuarios: usuarios.length,
      productos: productos.length,
      pedidos: pedidos.length
    });

    return { usuarios, productos, pedidos };
  } catch (error) {
    console.error('Error cargando dashboard:', error.message);
    throw error;
  }
}

// Promise.all con diferentes tipos de operaciones
async function inicializarAplicacion() {
  const tareasInicializacion = [
    // Cargar configuración
    fetch('/api/config').then(r => r.json()),

    // Inicializar base de datos
    inicializarDB(),

    // Cargar usuario actual
    obtenerUsuarioActual(),

    // Precargar recursos
    Promise.all([
      cargarImagenes(),
      cargarFuentes(),
      cargarTraducciones()
    ])
  ];

  const [config, dbInicializada, usuario, recursos] = await Promise.all(tareasInicializacion);
  console.log('Aplicación inicializada completamente');
}

// Promise.race - Primera en Completarse
// Timeout con Promise.race
function fetchConTimeout(url, timeout = 5000) {
  const controladorTimeout = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Timeout')), timeout);
  });

  const fetchPromise = fetch(url).then(response => {
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  });

  return Promise.race([fetchPromise, controladorTimeout]);
}

// Uso
async function cargarDatosConTimeout() {
  try {
    const datos = await fetchConTimeout('/api/datos-lentos', 3000);
    console.log('Datos cargados:', datos);
  } catch (error) {
    console.log('Error o timeout:', error.message);
  }
}

// Carrera entre múltiples servicios
async function obtenerDatosDesdeMejorServicio() {
  const servicios = [
    fetch('https://api.servicio-rapido.com/datos'),
    fetch('https://api.servicio-lento.com/datos'),
    fetch('https://api.servicio-muy-lento.com/datos')
  ];

  try {
    const respuestaRapida = await Promise.race(servicios);
    const datos = await respuestaRapida.json();
    console.log('Datos obtenidos del servicio más rápido');
    return datos;
  } catch (error) {
    console.error('Todos los servicios fallaron');
  }
}
// Promise.allSettled - Todas Completan (con Resultados)
// A diferencia de Promise.all, no falla si alguna promise es rechazada
async function procesarMultiplesAPIs() {
  const llamadasAPI = [
    fetch('/api/usuarios').then(r => r.json()).catch(e => ({ error: e.message })),
    fetch('/api/productos').then(r => r.json()).catch(e => ({ error: e.message })),
    fetch('/api/pedidos').then(r => r.json()).catch(e => ({ error: e.message }))
  ];

  const resultados = await Promise.allSettled(llamadasAPI);

  const exitosos = resultados.filter(r => r.status === 'fulfilled').map(r => r.value);
  const fallidos = resultados.filter(r => r.status === 'rejected').map(r => r.reason);

  console.log(`${exitosos.length} APIs respondieron correctamente`);
  console.log(`${fallidos.length} APIs fallaron`);

  return { exitosos, fallidos, todosLosResultados: resultados };
}

// Procesar resultados mixtos
procesarMultiplesAPIs().then(({ exitosos, fallidos }) => {
  if (exitosos.length > 0) {
    console.log('Procesando datos exitosos...');
    // Continuar con datos disponibles
  }

  if (fallidos.length > 0) {
    console.log('APIs fallidas:', fallidos);
    // Implementar estrategia de fallback o retry
  }
});
// Promise.any - Primera Exitosa
// Promise.any (ES2021) - primera promise que se resuelve exitosamente
async function cargarDesdeCualquierCDN() {
  const cdns = [
    'https://cdn1.example.com/lib.js',
    'https://cdn2.example.com/lib.js',
    'https://cdn3.example.com/lib.js'
  ];

  try {
    const scriptCargado = await Promise.any(
      cdns.map(url => fetch(url).then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return url;
      }))
    );

    console.log(`Script cargado desde: ${scriptCargado}`);
    return scriptCargado;
  } catch (error) {
    console.error('Todos los CDNs fallaron:', error.message);
  }
}