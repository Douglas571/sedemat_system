const dayjs = require('dayjs');

const settlementsReportsService = require('../../services/reports/settlementsReportsService');
module.exports.getSettlementsReport = async (req, res) => {
  try {
    const filters = req.query;

    console.log("executing")

    if (filters.format === 'json') {
      const settlements = await settlementsReportsService.getSettlementsReportJSON({ filters, user: req.user});
      res.status(200).json(settlements);

    } else if (filters.format === 'excel') {
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=settlements-${dayjs().format('MMMM-YYYY')}.xlsx`);

      console.log("returning excel")
      await settlementsReportsService.getSettlementsReportExcel({filters, user: req.user, stream: res});   

    } else {
      throw new InvalidFormatError();
    }

  } catch (error) {
    console.log({error})
    return res.status(error.statusCode).json({ error });
  }
}