const express = require("express");
const fs = require("fs");
const path = require("path");
const mongoose = require('mongoose');
const app = express();
const port = process.env.PORT || 3001;

const uri = process.env.MONGODB_URI;


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  const filePath = path.join(__dirname, "main.html"); // Path to the HTML file
  fs.readFile(filePath, "utf8", (err, data) => {
      if (err) {
          console.error("Error reading the HTML file:", err);
          res.status(500).send("Error loading page");
      } else {
          res.type("html").send(data); // Send the file content
      }
  });
});


app.get("/status", (req, res) => {
    const status = {
      "Status": "Running"
    }

    res.send(status);
});

console.log("Server file started");

// Connect to MongoDB Atlas
mongoose.connect(uri)
    .then(() => console.log('Connected to MongoDB Atlas'))
    .catch(err => console.error('Error connecting to MongoDB Atlas:', err));

// Define a schema for the data
const dataSchema = new mongoose.Schema({
  temp: Number,
  depth: Number
}, { timestamps: true });

// Create a model based on the schema
const DataModel = mongoose.model('Data', dataSchema);

// Function to insert data
const insertData = async (data_depth, data_temp) => {
  try {
      console.log('try to insert data');
      const newData = new DataModel({ temp: data_temp, depth: data_depth });

      const savedData = await newData.save();
      console.log('Data saved:', savedData);
  } catch (err) {
      console.error('Error saving data:', err);
  }
};

app.post("/sensordata", (req, res) => {
  const data = req.body; // Access the sent data from EMQX

  console.log('data: ' + data);

  let depth = data.depth_cm;
  let temp = data.temperature_C;

  insertData(depth, temp);

  console.log('Received data on /sensordata');

  res.status(200).send({ message: "Data received", data: data });
});

app.get('/data/latest', async (req, res) => {
  try {
      const latestData = await DataModel.findOne().sort({ _id: -1 });
      res.status(200).json(latestData);
  } catch (error) {
      console.error('Error fetching latest data:', error);
      res.status(500).json({ error: 'Error fetching latest data' });
  }
});

app.get('/data/history', async (req, res) => {
  try {
      const limit = Math.min(parseInt(req.query.limit) || 20, 100);
      const history = await DataModel.find().sort({ _id: -1 }).limit(limit);
      res.status(200).json(history.reverse());
  } catch (error) {
      console.error('Error fetching history:', error);
      res.status(500).json({ error: 'Error fetching history' });
  }
});

const server = app.listen(port, () => console.log(`Server listening on port ${port}!`));

server.keepAliveTimeout = 120 * 1000;
server.headersTimeout = 120 * 1000;
