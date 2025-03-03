const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

// Serve static files (like index.html, CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));

const FILE_PATH = path.join(__dirname, 'vehicles.json');

// Load existing vehicle data
function loadVehicles() {
    try {
        if (!fs.existsSync(FILE_PATH)) {
            return [];
        }
        const data = fs.readFileSync(FILE_PATH, 'utf8');
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error("Error reading vehicles.json:", error);
        return [];
    }
}

// Save vehicle data to file
function saveVehicles(vehicles) {
    fs.writeFileSync(FILE_PATH, JSON.stringify(vehicles, null, 2), 'utf8');
}

// **Serve index.html when accessing the root URL**
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

// **Get the file path**
app.get('/file-path', (req, res) => {
    res.json({ filePath: FILE_PATH });
});

// **Get all registered vehicles**
app.get('/vehicles', (req, res) => {
    res.json(loadVehicles());
});

// **Register a new vehicle**
app.post('/register', (req, res) => {
    let vehicles = loadVehicles();
    let newVehicle = req.body;

    if (vehicles.some(v => v.numberPlate === newVehicle.numberPlate)) {
        return res.status(400).json({ message: "Vehicle already registered!" });
    }

    vehicles.push(newVehicle);
    saveVehicles(vehicles);

    res.json({ message: "Vehicle Registered Successfully!", vehicle: newVehicle });
});

// **Search for a vehicle by number plate**
app.get('/search/:numberPlate', (req, res) => {
    let vehicles = loadVehicles();
    let numberPlate = req.params.numberPlate.toUpperCase();
    let foundVehicle = vehicles.find(vehicle => vehicle.numberPlate === numberPlate);

    if (foundVehicle) {
        res.json({ success: true, vehicle: foundVehicle });
    } else {
        res.status(404).json({ success: false, message: "Vehicle not found" });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
