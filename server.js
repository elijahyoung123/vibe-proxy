const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());

app.get('/api/daily', async (req, res) => {
  const { station, start, end } = req.query;
  try {
    const response = await axios.get('https://meteostat.p.rapidapi.com/stations/daily', {
      params: { station, start, end },
      headers: {
        'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
        'X-RapidAPI-Host': 'meteostat.p.rapidapi.com'
      }
    });
    res.json(response.data);
  } catch (err) {
    console.error("🔥 /api/daily error:", err.response?.data || err.message);
    res.status(500).json({
      error: "Daily data fetch error",
      details: err.response?.data || err.message
    });
  }
});


app.get('/api/geocode', async (req, res) => {
  const { q } = req.query;
  try {
    const response = await axios.get('https://api.openweathermap.org/geo/1.0/direct', {
      params: {
        q,
        limit: 5,
        appid: process.env.OPENWEATHER_KEY
      }
    });
    res.json(response.data);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Geocoding error' });
  }
});

app.get('/api/station', async (req, res) => {
  const { lat, lon } = req.query;
  try {
    const response = await axios.get('https://meteostat.p.rapidapi.com/stations/nearby', {
      params: { lat, lon },
      headers: {
        'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
        'X-RapidAPI-Host': 'meteostat.p.rapidapi.com'
      }
    });
    res.json(response.data);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Station lookup error' });
  }
});

app.get('/api/daily', async (req, res) => {
  const { location, start, end } = req.query;

  try {
    const response = await axios.get(`https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${encodeURIComponent(location)}/${start}/${end}`, {
      params: {
        unitGroup: 'metric',
        key: process.env.VC_API_KEY,
        include: 'days',
        elements: 'datetime,pressure',
        contentType: 'json'
      }
    });

    const data = response.data.days.map(day => ({
      date: day.datetime,
      pres: day.pressure
    }));

    res.json({ data });
  } catch (err) {
    console.error("🔥 /api/daily error:", err.response?.data || err.message);
    res.status(500).json({ error: "Visual Crossing daily fetch failed" });
  }
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
