# Water Tank Monitor

A web dashboard that displays real-time water tank depth and temperature readings. Sensor data is captured wirelessly, routed through an MQTT broker, stored in MongoDB, and displayed as a live graph.

## How it works

```
Digitech sensor (433MHz)
        ↓
LilyGo ESP32 (OpenMQTTGateway)
        ↓
EMQX Cloud (MQTT broker)
        ↓
This server (Node.js / Render)
        ↓
MongoDB Atlas
        ↓
Browser dashboard (Chart.js)
```

## Hardware

- **Sensor:** Digitech wireless ultrasonic tank level meter with temperature sensor (model TS-FT002, ID 167)
- **Receiver:** LilyGo ESP32 with 433MHz module running [OpenMQTTGateway](https://docs.openmqttgateway.com)

## Setup

### 1. Flash the LilyGo ESP32

1. Go to the [OpenMQTTGateway upload portal](https://docs.openmqttgateway.com/upload/portal.html#configuration-portal)
2. Flash the firmware to the LilyGo (select the 433MHz / ESP32 build)
3. After flashing, connect to the `OMG...` WiFi network that appears in your device's WiFi settings
4. Configure WiFi credentials and MQTT broker details using values from your EMQX Cloud console

### 2. Configure EMQX Cloud

Set up a rule in EMQX to extract the sensor payload and forward it to this server's `/sensordata` endpoint.

**Rule SQL:**
```sql
SELECT
  payload.depth_cm,
  payload.temperature_C,
  payload.id,
  payload.model
FROM
  "sensordata/OMG_lilygo_rtl_433_ESP_OOK/RTL_433toMQTT/TS-FT002/167"
```

The rule action should be an HTTP webhook posting to `https://<your-render-url>/sensordata`.

### 3. Deploy the server

This server runs on [Render](https://render.com). Connect this repository to a Render web service and set the following environment variable:

| Variable | Description |
|---|---|
| `MONGODB_URI` | MongoDB Atlas connection string |

Render sets `PORT` automatically — no need to configure it.

### 4. MongoDB Atlas

Create a free cluster on [MongoDB Atlas](https://cloud.mongodb.com). Add your Render service's outbound IP to the Atlas network access list, then paste the connection string into Render's environment variables.

## Local development

```bash
npm install
MONGODB_URI="your-connection-string" node app.js
```

Then open `http://localhost:3001`.

## API endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/` | Dashboard UI |
| `GET` | `/status` | Health check |
| `POST` | `/sensordata` | Receive sensor reading from EMQX |
| `GET` | `/data/latest` | Most recent reading |
| `GET` | `/data/history?limit=20` | Recent readings (max 100) |
