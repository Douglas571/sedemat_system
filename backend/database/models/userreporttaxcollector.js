'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class UserReportTaxCollector extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.SystemUsageReport, { foreignKey: 'systemUsageReportId', as: 'systemUsageReport' });
    }
  }
  UserReportTaxCollector.init({
    timestamp: DataTypes.DATE,
    username: DataTypes.STRING,
    userId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Users',
        key: 'id'
      },
    },
    grossIncomeInvoicesCreated: DataTypes.INTEGER,
    grossIncomeInvoicesIssued: DataTypes.INTEGER,
    grossIncomeInvoicesUpdated: DataTypes.INTEGER,
    
    systemUsageReportId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'SystemUsageReports',
        key: 'id'
      }
    }
  }, {
    sequelize,
    modelName: 'UserReportTaxCollector',
  });
  return UserReportTaxCollector;
};