const express = require("express");
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const app = express();
const port = process.env.PORT || 3001;

const uri = "mongodb+srv://janefindlay16:Mik6ET5GnlTjRZrg@cluster0.imfzdpt.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.get("/", (req, res) => res.type('html').send(html));

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

app.get('/api/data/latest', async (req, res) => {
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

const html = `
<!DOCTYPE html>
<html>
  <head>
    <title>Tank Monitor</title>
    <script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.5.1/dist/confetti.browser.min.js"></script>
    <script>
      setTimeout(() => {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          disableForReducedMotion: true
        });
      }, 500);
    </script>
    <style>
      @import url("https://p.typekit.net/p.css?s=1&k=vnd5zic&ht=tk&f=39475.39476.39477.39478.39479.39480.39481.39482&a=18673890&app=typekit&e=css");
      @font-face {
        font-family: "neo-sans";
        src: url("https://use.typekit.net/af/00ac0a/00000000000000003b9b2033/27/l?primer=7cdcb44be4a7db8877ffa5c0007b8dd865b3bbc383831fe2ea177f62257a9191&fvd=n7&v=3") format("woff2"), url("https://use.typekit.net/af/00ac0a/00000000000000003b9b2033/27/d?primer=7cdcb44be4a7db8877ffa5c0007b8dd865b3bbc383831fe2ea177f62257a9191&fvd=n7&v=3") format("woff"), url("https://use.typekit.net/af/00ac0a/00000000000000003b9b2033/27/a?primer=7cdcb44be4a7db8877ffa5c0007b8dd865b3bbc383831fe2ea177f62257a9191&fvd=n7&v=3") format("opentype");
        font-style: normal;
        font-weight: 700;
      }
      html {
        font-family: neo-sans;
        font-weight: 700;
        font-size: calc(62rem / 16);
      }
      body {
        background: white;
      }
      section {
        border-radius: 1em;
        padding: 1em;
        position: absolute;
        top: 50%;
        left: 50%;
        margin-right: -50%;
        transform: translate(-50%, -50%);
      }
    </style>
  </head>
  <body>
    <section>
      Tank Monitor
    </section>
    <section>
      <p>Sensor Data</p>
      <div id="data-container">Loading...</div>
      <script>
        const fetchLatestData = async () => {
            try {
                const response = await fetch('https://render-site-ttp7.onrender.com/data/latest'); // Update with your server URL
                const data = await response.json();

                const container = document.getElementById('data-container');
                container.textContent = `Depth: ${data.depth}, Temp: ${data.temp}`;
            } catch (error) {
                console.error('Error fetching data:', error);
                document.getElementById('data-container').textContent = 'Error fetching data';
            }
        };

        fetchLatestData(); // Fetch and display data
      </script>
    </section>
  </body>
</html>
`
