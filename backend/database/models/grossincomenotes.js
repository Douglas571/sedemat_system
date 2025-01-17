const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class GrossIncomeNote extends Model {}

  GrossIncomeNote.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      grossIncomeId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'GrossIncomes', // Adjust based on your table name
          key: 'id',
        },
      },
      isPaid: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: true,
      },
      comment: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      createdByUserId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Users', // Adjust based on your table name
          key: 'id',
        },
      },
      updatedByUserId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Users', // Adjust based on your table name
          key: 'id',
        },
      },
    },
    {
      sequelize,
      modelName: 'GrossIncomeNote',
      tableName: 'GrossIncomeNotes',
      timestamps: true, // createdAt and updatedAt
    }
  );

  return GrossIncomeNote;
};

/*

- when attempt to create one that doesn't exists, pass the following data and create and empty grossIncome

businessId
branchOfficeId

period

- then create the gross income note with the following data 

grossIncomeId

isPaid
comment

createdByUserId
updatedByUserId

createdAt
updatedAt


////////

there is only one gross income note that contains isPaid, it should be the first one,

*/
