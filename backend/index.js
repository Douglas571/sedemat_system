const express = require("express");
const cors = require('cors');
const path = require('path');


const paymentsRouter = require("./payments/controller")

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

app.listen(PORT, () => {
    console.log("Server Listening on PORT:", PORT);
});

// c