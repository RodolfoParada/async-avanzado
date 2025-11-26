// Task 1: Promise Chaining Avanzado (8 minutos)
// Las Promises permiten encadenar operaciones asíncronas de manera legible y manejar errores de forma centralizada.

// Promise Chaining Básico
function obtenerUsuario(id) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (id > 0) {
        resolve({ id, nombre: `Usuario ${id}`, email: `user${id}@example.com` });
      } else {
        reject(new Error('ID de usuario inválido'));
      }
    }, 500);
  });
}

function obtenerPostsUsuario(userId) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve([
        { id: 1, titulo: 'Post 1', userId, contenido: 'Contenido del post 1' },
        { id: 2, titulo: 'Post 2', userId, contenido: 'Contenido del post 2' }
      ]);
    }, 300);
  });
}

function obtenerComentariosPost(postId) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve([
        { id: 1, texto: 'Comentario 1', postId, autor: 'Ana' },
        { id: 2, texto: 'Comentario 2', postId, autor: 'Carlos' }
      ]);
    }, 200);
  });
}

// Chaining con transformación de datos
obtenerUsuario(1)
  .then(usuario => {
    console.log('Usuario obtenido:', usuario.nombre);
    return obtenerPostsUsuario(usuario.id);
  })
  .then(posts => {
    console.log(`Encontrados ${posts.length} posts`);
    // Obtener comentarios del primer post
    return obtenerComentariosPost(posts[0].id);
  })
  .then(comentarios => {
    console.log(`Comentarios del post: ${comentarios.length}`);
    return comentarios.map(c => c.texto);
  })
  .then(textosComentarios => {
    console.log('Textos de comentarios:', textosComentarios);
  })
  .catch(error => {
    console.error('Error en la cadena:', error.message);
  });

// Error Handling en Promise Chains
// Manejo de errores específicos
function procesarDatosUsuario(id) {
  return obtenerUsuario(id)
    .then(usuario => {
      if (!usuario.email) {
        throw new Error('Usuario sin email válido');
      }
      return usuario;
    })
    .then(usuario => obtenerPostsUsuario(usuario.id))
    .then(posts => {
      if (posts.length === 0) {
        throw new Error('Usuario sin posts');
      }
      return posts;
    })
    .catch(error => {
      // Diferentes tipos de error handling
      if (error.message.includes('ID')) {
        console.error('Error de validación:', error.message);
        return { error: 'VALIDATION_ERROR', message: error.message };
      } else if (error.message.includes('sin')) {
        console.error('Error de datos:', error.message);
        return { error: 'DATA_ERROR', message: error.message };
      } else {
        console.error('Error desconocido:', error.message);
        throw error; // Re-throw para que el caller lo maneje
      }
    });
}

// Uso con diferentes escenarios
procesarDatosUsuario(1).then(resultado => {
  if (resultado.error) {
    console.log('Procesamiento fallido:', resultado.message);
  } else {
    console.log('Procesamiento exitoso');
  }
});

procesarDatosUsuario(-1).then(resultado => {
  console.log('Resultado con ID inválido:', resultado);
});

// Promise Recovery (Recuperación)
// Recuperación automática de errores
function obtenerDatosConFallback(id) {
  return obtenerUsuario(id)
    .catch(error => {
      console.warn('Error obteniendo usuario, intentando con ID alternativo:', error.message);
      // Intentar con un usuario por defecto
      return { id: 0, nombre: 'Usuario Desconocido', email: 'unknown@example.com' };
    })
    .then(usuario => {
      console.log('Usuario final:', usuario.nombre);
      return usuario;
    });
}

// Recuperación condicional
function obtenerDatosInteligente(id) {
  return obtenerUsuario(id)
    .catch(error => {
      if (error.message.includes('ID')) {
        // Para errores de ID, intentar con usuario genérico
        console.log('Recuperando con usuario genérico...');
        return obtenerUsuario(999); // Usuario genérico
      } else {
        // Para otros errores, usar datos por defecto
        console.log('Usando datos por defecto...');
        return Promise.resolve({
          id: 0,
          nombre: 'Usuario por Defecto',
          email: 'default@example.com'
        });
      }
    });
}