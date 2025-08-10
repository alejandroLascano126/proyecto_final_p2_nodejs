
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
router.get('/dashboard/usuarios', isAuthenticated, function(req, res, next) {
  res.render('dashboard', { body: require('ejs').renderFile(
    __dirname + '/../views/partials/usuarios.ejs', {}, {}, function(err, str) { return str; }) });
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
    const response = await axios.post('http://localhost:3000/api/usuarios/login', { correo, clave });
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
    const response = await axios.post('http://localhost:3000/api/usuarios/registraUsuario', {
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

module.exports = router;
