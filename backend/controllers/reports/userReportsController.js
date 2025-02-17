

// controllers/userReportsController.js
const userReportsService = require('../../services/reports/userReportsService');

const userReportsController = {
  /**
   * Get all user reports
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getAllReports(req, res, next) {
    try {
      const { format = 'json' } = req.query;

      let user = req.user;
      let { filters } = req.body;

      if (format === 'excel') {
        // Set headers for Excel download
        res.setHeader(
          'Content-Type',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        );
        res.setHeader(
          'Content-Disposition',
          'attachment; filename=users_report.xlsx'
        );

        // Generate and stream the Excel file
        await userReportsService.getAllReportsExcel({ user: req.user, stream: res });
      } else if (format === 'json') {
        // Return JSON data
        const reports = await userReportsService.getAllReports();
        res.json(reports);
      } else {
        // Handle invalid format
        next(new Error('Invalid format specified. Use "json" or "excel".'))
      }
    } catch (error) {
      next(error)
    }
  },  

  /**
   * Submit a new user report
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async submitReport(req, res, next) {
    try {
      const user = req.user;
      const data = req.body; // Assuming the report data is sent in the request body
      // Delegate to the service
      const newReport = await userReportsService.submitReport({
        data,
        user
      });
      res.status(201).json(newReport);
    } catch (error) {
      next(error)
    }
  },

  async errorHandler(error, req, res, next) {
    // TODO: Improve the error handler, parse each type of error, and return an apropiate response
    console.log({error})
    res.status(500).json({ message: 'Error fetching reports', error: error.message });
  }
};

module.exports = userReportsController;