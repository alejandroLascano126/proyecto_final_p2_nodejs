var express = require('express');
var router = express.Router();
const Adjunto = require('../../models').adjuntos;
const { Op, where } = require('sequelize');

router.get('/consultaAdjuntos', function (req, res, next) {
    Adjunto.findAll()
        .then(adjuntos => {
            if (adjuntos.length === 0) {
                res.json({ respuesta: "No existen datos" });
            } else {
                res.json(adjuntos);
            }
        }).catch(error => res.status(400).send(error));
});

router.get('/consultaAdjuntosEspecifica', function (req, res, next) {
    let { id, idBitacora, titulo, extension } = req.query;

    let valoresFiltros = {};

    if (id) valoresFiltros.id = id;
    if (idBitacora) valoresFiltros.idBitacora = idBitacora;
    if (titulo) valoresFiltros.titulo = titulo;
    if (extension) valoresFiltros.extension = extension;

    Adjunto.findAll({
        where: valoresFiltros
    })
        .then(adjuntos => {
            if (adjuntos.length === 0) {
                res.json({ respuesta: "No existen datos" });
            } else {
                res.json(adjuntos);
            }
        }).catch(error => res.status(400).send(error));
});

router.post('/crearAdjunto', function (req, res, next) {
  let { idBitacora, titulo, extension, contenido } = req.body;

  Adjunto.create({
    idBitacora: idBitacora,
    titulo: titulo,
    extension: extension,
    contenido: contenido,
    createdAt: new Date(),
    updatedAt: new Date()
  }).then(adjuntos => {
    res.json(adjuntos);
  }).catch(error => {
    console.error('Error al guardar el adjunto:', error);
    res.status(400).send({ message: 'Error al guardar', error });
  })
});

router.put('/actualizaAdjunto/:id', function (req, res) {
  const id = parseInt(req.params.id);
  let { titulo } = req.body;

  Adjunto.update({
    titulo: titulo,
    updatedAt: new Date()
  }, {
    where: { id }
  })
  .then(respuesta => res.json(respuesta))
  .catch(error => res.status(400).send(error));
});

router.delete('/eliminarAdjunto/:id', function (req, res, next) {
  let id = parseInt(req.params.id);

  Adjunto.destroy({
    where: { id: id }
  }).then(respuesta => {
    res.json(respuesta);
  }).catch(error => res.status(400).send(error))
});



module.exports = router;