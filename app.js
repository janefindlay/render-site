const express = require("express");
const fs = require("fs");
const path = require("path");
const mongoose = require('mongoose');
const app = express();
const port = process.env.PORT || 3001;

const uri = "mongodb+srv://janefindlay16:Mik6ET5GnlTjRZrg@cluster0.imfzdpt.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";


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

// Connect to MongoDB Atlas
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB Atlas'))
    .catch(err => console.error('Error connecting to MongoDB Atlas:', err));

// Define a schema for the data
const dataSchema = new mongoose.Schema({
    temp: Number,
    depth: Number
});

// Create a model based on the schema
const DataModel = mongoose.model('Data', dataSchema);

// Function to insert data
const insertData = async (data_depth, data_temp) => {
  try {
      const newData = new DataModel({ temp: data_temp, depth: data_depth });

      const savedData = await newData.save();
      console.log('Data saved:', savedData);
  } catch (err) {
      console.log('Error saving data:', err);
  }
};

app.post("/sensordata", (req, res) => {
  const data = req.body; // Access the sent data from EMQX

  let depth = data.depth_cm;
  let temp = data.temperature_C;

  insertData(depth, temp);

  res.status(200).send({ message: "Data received", data: data });
});

app.get('/data/latest', async (req, res) => {
  try {
      const latestData = await DataModel.findOne().sort({ _id: -1 });
      res.status(200).json(latestData); // Send the most recent data
  } catch (error) {
      console.error('Error fetching latest data:', error);
      res.status(500).send('Error fetching latest data');
  }
});

const server = app.listen(port, () => console.log(`Server listening on port ${port}!`));

server.keepAliveTimeout = 120 * 1000;
server.headersTimeout = 120 * 1000;
