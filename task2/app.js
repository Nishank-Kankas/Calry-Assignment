const express = require('express');
const bodyParser = require('body-parser');
const requestsRouter = require('./routes/requests');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

// Mount the requests router
app.use('/requests', requestsRouter);

// Handle 404
app.use((req, res, next) => {
    res.status(404).json({ message: 'Endpoint not found' });
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Internal Server Error' });
});

app.listen(PORT, () => {
    console.log(`Hotel Room Service API is running on port ${PORT}`);
});
