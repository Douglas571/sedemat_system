module.exports = [
  {
    code: "1",
    title: "Primario",
    economicActivities: []
  },
  {
    code: "2",
    title: "Secundario",
    economicActivities: [
      { code: "2.1", title: "Industria y/o manufactura" },
      { code: "2.2", title: "Construcción" },
      { code: "2.3", title: "Construcción y servicios a la industria petrolera, petroquímica y similares" }
    ]
  },
  {
    code: "3",
    title: "Terciario",
    economicActivities: [
      { code: "3.1", 
        title: "Comercio al por mayor", 
        economicActivities: [
          { code: "3.1.01", title: "Materias primas y similares", economicActivities: [] },
          { code: "3.1.02", title: "Alimentos", economicActivities: [] },
          { code: "3.1.03", title: "Bebidas alcohólicas y tabaco", economicActivities: [] },
          { code: "3.1.04", title: "Textiles, del cuero, sintéticos, del calzado, deportivos, prendas, accesorios de vestir y conexos", economicActivities: [] },
          { code: "3.1.05", title: "Derivados de madera, corcho y artes gráficas", economicActivities: [] },
          { code: "3.1.06", title: "Químicos, derivados del petróleo, plástico y afines", economicActivities: [] },
          { code: "3.1.07", title: "Farmacéuticos y similares", economicActivities: [] },
          { code: "3.1.08", title: "Higiene y cosméticos", economicActivities: [] },
          { code: "3.1.09", title: "Construcción, metálicos y no metálicos", economicActivities: [] },
          { code: "3.1.10", title: "Maquinarias y equipamientos varios y repuestos", economicActivities: [] },
        ]
      },
      { code: "3.2", title: "Comercio al detal", economicActivities: [
          { code: "3.2.01", title: "Materias primas y similares", economicActivities: [] },
          { code: "3.2.02", title: "Alimentos", economicActivities: [] },
          { code: "3.2.03", title: "Bebidas alcohólicas y tabaco", economicActivities: [] },
          { code: "3.2.04", title: "Textiles, del cuero, sintéticos, del calzado, deportivos, prendas, accesorios de vestir y conexos", economicActivities: [] },
          { code: "3.2.05", title: "Derivados de madera, corcho y artes gráficas", economicActivities: [] },
          { code: "3.2.06", title: "Químicos, derivados del petróleo, plástico y afines", economicActivities: [] },
          { code: "3.2.07", title: "Farmacéuticos y similares", economicActivities: [] },
          { code: "3.2.08", title: "Higiene y cosméticos", economicActivities: [] },
          { code: "3.2.09", title: "Construcción, metálicos y no metálicos", economicActivities: [] },
          { code: "3.2.10", title: "Maquinarias, equipamientos varios y repuestos", economicActivities: [] },
          { code: "3.2.11", title: "Muebles, artefactos y artículos", economicActivities: [] },
          { code: "3.2.14", title: "Animales, productos y artículos para animales", economicActivities: [] },
        ] 
      },
      
      { code: "3.3", title: "Servicios personales y no personales", economicActivities: [] },
      { code: "3.4", title: "Actividad no especificadas", economicActivities: [] }
    ]
  }
];