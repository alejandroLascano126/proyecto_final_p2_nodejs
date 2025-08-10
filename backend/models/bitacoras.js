'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class bitacoras extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      models.bitacoras.belongsTo(models.tareas, { foreignKey: 'idTarea', targetKey: 'id' });
      models.bitacoras.belongsTo(models.proyectos, { foreignKey: 'idProyecto', targetKey: 'id' });
      models.bitacoras.hasMany(models.adjuntos, { foreignKey: 'idBitacora', sourceKey: 'id' });
    }
  }
  bitacoras.init({
    idProyecto: DataTypes.INTEGER,
    idTarea: DataTypes.INTEGER,
    titulo: DataTypes.STRING,
    descripcion: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'bitacoras',
    tableName: 'bitacoras'
  });
  return bitacoras;
};