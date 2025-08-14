// backend/admin/routes/rest/dashboard.js
var express = require('express');
var router = express.Router();

const {
  Sequelize,
  sequelize,
  usuarios: Usuario,
  proyectos: Proyecto,
  tareas: Tarea,
  bitacoras: Bitacora,
  adjuntos: Adjunto
} = require('../../models');

const { Op } = Sequelize;

/** KPIs y estados */
router.get('/kpis', async (req, res) => {
  try {
    const now = new Date();

    const [
      usuariosTotal,
      proyectosTotal,
      tareasTotal,
      bitacorasTotal,
      adjuntosTotal
    ] = await Promise.all([
      Usuario.count(),
      Proyecto.count(),
      Tarea.count(),
      Bitacora.count(),
      Adjunto.count()
    ]);

    // Estados de tareas (categorías disjuntas para gráficos)
    const finalizadas = await Tarea.count({ where: { fechaFin: { [Op.ne]: null } } });
    const vencidas = await Tarea.count({
      where: {
        fechaFin: null,
        fechaFinEst: { [Op.ne]: null, [Op.lt]: now }
      }
    });
    const enProgreso = await Tarea.count({
      where: {
        fechaFin: null,
        fechaInicio: { [Op.ne]: null },
        [Op.or]: [{ fechaFinEst: null }, { fechaFinEst: { [Op.gte]: now } }]
      }
    });
    const pendientes = await Tarea.count({
      where: {
        fechaFin: null,
        fechaInicio: null,
        [Op.or]: [{ fechaFinEst: null }, { fechaFinEst: { [Op.gte]: now } }]
      }
    });

    const tareasAbiertas = pendientes + enProgreso; // abiertas no incluye vencidas en este gráfico

    // Proyectos activos/vencidos (por fechas)
    const proyectosActivos = await Proyecto.count({ where: { fechaFin: null } });
    const proyectosVencidos = await Proyecto.count({
      where: {
        fechaFin: null,
        fechaFinEst: { [Op.ne]: null, [Op.lt]: now }
      }
    });

    // Distribución por urgencia (1 Baja, 2 Media, 3 Alta, 4 Crítica)
    const tareasPorUrgenciaRows = await Tarea.findAll({
      attributes: ['urgencia', [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']],
      group: ['urgencia'],
      raw: true
    });
    const proyectosPorUrgenciaRows = await Proyecto.findAll({
      attributes: ['urgencia', [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']],
      group: ['urgencia'],
      raw: true
    });

    const toMap4 = rows => {
      const base = { '1': 0, '2': 0, '3': 0, '4': 0 };
      for (const r of rows) {
        const k = (r.urgencia || 0).toString();
        if (base[k] !== undefined) base[k] += parseInt(r.count, 10);
      }
      return base;
    };

    res.json({
      kpis: {
        usuariosTotal,
        proyectosTotal,
        tareasTotal,
        bitacorasTotal,
        adjuntosTotal
      },
      tareas: {
        abiertas: tareasAbiertas,
        pendientes,
        enProgreso,
        finalizadas,
        vencidas,
        porUrgencia: toMap4(tareasPorUrgenciaRows)
      },
      proyectos: {
        activos: proyectosActivos,
        vencidos: proyectosVencidos,
        porUrgencia: toMap4(proyectosPorUrgenciaRows)
      }
    });
  } catch (e) {
    console.error('dashboard/kpis', e);
    res.status(500).json({ error: 'Error generando KPIs' });
  }
});

/** Series mensuales para el año dado */
router.get('/series', async (req, res) => {
  try {
    const year = parseInt(req.query.year, 10) || new Date().getFullYear();

    const seriesQuery = (Model, colName = 'createdAt', whereExtra = {}) => Model.findAll({
      attributes: [
        [Sequelize.fn('YEAR', Sequelize.col(colName)), 'year'],
        [Sequelize.fn('MONTH', Sequelize.col(colName)), 'month'],
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
      ],
      where: {
        [colName]: { [Op.ne]: null },
        ...whereExtra,
        [Op.and]: Sequelize.where(Sequelize.fn('YEAR', Sequelize.col(colName)), year)
      },
      group: ['year', 'month'],
      raw: true
    });

    const [
      proyectosCreados,
      tareasCreadas,
      tareasFinalizadas,
      bitacorasCreadas,
      adjuntosCreados
    ] = await Promise.all([
      seriesQuery(Proyecto),
      seriesQuery(Tarea),
      seriesQuery(Tarea, 'fechaFin', { fechaFin: { [Op.ne]: null } }),
      seriesQuery(Bitacora),
      seriesQuery(Adjunto)
    ]);

    const to12 = rows => {
      const arr = Array.from({ length: 12 }, (_, i) => ({ month: i + 1, count: 0 }));
      for (const r of rows) {
        const m = parseInt(r.month, 10);
        if (m >= 1 && m <= 12) arr[m - 1].count = parseInt(r.count, 10);
      }
      return arr;
    };

    res.json({
      year,
      proyectosCreados: to12(proyectosCreados),
      tareasCreadas: to12(tareasCreadas),
      tareasFinalizadas: to12(tareasFinalizadas),
      bitacorasCreadas: to12(bitacorasCreadas),
      adjuntosCreados: to12(adjuntosCreados)
    });
  } catch (e) {
    console.error('dashboard/series', e);
    res.status(500).json({ error: 'Error generando series' });
  }
});

/** Top 5: usuarios y proyectos con más tareas abiertas */
router.get('/top', async (req, res) => {
  try {
    const abiertas = await Tarea.findAll({
      attributes: ['idUsuario', 'idProyecto', [Sequelize.fn('COUNT', Sequelize.col('id')), 'abiertas']],
      where: { fechaFin: null },
      group: ['idUsuario', 'idProyecto'],
      raw: true
    });

    // Agregar por usuario
    const byUser = {};
    const byProject = {};
    for (const r of abiertas) {
      byUser[r.idUsuario] = (byUser[r.idUsuario] || 0) + parseInt(r.abiertas, 10);
      byProject[r.idProyecto] = (byProject[r.idProyecto] || 0) + parseInt(r.abiertas, 10);
    }

    // Top 5 usuarios
    const topUsersArr = Object.entries(byUser)
      .map(([id, count]) => ({ id: parseInt(id, 10), abiertas: count }))
      .sort((a, b) => b.abiertas - a.abiertas)
      .slice(0, 5);

    const usuariosRows = await Usuario.findAll({
      where: { id: topUsersArr.map(x => x.id) },
      attributes: ['id', 'nombre', 'apellido'],
      raw: true
    });

    const usuariosMap = Object.fromEntries(usuariosRows.map(u => [u.id, u]));
    const topUsuarios = topUsersArr.map(x => ({
      id: x.id,
      nombre: usuariosMap[x.id]?.nombre || '',
      apellido: usuariosMap[x.id]?.apellido || '',
      abiertas: x.abiertas
    }));

    // Top 5 proyectos
    const topProjArr = Object.entries(byProject)
      .map(([id, count]) => ({ id: parseInt(id, 10), abiertas: count }))
      .sort((a, b) => b.abiertas - a.abiertas)
      .slice(0, 5);

    const proyectosRows = await Proyecto.findAll({
      where: { id: topProjArr.map(x => x.id) },
      attributes: ['id', 'nombre'],
      raw: true
    });
    const proyectosMap = Object.fromEntries(proyectosRows.map(p => [p.id, p]));
    const topProyectos = topProjArr.map(x => ({
      id: x.id,
      nombre: proyectosMap[x.id]?.nombre || '',
      abiertas: x.abiertas
    }));

    res.json({ topUsuarios, topProyectos });
  } catch (e) {
    console.error('dashboard/top', e);
    res.status(500).json({ error: 'Error generando top' });
  }
});

module.exports = router;
