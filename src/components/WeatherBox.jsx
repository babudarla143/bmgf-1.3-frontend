import React from 'react';
import './WeatherBox.css';

export default function WeatherBox({ forecastData }) {
  if (!forecastData) return null;

  const formatValue = (val, unit = '') => {
    if (val === "--" || val === null || val === undefined) return `--${unit}`;
    const num = Number(val);
    return isNaN(num) ? `--${unit}` : `${num.toFixed(2)}${unit}`;
  };

  const {
    Rainfall = "--",
    Tmin = "--",
    Tmax = "--",
    RH = "--",
    Wind_Speed = "--",
    Wind_Direction = "--",
    Soilm10 = "--",
    Soilt10 = "--",
  } = forecastData;

  return (
    <div className="weather-card">
      <h2 style={{textAlign:'center'}}> Weather Forecast</h2>
      <div className="weather-grid">
        <div className="weather-item">Rainfall: {formatValue(Rainfall, " mm")}</div>
        <div className="weather-item">Temp Min: {formatValue(Tmin, "°C")}</div>
        <div className="weather-item">Temp Max: {formatValue(Tmax, "°C")}</div>
        <div className="weather-item">Humidity: {formatValue(RH, "%")}</div>
        <div className="weather-item">Wind Speed: {formatValue(Wind_Speed, " m/s")}</div>
        <div className="weather-item">Wind Direction: {formatValue(Wind_Direction, "°")}</div>
        <div className="weather-item">Soil Moisture: {formatValue(Soilm10, "%")}</div>
        <div className="weather-item">Soil Temp: {formatValue(Soilt10, "°C")}</div>
      </div>
    </div>
  );
}
