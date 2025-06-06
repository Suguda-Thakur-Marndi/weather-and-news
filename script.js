
const weatherApiKey = "bf563bf355144c7598d173452252605";   
const gnewsApiKey   = "061a4b778a8deff7eccefe313760da2e";   


const $ = sel => document.querySelector(sel);
const $$ = sel => document.querySelectorAll(sel);

const searchBtn       = $(".searchbtn");
const cityInput       = $(".cityinput");
const newsInput       = $(".news-search-input");
const newsBtn         = $(".news-search-btn");
const catBtns         = $$(".category-btn");
const catSelect       = $(".news-categories-dropdown");

const countryTxt      = $(".country-txt");
const dateTxt         = $(".date-txt");
const icon            = $(".icon");
const tempText        = $(".temp-text");
const conditionText   = $(".condition-text");
const humidityText    = $(".humidity-value-text");
const windText        = $(".wind-speed-text");
const forecastWrap    = $(".forecast");
const featuredNews    = $(".featured-news");
const newsGrid        = $(".news-grid");

searchBtn.addEventListener("click", () => fetchWeather(cityInput.value.trim() || "India"));
cityInput.addEventListener("keydown", e => e.key === "Enter" && searchBtn.click());

newsBtn.addEventListener("click", () => fetchNews(newsInput.value.trim() || catSelect.value));
newsInput.addEventListener("keydown", e => e.key === "Enter" && newsBtn.click());

catBtns.forEach(btn => btn.addEventListener("click", () => {
  setActive(btn); newsInput.value = ""; fetchNews(btn.dataset.category);
}));
catSelect.addEventListener("change", () => fetchNews(catSelect.value));

function setActive(activeBtn){
  catBtns.forEach(b => b.classList.remove("active"));
  activeBtn.classList.add("active");
}

const weatherColor = c => {
  c = c.toLowerCase();
  if (c.includes("rain"))  return "#a0c4ff";
  if (c.includes("cloud")) return "#d3d3d3";
  if (c.includes("clear")) return "#87ceeb";
  if (c.includes("snow"))  return "#ffffff";
  return "#add8e6";
};
const weatherEmoji = c => {
  c = c.toLowerCase();
  if (c.includes("rain"))  return "🌧️";
  if (c.includes("cloud")) return "☁️";
  if (c.includes("clear")) return "☀️";
  if (c.includes("snow"))  return "❄️";
  if (c.includes("storm")) return "⛈️";
  return "🌡️";
};


async function fetchWeather(city){
  try{
    countryTxt.textContent = "Loading…";
    forecastWrap.innerHTML = "";

    const res = await fetch(
      `https://api.weatherapi.com/v1/forecast.json?key=${weatherApiKey}&q=${encodeURIComponent(city)}&days=7&aqi=no&alerts=no`
    );
    const data = await res.json();

    countryTxt.textContent     = data.location.name;
    dateTxt.textContent        = data.location.localtime;
    icon.textContent           = weatherEmoji(data.current.condition.text);
    tempText.textContent       = `${data.current.temp_c}°C`;
    conditionText.textContent  = data.current.condition.text;
    humidityText.textContent   = `${data.current.humidity}%`;
    windText.textContent       = `${data.current.wind_kph} km/h`;

    forecastWrap.innerHTML = data.forecast.forecastday.map(d => `
      <div class="day">${d.date}<br>${weatherEmoji(d.day.condition.text)}<br>${d.day.avgtemp_c}°C</div>
    `).join("");

    document.body.style.background = weatherColor(data.current.condition.text);
    $(".main-news").style.background = "rgba(0,0,0,0.35)";
  }catch(err){
    console.error(err);
    countryTxt.textContent = "Error loading data";
  }
}


const gnewsTopics = ["general","world","nation","business","technology","entertainment","sports","science","health"];

async function fetchNews(query){
  try{
    const isTopic = gnewsTopics.includes(query.toLowerCase());
    const endpoint = isTopic ? "top-headlines" : "search";
    const params   = isTopic
       ? `topic=${query}&lang=en&max=11`
       : `q=${encodeURIComponent(query)}&lang=en&max=11`;

    const url = `https://gnews.io/api/v4/${endpoint}?${params}&apikey=${gnewsApiKey}`;
    const { articles = [] } = await (await fetch(url)).json();

    if(!articles.length){ featuredNews.innerHTML = "<p>No news found.</p>"; newsGrid.innerHTML=""; return; }

    const [first,...rest] = articles;
    featuredNews.innerHTML = newsCard(first);
    newsGrid.innerHTML     = rest.map(newsCard).join("");
  }catch(err){
    console.error(err);
    featuredNews.innerHTML = "<p>Unable to fetch news.</p>";
    newsGrid.innerHTML = "";
  }
}

const newsCard = a => `
  <a href="${a.url}" target="_blank" rel="noopener" class="news-item">
    <img src="${a.image || 'https://via.placeholder.com/100x80'}" alt="">
    <div class="news-text">
      <h3>${a.title}</h3>
      <p>${a.description || "No description available."}</p>
    </div>
  </a>`;

fetchWeather("India");
fetchNews("general");
setActive($(".category-btn[data-category='general']"));
