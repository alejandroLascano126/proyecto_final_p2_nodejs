
var express = require('express');
var router = express.Router();
const axios = require('axios');
const ejs = require('ejs');

// Home page
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Gestor de Proyectos' });
});

// Login page
router.get('/login', function (req, res, next) {
  res.render('login');
});

function isAuthenticated(req, res, next) {
  if (req.session && req.session.user) {
    return next();
  }
  res.redirect('/login');
}

// Dashboard principal
router.get('/dashboard', isAuthenticated, function (req, res, next) {
  res.render('dashboard', { body: '' });
});

// Dashboard secciones (partials)
// router.get('/dashboard/usuarios', isAuthenticated, function(req, res, next) {
//   res.render('dashboard', { body: require('ejs').renderFile(
//     __dirname + '/../views/partials/usuarios.ejs', {}, {}, function(err, str) { return str; }) });
// });
router.get('/dashboard/usuarios', isAuthenticated, async function (req, res, next) {
  try {
    const body = await ejs.renderFile(__dirname + '/../views/partials/usuarios.ejs');
    res.render('dashboard', { body });
  } catch (error) {
    console.error('Error rendering usuarios partial:', error);
    res.status(500).send('Error al cargar la vista de usuarios');
  }
});
router.get('/dashboard/proyectos', isAuthenticated, async function (req, res, next) {
  try {
    const ejs = require('ejs');
    const fs = require('fs');
    const path = require('path');
    
    const partialPath = path.join(__dirname, '../views/partials/proyectos.ejs');
    const partialContent = await ejs.renderFile(partialPath, {});
    
    res.render('dashboard', { body: partialContent });
  } catch (err) {
    next(err);
  }
});
router.get('/dashboard/tareas', isAuthenticated, async function (req, res, next) {
  try {
    const body = await ejs.renderFile(__dirname + '/../views/partials/tareas.ejs');
    res.render('dashboard', { body });
  } catch (error) {
    console.error('Error rendering tareas partial:', error);
    res.status(500).send('Error al cargar la vista de tareas');
  }
});
router.get('/dashboard/bitacoras', isAuthenticated, function (req, res, next) {
  res.render('dashboard', {
    body: require('ejs').renderFile(
      __dirname + '/../views/partials/bitacoras.ejs', {}, {}, function (err, str) { return str; })
  });
});
router.get('/dashboard/adjuntos', isAuthenticated, function (req, res, next) {
  res.render('dashboard', {
    body: require('ejs').renderFile(
      __dirname + '/../views/partials/adjuntos.ejs', {}, {}, function (err, str) { return str; })
  });
});


// Login: solo por correo y clave
router.post('/login', async function (req, res, next) {
  const { correo, clave } = req.body;
  try {
    const response = await axios.post('http://localhost:3000/rest/usuarios/login', { correo, clave });
    req.session.user = response.data.usuario;
    res.redirect('/dashboard/proyectos');
  } catch (err) {
    res.render('login', { error: 'Credenciales incorrectas' });
  }
});


// Registro: enviar los campos como llegan del formulario
router.post('/register', async function (req, res, next) {
  const { usuario, clave, nombre, apellido, correo } = req.body;
  try {
    const response = await axios.post('http://localhost:3000/rest/usuarios/registraUsuario', {
      usuario,
      clave,
      nombre,
      apellido,
      correo,
      nivel: 1
    });
    req.session.user = response.data;
    res.redirect('/dashboard');
  } catch (err) {
    res.render('login', { error: 'Error al registrar usuario' });
  }
});

// Actualiza un usuario
router.put('/actualizarUsuarios', async (req, res) => {
  const usuarios = req.body; // Array con objetos { id, campo1, campo2, ... }
  const usuarioSesion = req.session.user;

  if (!usuarioSesion) {
    return res.status(401).json({ error: 'No autorizado. Debes iniciar sesión.' });
  }
  if (usuarioSesion.nivel !== 1) {
    return res.status(403).json({ error: 'No tienes permisos para actualizar usuarios.' });
  }

  try {
    for (const u of usuarios) {
      // Asumiendo que tu API REST acepta PUT a /rest/usuarios/actualizarUsuario/:id
      await axios.put(`http://localhost:3000/rest/usuarios/actualizaUsuario/${u.id}`, u);
    }
    res.json({ mensaje: 'Usuarios actualizados correctamente' });
  } catch (error) {
    console.error('Error actualizando usuarios:', error);
    res.status(500).json({ error: 'Error actualizando usuarios' });
  }
});

