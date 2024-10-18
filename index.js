// OpenWeather API key
const API_KEY = '345ca349d2c130abaf9eda0f64f217cf';
const BASE_URL = 'https://api.openweathermap.org/data/2.5/';

// DOM elements
const cityInput = document.getElementById('city-search');
const searchBtn = document.getElementById('search-btn');
const currentWeather = document.getElementById('current-weather');
const tempBarChart = document.getElementById('temp-bar-chart');
const conditionDoughnutChart = document.getElementById('condition-doughnut-chart');
const tempLineChart = document.getElementById('temp-line-chart');
const imgContainer = document.querySelector('.weather-widget');

// Chart.js instances
let barChart, doughnutChart, lineChart;

// Event listeners
searchBtn.addEventListener('click', () => fetchWeatherData(cityInput.value));
cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') fetchWeatherData(cityInput.value);
});

// Fetch weather data
async function fetchWeatherData(city) {
    try {
        displayLoader();
        hideContent();

        const currentWeatherData = await fetch(`${BASE_URL}/weather?q=${city}&units=metric&appid=${API_KEY}`).then(res => res.json());

        const forecastData = await fetch(`${BASE_URL}/forecast?q=${city}&units=metric&appid=${API_KEY}`).then(res => res.json());

        updateCurrentWeather(currentWeatherData);
        updateCharts(forecastData);

        hideLoader();
        displayContent();

        setWeatherBackground(currentWeatherData.weather[0].description);
        
    } catch (error) {
        console.error('Error fetching weather data:', error);

        imgContainer.innerHTML = '<b style="font-size: 18px; color: red;">Error fetching weather data. Please try again.</b>';

        var charts = document.getElementsByClassName("chart");
    
        for (let i = 0; i < charts.length; i++) {
            charts[i].style.display = "none";
        }
        }
}

// Function to change background based on weather
function setWeatherBackground(condition) {
    switch (condition) {
        case "clear":
        case "sunny":
        case "clear sky":            
            imgContainer.style.backgroundImage = "url('Images/clear.jpg')";
            imgContainer.style.backgroundRepeat = "no-repeat";
            imgContainer.style.backgroundSize = "cover";
            break;
        case "smoke":            
            imgContainer.style.backgroundImage = "url('Images/smoky.jpg')";
            imgContainer.style.backgroundRepeat = "no-repeat";
            imgContainer.style.backgroundSize = "cover";
            break;
        case "few clouds":            
        case "scattered clouds":            
            imgContainer.style.backgroundImage = "url('Images/few-clouds.jpg')";
            imgContainer.style.backgroundRepeat = "no-repeat";
            imgContainer.style.backgroundSize = "cover";
            break;
        
        case "overcast clouds":            
            imgContainer.style.backgroundImage = "url('Images/overcast-clouds.jpg')";
            imgContainer.style.backgroundRepeat = "no-repeat";
            imgContainer.style.backgroundSize = "cover";
            break;

        case "light rain":
        case "rain":
        case "heavy rain":
        case "storm":            
            imgContainer.style.backgroundImage = "url('Images/rain.jpg')";
            imgContainer.style.backgroundRepeat = "no-repeat";
            imgContainer.style.backgroundSize = "cover";
            break;
        case "snowy":
            imgContainer.style.backgroundImage = "url('snowy-background.jpg')";
            imgContainer.style.backgroundRepeat = "no-repeat";
            imgContainer.style.backgroundSize = "cover";
            break;
    }
}

