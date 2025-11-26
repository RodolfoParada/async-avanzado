// Task 2: Patrones Avanzados con Async/Await (8 minutos)
// Async/await permite escribir código asíncrono que se lee como síncrono, facilitando el manejo de errores y control de flujo.

// Async/Await Básico con Error Handling
async function procesarUsuarioCompleto(id) {
  try {
    const usuario = await obtenerUsuario(id);
    console.log('Usuario:', usuario.nombre);

    const posts = await obtenerPostsUsuario(usuario.id);
    console.log(`Posts encontrados: ${posts.length}`);

    // Procesar posts en paralelo
    const promesasComentarios = posts.map(post =>
      obtenerComentariosPost(post.id)
    );

    const resultadosComentarios = await Promise.all(promesasComentarios);

    // Combinar resultados
    const resultadoFinal = {
      usuario,
      posts: posts.map((post, index) => ({
        ...post,
        comentarios: resultadosComentarios[index]
      }))
    };

    return resultadoFinal;

  } catch (error) {
    console.error('Error procesando usuario:', error.message);

    // Retornar resultado alternativo en caso de error
    return {
      error: true,
      message: error.message,
      usuario: null,
      posts: []
    };
  }
}

// Uso
async function main() {
  const resultado = await procesarUsuarioCompleto(1);

  if (resultado.error) {
    console.log('Error procesado:', resultado.message);
  } else {
    console.log('Datos procesados exitosamente');
    console.log('Posts con comentarios:', resultado.posts.length);
  }
}

main();

// Paralelización Estratégica
// Paralelización cuando las operaciones son independientes
async function cargarDashboardCompleto(userId) {
  // Iniciar todas las operaciones independientes al mismo tiempo
  const [usuario, estadisticas, notificaciones] = await Promise.all([
    obtenerUsuario(userId),
    obtenerEstadisticasUsuario(userId),
    obtenerNotificacionesUsuario(userId)
  ]);

  // Operaciones que dependen de datos previos
  const posts = await obtenerPostsUsuario(usuario.id);
  const comentariosRecientes = await obtenerComentariosRecientes(posts.map(p => p.id));

  return {
    usuario,
    estadisticas,
    notificaciones,
    posts,
    comentariosRecientes
  };
}

// Mezcla de operaciones secuenciales y paralelas
async function procesarPedidoCompleto(pedido) {
  // 1. Validar usuario (requerido primero)
  const usuario = await validarUsuario(pedido.usuarioId);

  // 2. Procesar pago y verificar inventario en paralelo
  const [resultadoPago, resultadoInventario] = await Promise.all([
    procesarPago(pedido.total),
    verificarInventario(pedido.productos)
  ]);

  // 3. Si todo está bien, crear orden y enviar confirmación en paralelo
  if (resultadoPago.aprobado && resultadoInventario.disponible) {
    const [orden, emailEnviado] = await Promise.all([
      crearOrden(pedido, usuario),
      enviarEmailConfirmacion(usuario.email, pedido)
    ]);

    return { exito: true, orden, emailEnviado };
  } else {
    // Rollback si algo falló
    await rollbackPago(resultadoPago.transaccionId);
    throw new Error('No se pudo completar el pedido');
  }
}

// Async Functions en Callbacks
// Convertir callbacks a promises
function leerArchivoAsync(ruta) {
  return new Promise((resolve, reject) => {
    // Simulación de lectura de archivo
    setTimeout(() => {
      if (ruta.endsWith('.txt')) {
        resolve(`Contenido del archivo ${ruta}`);
      } else {
        reject(new Error('Formato de archivo no soportado'));
      }
    }, 500);
  });
}

// Uso en función async
async function procesarArchivos(rutas) {
  const resultados = [];

  for (const ruta of rutas) {
    try {
      const contenido = await leerArchivoAsync(ruta);
      resultados.push({
        ruta,
        contenido,
        exito: true
      });
    } catch (error) {
      resultados.push({
        ruta,
        error: error.message,
        exito: false
      });
    }
  }

  return resultados;
}

// Procesar archivos con manejo de errores individual
procesarArchivos(['archivo1.txt', 'archivo2.json', 'archivo3.txt'])
  .then(resultados => {
    const exitosos = resultados.filter(r => r.exito);
    const fallidos = resultados.filter(r => !r.exito);

    console.log(`${exitosos.length} archivos procesados correctamente`);
    console.log(`${fallidos.length} archivos con errores`);

    fallidos.forEach(f => console.log(`Error en ${f.ruta}: ${f.error}`));
  });