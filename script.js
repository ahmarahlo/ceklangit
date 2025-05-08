const apiKey = "02c17f03b8ce476c98305004251802";
const currentWeatherDiv = document.querySelector(".weather-details");
const searchInput = document.querySelector("#searchInput");
const hourlyWeatherDiv = document.querySelector(".hourly .details-content");
const forecastList = document.querySelector(".forecast-list");
const airConditionsDiv = document.querySelector(".air-conditions");

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

const setLoading = (isLoading) => {
  const loadingText = document.querySelector("#city-name");
  loadingText.innerText = isLoading ? "Loading..." : "";
};

const displayHourlyForecast = (hourlyData) => {
  const currentHour = new Date().setMinutes(0, 0, 0);
  const next24Hours = currentHour + 24 * 60 * 60 * 1000;

  const next24HoursData = hourlyData.filter(({time}) => {
    const forecastTime = new Date(time).getTime();
    return forecastTime >= currentHour && forecastTime <= next24Hours;
  });

  hourlyWeatherDiv.innerHTML = next24HoursData
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

const displayWeeklyForecast = (forecastData) => {
  forecastList.innerHTML = "";
  const next7Days = forecastData.slice(0, 7);

  next7Days.forEach((day) => {
    const weatherIcon =
      Object.keys(weatherCodes).find((icon) =>
        weatherCodes[icon].includes(day.day.condition.code)
      ) || "clear";

    forecastList.innerHTML += `
      <div class="forecast-day">
        <span class="day">${new Date(day.date).toLocaleDateString("en-US", {
          weekday: "short",
        })}</span>
        <img src="icons1/${weatherIcon}.svg" class="forecast-icon" />
        <span class="temp">${Math.floor(day.day.maxtemp_c)}° / ${Math.floor(
      day.day.mintemp_c
    )}°</span>
      </div>`;
  });
};

const getWeatherDetails = async (city) => {
  setLoading(true);
  const apiUrl = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${city}&days=7`;
  try {
    const response = await fetch(apiUrl);
    const data = await response.json();
    setLoading(false);
    console.log("Forecast Data:", data.forecast.forecastday);
    console.log("Total Days Received:", data.forecast.forecastday.length);
    if (data.error) {
      alert("Kota tidak ditemukan!");
      return;
    }
    const temp = Math.floor(data.current.temp_c);
    const description = data.current.condition.text;
    const name = data.location.name;
    const weatherIcon = Object.keys(weatherCodes).find((icon) =>
      weatherCodes[icon].includes(data.current.condition.code)
    );
    currentWeatherDiv.querySelector(
      "#temperature"
    ).innerHTML = `${temp}<span>°C</span>`;
    currentWeatherDiv.querySelector(".description").innerText = description;
    currentWeatherDiv.querySelector("#city-name").innerText = name;
    currentWeatherDiv.querySelector(
      ".weather-icon"
    ).src = `icons1/${weatherIcon}.svg`;

    // Update Air Conditions
    airConditionsDiv.innerHTML = `
      <div>
        <span>Real Feel</span>
        <span>${Math.floor(data.current.feelslike_c)}°C</span>
      </div>
      <div>
        <span>Wind</span>
        <span>${data.current.wind_kph} km/h</span>
      </div>
      <div>
        <span>Chance of Rain</span>
        <span>${data.forecast.forecastday[0].day.daily_chance_of_rain}%</span>
      </div>
      <div>
        <span>UV Index</span>
        <span>${data.current.uv}</span>
      </div>
    `;

    displayHourlyForecast([
      ...data.forecast.forecastday[0].hour,
      ...data.forecast.forecastday[1].hour,
    ]);
    displayWeeklyForecast(data.forecast.forecastday);
  } catch (error) {
    setLoading(false);
    console.error(error);
    alert("Gagal mengambil data cuaca. Coba lagi nanti!");
  }
};

const getUserLocation = () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const {latitude, longitude} = position.coords;
        getWeatherDetails(`${latitude},${longitude}`);
      },
      (error) => {
        console.error("Gagal Mendapatkan Lokasi:", error);
        alert("Tidak Bisa Mengakses Lokasi Anda");
      },
      {enableHighAccuracy: true, timeout: 10000, maximumAge: 0}
    );
  } else {
    alert("Browser tidak mendukung");
  }
};

searchInput.addEventListener("keyup", (e) => {
  const city = searchInput.value.trim();
  if (e.key === "Enter" && city) {
    window.location.href = `kota.html?city=${encodeURIComponent(city)}`;
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const city = params.get("city");
  if (city) {
    getWeatherDetails(city);
  } else {
    getUserLocation();
  }
});
