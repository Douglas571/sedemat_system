'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
    */

    await queryInterface.bulkInsert('InvoiceItemTypes', [
      {
        id: 1,
        code: '301100801',
        name: 'Alquiler De Edificios Y Locales',
        defaultAmountMMV: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 2,
        code: '301100802',
        name: 'Alquiler De Tierras Y Terrenos',
        defaultAmountMMV: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 3,
        code: '301021100',
        name: 'Apuestas Licitas',
        defaultAmountMMV: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 4,
        code: '301035400',
        name: 'Aseo Domiciliario',
        defaultAmountMMV: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 5,
        code: '301035700',
        name: 'Cementerio',
        defaultAmountMMV: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 6,
        code: '301034900',
        name: 'Certificaciones Y Solvencias',
        defaultAmountMMV: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 7,
        code: '301021200',
        name: 'Deudas Morosas',
        defaultAmountMMV: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 8,
        code: '301021000',
        name: 'Espectaculos Publicos',
        defaultAmountMMV: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 9,
        code: '306080200',
        name: 'Fondo De Compensacion Interterritorial',
        defaultAmountMMV: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 10,
        code: '301020404',
        name: 'Impuesto A La Operación De Juegos De Loteria',
        defaultAmountMMV: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 11,
        code: '301020310',
        name: 'Impuesto Sobre Expedición Al Público De Especies Alcohólicas Nacionales',
        defaultAmountMMV: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 12,
        code: '301090101',
        name: 'Ingreso Por Formularios Y Gacetas Municipales',
        defaultAmountMMV: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 13,
        code: '301020500',
        name: 'Inmueble Urbanos',
        defaultAmountMMV: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 14,
        code: '301110100',
        name: 'Intereses Moratorios',
        defaultAmountMMV: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 15,
        code: '302030100',
        name: 'Liquidación De Entes Descentralizados',
        defaultAmountMMV: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 16,
        code: '301035300',
        name: 'Mensura Y Deslinde',
        defaultAmountMMV: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 17,
        code: '301035600',
        name: 'Mercado',
        defaultAmountMMV: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 18,
        code: '301110800',
        name: 'Multas Y Recargos',
        defaultAmountMMV: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 19,
        code: '301029900',
        name: 'Otros Impuestos Indirectos',
        defaultAmountMMV: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 20,
        code: '301990100',
        name: 'Otros Ingresos Ordinarios',
        defaultAmountMMV: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 21,
        code: '301039900',
        name: 'Otros Tipos De Tasas',
        defaultAmountMMV: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 22,
        code: '301020800',
        name: 'Patente De Vehiculo',
        defaultAmountMMV: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 23,
        code: '301020700',
        name: 'Patente De Industria Y Comercio',
        defaultAmountMMV: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 24,
        code: '301034800',
        name: 'Permisos Municipales',
        defaultAmountMMV: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 25,
        code: '301020900',
        name: 'Propaganda Comercial',
        defaultAmountMMV: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 26,
        code: '301111200',
        name: 'Reparos Administrativos Por Impuestos Municipàles',
        defaultAmountMMV: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 27,
        code: '301110300',
        name: 'Sanciones Fiscales',
        defaultAmountMMV: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 28,
        code: '305030102',
        name: 'Situado Municipal',
        defaultAmountMMV: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 29,
        code: '301039901',
        name: 'Tasa Por Servicios Municipales',
        defaultAmountMMV: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        // TODO: Check if this is correct
        id: 30,
        code: '301039903',
        name: 'Tasas Administrativas',
        defaultAmountMMV: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 31,
        code: '306010302',
        name: 'Venta Y/O Desincorporacion De Equipos De Transporte, Tracción Y Elevación',
        defaultAmountMMV: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 32,
        code: '306010100',
        name: 'Venta Y/O Desincorporacion De Tierras Y Terrenos',
        defaultAmountMMV: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */

    await queryInterface.bulkDelete('InvoiceItemTypes', null, {});
  }
};
