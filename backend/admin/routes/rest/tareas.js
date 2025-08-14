var express = require('express');
var router = express.Router();
const Usuario = require('../../models').usuarios;
const Proyecto = require('../../models').proyectos;
const Tarea = require('../../models').tareas;
const { Op, where } = require('sequelize');

router.get('/consultaTareas', async (req, res) => {
    try {
        const tareas = await Tarea.findAll({
            include: [
                { model: Usuario, attributes: ['usuario'] },
                { model: Proyecto, attributes: ['nombre'] }
            ],
            order: [['createdAt', 'DESC']]
        });
        
        if (tareas.length === 0) {
            res.json({ respuesta: "No existen datos" });
        } else {
            res.json(tareas);
        }
    } catch (error) {
        console.error('consultaTareas error:', error);
        res.status(400).send(error);
    }
});

router.get('/consultaTareaEspecifica', async (req, res) => {
    try {
        const { usuario, nombreProyecto, nombre, urgencia, fechaInicio, fechaFinEst, fechaFin, createdAt } = req.query;

        const where = {};
        
        // Filtros para la tabla tareas
        if (nombre) where.nombre = { [Op.like]: `%${nombre}%` }; // Búsqueda parcial
        if (urgencia) where.urgencia = urgencia;
        if (fechaInicio) where.fechaInicio = fechaInicio;
        if (fechaFinEst) where.fechaFinEst = fechaFinEst;
        if (fechaFin) where.fechaFin = fechaFin;
        if (createdAt) where.createdAt = createdAt;

        // Filtros para las tablas relacionadas
        const usuarioWhere = usuario ? { usuario: { [Op.like]: `%${usuario}%` } } : {};
        const proyectoWhere = nombreProyecto ? { nombre: { [Op.like]: `%${nombreProyecto}%` } } : {};

        const tareas = await Tarea.findAll({
            where,
            include: [
                {
                    model: Usuario,
                    attributes: ['usuario'],
                    where: Object.keys(usuarioWhere).length ? usuarioWhere : undefined,
                    required: Object.keys(usuarioWhere).length > 0
                },
                {
                    model: Proyecto,
                    attributes: ['nombre'],
                    where: Object.keys(proyectoWhere).length ? proyectoWhere : undefined,
                    required: Object.keys(proyectoWhere).length > 0
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        if (tareas.length === 0) {
            res.json({ respuesta: "No existen datos" });
        } else {
            res.json(tareas);
        }
    } catch (error) {
        console.error('consultaTareaEspecifica error:', error);
        res.status(400).send(error);
    }
});

router.post('/crearTarea', function (req, res, next) {
  let { idProyecto, idUsuario, nombre, descripcion, urgencia, fechaInicio, fechaFinEst, fechaFin } = req.body;

  Tarea.create({
    idProyecto: idProyecto,
    idUsuario: idUsuario,
    nombre: nombre,
    descripcion: descripcion,
    urgencia: urgencia,
    fechaInicio: fechaInicio || new Date(), // Si no se proporciona, usar fecha actual
    fechaFinEst: fechaFinEst || null,
    fechaFin: fechaFin || null,
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

// ===== opciones ligeras para combos =====
router.get('/options', async (req, res) => {
  try {
    const rows = await require('../../models').tareas.findAll({
      attributes: ['id', 'nombre', 'idProyecto'],
      order: [['nombre', 'ASC']]
    });
    res.json(rows);
  } catch (e) {
    console.error('tareas/options:', e);
    res.status(500).json({ error: 'Error cargando opciones de tareas' });
  }
});


module.exports = router;