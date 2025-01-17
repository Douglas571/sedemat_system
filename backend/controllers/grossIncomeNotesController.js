const GrossIncomeNotesService = require('../services/grossIncomeService');


module.exports = {
  async create(req, res, next) {
    try {
      const { body } = req;
      const note = await GrossIncomeNotesService.create({data: body});
      res.status(201).json(note);
    } catch (error) {
      next(error); // Pass the error to the middleware
    }
  },

  async findAll(req, res, next) {
    try {
      const filters = req.query;
      const notes = await GrossIncomeNotesService.findAll({ filters });
      res.status(200).json(notes);
    } catch (error) {
      next(error); // Pass the error to the middleware
    }
  },

  async update(req, res, next) {
    try {
      const { id } = req.params;
      const { body } = req;
      const updated = await GrossIncomeNotesService.update({ id, newData: body });

      if (!updated[0]) throw new CustomError(404, 'Gross income note not found');

      res.status(200).json({ message: 'Gross income note updated successfully' });
    } catch (error) {
      next(error); // Pass the error to the middleware
    }
  },

  async delete(req, res, next) {
    try {
      const { id } = req.params;
      const deleted = await GrossIncomeNotesService.destroy({ id });

      if (!deleted) throw new CustomError(404, 'Gross income note not found');

      res.status(200).json({ message: 'Gross income note deleted successfully' });
    } catch (error) {
      next(error); // Pass the error to the middleware
    }
  },
};
