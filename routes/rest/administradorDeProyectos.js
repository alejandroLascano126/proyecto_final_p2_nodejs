var express = require('express');
var router = express.Router();
const Usuario = require('../../models').usuarios;
const { Op } = require('sequelize');

router.post('/iniciaSesion', function (req, res, next) {
    let { usuario, clave } = req.body;


    Usuario.findAll({
      where: {
        [Op.and]: [
          { 
            usuario: usuario,
            clave: clave
          }
        ]
      },
      attributes: { exclude: ["updatedAt","id","createdAt","clave"] }
    })
      .then(usuarios => {
        if (usuarios.length === 0) {
          res.json({ respuesta: "No se puedo iniciar sesión" });
        } else {
          res.json(usuarios);
        }
      })
      .catch(error =>
        res.status(400).send(error))
  });


module.exports = router;