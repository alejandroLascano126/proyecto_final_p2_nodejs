var express = require('express');
var router = express.Router();

const Proyecto  = require('../../models').proyectos;
const Tarea     = require('../../models').tareas;
const Bitacora  = require('../../models').bitacoras;
const { Op }    = require('sequelize');

router.get('/consultaBitacoras', async (req, res) => {
  try {
    const bitacoras = await Bitacora.findAll({
      order: [['createdAt', 'DESC']],
      include: [
        { model: Proyecto, attributes: ['id', 'nombre'] },
        { model: Tarea,    attributes: ['id', 'nombre'] }
      ]
    });
    if (!bitacoras.length) return res.json({ respuesta: 'No existen datos' });
    res.json(bitacoras);
  } catch (err) {
    console.error('consultaBitacoras error:', err);
    res.status(400).send(err);
  }
});

router.get('/consultaBitacoraEspecifica', async (req, res) => {
  try {
    const { id, idProyecto, idTarea, createdAt } = req.query;
    const where = {};
    if (id) where.id = +id;
    if (idProyecto) where.idProyecto = +idProyecto;
    if (idTarea) where.idTarea = +idTarea;
    if (createdAt) where.createdAt = createdAt; // yyyy-mm-dd o ISO

    const bitacoras = await Bitacora.findAll({
      where,
      include: [
        { model: Proyecto, attributes: ['id', 'nombre'] },
        { model: Tarea,    attributes: ['id', 'nombre'] }
      ],
      order: [['createdAt', 'DESC']]
    });
    if (!bitacoras.length) return res.json({ respuesta: 'No existen datos' });
    res.json(bitacoras);
  } catch (err) {
    console.error('consultaBitacoraEspecifica error:', err);
    res.status(400).send(err);
  }
});

router.post('/crearBitacora', async (req, res) => {
  try {
    const { idProyecto, idTarea, titulo, descripcion } = req.body;

    if (!idProyecto || !idTarea || !titulo) {
      return res.status(400).json({ error: 'idProyecto, idTarea y titulo son obligatorios' });
    }

    const proyecto = await Proyecto.findByPk(idProyecto);
    if (!proyecto) return res.status(400).json({ error: 'Proyecto no existe' });

    const tarea = await Tarea.findByPk(idTarea);
    if (!tarea) return res.status(400).json({ error: 'Tarea no existe' });

    const nueva = await Bitacora.create({
      idProyecto, idTarea, titulo, descripcion
    });

    res.status(201).json(nueva);
  } catch (err) {
    console.error('crearBitacora error:', err);
    res.status(400).send(err);
  }
});

router.put('/actualizaBitacora/:id', async (req, res) => {
  try {
    const id = +req.params.id;
    const { titulo, descripcion } = req.body;

    const encontrada = await Bitacora.findByPk(id);
    if (!encontrada) return res.status(404).json({ error: 'Bitácora no existe' });

    await Bitacora.update(
      { titulo, descripcion, updatedAt: new Date() },
      { where: { id } }
    );

    const refrescada = await Bitacora.findByPk(id);
    res.json(refrescada);
  } catch (err) {
    console.error('actualizaBitacora error:', err);
    res.status(400).send(err);
  }
});

router.delete('/eliminarBitacora/:id', async (req, res) => {
  try {
    const id = +req.params.id;
    const count = await Bitacora.destroy({ where: { id } });
    res.json({ eliminados: count });
  } catch (err) {
    console.error('eliminarBitacora error:', err);
    res.status(400).send(err);
  }
});

module.exports = router;
