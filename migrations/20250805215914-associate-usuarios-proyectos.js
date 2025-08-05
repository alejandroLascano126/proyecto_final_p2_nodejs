'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    //proyectos

    await queryInterface.addConstraint('proyectos', {
        fields: ['usuarioId'],
        name: 'usuarioId_fk',
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
        name: 'idProyecto_fk',
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
        name: 'idProyecto_fk',
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
        name: 'idProyecto_fk',
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
        name: 'idTarea_fk',
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
        name: 'idBitacora_fk',
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
    await queryInterface.removeConstraint('proyectos', 'foto_id_fk')
    await queryInterface.removeConstraint('tareas', 'etiqueta_id_fk')
    await queryInterface.removeConstraint('tareas', 'etiqueta_id_fk')
    await queryInterface.removeConstraint('bitacoras', 'etiqueta_id_fk')
    await queryInterface.removeConstraint('bitacoras', 'etiqueta_id_fk')
    await queryInterface.removeConstraint('adjuntos', 'etiqueta_id_fk')
  }
};
