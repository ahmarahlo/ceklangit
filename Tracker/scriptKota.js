// scriptKota.js

const apiKey = "02c17f03b8ce476c98305004251802";
const searchInput = document.querySelector("#searchInput");
const cityName = document.querySelector("#city-name");
const temperature = document.querySelector("#temperature");
const description = document.querySelector("#description");
const historyList = document.querySelector(".history-list");
const hourlyWeatherDiv = document.querySelector(".hourly .details-content");
const forecastList = document.querySelector(".forecast-list");

const weatherCodes = {
  clear: [1000],
  clouds: [1003, 1006, 1007, 1009],
  mist: [1030, 1135, 1147],
  rain: [
    1063, 1150, 1153, 1168, 1171, 1180, 1183, 1198, 1201, 1240, 1243, 1246,
    1273, 1276,
  ],
  moderate_heavy_rain: [1186, 1189, 1192, 1195, 1243, 1246],
  snow: [
    1066, 1069, 1072, 1114, 1117, 1204, 1207, 1210, 1213, 1216, 1219, 1222,
    1225, 1237, 1249, 1252, 1255, 1258, 1261, 1264, 1279, 1282,
  ],
  thunder: [1087, 1279, 1282],
  thunder_rain: [1273, 1276],
};

const MAX_HISTORY = 4;
let history = [];

const saveToHistory = (city) => {
  history = history.filter((item) => item !== city);
  history.unshift(city);
  if (history.length > MAX_HISTORY) history.pop();
  renderHistory();
};

const displayHourlyForecast = (hourlyData) => {
  const currentHour = new Date().setMinutes(0, 0, 0);

  const next3HoursData = hourlyData
    .filter(({time}) => {
      const forecastTime = new Date(time).getTime();
      return forecastTime >= currentHour;
    })
    .slice(0, 3);

  hourlyWeatherDiv.innerHTML = next3HoursData
    .map((item) => {
      const time = new Date(item.time).getHours() + ":00";
      const temp = Math.floor(item.temp_c);
      const weatherIcon = Object.keys(weatherCodes).find((icon) =>
        weatherCodes[icon].includes(item.condition.code)
      );
      return `<li class="forecast-hour">
              <p class="time">${time}</p>
              <img src="icons1/${weatherIcon}.svg" class="iconhour" />
              <p class="temperature">${temp}°C</p>
            </li>`;
    })
    .join("");
};

const renderHistory = () => {
  historyList.innerHTML = "";
  history.forEach((city) => {
    fetch(`https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${city}`)
      .then((res) => res.json())
      .then((data) => {
        const iconCode = data.current.condition.code;
        const iconKey = Object.keys(weatherCodes).find((key) =>
          weatherCodes[key].includes(iconCode)
        );
        const iconPath = `icons1/${iconKey || "clear"}.svg`;

        const div = document.createElement("div");
        div.className = "history-item";
        div.innerHTML = `
          <div class="info">
            <img src="${iconPath}" alt="icon" />
            <div>
              <h4>${data.location.name}</h4>
              <p>${data.current.condition.text}</p>
              <p>${Math.floor(data.current.temp_c)}°C</p>
            </div>
          </div>
          <button class="detail-button">Lihat Detail</button>
        `;

        div.querySelector(".detail-button").addEventListener("click", () => {
          window.location.href = `kota.html?city=${encodeURIComponent(city)}`;
        });

        div.querySelector("h4").addEventListener("click", () => {
          loadCityWeather(city);
        });

        historyList.appendChild(div);
      });
  });
};

const loadCityWeather = async (city) => {
  console.log(`Loading weather for city: ${city}`); // Menambahkan log

  const apiUrl = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${city}&days=4`;
  try {
    const response = await fetch(apiUrl);
    const data = await response.json();

    if (data.error) {
      alert("Kota tidak ditemukan!");
      return;
    }

    if (cityName && temperature && description) {
      cityName.innerText = data.location.name;
      temperature.innerHTML = `${Math.floor(
        data.current.temp_c
      )}<span>°C</span>`;
      description.innerText = data.current.condition.text;
    }

    forecastList.innerHTML = data.forecast.forecastday
      .slice(0, 3)
      .map((day) => {
        const weatherIcon = Object.keys(weatherCodes).find((key) =>
          weatherCodes[key].includes(day.day.condition.code)
        );
        return `
          <div class="forecast-day">
            <span class="day">${new Date(day.date).toLocaleDateString("en-US", {
              weekday: "short",
            })}</span>
            <img src="icons1/${weatherIcon}.svg" class="forecast-icon" />
            <span class="temp">${Math.floor(day.day.maxtemp_c)}° / ${Math.floor(
          day.day.mintemp_c
        )}°</span>
          </div>`;
      })
      .join("");

    displayHourlyForecast([
      ...data.forecast.forecastday[0].hour,
      ...data.forecast.forecastday[1].hour,
    ]);

    saveToHistory(city);
  } catch (error) {
    console.error(error);
  }
};


searchInput.addEventListener("keyup", (e) => {
  if (e.key === "Enter") {
    const city = searchInput.value.trim();
    if (city) {
      loadCityWeather(city);
    }
  }
});

window.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const city = params.get("city");
  if (city) {
    loadCityWeather(city);
  }
});