// Update current weather display
function updateCurrentWeather(data) {
    const weatherIcon = `http://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
    currentWeather.innerHTML = `
        <p style="font-size:25px; color: rgb(255, 116, 66);">${data.name}, ${data.sys.country}</p>
        <img src="${weatherIcon}" alt="${data.weather[0].description}">
        <p style="font-size:18px;"><img style="margin-right: 8px;" width="16" src="Images/temperature-high.png">Temperature: ${data.main.temp}°C</p>
        <p style="font-size:18px;"><img style="margin-right: 8px;" width="16" src="Images/heat.png">Feels like: ${data.main.feels_like}°C</p>
        <p style="font-size:18px;"><img style="margin-right: 8px;" width="16" src="Images/humidity.png">Humidity: ${data.main.humidity}%</p>
        <p style="font-size:18px;"><img style="margin-right: 8px;" width="16" src="Images/wind.png">Wind Speed: ${data.wind.speed} m/s</p>
        <p style="font-size:18px;"><img style="margin-right: 8px;" width="16" src="Images/cloud-sleet.png">Weather: ${data.weather[0].description}</p>
    `;
}

// Update charts
function updateCharts(data) {
    const dailyData = data.list.filter(item => item.dt_txt.includes('12:00:00'));
    
    updateBarChart(dailyData);
    updateDoughnutChart(dailyData);
    updateLineChart(dailyData);
}

// Update bar chart
function updateBarChart(data) {
    const ctx = tempBarChart.getContext('2d');
    const labels = data.map(item => new Date(item.dt * 1000).toLocaleDateString());
    const temperatures = data.map(item => item.main.temp);

    if (barChart) barChart.destroy();

    barChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Temperature (°C)',
                data: temperatures,
                backgroundColor: 'rgba(54, 162, 235, 0.6)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: false
                }
            },
            animation: {
                duration: 1000,
                easing: 'easeOutQuart'
            }
        }
    });
}

// Update doughnut chart
function updateDoughnutChart(data) {
    const ctx = conditionDoughnutChart.getContext('2d');
    const conditions = data.map(item => item.weather[0].main);
    const conditionCounts = conditions.reduce((acc, condition) => {
        acc[condition] = (acc[condition] || 0) + 1;
        return acc;
    }, {});

    if (doughnutChart) doughnutChart.destroy();

    doughnutChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(conditionCounts),
            datasets: [{
                data: Object.values(conditionCounts),
                backgroundColor: [
                    'rgba(255, 99, 132, 0.6)',
                    'rgba(54, 162, 235, 0.6)',
                    'rgba(255, 206, 86, 0.6)',
                    'rgba(75, 192, 192, 0.6)',
                    'rgba(153, 102, 255, 0.6)',
                ]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: 'Weather Conditions Distribution'
                }
            },
            animation: {
                animateScale: true,
                animateRotate: true
            }
        }
    });
}

// Update line chart
function updateLineChart(data) {
    const ctx = tempLineChart.getContext('2d');
    const labels = data.map(item => new Date(item.dt * 1000).toLocaleDateString());
    const temperatures = data.map(item => item.main.temp);

    if (lineChart) lineChart.destroy();

    lineChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Temperature (°C)',
                data: temperatures,
                fill: false,
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Temperature Trend'
                }
            },
            scales: {
                y: {
                    beginAtZero: false
                }
            },
            animation: {
                duration: 1000,
                easing: 'easeOutQuart'
            }
        }
    });
}

function hideLoader() {
    var loaders = document.getElementsByClassName("loader");
    if (loaders.length > 0) {
        loaders[0].style.display = "none";
    }
}

function displayLoader() {
    var loaders = document.getElementsByClassName("loader");
    if (loaders.length > 0) {
        loaders[0].style.display = "flex";
    }
}

function displayContent() {
    var charts = document.getElementsByClassName("chart");
    var weatherWidgets = document.getElementsByClassName("weather-widget");

    for (let i = 0; i < charts.length; i++) {
        charts[i].style.display = "flex";
        charts[i].style.flexDirection = 'column';
        charts[i].style.width = '32%';
    }

    for (let i = 0; i < weatherWidgets.length; i++) {
        weatherWidgets[i].style.display = "block";
    }
}

function hideContent() {
    var charts = document.getElementsByClassName("chart");
    var weatherWidgets = document.getElementsByClassName("weather-widget");

    for (let i = 0; i < charts.length; i++) {
        charts[i].style.display = "none";
    }

    for (let i = 0; i < weatherWidgets.length; i++) {
        weatherWidgets[i].style.display = "none";
    }
}

// Initial fetch for a default city (e.g., Islamabad)
fetchWeatherData('Lahore');