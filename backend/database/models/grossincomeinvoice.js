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

      GrossIncomeInvoice.belongsTo(models.Bank, {
        foreignKey: 'firstBankAccountId',
        as: 'firstBankAccount'
      })

      GrossIncomeInvoice.belongsTo(models.Bank, {
        foreignKey: 'secondBankAccountId',
        as: 'secondBankAccount'
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

    updatedByUserId: {
      type: DataTypes.INTEGER,
      allowNull: true,
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

    // Deprecated: Use Settlement settledByUserId instead
    settledByUserId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Users',
        key: 'id'
      }
    },

    totalBs: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0
    },

    TCMMVBCV: {
      type: DataTypes.DECIMAL(10, 4),
      allowNull: false,
    },
    
    TCMMVBCVValidSince: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    TCMMVBCVValidUntil: {
      type: DataTypes.DATE,
      allowNull: true,
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
      allowNull: true,
    },
    branchOfficeAddress: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    branchOfficeDimensions: {
      type: DataTypes.DOUBLE,
      allowNull: true,
    },
    branchOfficeType: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    createdByUserPersonFullName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    checkedByUserPersonFullName: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    note: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    firstBankAccountId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Bank',
        key: 'id'
      }
    },

    secondBankAccountId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Bank',
        key: 'id'
      }
    },

    economicActivityTitle: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    economicActivityCode: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    issuedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    createdAt: {
      type: DataTypes.DATE
    },
    updatedAt: {
      type: DataTypes.DATE
    },

    toFix: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },

    toFixReason: {
      type: DataTypes.STRING,
      allowNull: true,
    }
  }, {
    sequelize,
    modelName: 'GrossIncomeInvoice',
  });
  return GrossIncomeInvoice;
};