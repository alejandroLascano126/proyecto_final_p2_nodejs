var express = require('express');
var router = express.Router();
var multer = require('multer');
var path = require('path');
var fs = require('fs');

const Adjunto  = require('../../models').adjuntos;
const Bitacora = require('../../models').bitacoras;
const { Op }   = require('sequelize');

// Configuración de multer para subida de archivos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '../../uploads');
    // Crear directorio si no existe
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Generar nombre único: timestamp + nombre original
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { 
    fileSize: 10 * 1024 * 1024 // Límite de 10MB
  },
  fileFilter: function (req, file, cb) {
    // Extensiones permitidas
    const allowedExtensions = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', 
                              '.txt', '.png', '.jpg', '.jpeg', '.gif', '.zip', '.rar'];
    const fileExtension = path.extname(file.originalname).toLowerCase();
    
    if (allowedExtensions.includes(fileExtension)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de archivo no permitido'), false);
    }
  }
});

router.get('/consultaAdjuntos', async (req, res) => {
  try {
    const { idBitacora } = req.query;
    const where = {};
    if (idBitacora) where.idBitacora = +idBitacora;

    const adjuntos = await Adjunto.findAll({
      where,
      include: [{
        model: Bitacora,
        attributes: ['id', 'titulo']
      }],
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
    const { id, idBitacora, titulo, extension, contenido, createdAt } = req.query;
    
    const where = {};
    if (id) where.id = +id;
    if (idBitacora) where.idBitacora = +idBitacora;
    if (titulo) where.titulo = { [Op.like]: `%${titulo}%` }; // Búsqueda parcial
    if (extension) where.extension = { [Op.like]: `%${extension}%` }; // Búsqueda parcial
    if (contenido) where.contenido = { [Op.like]: `%${contenido}%` }; // Búsqueda parcial
    if (createdAt) where.createdAt = createdAt;

    const adjuntos = await Adjunto.findAll({
      where,
      include: [{
        model: Bitacora,
        attributes: ['id', 'titulo']
      }],
      order: [['createdAt', 'DESC']]
    });
    
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

// Nuevo endpoint para subir archivos
router.post('/subirAdjunto', upload.single('archivo'), async (req, res) => {
  try {
    const { idBitacora, titulo } = req.body;
    const file = req.file;

    if (!idBitacora || !titulo) {
      return res.status(400).json({ error: 'idBitacora y titulo son obligatorios' });
    }

    if (!file) {
      return res.status(400).json({ error: 'Archivo es obligatorio' });
    }

    const bit = await Bitacora.findByPk(idBitacora);
    if (!bit) {
      // Si la bitácora no existe, eliminar el archivo subido
      fs.unlinkSync(file.path);
      return res.status(400).json({ error: 'Bitácora no existe' });
    }

    // Extraer extensión del archivo
    const extension = path.extname(file.originalname).toLowerCase().substring(1);

    const nuevo = await Adjunto.create({
      idBitacora: parseInt(idBitacora),
      titulo,
      extension,
      contenido: file.filename // Guardar solo el nombre del archivo generado
    });

    res.status(201).json({
      ...nuevo.toJSON(),
      mensaje: 'Archivo subido exitosamente'
    });
  } catch (err) {
    console.error('subirAdjunto error:', err);
    // Si hay error, eliminar el archivo si existe
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(400).json({ error: err.message || 'Error al subir archivo' });
  }
});

// Endpoint para descargar archivos
router.get('/descargar/:filename', (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, '../../uploads', filename);
    
    // Verificar que el archivo existe
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Archivo no encontrado' });
    }
    
    // Obtener información del adjunto para el nombre original
    Adjunto.findOne({ where: { contenido: filename } })
      .then(adjunto => {
        // Usar el nombre del archivo tal como está
        const downloadName = filename;
        
        res.download(filePath, downloadName, (err) => {
          if (err) {
            console.error('Error al descargar archivo:', err);
            res.status(500).json({ error: 'Error al descargar archivo' });
          }
        });
      })
      .catch(err => {
        console.error('Error al buscar adjunto:', err);
        res.download(filePath, filename);
      });
  } catch (err) {
    console.error('descargar error:', err);
    res.status(400).json({ error: 'Error al descargar archivo' });
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
    
    // Buscar el adjunto para obtener el nombre del archivo
    const adjunto = await Adjunto.findByPk(id);
    
    if (adjunto && adjunto.contenido) {
      // Intentar eliminar el archivo físico
      const filePath = path.join(__dirname, '../../uploads', adjunto.contenido);
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (err) {
          console.error('Error al eliminar archivo físico:', err);
          // Continuar eliminando el registro aunque falle el archivo
        }
      }
    }
    
    // Eliminar el registro de la base de datos
    const count = await Adjunto.destroy({ where: { id } });
    res.json({ eliminados: count, mensaje: 'Adjunto y archivo eliminados' });
  } catch (err) {
    console.error('eliminarAdjunto error:', err);
    res.status(400).send(err);
  }
});

// ===== opciones ligeras para combos =====
router.get('/options', async (req, res) => {
  try {
    const rows = await Adjunto.findAll({
      attributes: ['id', 'titulo', 'idBitacora'],
      order: [['titulo', 'ASC']]
    });
    res.json(rows);
  } catch (e) {
    console.error('adjuntos/options:', e);
    res.status(500).json({ error: 'Error cargando opciones de adjuntos' });
  }
});

module.exports = router;
