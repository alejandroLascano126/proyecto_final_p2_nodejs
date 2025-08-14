var express = require('express');
var router = express.Router();
const Usuario = require('../../models').usuarios;
const Proyecto = require('../../models').proyectos;
const { Op } = require('sequelize');


router.get('/consultaProyectos', async (req, res) => {
    try {
        const proyectos = await Proyecto.findAll({
            include: [{
                model: Usuario,
                attributes: ['usuario']
            }],
            order: [['createdAt', 'DESC']]
        });
        
        if (proyectos.length === 0) {
            res.json({ respuesta: "No existen datos" });
        } else {
            res.json(proyectos);
        }
    } catch (error) {
        console.error('consultaProyectos error:', error);
        res.status(400).send(error);
    }
});

router.get('/consultaProyectoEspecifico', async (req, res) => {
    try {
        const { usuario, nombre, urgencia, fechaInicio, fechaFinEst, fechaFin, createdAt } = req.query;

        const where = {};
        
        // Filtros para la tabla proyectos
        if (nombre) where.nombre = { [Op.like]: `%${nombre}%` }; // Búsqueda parcial
        if (urgencia) where.urgencia = urgencia;
        if (fechaInicio) where.fechaInicio = fechaInicio;
        if (fechaFinEst) where.fechaFinEst = fechaFinEst;
        if (fechaFin) where.fechaFin = fechaFin;
        if (createdAt) where.createdAt = createdAt;

        // Filtro para usuario
        const usuarioWhere = usuario ? { usuario: { [Op.like]: `%${usuario}%` } } : {};

        const proyectos = await Proyecto.findAll({
            where,
            include: [{
                model: Usuario,
                attributes: ['usuario'],
                where: Object.keys(usuarioWhere).length ? usuarioWhere : undefined,
                required: Object.keys(usuarioWhere).length > 0
            }],
            order: [['createdAt', 'DESC']]
        });

        if (proyectos.length === 0) {
            res.json({ respuesta: "No existen datos" });
        } else {
            res.json(proyectos);
        }
    } catch (error) {
        console.error('consultaProyectoEspecifico error:', error);
        res.status(400).send(error);
    }
});

router.post('/creaProyecto', function (req, res, next) {
  let { usuarioId, nombre, descripcion, urgencia, fechaInicio, fechaFinEst, fechaFin } = req.body;

  Proyecto.create({
    usuarioId: usuarioId,
    nombre: nombre,
    descripcion: descripcion,
    urgencia: urgencia,
    fechaInicio: fechaInicio || new Date(), // Si no se proporciona, usar fecha actual
    fechaFinEst: fechaFinEst || null,
    fechaFin: fechaFin || null,
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

// ===== opciones ligeras para combos =====
router.get('/options', async (req, res) => {
  try {
    const rows = await Proyecto.findAll({
      attributes: ['id', 'nombre'],
      order: [['nombre', 'ASC']]
    });
    res.json(rows);
  } catch (e) {
    console.error('proyectos/options:', e);
    res.status(500).json({ error: 'Error cargando opciones de proyectos' });
  }
});



module.exports = router;
