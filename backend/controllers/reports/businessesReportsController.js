const businessReportsService = require('../../services/reports/businessReportsService');

module.exports.getBusinessesGrossIncomeReport = async (req, res) => {
  try {
    const result = await businessReportsService.getBusinessesGrossIncomeReportJSON(req.user);
    res.json(result);
  } catch (err) {

    console.log({err});


    if (err.statusCode) {
      return res.status(err.statusCode).json({ error: {
        message: err.message,
        name: err.name,
        statusCode: err.statusCode
      }});
    }

    return res.status(500).json({ error: {
      message: err.message,
      name: err.name
    }});

  }
}