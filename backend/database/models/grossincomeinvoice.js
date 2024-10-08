'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class GrossIncomeInvoice extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here

      GrossIncomeInvoice.hasMany(models.GrossIncome, {
        foreignKey: 'grossIncomeInvoiceId',
        as: 'grossIncomes'
      })

      GrossIncomeInvoice.hasMany(models.Payment, {
        foreignKey: 'grossIncomeInvoiceId',
        as: 'payments'
      })

      GrossIncomeInvoice.belongsTo(models.User, {
        foreignKey: 'checkedByUserId',
        as: 'checkedByUser'
      })

      GrossIncomeInvoice.belongsTo(models.User, {
        foreignKey: 'createdByUserId',
        as: 'createdByUser'
      })

      GrossIncomeInvoice.belongsTo(models.User, {
        foreignKey: 'settledByUserId',
        as: 'settledByUser'
      })

      GrossIncomeInvoice.hasOne(models.Settlement, {
        foreignKey: 'grossIncomeInvoiceId',
        as: 'settlement'
      })
    }
  }
  GrossIncomeInvoice.init({
    // isPaid: {
    //   type: DataTypes.BOOLEAN,
    //   allowNull: false,
    //   defaultValue: false
    // },

    businessId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Business',
        key: 'id'
      }
    },

    formPriceBs: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0
    },

    // Deprecated
    paidAt: {
      type: DataTypes.DATE,
      allowNull: true 
    },

    createdByUserId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },

    checkedByUserId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Users',
        key: 'id'
      }
    },

    // Deprecated
    settledByUserId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Users',
        key: 'id'
      }
    },

    // Deprecated 
    totalBs: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0
    },

    TCMMVBCV: {
      type: DataTypes.DECIMAL(10, 4),
      allowNull: false,
    },

    businessName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    businessDNI: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    branchOfficeName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    branchOfficeAddress: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    branchOfficeDimensions: {
      type: DataTypes.DOUBLE,
      allowNull: false,
    },
    branchOfficeType: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    createdByUserPersonFullName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    checkedByUserPersonFullName: {
      type: DataTypes.STRING,
      allowNull: false,
    },


    createdAt: {
      type: DataTypes.DATE
    },
    updatedAt: {
      type: DataTypes.DATE
    },
  }, {
    sequelize,
    modelName: 'GrossIncomeInvoice',
  });
  return GrossIncomeInvoice;
};