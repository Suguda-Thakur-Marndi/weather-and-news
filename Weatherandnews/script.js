const weatherApiKey = "bf563bf355144c7598d173452252605";
const newsApiKey = "2ebba1e6bd834cdf8a47b724ed976812";

const searchBtn = document.querySelector(".searchbtn");
const cityInput = document.querySelector(".cityinput");
const newsSearchInput = document.querySelector(".news-search-input");
const newsSearchBtn = document.querySelector(".news-search-btn");
const categorySelect = document.querySelector(".news-category");

searchBtn.addEventListener("click", () => {
  const city = cityInput.value || "India";
  fetchWeather(city);
});

cityInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") searchBtn.click();
});

newsSearchBtn.addEventListener("click", () => {
  const query = newsSearchInput.value.trim() || categorySelect.value;
  fetchNews(query);
});

categorySelect.addEventListener("change", () => {
  fetchNews(categorySelect.value);
});

function fetchWeather(city) {
  const countryTxt = document.querySelector(".country-txt");
  const dateTxt = document.querySelector(".date-txt");
  const icon = document.querySelector(".icon");
  const tempText = document.querySelector(".temp-text");
  const conditionText = document.querySelector(".condition-text");
  const humidityText = document.querySelector(".humidity-value-text");
  const windSpeedText = document.querySelector(".wind-speed-text");
  const forecast = document.querySelector(".forecast");

  countryTxt.textContent = "Loading...";
  forecast.innerHTML = "";

  fetch(`https://api.weatherapi.com/v1/forecast.json?key=${weatherApiKey}&q=${city}&days=7&aqi=yes&alerts=yes`)
    .then(res => res.json())
    .then(data => {
      countryTxt.textContent = data.location.name;
      dateTxt.textContent = data.location.localtime;
      icon.textContent = getWeatherEmoji(data.current.condition.text);
      tempText.textContent = `${data.current.temp_c}°C`;
      conditionText.textContent = data.current.condition.text;
      humidityText.textContent = `${data.current.humidity}%`;
      windSpeedText.textContent = `${data.current.wind_kph} km/h`;

      forecast.innerHTML = data.forecast.forecastday.map(day => `
        <div class="day">
          ${day.date}<br>${getWeatherEmoji(day.day.condition.text)}<br>${day.day.avgtemp_c}°C
        </div>
      `).join("");

      document.body.style.backgroundColor = getWeatherColor(data.current.condition.text);
    })
    .catch(() => {
      countryTxt.textContent = "Error loading data";
    });
}

function fetchNews(query) {
  const fromDate = new Date();
  fromDate.setDate(fromDate.getDate() - 30);
  const formattedDate = fromDate.toISOString().split('T')[0];

  fetch(`https://newsapi.org/v2/everything?q=${query}&from=${formattedDate}&sortBy=publishedAt&apiKey=${newsApiKey}`)
    .then(res => res.json())
    .then(data => {
      const articles = data.articles.slice(0, 10);
      if (!articles.length) return;

      const [first, ...rest] = articles;

      document.querySelector(".featured-news").innerHTML = `
        <a href="${first.url}" target="_blank" class="news-item">
          <img src="${first.urlToImage || 'https://via.placeholder.com/100x80'}" />
          <div class="news-text">
            <h3>${first.title}</h3>
            <p>${first.description || 'No description available.'}</p>
          </div>
        </a>`;

      document.querySelector(".news-grid").innerHTML = rest.map(article => `
        <a href="${article.url}" target="_blank" class="news-item">
          <img src="${article.urlToImage || 'https://via.placeholder.com/100x80'}" />
          <div class="news-text">
            <h3>${article.title}</h3>
            <p>${article.description || 'No description available.'}</p>
          </div>
        </a>
      `).join('');
    })
    .catch(() => {
      document.querySelector(".featured-news").innerHTML = "<p>Unable to fetch news.</p>";
      document.querySelector(".news-grid").innerHTML = "";
    });
}

function getWeatherEmoji(condition) {
  const text = condition.toLowerCase();
  if (text.includes("rain")) return "🌧️";
  if (text.includes("cloud")) return "☁️";
  if (text.includes("clear")) return "☀️";
  if (text.includes("snow")) return "❄️";
  if (text.includes("storm")) return "⛈️";
  return "🌡️";
}

function getWeatherColor(condition) {
  const text = condition.toLowerCase();
  if (text.includes("rain")) return "#a0c4ff";
  if (text.includes("cloud")) return "#d3d3d3";
  if (text.includes("clear")) return "#87ceeb";
  if (text.includes("snow")) return "#ffffff";
  return "#add8e6";
}

fetchWeather("India");
fetchNews("India");
