var express = require('express');
var router = express.Router();

const Adjunto  = require('../../models').adjuntos;
const Bitacora = require('../../models').bitacoras;

router.get('/consultaAdjuntos', async (req, res) => {
  try {
    const { idBitacora } = req.query;
    const where = {};
    if (idBitacora) where.idBitacora = +idBitacora;

    const adjuntos = await Adjunto.findAll({
      where,
      order: [['createdAt', 'DESC']]
    });
    if (!adjuntos.length) return res.json({ respuesta: 'No existen datos' });
    res.json(adjuntos);
  } catch (err) {
    console.error('consultaAdjuntos error:', err);
    res.status(400).send(err);
  }
});

router.get('/consultaAdjuntosEspecifica', async (req, res) => {
  try {
    const { id } = req.query;
    const where = {};
    if (id) where.id = +id;

    const adjuntos = await Adjunto.findAll({ where });
    if (!adjuntos.length) return res.json({ respuesta: 'No existen datos' });
    res.json(adjuntos);
  } catch (err) {
    console.error('consultaAdjuntosEspecifica error:', err);
    res.status(400).send(err);
  }
});

router.post('/crearAdjunto', async (req, res) => {
  try {
    const { idBitacora, titulo, extension, contenido } = req.body;

    if (!idBitacora || !titulo) {
      return res.status(400).json({ error: 'idBitacora y titulo son obligatorios' });
    }

    const bit = await Bitacora.findByPk(idBitacora);
    if (!bit) return res.status(400).json({ error: 'Bitácora no existe' });

    const nuevo = await Adjunto.create({
      idBitacora, titulo, extension, contenido
    });

    res.status(201).json(nuevo);
  } catch (err) {
    console.error('crearAdjunto error:', err);
    res.status(400).send(err);
  }
});

router.put('/actualizaAdjunto/:id', async (req, res) => {
  try {
    const id = +req.params.id;
    const { titulo, extension, contenido } = req.body;

    const encontrado = await Adjunto.findByPk(id);
    if (!encontrado) return res.status(404).json({ error: 'Adjunto no existe' });

    await Adjunto.update(
      { titulo, extension, contenido, updatedAt: new Date() },
      { where: { id } }
    );

    const refrescado = await Adjunto.findByPk(id);
    res.json(refrescado);
  } catch (err) {
    console.error('actualizaAdjunto error:', err);
    res.status(400).send(err);
  }
});

router.delete('/eliminarAdjunto/:id', async (req, res) => {
  try {
    const id = +req.params.id;
    const count = await Adjunto.destroy({ where: { id } });
    res.json({ eliminados: count });
  } catch (err) {
    console.error('eliminarAdjunto error:', err);
    res.status(400).send(err);
  }
});

module.exports = router;
