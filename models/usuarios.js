'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class usuarios extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      models.usuarios.hasMany(models.proyectos, { foreignKey: 'usuarioId', sourceKey: 'id' });
    }
  }
  usuarios.init({
    usuario: DataTypes.STRING,
    clave: DataTypes.STRING,
    nombre: DataTypes.STRING,
    apellido: DataTypes.STRING,
    correo: DataTypes.STRING,
    nivel: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'usuarios',
    tableName: 'usuarios'
  });
  return usuarios;
};