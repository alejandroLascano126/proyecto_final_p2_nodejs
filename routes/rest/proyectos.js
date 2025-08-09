var express = require('express');
var router = express.Router();
const Usuario = require('../../models').usuarios;
const Proyecto = require('../../models').proyectos;
const { Op } = require('sequelize');


router.get('/consultaProyectos', function (req, res, next) {
    Proyecto.findAll({
        include: [{
            model: Usuario,
            attributes: ['usuario']
        }]
    })
        .then(proyectos => {
            if (proyectos.length === 0) {
                res.json({ respuesta: "No existen datos" });
            } else {
                res.json(proyectos);
            }
        }).catch(error => res.status(400).send(error));
});

router.get('/consultaProyectoEspecifico', function (req, res) {
    let { usuario, nombre, urgencia, fechaInicio, fechaFinEst, fechaFin, createdAt } = req.query;

    let valoresFiltros = {};

    if (nombre) valoresFiltros.nombre = nombre;
    if (urgencia) valoresFiltros.urgencia = urgencia;
    if (fechaInicio) valoresFiltros.fechaInicio = fechaInicio;
    if (fechaFinEst) valoresFiltros.fechaFinEst = fechaFinEst;
    if (fechaFin) valoresFiltros.fechaFin = fechaFin;
    if (createdAt) valoresFiltros.createdAt = createdAt;

    Proyecto.findAll({
        where: valoresFiltros,
        include: [{
            model: Usuario,
            attributes: ['usuario'],
            where: usuario ? { usuario: usuario } : undefined
        }]
    })
        .then(proyectos => {
            if (proyectos.length === 0) {
                res.json({ respuesta: "No existen datos" });
            } else {
                res.json(proyectos);
            }
        }).catch(error => res.status(400).send(error));
});

router.post('/creaProyecto', function (req, res, next) {
  let { usuarioId, nombre, descripcion, urgencia } = req.body;

  Proyecto.create({
    usuarioId: usuarioId,
    nombre: nombre,
    descripcion: descripcion,
    urgencia: urgencia,
    fechaInicio: null,
    fechaFinEst: null,
    fechaFin: null,
    createdAt: new Date(),
    updatedAt: new Date()
  }).then(proyectos => {
    res.json(proyectos);
  }).catch(error => {
    console.error('Error al guardar el proyecto:', error);
    res.status(400).send({ message: 'Error al guardar', error });
  })
});

router.put('/actualizaProyecto/:id', function (req, res) {
  const id = parseInt(req.params.id);
  let { usuarioId, descripcion, urgencia, fechaInicio, fechaFinEst, fechaFin } = req.body;

  Proyecto.update({
    usuarioId: usuarioId,
    descripcion: descripcion,
    urgencia: urgencia,
    fechaInicio: fechaInicio,
    fechaFinEst: fechaFinEst,
    fechaFin: fechaFin,
    updatedAt: new Date()
  }, {
    where: { id }
  })
  .then(respuesta => res.json(respuesta))
  .catch(error => res.status(400).send(error));
});

router.delete('/eliminarProyecto/:id', function (req, res, next) {
  let id = parseInt(req.params.id);

  Proyecto.destroy({
    where: { id: id }
  }).then(respuesta => {
    res.json(respuesta);
  }).catch(error => res.status(400).send(error))
});


module.exports = router;