// Eliminar un usuario
router.post('/eliminarUsuario', async function (req, res, next) {
  const { idUsuario } = req.body;
  const usuarioSesion = req.session.user;

  if (!usuarioSesion) {
    return res.status(401).json({ error: 'No autorizado. Debes iniciar sesión.' });
  }

  if (usuarioSesion.id == idUsuario) {
    return res.status(400).json({ error: 'No puedes eliminar tu propio usuario.' });
  }

  if (usuarioSesion.nivel !== 1) {
    return res.status(403).json({ error: 'No tienes permisos para eliminar usuarios.' });
  }

  try {
    await axios.delete(`http://localhost:3000/rest/usuarios/eliminarUsuario/${idUsuario}`);
    return res.json({ success: true });
  } catch (err) {
    console.error('Error eliminando usuario:', err.message);
    return res.status(500).json({ error: 'Error interno al eliminar usuario.' });
  }
});


// Registro: enviar los campos como llegan del formulario
router.post('/registerAdmin', async function (req, res, next) {
  const { usuario, clave, nombre, apellido, correo } = req.body;
  try {
    const response = await axios.post('http://localhost:3000/rest/usuarios/registraUsuario', {
      usuario,
      clave,
      nombre,
      apellido,
      correo,
      nivel: 1
    });

    res.status(201).json({ mensaje: 'Usuario registrado correctamente' });
  } catch (err) {
    res.status(500).json({ error: 'Error al registrar usuario' });
  }
});



async function consultaUsuarios() {
  const response = await axios.get('http://localhost:3000/rest/usuarios/consultaUsuarios');
  return response.data; // Devuelve los usuarios
}

// ===== RUTAS PROXY PARA PROYECTOS =====

// Obtener todos los proyectos
router.get('/api/proyectos/consultaProyectos', isAuthenticated, async function(req, res, next) {
  try {
    const response = await axios.get('http://localhost:3000/rest/proyectos/consultaProyectos');
    res.json(response.data);
  } catch (error) {
    console.error('Error consultando proyectos:', error);
    res.status(500).json({ error: 'Error al consultar proyectos' });
  }
});

// Consultar proyecto específico con filtros
router.get('/api/proyectos/consultaProyectoEspecifico', isAuthenticated, async function(req, res, next) {
  try {
    const queryParams = new URLSearchParams(req.query).toString();
    const response = await axios.get(`http://localhost:3000/rest/proyectos/consultaProyectoEspecifico?${queryParams}`);
    res.json(response.data);
  } catch (error) {
    console.error('Error consultando proyecto específico:', error);
    res.status(500).json({ error: 'Error al consultar proyecto específico' });
  }
});

// Crear nuevo proyecto
router.post('/api/proyectos/creaProyecto', isAuthenticated, async function(req, res, next) {
  try {
    // Agregar el ID del usuario logueado al proyecto
    const proyectoData = {
      ...req.body,
      usuarioId: req.session.user.id
    };
    
    const response = await axios.post('http://localhost:3000/rest/proyectos/creaProyecto', proyectoData);
    res.json(response.data);
  } catch (error) {
    console.error('Error creando proyecto:', error);
    res.status(500).json({ error: 'Error al crear proyecto' });
  }
});

// Actualizar proyecto
router.put('/api/proyectos/actualizaProyecto/:id', isAuthenticated, async function(req, res, next) {
  try {
    const id = req.params.id;
    const response = await axios.put(`http://localhost:3000/rest/proyectos/actualizaProyecto/${id}`, req.body);
    res.json(response.data);
  } catch (error) {
    console.error('Error actualizando proyecto:', error);
    res.status(500).json({ error: 'Error al actualizar proyecto' });
  }
});

// Eliminar proyecto
router.delete('/api/proyectos/eliminarProyecto/:id', isAuthenticated, async function(req, res, next) {
  try {
    const id = req.params.id;
    const response = await axios.delete(`http://localhost:3000/rest/proyectos/eliminarProyecto/${id}`);
    res.json(response.data);
  } catch (error) {
    console.error('Error eliminando proyecto:', error);
    res.status(500).json({ error: 'Error al eliminar proyecto' });
  }
});

// ===== RUTAS PROXY PARA TAREAS =====

// Obtener todas las tareas
router.get('/api/tareas/consultaTareas', isAuthenticated, async function(req, res, next) {
  try {
    const response = await axios.get('http://localhost:3000/rest/tareas/consultaTareas');
    res.json(response.data);
  } catch (error) {
    console.error('Error consultando tareas:', error);
    res.status(500).json({ error: 'Error al consultar tareas' });
  }
});

