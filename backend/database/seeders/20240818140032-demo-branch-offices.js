'use strict';

const getRandomZone = () => ZONES[Math.floor(Math.random() * ZONES.length)].value;

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('BranchOffices', [
      {
        id: 1,
        businessId: 1,
        address: 'Av. Principal, Sector Alta Vista',
        zone: getRandomZone(),
        isRented: true,
        dimensions: 120,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 2,
        businessId: 2,
        address: 'Calle Bella Vista, Sector Delicias',
        zone: getRandomZone(),
        isRented: true,
        dimensions: 80,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 3,
        businessId: 3,
        address: 'Av. Bolívar, Sector Centro',
        zone: getRandomZone(),
        dimensions: 100,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 4,
        businessId: 4,
        address: 'Calle La Paz, Sector Inavi',
        zone: getRandomZone(),
        isRented: true,
        dimensions: 90,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 5,
        businessId: 5,
        address: 'Carretera Nacional, Sector Santa Elena',
        zone: getRandomZone(),
        dimensions: 30,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('BranchOffices', null, {});
  }
};



const ZONES = [
  { id: 1, label: "ALTA VISTA", value: "ALTA VISTA" },
  { id: 2, label: "AVENDA BELLA VISTA", value: "AVENDA BELLA VISTA" },
  { id: 3, label: "AVENIDA", value: "AVENIDA" },
  { id: 4, label: "AVENIDA BELLA VISTA", value: "AVENIDA BELLA VISTA" },
  { id: 5, label: "BARRIALITO", value: "BARRIALITO" },
  { id: 6, label: "CALLE BOLIVAR", value: "CALLE BOLIVAR" },
  { id: 7, label: "CALLE INDUSTRIA", value: "CALLE INDUSTRIA" },
  { id: 8, label: "CALLE LA PAZ", value: "CALLE LA PAZ" },
  { id: 9, label: "CALLE ZAMORA", value: "CALLE ZAMORA" },
  { id: 10, label: "CARRETERA NACIONAL MORON-CORO", value: "CARRETERA NACIONAL MORON-CORO" },
  { id: 11, label: "CENTRO", value: "CENTRO" },
  { id: 12, label: "CERRO", value: "CERRO" },
  { id: 13, label: "CIRO CALDERA", value: "CIRO CALDERA" },
  { id: 14, label: "CORO", value: "CORO" },
  { id: 15, label: "CUMAREBITO", value: "CUMAREBITO" },
  { id: 16, label: "DELICIAS", value: "DELICIAS" },
  { id: 17, label: "INAVI", value: "INAVI" },
  { id: 18, label: "LA CAÑADA", value: "LA CAÑADA" },
  { id: 19, label: "LAS DELICIAS", value: "LAS DELICIAS" },
  { id: 20, label: "PUENTE PIEDRA", value: "PUENTE PIEDRA" },
  { id: 21, label: "QUEBRADA DE HUTTEN", value: "QUEBRADA DE HUTTEN" },
  { id: 22, label: "SANTA ELENA", value: "SANTA ELENA" },
  { id: 23, label: "SANTA TERESA", value: "SANTA TERESA" },
  { id: 24, label: "SECTOR LAS DELICIAS", value: "SECTOR LAS DELICIAS" },
  { id: 25, label: "TRANSEUNTE", value: "TRANSEUNTE" },
  { id: 26, label: "URBANIZACION CIRO CALDERA", value: "URBANIZACION CIRO CALDERA" }
];