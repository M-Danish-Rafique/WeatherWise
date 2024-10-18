// OpenWeather API key
const API_KEY = '345ca349d2c130abaf9eda0f64f217cf';
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

// Gemini API key
const GEMINI_API_KEY = 'AIzaSyA9Ndj3CzooCtulm9Y03Rkk5U-NzvJuqJc';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

// DOM elements
const cityInput = document.getElementById('city-search');
const searchBtn = document.getElementById('search-btn');
const forecastTable = document.getElementById('forecast-table');
const pagination = document.getElementById('pagination');
const chatbotInput = document.getElementById('chatbot-input');
const chatbotSend = document.getElementById('chatbot-send');
const chatbotAnswers = document.getElementById('chatbot-answers');
const filterDropdown = document.getElementById('filter-dropdown');

// Pagination variables
let currentPage = 1;
const itemsPerPage = 8;
let forecastData = [];

// Event listeners
searchBtn.addEventListener('click', () => fetchWeatherData(cityInput.value));
cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') fetchWeatherData(cityInput.value);
});
chatbotSend.addEventListener('click', handleChatbotInput);
chatbotInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleChatbotInput();
});
filterDropdown.addEventListener('change', handleFilterChange);

// Fetch weather data function
async function fetchWeatherData(city) {
    try {
        document.getElementsByClassName("loader")[0].style.display = "block";    // loader adding
        document.querySelector('#forecast-table').replaceChildren();        // Clearing the table for new input

        const response = await fetch(`${BASE_URL}/forecast?q=${city}&units=metric&appid=${API_KEY}`);   // API Call
        const data = await response.json();
        forecastData = data.list;

        document.getElementsByClassName("loader")[0].style.display = "none";       // loader removing
    } catch (error) {
        console.error('Error fetching weather data:', error);
        forecastTable.innerHTML = '<p style="color: red;">Error fetching weather data. Please try again.</p>';
        return;
    }
    updateTable();
    updateFilterButtons();
}

// Update table with weather data
function updateTable(data = forecastData) {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const pageData = data.slice(start, end);

    let tableHTML = `
        <tr>
            <th>Date</th>
            <th>Time</th>
            <th>Temperature (°C)</th>
            <th>Weather</th>
            <th>Humidity (%)</th>
        </tr>
    `;

    pageData.forEach(item => {
        const date = new Date(item.dt * 1000);
        tableHTML += `
            <tr>
                <td>${date.toLocaleDateString()}</td>
                <td>${date.toLocaleTimeString()}</td>
                <td>${item.main.temp}</td>
                <td>${item.weather[0].description}</td>
                <td>${item.main.humidity}</td>
            </tr>
        `;
    });

    forecastTable.innerHTML = tableHTML;
    updatePagination(data.length);
}

// Update pagination controls
function updatePagination(totalItems) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    let paginationHTML = '';

    for (let i = 1; i <= totalPages; i++) {
        paginationHTML += `<button onclick="changePage(${i})" ${i === currentPage ? 'disabled' : ''}>${i}</button>`;
    }

    pagination.innerHTML = paginationHTML;
}

// Change current page
function changePage(page) {
    currentPage = page;
    updateTable();
}

// Handle chatbot input
function handleChatbotInput() {
    const question = chatbotInput.value.trim(); // removes extra spaces
    if (question) {
        chatbotInput.value = '';
        const answer = generateChatbotAnswer(question);
        chatbotAnswers.innerHTML += `<p><strong>You:</strong> ${question}</p>`;
        chatbotAnswers.innerHTML += `<p><strong>Chatbot:</strong> ${answer}</p>`;
        chatbotAnswers.scrollTop = chatbotAnswers.scrollHeight;
    }
}

// Generate chatbot answer
function generateChatbotAnswer(question) {
    const lowercaseQuestion = question.toLowerCase();
    if (lowercaseQuestion.includes('highest temperature')) {
        const highest = Math.max(...forecastData.map(item => item.main.temp));
        return `The highest temperature in the forecast is ${highest}°C.`;
    } else if (lowercaseQuestion.includes('lowest temperature')) {
        const lowest = Math.min(...forecastData.map(item => item.main.temp));
        return `The lowest temperature in the forecast is ${lowest}°C.`;
    } else if (lowercaseQuestion.includes('average temperature')) {
        const sum = forecastData.reduce((acc, item) => acc + item.main.temp, 0);
        const average = (sum / forecastData.length).toFixed(2);
        return `The average temperature in the forecast is ${average}°C.`;
    } else {
        return "I'm sorry, I don't have enough information to answer that question. You can ask about the highest, lowest, or average temperature in the forecast.";
    }
}

// Filter functions
function sortTemperaturesAscending() {
    const sortedData = [...forecastData].sort((a, b) => a.main.temp - b.main.temp);
    updateTable(sortedData);
}

function sortTemperaturesDescending() {
    const sortedData = [...forecastData].sort((a, b) => b.main.temp - a.main.temp);
    updateTable(sortedData);
}

function filterRainyDays() {
    const rainyDays = forecastData.filter(item => item.weather[0].description.toLowerCase().includes('rain'));
    updateTable(rainyDays);
}

function showHighestTemperatureDay() {
    const highestTempDay = forecastData.reduce((max, item) => item.main.temp > max.main.temp ? item : max);
    updateTable([highestTempDay]);
}

// Handle filter change
function handleFilterChange() {
    const selectedFilter = filterDropdown.value;
    switch (selectedFilter) {
        case 'ascending':
            sortTemperaturesAscending();
            break;
        case 'descending':
            sortTemperaturesDescending();
            break;
        case 'rainy':
            filterRainyDays();
            break;
        case 'highest':
            showHighestTemperatureDay();
            break;
        default:
            updateTable(forecastData);
    }
}

// Weather-related keywords for filtering queries
const weatherKeywords = ['weather', 'temperature', 'forecast', 'rain', 'sun', 'wind', 'humidity', 'climate', 'storm', 'snow', 'cloud'];

// Handle chatbot input
async function handleChatbotInput() {
    const question = chatbotInput.value.trim();
    if (question) {
        chatbotInput.value = '';
        chatbotAnswers.innerHTML += `<p><strong>You:</strong> ${question}</p>`;
        
        if (isWeatherRelatedQuery(question)) {
            const answer = await generateChatbotAnswer(question);
            chatbotAnswers.innerHTML += `<p><strong>Chatbot:</strong> ${answer}</p>`;
        } else {
            chatbotAnswers.innerHTML += `<p><strong>Chatbot:</strong> I'm sorry, but I can only answer weather-related questions. Please ask something about the weather, temperature, or forecast.</p>`;
        }
        
        chatbotAnswers.scrollTop = chatbotAnswers.scrollHeight;
    }
}

// Check if the query is weather-related
function isWeatherRelatedQuery(query) {
    const lowercaseQuery = query.toLowerCase();
    return weatherKeywords.some(keyword => lowercaseQuery.includes(keyword));
}

// Generate chatbot answer using Gemini API
async function generateChatbotAnswer(question) {
    try {
        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: `Answer this weather-related question based on the following forecast data: ${JSON.stringify(forecastData)}\n\nQuestion: ${question}`
                    }]
                }]
            })
        });

        const data = await response.json();
        return data.candidates[0].content.parts[0].text;
    } catch (error) {
        console.error('Error generating answer:', error);
        return "I'm sorry, I encountered an error while processing your question. Please try again later.";
    }
}

fetchWeatherData("Lahore");