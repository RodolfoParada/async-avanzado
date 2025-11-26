// Task 4: Async Iterators y Generators (6 minutos)
// Async iterators permiten trabajar con secuencias de datos asíncronas.

// Async Iterators Básicos
// Crear un async iterable
async function* generarNumerosAleatorios(cantidad) {
  for (let i = 0; i < cantidad; i++) {
    // Simular operación asíncrona
    await new Promise(resolve => setTimeout(resolve, 500));
    yield Math.floor(Math.random() * 100);
  }
}

// Consumir async iterator
async function procesarNumeros() {
  const generador = generarNumerosAleatorios(5);

  for await (const numero of generador) {
    console.log('Número generado:', numero);
  }
}

// Uso
procesarNumeros();

// Generators para Control de Flujo Asíncrono
// Generator que simula procesamiento de datos
function* procesarDatos(datos) {
  for (const dato of datos) {
    // Procesamiento síncrono
    const procesado = dato * 2;

    // Simular operación asíncrona
    yield new Promise(resolve => {
      setTimeout(() => resolve(procesado), 1000);
    });
  }
}

// Función async que consume el generator
async function ejecutarProcesamiento(datos) {
  const procesador = procesarDatos(datos);
  const resultados = [];

  for (const promesa of procesador) {
    const resultado = await promesa;
    resultados.push(resultado);
    console.log('Resultado procesado:', resultado);
  }

  return resultados;
}

// Uso
ejecutarProcesamiento([1, 2, 3, 4, 5]).then(resultados => {
  console.log('Procesamiento completo:', resultados);
});

// Async Generators Avanzados
// Async generator para stream de datos
async function* streamDeEventos() {
  const eventos = [
    'usuario_login',
    'compra_realizada',
    'mensaje_enviado',
    'archivo_subido'
  ];

  for (const evento of eventos) {
    // Simular delay aleatorio
    await new Promise(resolve =>
      setTimeout(resolve, Math.random() * 2000 + 500)
    );

    yield {
      tipo: evento,
      timestamp: new Date(),
      id: Math.random().toString(36).substr(2, 9)
    };
  }
}

// Procesador de eventos con async iteration
async function procesarStreamDeEventos() {
  const stream = streamDeEventos();

  try {
    for await (const evento of stream) {
      console.log(`📅 [${evento.timestamp.toLocaleTimeString()}] Evento: ${evento.tipo} (ID: ${evento.id})`);

      // Simular procesamiento específico por tipo de evento
      switch (evento.tipo) {
        case 'usuario_login':
          await procesarLogin(evento);
          break;
        case 'compra_realizada':
          await procesarCompra(evento);
          break;
        case 'mensaje_enviado':
          await procesarMensaje(evento);
          break;
        case 'archivo_subido':
          await procesarArchivo(evento);
          break;
      }
    }

    console.log('✅ Todos los eventos procesados');
  } catch (error) {
    console.error('❌ Error procesando stream:', error.message);
  }
}

// Funciones de procesamiento simuladas
async function procesarLogin(evento) {
  await new Promise(resolve => setTimeout(resolve, 200));
  console.log(`🔐 Procesando login del usuario`);
}

async function procesarCompra(evento) {
  await new Promise(resolve => setTimeout(resolve, 300));
  console.log(`💰 Procesando compra`);
}

async function procesarMensaje(evento) {
  await new Promise(resolve => setTimeout(resolve, 150));
  console.log(`💬 Procesando mensaje`);
}

async function procesarArchivo(evento) {
  await new Promise(resolve => setTimeout(resolve, 400));
  console.log(`📁 Procesando archivo subido`);
}

// Ejecutar procesamiento
procesarStreamDeEventos();