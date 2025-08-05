'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class adjuntos extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  adjuntos.init({
    idBitacora: DataTypes.INTEGER,
    titulo: DataTypes.STRING,
    extension: DataTypes.STRING,
    contenido: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'adjuntos',
    tableName: 'adjuntos'
  });
  return adjuntos;
};