// Consultar tarea específica con filtros
router.get('/api/tareas/consultaTareaEspecifica', isAuthenticated, async function(req, res, next) {
  try {
    const queryParams = new URLSearchParams(req.query).toString();
    const response = await axios.get(`http://localhost:3000/rest/tareas/consultaTareaEspecifica?${queryParams}`);
    res.json(response.data);
  } catch (error) {
    console.error('Error consultando tarea específica:', error);
    res.status(500).json({ error: 'Error al consultar tarea específica' });
  }
});

// Crear nueva tarea
router.post('/api/tareas/crearTarea', isAuthenticated, async function(req, res, next) {
  try {
    const response = await axios.post('http://localhost:3000/rest/tareas/crearTarea', req.body);
    res.json(response.data);
  } catch (error) {
    console.error('Error creando tarea:', error);
    res.status(500).json({ error: 'Error al crear tarea' });
  }
});

// Actualizar tarea
router.put('/api/tareas/actualizaTarea/:id', isAuthenticated, async function(req, res, next) {
  try {
    const id = req.params.id;
    const response = await axios.put(`http://localhost:3000/rest/tareas/actualizaTarea/${id}`, req.body);
    res.json(response.data);
  } catch (error) {
    console.error('Error actualizando tarea:', error);
    res.status(500).json({ error: 'Error al actualizar tarea' });
  }
});

// Eliminar tarea
router.delete('/api/tareas/eliminarTarea/:id', isAuthenticated, async function(req, res, next) {
  try {
    const id = req.params.id;
    const response = await axios.delete(`http://localhost:3000/rest/tareas/eliminarTarea/${id}`);
    res.json(response.data);
  } catch (error) {
    console.error('Error eliminando tarea:', error);
    res.status(500).json({ error: 'Error al eliminar tarea' });
  }
});

// ===== RUTAS PROXY PARA USUARIOS =====

// Obtener todos los usuarios (para los selects)
router.get('/api/usuarios/consultaUsuarios', isAuthenticated, async function(req, res, next) {
  try {
    const response = await axios.get('http://localhost:3000/rest/usuarios/consultaUsuarios');
    res.json(response.data);
  } catch (error) {
    console.error('Error consultando usuarios:', error);
    res.status(500).json({ error: 'Error al consultar usuarios' });
  }
});

// ===== RUTAS PROXY PARA BITACORAS =====
router.get('/api/bitacoras/consultaBitacoras', isAuthenticated, async (req, res) => {
  try {
    const r = await axios.get('http://localhost:3000/rest/bitacoras/consultaBitacoras');
    res.json(r.data);
  } catch (err) {
    console.error('proxy consultaBitacoras:', err);
    res.status(500).json({ error: 'Error al consultar bitácoras' });
  }
});

router.get('/api/bitacoras/consultaBitacoraEspecifica', isAuthenticated, async (req, res) => {
  try {
    const r = await axios.get('http://localhost:3000/rest/bitacoras/consultaBitacoraEspecifica', { params: req.query });
    res.json(r.data);
  } catch (err) {
    console.error('proxy consultaBitacoraEspecifica:', err);
    res.status(500).json({ error: 'Error al consultar bitácora específica' });
  }
});

router.post('/api/bitacoras/crearBitacora', isAuthenticated, async (req, res) => {
  try {
    const r = await axios.post('http://localhost:3000/rest/bitacoras/crearBitacora', req.body);
    res.json(r.data);
  } catch (err) {
    console.error('proxy crearBitacora:', err);
    res.status(500).json({ error: 'Error al crear bitácora' });
  }
});

router.put('/api/bitacoras/actualizaBitacora/:id', isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const r = await axios.put(`http://localhost:3000/rest/bitacoras/actualizaBitacora/${id}`, req.body);
    res.json(r.data);
  } catch (err) {
    console.error('proxy actualizaBitacora:', err);
    res.status(500).json({ error: 'Error al actualizar bitácora' });
  }
});

router.delete('/api/bitacoras/eliminarBitacora/:id', isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const r = await axios.delete(`http://localhost:3000/rest/bitacoras/eliminarBitacora/${id}`);
    res.json(r.data);
  } catch (err) {
    console.error('proxy eliminarBitacora:', err);
    res.status(500).json({ error: 'Error al eliminar bitácora' });
  }
});


module.exports = router;
