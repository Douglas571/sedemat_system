const logger = require('./utils/logger')
const app = require('./app')


const PORT = process.env.PORT || 3000;
console.log({PORT})

app.listen(PORT, () => {
    console.log("Server Listening on PORT:", PORT);
    logger.info("server listening on PORT:", PORT)
});
