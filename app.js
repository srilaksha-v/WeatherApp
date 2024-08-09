const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const axios = require("axios");
const path = require("path");

require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 7000;

mongoose.connect(process.env.MONGO_URI);

app.set("view engine", "ejs");
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.urlencoded({ extended: true }));

app.use(bodyParser.json());
app.use(express.json());

app.get('/', async (req, res) => {
    try {
        let values = await getWeather();
        console.log(values, "values");
        if (values) {
            res.render('index', { values: values[3], place: values[0], region: values[1], current: values[2], error: null });
        }
        else {
            res.render('index', { error: "Place not found. Please try a different location." });
        }
    }
    catch (err) {
        console.error('Error fetching data:', err);
    }
});

app.post('/', async (req, res) => {
    const search = req.body.search;

    let values = await getWeather(search);
    // res.render('index', { values: values[3], place: values[0], region: values[1], current: values[2] });
    if (values) {
        res.render('index', { values: values[3], place: values[0], region: values[1], current: values[2], error: null });
    }
    else {
        res.render('index', { error: "Place not found. Please try a different location." });
    }
})

async function getWeather(place = "tokyo") {
    const url = `https://api.weatherapi.com/v1/forecast.json`;
    // `https://api.weatherapi.com/v1/forecast.json?key=451be396ec074e2ebbf124159240908&q=tokyo&hour_fields=temp_c&aqi=no;
    // `;

    const params = {
        key: "451be396ec074e2ebbf124159240908",
        q: place,
        hour_fields: "temp_c",
        aqi: "no",
    }
    try {
        const response = await axios.get(url, { params });
        //console.log(response.data);
        if (response.data && response.data.location && response.data.forecast) {
            let data = response.data.forecast.forecastday[0].hour;
            let infos = [response.data.location.name, response.data.location.region, response.data.current.temp_c];
            let temperatures = [];
            data.forEach(element => {
                temperatures.push(element.temp_c);
            });
            infos.push(temperatures);
            return infos;
        } else {
            return null;
        }
    } catch (err) {
        console.error('Error fetching weather data:', err);
        return null;
    }
}


app.listen(PORT, () => {
    console.log(`Server started on http://localhost:${PORT}`);
});
