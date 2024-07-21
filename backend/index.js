const express = require("express");
const cors = require('cors');
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


const paymentsRouter = require("./payments/controller")
const businessesRouter = require("./businesses/controller")
const branchOfficesRouter = require("./branchOffices/controller")
const economicActivitiesRouter = require("./economicActivities/controller")

const app = express ();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 3000;
console.log({PORT})

const requestLogger = (req, res, next) => {
    const method = req.method;
    const url = req.url;
    const timestamp = new Date().toISOString();

    console.log(`[${timestamp}] ${method} ${url}`);
    
    next();
};
app.use(requestLogger);




app.use("/v1/payments", paymentsRouter)
app.use("/v1/businesses", businessesRouter)
app.use("/v1/branchOffices", branchOfficesRouter) // todo: fix this url to use hyphens instead of camelCase
app.use("/v1/economic-activities", economicActivitiesRouter)
// Middleware to serve static files from the 'uploads' directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.get('/image/:filename', (req, res) => {
    const filename = req.params.filename;
    const filepath = path.join(__dirname, 'uploads', filename);
    
    res.sendFile(filepath, (err) => {
      if (err) {
        res.status(404).json({ error: 'Image not found' });
      }
    });
  });

app.get("status", (request, response) => {
    const status = {
        "Status": "Running"
    };
    response.send(status);
});

logger.info('index.js - Routes mounted')

app.listen(PORT, () => {
    console.log("Server Listening on PORT:", PORT);
    logger.info("server listening on PORT:", PORT)
});
