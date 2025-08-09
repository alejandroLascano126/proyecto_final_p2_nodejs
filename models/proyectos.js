'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class proyectos extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      models.proyectos.belongsTo(models.usuarios, { foreignKey: 'usuarioId', targetKey: 'id' });
      models.proyectos.hasMany(models.tareas, { foreignKey: 'idProyecto', sourceKey: 'id' });
      models.proyectos.hasMany(models.bitacoras, { foreignKey: 'idProyecto', sourceKey: 'id' });
    }
  }
  proyectos.init({
    usuarioId: DataTypes.INTEGER,
    nombre: DataTypes.STRING,
    descripcion: DataTypes.STRING,
    urgencia: DataTypes.INTEGER,
    fechaInicio: DataTypes.DATE,
    fechaFinEst: DataTypes.DATE,
    fechaFin: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'proyectos',
    tableName: 'proyectos'
  });
  return proyectos;
};