var express = require('express');
var router = express.Router();
const Proyecto = require('../../models').proyectos;
const Tarea = require('../../models').tareas;
const Bitacora = require('../../models').bitacoras;
const { Op, where } = require('sequelize');

router.get('/consultaBitacoras', function (req, res, next) {
    Bitacora.findAll({
        include: [
                   {model: Proyecto, attributes: ['nombre']},
                   {model: Tarea, attributes: ['nombre']}
                 ]
    })
        .then(bitacoras => {
            if (bitacoras.length === 0) {
                res.json({ respuesta: "No existen datos" });
            } else {
                res.json(bitacoras);
            }
        }).catch(error => res.status(400).send(error));
});

router.get('/consultaBitacoraEspecifica', function (req, res, next) {
    let { id, idProyecto, idTarea, createdAt } = req.query;

    let valoresFiltros = {};

    if (id) valoresFiltros.id = id;
    if (idProyecto) valoresFiltros.idProyecto = idProyecto;
    if (idTarea) valoresFiltros.idTarea = idTarea;
    if (createdAt) valoresFiltros.createdAt = createdAt;

    Bitacora.findAll({
        where: valoresFiltros,
        include: [
                   {model: Proyecto, attributes: ['nombre']},
                   {model: Tarea, attributes: ['nombre']}
                 ]
    })
        .then(bitacoras => {
            if (bitacoras.length === 0) {
                res.json({ respuesta: "No existen datos" });
            } else {
                res.json(bitacoras);
            }
        }).catch(error => res.status(400).send(error));
});

router.post('/crearBitacora', function (req, res, next) {
  let { idProyecto, idTarea, titulo, descripcion } = req.body;

  Bitacora.create({
    idProyecto: idProyecto,
    idTarea: idTarea,
    titulo: titulo,
    descripcion: descripcion,
    createdAt: new Date(),
    updatedAt: new Date()
  }).then(bitacoras => {
    res.json(bitacoras);
  }).catch(error => {
    console.error('Error al guardar la bitacora:', error);
    res.status(400).send({ message: 'Error al guardar', error });
  })
});

router.put('/actualizaBitacora/:id', function (req, res) {
  const id = parseInt(req.params.id);
  let { titulo, descripcion } = req.body;

  Bitacora.update({
    titulo: titulo,
    descripcion: descripcion,
    updatedAt: new Date()
  }, {
    where: { id }
  })
  .then(respuesta => res.json(respuesta))
  .catch(error => res.status(400).send(error));
});

router.delete('/eliminarBitacora/:id', function (req, res, next) {
  let id = parseInt(req.params.id);

  Bitacora.destroy({
    where: { id: id }
  }).then(respuesta => {
    res.json(respuesta);
  }).catch(error => res.status(400).send(error))
});



module.exports = router;