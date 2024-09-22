const express = require("express");
const cors = require('cors');
const passport = require('passport');

const path = require('path');

const fs = require('fs');

const logger = require('./utils/logger')


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
const economicActivitiesRouter = require("./controllers/economicActivities");
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

const bankAccountRouter = require('./routers/bankAccountRouter')

const userRouter = require('./routers/userRouter')
const authRouter = require('./routers/authRouter');

const app = express ();
app.use(express.json());
app.use(cors());

app.use(passport.initialize());


const requestLogger = (req, res, next) => {
    const method = req.method;
    const url = req.url;
    const timestamp = new Date().toISOString();

    console.log(`[${timestamp}] ${method} ${url}`);
    
    next();
};
app.use(requestLogger);

app.get('/ping', (req, res) => {
  res.status(200).send('pong')
})

app.use("/v1/payments", paymentsRouter)
app.use("/v1/businesses", businessesRouter)
app.use("/v1/branch-offices", branchOfficesRouter) // todo: fix this url to use hyphens instead of camelCase
app.use("/v1/economic-activities", economicActivitiesRouter)
app.use("/v1/economic-licenses", economicLicenseRouter)
app.use("/v1/people", peopleRouter)

app.use("/v1/zonations", zonationsRouter)
app.use("/v1/lease-docs", leaseDocsRouter)
app.use("/v1/building-docs", buildingDocsRouter)

app.use("/v1/permit-docs", permitDocsRouter)
app.use("/v1/currency-exchange-rates", currencyExchangeRates)
app.use("/v1/invoice-item-types", invoiceItemTypeRouter)
app.use("/v1/gross-incomes", grossIncomeRouter);

app.use('/v1/gross-income-invoices', grossIncomeInvoiceRouter);

app.use('/v1/bank-accounts', bankAccountRouter)

app.use('/v1/users', userRouter)
app.use('/v1/auth', authRouter);

// Middleware to serve static files from the 'uploads' directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get("status", (request, response) => {
    console.log("get here")
    const status = {
        "Status": "Running"
    };
    response.send(status);
});

logger.info('index.js - Routes mounted')

module.exports = app