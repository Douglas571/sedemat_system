const businessReportsService = require('../../services/reports/businessReportsService');

const dayjs = require('dayjs');

module.exports.getBusinessesGrossIncomeReport = async (req, res) => {
  try {

    const {format} = req.query;
    if (format === 'json' || !format) {
      
      const result = await businessReportsService.getBusinessesGrossIncomeReportJSON({user: req.user});

      return res.json(result);

    } else if (format === 'excel') {

      // return Excel file
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

      res.setHeader('Content-Disposition', `attachment; filename=reporte_ingresos_brutos_${dayjs().format('DD-MM-YYYY_HH-mm-ss')}.xlsx`);

      // console.log({res})
      await businessReportsService.getBusinessesGrossIncomeReportExcel({user: req.user, stream: res});

      

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

module.exports.getGrossIncomesSummary = async (req, res) => {
  
  const { month, year, format } = req.query;

  try {

    if (format === 'json' || !format) {
      const result = await businessReportsService.getGrossIncomesSummaryJSON({month, year, user: req.user});

      return res.json(result);
    } else if (format === 'excel') {
    
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

      res.setHeader('Content-Disposition', `attachment; filename=resumen-${dayjs().format('MMMM-YYYY')}.xlsx`);

      await businessReportsService.getGrossIncomesSummaryExcel({month, year,user: req.user, stream: res});      

    } else {
      return res.status(400).json({ error: {
        message: 'Invalid format, please specify json or excel',
        name: "InvalidFormat"
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