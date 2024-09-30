const express = require('express');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();
const DATA_FILE = './data/requests.json';

const readData = () => {
    try {
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        return [];
    }
};

const writeData = (data) => {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
};

// POST /requests - Add a new service request
router.post('/', (req, res) => {
    const { guestName, roomNumber, requestDetails, priority, status } = req.body;

    if (!guestName || !roomNumber || !requestDetails || priority === undefined || !status) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    const newRequest = {
        id: uuidv4(),
        guestName,
        roomNumber,
        requestDetails,
        priority,
        status,
    };

    const data = readData();
    data.push(newRequest);
    writeData(data);

    res.status(201).json(newRequest);
});

// GET /requests - Retrieve all requests, sorted by priority
router.get('/', (req, res) => {
    const data = readData();

    data.sort((a, b) => {
        if (a.priority !== b.priority) {
            return a.priority - b.priority;
        }
        const statusOrder = {
            'received': 1,
            'awaiting confirmation': 2,
            'in progress': 3,
            'completed': 4,
            'canceled': 5,
        };
        return statusOrder[a.status] - statusOrder[b.status];
    });

    res.json(data);
});

// GET /requests/:id - Retrieve a specific request by ID
router.get('/:id', (req, res) => {
    const { id } = req.params;
    const data = readData();
    const request = data.find(r => r.id === id);

    if (!request) {
        return res.status(404).json({ message: 'Request not found.' });
    }

    res.json(request);
});

// PUT /requests/:id - Update details or priority of an existing request
router.put('/:id', (req, res) => {
    const { id } = req.params;
    const { guestName, roomNumber, requestDetails, priority, status } = req.body;

    const data = readData();
    const requestIndex = data.findIndex(r => r.id === id);

    if (requestIndex === -1) {
        return res.status(404).json({ message: 'Request not found.' });
    }

    if (guestName !== undefined) data[requestIndex].guestName = guestName;
    if (roomNumber !== undefined) data[requestIndex].roomNumber = roomNumber;
    if (requestDetails !== undefined) data[requestIndex].requestDetails = requestDetails;
    if (priority !== undefined) data[requestIndex].priority = priority;
    if (status !== undefined) data[requestIndex].status = status;

    writeData(data);
    res.json(data[requestIndex]);
});

// DELETE /requests/:id - Remove a completed or canceled request
router.delete('/:id', (req, res) => {
    const { id } = req.params;
    const data = readData();
    const requestIndex = data.findIndex(r => r.id === id);

    if (requestIndex === -1) {
        return res.status(404).json({ message: 'Request not found.' });
    }

    const request = data[requestIndex];
    if (request.status !== 'completed' && request.status !== 'canceled') {
        return res.status(400).json({ message: 'Only completed or canceled requests can be deleted.' });
    }

    data.splice(requestIndex, 1);
    writeData(data);

    res.json({ message: 'Request deleted successfully.' });
});

// POST /requests/:id/complete - Mark a request as completed
router.post('/:id/complete', (req, res) => {
    const { id } = req.params;
    const data = readData();
    const requestIndex = data.findIndex(r => r.id === id);

    if (requestIndex === -1) {
        return res.status(404).json({ message: 'Request not found.' });
    }

    data[requestIndex].status = 'completed';
    writeData(data);

    res.json(data[requestIndex]);
});

module.exports = router;
