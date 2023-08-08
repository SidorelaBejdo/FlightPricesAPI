

// Import dependencies
const express = require('express');
const puppeteer = require('puppeteer');
const app = express();
const port = 3000; // Replace this with your desired port

app.use(express.json());



app.post('/flights', async (req, res) => {
    const { departure, arrival, departure_date } = req.body;

    if (!(departure && arrival && departure_date)) {
        return res.status(400).json({ error: 'Missing required parameters' });
    }

    try {
        // Call the function to scrape the flights
        const flightsData = await scrapeFlights(departure, arrival, departure_date);
        res.json(flightsData);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch flight data' });
    }
});

async function scrapeFlights(departure, arrival, departure_date) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    const base_url = 'https://www.ryanair.com/gb/en'; 
    const query_params = {
        departure,
        arrival,
        departure_date
    };

    const url = `${base_url}?${new URLSearchParams(query_params).toString()}`;
    await page.goto(url);

    // Wait for the flight information to load on the page
    await page.waitForSelector('.flight-info');

    const flightsData = await page.evaluate(() => {
        const flights = [];
        const flightElements = document.querySelectorAll('.flight-info');

        flightElements.forEach((element) => {
            const flight_name = element.querySelector('.flight-name').innerText;
            const price = element.querySelector('.flight-price').innerText;

            flights.push({ flight_name, price });
        });

        return flights;
    });

    await browser.close();

    return flightsData;
}

app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});








