'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class GrossIncome extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      GrossIncome.belongsTo(models.BranchOffice, {
        foreignKey: 'branchOfficeId',
        as: 'branchOffice'
      });

      GrossIncome.belongsTo(models.CurrencyExchangeRates, {
        foreignKey: 'currencyExchangeRatesId',
        as: 'currencyExchangeRate'
      });

      GrossIncome.belongsTo(models.WasteCollectionTax, {
        foreignKey: 'wasteCollectionTaxId',
        as: 'wasteCollectionTax'
      });

      GrossIncome.belongsTo(models.GrossIncomeInvoice, {
        foreignKey: 'grossIncomeInvoiceId',
        as: 'grossIncomeInvoice'
      });

      GrossIncome.belongsTo(models.Alicuota, {
        foreignKey: 'alicuotaId',
        as: 'alicuota'
      })

      GrossIncome.belongsTo(models.Business, {
        foreignKey: 'businessId',
        as: 'business'
      })

      GrossIncome.belongsTo(models.User, {
        foreignKey: 'createdByUserId',
        as: 'createdByUser'
      })

      GrossIncome.belongsTo(models.User, {
        foreignKey: 'updatedByUserId',
        as: 'updatedByUser'
      })
    }
  }
  GrossIncome.init({
    businessId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    branchOfficeId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    period: {
      type: DataTypes.DATE,
      allowNull: false
    },
    amountBs: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true
    },
    chargeWasteCollection: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    declarationImage: {
      type: DataTypes.STRING,
      allowNull: true
    },

    // Deprecated 
    currencyExchangeRatesId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },

    wasteCollectionTaxId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    
    grossIncomeInvoiceId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },

    alicuotaId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT'
    },

    TCMMVBCV: {
      type: DataTypes.DECIMAL(10, 4),
      allowNull: false,
    },

    alicuotaMinTaxMMVBCV: {
      type: DataTypes.DECIMAL(10, 4),
      allowNull: false
    },
    alicuotaTaxPercent: {
      type: DataTypes.DECIMAL(10, 4),
      allowNull: false
    },
    branchOfficeDimensionsMts2: {
      type: DataTypes.DECIMAL(10, 4),
      defaultValue: 0,
      allowNull: true
    },
    branchOfficeType: {
      type: DataTypes.STRING(5),
      defaultValue: '',
      allowNull: true
    },
    wasteCollectionTaxMMVBCV: {
      type: DataTypes.DECIMAL(10, 4),
      allowNull: true
    },

    taxInBs: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0
    },
    minTaxInBs: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0
    },
    wasteCollectionTaxInBs: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0
    },
    totalTaxInBs: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0
    },

    declaredAt: {
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

  }, {
    sequelize,
    modelName: 'GrossIncome',
  });
  return GrossIncome;
};