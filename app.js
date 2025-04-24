const express = require("express");
const mongoose = require('mongoose');
const app = express();
const port = process.env.PORT || 3001;

const uri = "mongodb+srv://janefindlay16:Mik6ET5GnlTjRZrg@cluster0.imfzdpt.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

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

mongoose.connection.on('error', (err) => {
  console.error('Database connection error:', err);
});
mongoose.connection.on('connected', () => {
  console.log('Database connected');
});
  

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
      console.error('Error saving data:', err);
  }
};

insertData(7, 98);

app.post("/sensordata", (req, res) => {
  const data = req.body; // Access the sent data from EMQX
  
  let jsonData = JSON.parse(data);

  let depth = jsonData.depth_cm;
  let temp = jsonData.temperature_C;

  insertData(depth, temp);

  res.status(200).send({ message: "Data received", data: data });
});

const server = app.listen(port, () => console.log(`Server listening on port ${port}!`));

server.keepAliveTimeout = 120 * 1000;
server.headersTimeout = 120 * 1000;

const html = `
<!DOCTYPE html>
<html>
  <head>
    <title>Hello from Render!</title>
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
      Hello from Render!
    </section>
  </body>
</html>
`
