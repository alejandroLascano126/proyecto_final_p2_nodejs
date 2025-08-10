'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    //proyectos

    await queryInterface.addConstraint('proyectos', {
        fields: ['usuarioId'],
        name: 'usuarioId_pfk',
        type: 'foreign key',
        references: {
        table: 'usuarios',
        field: 'id'
        },
        onDelete: 'cascade',
        onUpdate: 'set null'
      });

      //tareas

      await queryInterface.addConstraint('tareas', {
        fields: ['idProyecto'],
        name: 'idProyecto_tfk',
        type: 'foreign key',
        references: {
        table: 'proyectos',
        field: 'id'
        },
        onDelete: 'cascade',
        onUpdate: 'set null'
      });

      await queryInterface.addConstraint('tareas', {
        fields: ['idUsuario'],
        name: 'idUsuario_tfk',
        type: 'foreign key',
        references: {
        table: 'usuarios',
        field: 'id'
        },
        onDelete: 'cascade',
        onUpdate: 'set null'
      });

      //bitacoras

      await queryInterface.addConstraint('bitacoras', {
        fields: ['idProyecto'],
        name: 'idProyecto_bfk',
        type: 'foreign key',
        references: {
        table: 'proyectos',
        field: 'id'
        },
        onDelete: 'cascade',
        onUpdate: 'set null'
      });

      await queryInterface.addConstraint('bitacoras', {
        fields: ['idTarea'],
        name: 'idTarea_bfk',
        type: 'foreign key',
        references: {
        table: 'tareas',
        field: 'id'
        },
        onDelete: 'cascade',
        onUpdate: 'set null'
      });

      //adjuntos

      await queryInterface.addConstraint('adjuntos', {
        fields: ['idBitacora'],
        name: 'idBitacora_afk',
        type: 'foreign key',
        references: {
        table: 'bitacoras',
        field: 'id'
        },
        onDelete: 'cascade',
        onUpdate: 'set null'
      });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeConstraint('proyectos', 'usuarioIdp_fk')
    await queryInterface.removeConstraint('tareas', 'idProyecto_tfk')
    await queryInterface.removeConstraint('tareas', 'idUsuario_tfk')
    await queryInterface.removeConstraint('bitacoras', 'idProyecto_bfk')
    await queryInterface.removeConstraint('bitacoras', 'idTarea_bfk')
    await queryInterface.removeConstraint('adjuntos', 'idBitacora_afk')
  }
};
