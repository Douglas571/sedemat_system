const businessReportsService = require('../../services/reports/businessReportsService');

const dayjs = require('dayjs');

module.exports.getBusinessesGrossIncomeReport = async (req, res) => {
  try {

    const {format} = req.query;
    if (format === 'json' || !format) {
      
      const result = await businessReportsService.getBusinessesGrossIncomeReportJSON(req.user);

      return res.json(result);

    } else if (format === 'excel') {

      // // return Excel file
      // const result = await businessReportsService.getBusinessesGrossIncomeReportExcel(req.user);

      // res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

      // res.setHeader('Content-Disposition', `attachment; filename=reporte_ingresos_brutos_${dayjs().format('DD-MM-YYYY_HH-mm-ss')}.xlsx`);

      // return res.send(result);

      return res.status(500).json({ error: {
        message: "coming soon :)"
      }})

    } else {
      return res.status(400).json({ error: {
        message: 'Invalid format, please specify json or excel'
      }});
    }
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