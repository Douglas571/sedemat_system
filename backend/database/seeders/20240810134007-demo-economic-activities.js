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
    await queryInterface.bulkInsert('EconomicActivities', [
      { id: 1, code: '2.1.01', title: 'Industria de la carne', alicuota: 0.01, minimumTax: 15.00, createdAt: new Date(), updatedAt: new Date() },
      { id: 2, code: '2.1.02', title: 'Industrias lácteas', alicuota: 0.01, minimumTax: 15.00, createdAt: new Date(), updatedAt: new Date() },
      { id: 3, code: '2.1.03', title: 'Industria de conservación de frutas, hortalizas y similares', alicuota: 0.01, minimumTax: 15.00, createdAt: new Date(), updatedAt: new Date() },
      { id: 4, code: '2.1.04', title: 'Fabricación de aceites y grasas animales y/o vegetales', alicuota: 0.01, minimumTax: 15.00, createdAt: new Date(), updatedAt: new Date() },
      { id: 5, code: '2.1.05', title: 'Industrias de productos alimenticios diversos para el consumo humano', alicuota: 0.015, minimumTax: 15.00, createdAt: new Date(), updatedAt: new Date() },
      { id: 6, code: '2.1.06', title: 'Industrias de alimentos y demás productos para el consumo animal', alicuota: 0.015, minimumTax: 15.00, createdAt: new Date(), updatedAt: new Date() },
      { id: 7, code: '2.1.07', title: 'Fabricación de bebidas no alcohólicas', alicuota: 0.015, minimumTax: 15.00, createdAt: new Date(), updatedAt: new Date() },
      { id: 8, code: '2.1.08', title: 'Fabricación de bebidas alcohólicas obtenidas por destilación de especies vegetales nacionales', alicuota: 0.03, minimumTax: 15.00, createdAt: new Date(), updatedAt: new Date() },
      { id: 9, code: '2.1.09', title: 'Fabricación de las demás bebidas alcohólicas y licores', alicuota: 0.04, minimumTax: 15.00, createdAt: new Date(), updatedAt: new Date() },
      { id: 10, code: '2.1.10', title: 'Manufactura de tabaco, cigarrillos y derivados', alicuota: 5.00, minimumTax: 15.00, createdAt: new Date(), updatedAt: new Date() },
      { id: 11, code: '2.1.11', title: 'Industrias textil', alicuota: 0.015, minimumTax: 15.00, createdAt: new Date(), updatedAt: new Date() },
      { id: 12, code: '2.1.12', title: 'Fabricación de prendas de vestir y demás accesorios de vestir', alicuota: 0.015, minimumTax: 15.00, createdAt: new Date(), updatedAt: new Date() },
      { id: 13, code: '2.1.13', title: 'Industria del cuero natural, sintéticos y conexas', alicuota: 0.015, minimumTax: 15.00, createdAt: new Date(), updatedAt: new Date() },
      { id: 14, code: '2.1.14', title: 'Fabricación de calzado, artículos de talabartería y guarnicionería', alicuota: 0.015, minimumTax: 15.00, createdAt: new Date(), updatedAt: new Date() },
      { id: 15, code: '2.1.15', title: 'Industrias de la madera y corcho', alicuota: 0.015, minimumTax: 15.00, createdAt: new Date(), updatedAt: new Date() },
      { id: 16, code: '2.1.16', title: 'Fabricación de papel y cartón y productos de estas materias', alicuota: 0.015, minimumTax: 15.00, createdAt: new Date(), updatedAt: new Date() },
      { id: 17, code: '2.1.17', title: 'Industria de impresión, reproducción, editorial y artes gráficas', alicuota: 0.01, minimumTax: 15.00, createdAt: new Date(), updatedAt: new Date() },
      { id: 18, code: '2.1.18', title: 'Fabricación de envases, empaques, embalajes', alicuota: 0.01, minimumTax: 15.00, createdAt: new Date(), updatedAt: new Date() },
      { id: 19, code: '2.1.19', title: 'Fabricación de productos a partir de los derivados del petróleo, del caucho y plástico', alicuota: 0.015, minimumTax: 15.00, createdAt: new Date(), updatedAt: new Date() },
      { id: 20, code: '2.1.20', title: 'Industrias químicas', alicuota: 0.015, minimumTax: 15.00, createdAt: new Date(), updatedAt: new Date() },
      { id: 21, code: '2.1.21', title: 'Fabricación de productos farmacéuticos, sustancias químicas medicinales y productos botánicos de uso farmacéutico', alicuota: 0.01, minimumTax: 15.00, createdAt: new Date(), updatedAt: new Date() },
      { id: 22, code: '2.1.22', title: 'Fabricación de productos de higiene, cosméticos y otros', alicuota: 0.015, minimumTax: 15.00, createdAt: new Date(), updatedAt: new Date() },
      { id: 23, code: '2.1.23', title: 'Industria de la transformación de otros productos minerales no metálicos', alicuota: 0.015, minimumTax: 15.00, createdAt: new Date(), updatedAt: new Date() },
      { id: 24, code: '2.1.24', title: 'Industria metalúrgica y metalmecánica', alicuota: 0.01, minimumTax: 15.00, createdAt: new Date(), updatedAt: new Date() },
      { id: 25, code: '2.1.25', title: 'Fabricación de productos elaborados de metal, excepto maquinarias y equipos', alicuota: 0.015, minimumTax: 15.00, createdAt: new Date(), updatedAt: new Date() },
      { id: 26, code: '2.1.26', title: 'Fabricación de equipos, materiales e instrumentos de informática, electrónicos y eléctricos', alicuota: 0.015, minimumTax: 15.00, createdAt: new Date(), updatedAt: new Date() },
      { id: 27, code: '2.1.27', title: 'Fabricación de maquinarias y otros equipos e instrumentos', alicuota: 0.015, minimumTax: 15.00, createdAt: new Date(), updatedAt: new Date() },
      { id: 28, code: '2.1.28', title: 'Fabricación de mobiliario, utensilios de uso industrial y doméstico', alicuota: 0.02, minimumTax: 15.00, createdAt: new Date(), updatedAt: new Date() },
      { id: 29, code: '2.1.29', title: 'Industrias Químicas y derivado de recursos naturales renovables y afines, carbón activado, desechos agroindustriales y otros', alicuota: 0.01, minimumTax: 15.00, createdAt: new Date(), updatedAt: new Date() },
      { id: 30, code: '2.1.30', title: 'Fabricación y ensamblaje de vehículos de motor, remolque o semirremolque', alicuota: 0.03, minimumTax: 15.00, createdAt: new Date(), updatedAt: new Date() },
      { id: 31, code: '2.1.31', title: 'Fabricación de otros equipos de transporte', alicuota: 0.02, minimumTax: 15.00, createdAt: new Date(), updatedAt: new Date() },
      { id: 32, code: '2.1.32', title: 'Fabricación de autopartes y repuestos para vehículos terrestres', alicuota: 0.02, minimumTax: 15.00, createdAt: new Date(), updatedAt: new Date() },
    ], {});
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    await queryInterface.bulkDelete('EconomicActivities', null, {});
  }
};
