'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class UserReportFiscal extends Model {
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
  UserReportFiscal.init({
    timestamp: DataTypes.DATE,
    username: DataTypes.STRING,
    userId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Users',
        key: 'id'
      },
    },
    grossIncomesCreated: DataTypes.INTEGER,
    paymentsCreated: DataTypes.INTEGER,
    systemUsageReportId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'SystemUsageReports',
        key: 'id'
      }
    }
  }, {
    sequelize,
    modelName: 'UserReportFiscal',
  });
  return UserReportFiscal;
};