
var express = require('express');
var router = express.Router();
const axios = require('axios');

// Home page
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Gestor de Proyectos' });
});

// Login page
router.get('/login', function(req, res, next) {
  res.render('login');
});

function isAuthenticated(req, res, next) {
  if (req.session && req.session.user) {
    return next();
  }
  res.redirect('/login');
}

// Dashboard principal
router.get('/dashboard', isAuthenticated, function(req, res, next) {
  res.render('dashboard', { body: '' });
});

// Dashboard secciones (partials)
// router.get('/dashboard/usuarios', isAuthenticated, function(req, res, next) {
//   res.render('dashboard', { body: require('ejs').renderFile(
//     __dirname + '/../views/partials/usuarios.ejs', {}, {}, function(err, str) { return str; }) });
// });
router.get('/dashboard/usuarios', isAuthenticated, async function (req, res, next) {
  try {
    const usuarios = await consultaUsuarios();
    require('ejs').renderFile(__dirname + '/../views/partials/usuarios.ejs',{ usuarios },{},
      function (err, str) {
        if (err) return next(err);
        res.render('dashboard', { body: str });
      }
    );
  } catch (err) {
    next(err);
  }
});
router.get('/dashboard/proyectos', isAuthenticated, function(req, res, next) {
  res.render('dashboard', { body: require('ejs').renderFile(
    __dirname + '/../views/partials/proyectos.ejs', {}, {}, function(err, str) { return str; }) });
});
router.get('/dashboard/tareas', isAuthenticated, function(req, res, next) {
  res.render('dashboard', { body: require('ejs').renderFile(
    __dirname + '/../views/partials/tareas.ejs', {}, {}, function(err, str) { return str; }) });
});
router.get('/dashboard/bitacoras', isAuthenticated, function(req, res, next) {
  res.render('dashboard', { body: require('ejs').renderFile(
    __dirname + '/../views/partials/bitacoras.ejs', {}, {}, function(err, str) { return str; }) });
});
router.get('/dashboard/adjuntos', isAuthenticated, function(req, res, next) {
  res.render('dashboard', { body: require('ejs').renderFile(
    __dirname + '/../views/partials/adjuntos.ejs', {}, {}, function(err, str) { return str; }) });
});


// Login: solo por correo y clave
router.post('/login', async function(req, res, next) {
  const { correo, clave } = req.body;
  try {
    const response = await axios.post('http://localhost:3000/rest/usuarios/login', { correo, clave });
    req.session.user = response.data.usuario;
    res.redirect('/dashboard');
  } catch (err) {
    res.render('login', { error: 'Credenciales incorrectas' });
  }
});


// Registro: enviar los campos como llegan del formulario
router.post('/register', async function(req, res, next) {
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
router.post('/actualizaUsuario', async function(req, res, next) {
  const { idUsuario, usuario, nombre, apellido, correo, clave, nivel } = req.body;

  try {
    await axios.put(`http://localhost:3000/rest/usuarios/actualizaUsuario/${idUsuario}`, {
      usuario,
      clave,
      nombre,
      apellido,
      correo,
      nivel: nivel || 1
    });

    res.redirect('/dashboard');
  } catch (err) {
    console.error('Error actualizando usuario:', err.message);
    res.redirect('/dashboard');
  }
});

// Eliminar un usuario
router.post('/eliminarUsuario', async function(req, res, next) {
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



async function consultaUsuarios() {
  const response = await axios.get('http://localhost:3000/rest/usuarios/consultaUsuarios');
  return response.data; // Devuelve los usuarios
}










module.exports = router;
