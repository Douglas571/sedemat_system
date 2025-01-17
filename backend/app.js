// require('dotenv').config()

// const {TESTING_KEY} = process.env

// console.log(TESTING_KEY)

const express = require("express");
const cors = require('cors');
const passport = require('passport');

const path = require('path');

const fs = require('fs');

const logger = require('./utils/logger')

// ! TODO: Research why this is a bad idea 
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'


// ensure that the uploads folder exists
const ensureDirectoryExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`Directory created: ${dirPath}`);
  } else {
    console.log(`Directory already exists: ${dirPath}`);
  }
};

// Example usage
const directoryPath = path.join(__dirname, 'uploads');
ensureDirectoryExists(directoryPath);

const paymentsRouter = require("./controllers/payments")

const businessesRouter = require("./controllers/businesses")
const branchOfficesRouter = require("./controllers/branchOffices")

const economicActivitiesRouter = require("./routers/EconomicActivitiesRouter")
const alicuotaHistoryRouter = require("./routers/alicuotaHistoryRouter")

const economicLicenseRouter = require("./routers/economicLicenseRouter")
const peopleRouter = require("./controllers/people")
const zonationsRouter = require("./routers/zonations")
const leaseDocsRouter = require("./routers/leaseDocs")
const buildingDocsRouter = require("./routers/buildingDocs")

const permitDocsRouter = require("./routers/permitDocs")

const currencyExchangeRates = require('./routers/currencyExchangeRatesRouter')
const invoiceItemTypeRouter = require('./routers/invoiceItemTypeRouter')

const grossIncomeRouter = require('./routers/grossIncomeRouter');

const grossIncomeInvoiceRouter = require('./routers/grossIncomeInvoiceRouter');

const grossIncomeNotesRouter = require('./routers/grossIncomeNotesRouter')

const bankAccountRouter = require('./routers/bankAccountRouter')

const userRouter = require('./routers/userRouter')
const authRouter = require('./routers/authRouter');

const settlementRouter = require('./routers/settlementRouter');

const penaltyRouter = require('./routers/penaltyRouter');

const inactivityPeriodRouter = require('./routers/inactivityPeriodRoutes');

const businessActivityCategoriesRouter = require('./routers/businessActivityCategoriesRouter');

// REPORTS

const reportBusinesses = require('./routers/reports/businessesReportsRouter');
const reportSettlements = require('./routers/reports/settlementsReportsRouter');

// UTILITY ROUTERS 

const filesRouter = require('./routers/filesRouter');


const app = express ();
app.use(express.json());
app.use(cors());

app.use(passport.initialize());

const responseTime = require('response-time')
app.use(
  responseTime(
    (req, res, time) => {
      const method = req.method;
      const url = req.originalUrl;
      const timestamp = new Date().toISOString();

      console.log(`[${timestamp}] ${method} ${url} - (${time} ms)`);
    }
  )
);

app.use("/v1/reports/businesses", reportBusinesses)
app.use("/v1/reports/settlements", reportSettlements)

app.use("/v1/payments", paymentsRouter)

app.use("/v1/businesses", businessesRouter)
app.use("/v1/branch-offices", branchOfficesRouter) // todo: fix this url to use hyphens instead of camelCase

app.use("/v1/economic-activities", economicActivitiesRouter)
app.use("/v1/alicuota-history", alicuotaHistoryRouter)

app.use("/v1/economic-licenses", economicLicenseRouter)

app.use("/v1/people", peopleRouter)

app.use("/v1/zonations", zonationsRouter)
app.use("/v1/lease-docs", leaseDocsRouter)
app.use("/v1/building-docs", buildingDocsRouter)

app.use("/v1/permit-docs", permitDocsRouter)
app.use("/v1/currency-exchange-rates", currencyExchangeRates)
app.use("/v1/invoice-item-types", invoiceItemTypeRouter)

app.use("/v1/gross-incomes", grossIncomeRouter);
app.use('/v1/gross-incomes/notes', grossIncomeNotesRouter)

app.use('/v1/gross-income-invoices', grossIncomeInvoiceRouter);
app.use('/v1/settlements', settlementRouter);
app.use('/v1/penalties', penaltyRouter);

app.use('/v1/inactivity-periods', inactivityPeriodRouter);

app.use('/v1/bank-accounts', bankAccountRouter)

app.use('/v1/business-activity-categories', businessActivityCategoriesRouter);

app.use('/v1/users', userRouter)
app.use('/v1/auth', authRouter);

app.use('/v1/files', filesRouter);

// Middleware to serve static files from the 'uploads' directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/ping', (req, res) => {
  res.status(200).send('pong')
})

app.get("/status", (request, response) => {
    console.log("get here")
    const status = {
        "Status": "Running"
    };
    response.send(status);
});

logger.info('index.js - Routes mounted')

module.exports = app