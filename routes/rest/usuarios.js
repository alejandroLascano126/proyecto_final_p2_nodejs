var express = require('express');
var router = express.Router();
const Usuario = require('../../models').usuarios;

router.post('/save', function (req, res, next) {
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



module.exports = router;
