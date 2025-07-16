document.addEventListener('DOMContentLoaded', () => {
    // --- Weather Fetch ---
    const apiKey = '232703aa696071faeec1d93096aeef4c'; // Replace with your actual OpenWeatherMap API key
    const lat = '6.5244';
    const lon = '3.3792';
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

    const weatherInfo = document.getElementById('weather-info');

    async function fetchWeather() {
        if (apiKey === 'YOUR_API_KEY_HERE') {
            weatherInfo.innerHTML = '<p>Please enter your OpenWeatherMap API key in home.js to see the weather.</p>';
            return;
        }
        try {
            // Fetch current weather
            const weatherResponse = await fetch(weatherUrl);
            if (!weatherResponse.ok) throw new Error('Current weather data not available.');
            const currentData = await weatherResponse.json();

            // Fetch forecast
            const forecastResponse = await fetch(forecastUrl);
            if (!forecastResponse.ok) throw new Error('Forecast data not available.');
            const forecastData = await forecastResponse.json();

            displayWeather(currentData, forecastData);
        } catch (error) {
            console.error('Error fetching weather:', error);
            weatherInfo.innerHTML = '<p>Could not retrieve weather data. Please try again later.</p>';
        }
    }

    function displayWeather(current, forecast) {
        const currentTemp = current.main.temp.toFixed(0);
        const description = current.weather[0].description;
        const icon = `https://openweathermap.org/img/wn/${current.weather[0].icon}.png`;

        // Filter for one forecast per day (e.g., at noon)
        const dailyForecasts = forecast.list.filter(item => item.dt_txt.includes("12:00:00")).slice(0, 3);

        let forecastHtml = '<h4>3-Day Forecast</h4><ul>';
        dailyForecasts.forEach(day => {
            const date = new Date(day.dt * 1000);
            const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
            const temp = day.main.temp.toFixed(0);
            forecastHtml += `<li>${dayName}: ${temp}°C</li>`;
        });
        forecastHtml += '</ul>';

        weatherInfo.innerHTML = `
            <div class="current-weather">
                <img src="${icon}" alt="${description}">
                <p><strong>Current:</strong> ${currentTemp}°C, ${description}</p>
            </div>
            ${forecastHtml}
        `;
    }

    // --- Member Spotlights ---
    const membersUrl = 'data/members.json';
    const spotlightCards = document.getElementById('spotlight-cards');

    async function fetchSpotlights() {
        try {
            const response = await fetch(membersUrl);
            if (!response.ok) throw new Error('Member data not available.');
            const data = await response.json();
            displaySpotlights(data.members); // Access the nested array
        } catch (error) {
            console.error('Error fetching members:', error);
            spotlightCards.innerHTML = '<p>Could not load member spotlights.</p>';
        }
    }

    function displaySpotlights(members) {
        const eligibleMembers = members.filter(member => member.membership === 3 || member.membership === 2); // Filter by numeric level (Gold=3, Silver=2)
        
        // Shuffle the array to get random members
        const shuffled = eligibleMembers.sort(() => 0.5 - Math.random());
        
        // Select 2 or 3 members
        const selectedCount = Math.floor(Math.random() * 2) + 2; // Randomly 2 or 3
        const selectedMembers = shuffled.slice(0, selectedCount);

        let cardsHtml = '';
        selectedMembers.forEach(member => {
            cardsHtml += `
                <div class="spotlight-card">
                    <h4>${member.name}</h4>
                    <img src="${member.image}" alt="${member.name} Logo">
                    <p>${member.address}</p>
                    <p>${member.phone}</p>
                    <a href="${member.website}" target="_blank">Visit Website</a>
                    <p><strong>Membership:</strong> ${member.membership === 3 ? 'Gold' : 'Silver'}</p>
                </div>
            `;
        });
        spotlightCards.innerHTML = cardsHtml;
    }

    // Initial fetches
    fetchWeather();
    fetchSpotlights();
});