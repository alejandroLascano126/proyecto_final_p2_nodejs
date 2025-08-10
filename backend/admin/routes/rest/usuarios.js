var express = require('express');
var router = express.Router();
const Usuario = require('../../models').usuarios;
const { Op } = require('sequelize');


router.get('/consultaUsuarios', function (req, res, next) {
  Usuario.findAll({
    attributes: { exclude: ["updatedAt"] },
  })
    .then(usuarios => {
      res.json(usuarios);
    })
    .catch(error => {
      res.status(400).send(error);
    });
});

router.get('/consultaUsuarioEspecifico', function (req, res) {
  let { id, usuario, nombre, apellido, correo, nivel, createdAt } = req.query;

  let valoresFiltros = {};

  if (usuario) valoresFiltros.usuario = usuario;
  if (id) valoresFiltros.id = id;
  if (nombre) valoresFiltros.nombre = nombre;
  if (apellido) valoresFiltros.apellido = apellido;
  if (correo) valoresFiltros.correo = correo;
  if (nivel) valoresFiltros.nivel = nivel;
  if (createdAt) valoresFiltros.createdAt = createdAt;

  Usuario.findAll({
    where: valoresFiltros,
    attributes: { exclude: ["updatedAt","id","createdAt","clave"] }
  })
  .then(usuarios => {
    if (usuarios.length === 0) {
      res.json({ respuesta: "No existen datos" });
    } else {
      res.json(usuarios);
    }
  })
  .catch(error => res.status(400).send(error));
});

router.post('/registraUsuario', function (req, res, next) {
  let { usuario, clave, nombre, apellido, correo, nivel } = req.body;

  Usuario.create({
    usuario: usuario,
    clave: clave,
    nombre: nombre,
    apellido: apellido,
    correo: correo,
    nivel: nivel,
    createdAt: new Date(),
    updatedAt: new Date()
  }).then(usuario => {
    res.json(usuario);
  }).catch(error => {
    console.error('Error al guardar el usuario:', error);
    res.status(400).send({ message: 'Error al guardar', error });
  }
  )
});

router.put('/actualizaUsuario/:id', function (req, res) {
  const id = parseInt(req.params.id);
  let { usuario, clave, nombre, apellido, correo, nivel } = req.body;

  Usuario.update({
    usuario,
    clave,
    nombre,
    apellido,
    correo,
    nivel,
    updatedAt: new Date()
  }, {
    where: { id }
  })
  .then(respuesta => res.json(respuesta))
  .catch(error => res.status(400).send(error));
});

router.delete('/eliminarUsuario/:id', function (req, res, next) {
  let id = parseInt(req.params.id);

  Usuario.destroy({
    where: { id: id }
  }).then(respuesta => {
    res.json(respuesta);
  }).catch(error => res.status(400).send(error))
});

router.post('/login', async function (req, res) {
  console.log(req.body);
  const { usuario, correo, clave } = req.body;
  try {
    // Permite login por usuario o correo
    const where = {};
    if (usuario) where.usuario = usuario;
    if (correo) where.correo = correo;
    where.clave = clave;

    const user = await Usuario.findOne({ where });
    if (!user) {
      return res.status(401).json({ error: 'Usuario o clave incorrectos' });
    }
    // No envíes la clave al frontend
    const { clave: _, ...userData } = user.toJSON();
    res.json({ usuario: userData });
  } catch (err) {
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

module.exports = router;
