const { GrossIncomeNote } = require('../database/models');

module.exports = {
  async create({
    data,
    user
  }) {
    return await GrossIncomeNote.create(data);
  },

  async findAll({
    filters,
    user
  }) {

    let where = { ...filters }

    return await GrossIncomeNote.findAll({ where });
  },

  async update({id, newData}) {
    return await GrossIncomeNote.update(newData, { where: { id } })
  },

  async deleteNoteById({id, user}) {
    return await GrossIncomeNote.destroy({ where: { id } });
  },
};
