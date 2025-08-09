var express = require('express');
var router = express.Router();
const Usuario = require('../../models').usuarios;
const Proyecto = require('../../models').proyectos;
const Tarea = require('../../models').tareas;
const { Op, where } = require('sequelize');

router.get('/consultaTareas', function (req, res, next) {
    Tarea.findAll({
        include: [
                  {model: Usuario, attributes: ['usuario']},
                  {model: Proyecto, attributes: ['nombre']}
                 ]
    })
        .then(tareas => {
            if (tareas.length === 0) {
                res.json({ respuesta: "No existen datos" });
            } else {
                res.json(tareas);
            }
        }).catch(error => res.status(400).send(error));
});

router.get('/consultaTareaEspecifica', function (req, res, next) {
    let { usuario, nombreProyecto, nombreTarea, urgencia, fechaInicio, fechaFinEst, fechaFin, createdAt } = req.query;

    let valoresFiltros = {};

    if (nombreTarea) valoresFiltros.nombreTarea = nombreTarea;
    if (urgencia) valoresFiltros.urgencia = urgencia;
    if (fechaInicio) valoresFiltros.fechaInicio = fechaInicio;
    if (fechaFinEst) valoresFiltros.fechaFinEst = fechaFinEst;
    if (fechaFin) valoresFiltros.fechaFin = fechaFin;
    if (createdAt) valoresFiltros.createdAt = createdAt;

    let usuarioWhere = usuario ? { usuario } : undefined;
    let proyectoWhere = nombreProyecto ? { nombreProyecto } : undefined;

    Tarea.findAll({
        where: valoresFiltros,
        include: [
                  {model: Usuario, attributes: ['usuario'], where: usuarioWhere},
                  {model: Proyecto, attributes: ['nombre'], where: proyectoWhere}
                 ]
    })
        .then(tareas => {
            if (tareas.length === 0) {
                res.json({ respuesta: "No existen datos" });
            } else {
                res.json(tareas);
            }
        }).catch(error => res.status(400).send(error));
});

router.post('/crearTarea', function (req, res, next) {
  let { idProyecto, idUsuario, nombre, descripcion, urgencia } = req.body;

  Tarea.create({
    idProyecto: idProyecto,
    idUsuario: idUsuario,
    nombre: nombre,
    descripcion: descripcion,
    urgencia: urgencia,
    fechaInicio: null,
    fechaFinEst: null,
    fechaFin: null,
    createdAt: new Date(),
    updatedAt: new Date()
  }).then(tareas => {
    res.json(tareas);
  }).catch(error => {
    console.error('Error al guardar la tarea:', error);
    res.status(400).send({ message: 'Error al guardar', error });
  })
});

router.put('/actualizaTarea/:id', function (req, res) {
  const id = parseInt(req.params.id);
  let { idProyecto, idUsuario, descripcion, urgencia, fechaInicio, fechaFinEst, fechaFin } = req.body;

  Tarea.update({
    idProyecto: idProyecto,
    idUsuario: idUsuario,
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

router.delete('/eliminarTarea/:id', function (req, res, next) {
  let id = parseInt(req.params.id);

  Tarea.destroy({
    where: { id: id }
  }).then(respuesta => {
    res.json(respuesta);
  }).catch(error => res.status(400).send(error))
});



module.exports = router;