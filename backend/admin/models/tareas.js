'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class tareas extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      models.tareas.belongsTo(models.proyectos, { foreignKey: 'idProyecto', targetKey: 'id' });
      models.tareas.belongsTo(models.usuarios, { foreignKey: 'idUsuario', targetKey: 'id' });
      models.tareas.hasMany(models.bitacoras, { foreignKey: 'idTarea', sourceKey: 'id' });
    }
  }
  tareas.init({
    idProyecto: DataTypes.INTEGER,
    idUsuario: DataTypes.INTEGER,
    nombre: DataTypes.STRING,
    descripcion: DataTypes.STRING,
    urgencia: DataTypes.INTEGER,
    fechaInicio: DataTypes.DATE,
    fechaFinEst: DataTypes.DATE,
    fechaFin: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'tareas',
    tableName: 'tareas'
  });
  return tareas;
};