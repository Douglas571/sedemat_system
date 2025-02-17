'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class SystemUsageReport extends Model {
    static associate(models) {
      // Define associations here
      this.hasMany(models.UserReportTaxCollector, { foreignKey: 'systemUsageReportId', as: 'taxCollectorReports' });
      this.hasMany(models.UserReportFiscal, { foreignKey: 'systemUsageReportId', as: 'fiscalReports' });
      this.hasMany(models.UserReportSettler, { foreignKey: 'systemUsageReportId', as: 'settlerReports' });
    }
  }
  SystemUsageReport.init({
    timestamp: DataTypes.DATE,
    totalUsers: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'SystemUsageReport',
  });
  return SystemUsageReport;
};