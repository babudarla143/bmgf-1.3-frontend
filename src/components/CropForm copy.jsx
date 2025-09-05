import { useState, useEffect } from 'react';
import { getAdvice } from '../api/adviceApi';
import {
  getStates,
  getDistricts,
  getSubDistricts,
  getVillages,
  getVillageLatLon,
} from '../api/locationApi';
import WeatherBox from './WeatherBox';
import { parseISO, format } from 'date-fns';

export default function CropForm({ setForecastForDate, onSubmit }) {
  const [crop, setCrop] = useState("Rice");
  const [stage, setStage] = useState("");
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [subDistricts, setSubDistricts] = useState([]);
  const [villages, setVillages] = useState([]);

  const [selectedState, setSelectedState] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedSubDistrict, setSelectedSubDistrict] = useState("");
  const [selectedVillage, setSelectedVillage] = useState("");
  const [villageLatLon, setVillageLatLon] = useState(null);
  const [date, setDate] = useState("");

  const [forecastForDate, internalSetForecastForDate] = useState(null);

  const cropStages = {
    Rice: [
      "Seeding/Sowing", "Germination", "Seedling Establishment", "Transplanting",
      "Tillering", "Stem Elongation", "Panicle Initiation", "Booting",
      "Heading", "Flowering", "Milk Stage", "Dough Stage", "Maturity", "Harvesting"
    ],
    Potato: [
      "Planting", "Emergence", "Vegetative Growth", "Tuber Initiation",
      "Tuber Bulking", "Maturity", "Harvesting"
    ],
    Wheat: [
      "Germination", "Tillering", "Stem Elongation", "Booting",
      "Heading", "Flowering", "Milk Stage", "Dough Stage", "Maturity", "Harvesting"
    ]
  };

  useEffect(() => {
    getStates().then(setStates);
  }, []);

  const handleStateChange = (id) => {
    setSelectedState(id);
    setSelectedDistrict("");
    setSelectedSubDistrict("");
    setSelectedVillage("");
    setDistricts([]);
    setSubDistricts([]);
    setVillages([]);
    setVillageLatLon(null);
    internalSetForecastForDate(null);
    getDistricts(id).then(setDistricts);
  };

  const handleDistrictChange = (id) => {
    setSelectedDistrict(id);
    setSelectedSubDistrict("");
    setSelectedVillage("");
    setSubDistricts([]);
    setVillages([]);
    setVillageLatLon(null);
    internalSetForecastForDate(null);
    getSubDistricts(id).then(setSubDistricts);
  };

  const handleSubDistrictChange = (id) => {
    setSelectedSubDistrict(id);
    setSelectedVillage("");
    setVillages([]);
    setVillageLatLon(null);
    internalSetForecastForDate(null);
    getVillages(id).then(setVillages);
  };

  const handleVillageChange = async (id) => {
    setSelectedVillage(id);
    setVillageLatLon(null);
    internalSetForecastForDate(null);
    const village = villages.find(v => v.id === parseInt(id));
    if (village?.name) {
      try {
        const data = await getVillageLatLon(village.name);
        setVillageLatLon(data);

        if (data?.niruthi_data?.["Forecast data"] && date) {
          const matched = data.niruthi_data["Forecast data"].find((f) =>
            format(parseISO(f.Date_time), "yyyy-MM-dd") === date
          );
          internalSetForecastForDate(matched || null);
          setForecastForDate?.(matched || null);
        }

      } catch (error) {
        console.error("Failed to fetch village lat/lon:", error);
      }
    }
  };

  const handleDateChange = (value) => {
    setDate(value);
    internalSetForecastForDate(null);

    if (villageLatLon?.niruthi_data?.["Forecast data"]) {
      const matched = villageLatLon.niruthi_data["Forecast data"].find((f) =>
        format(parseISO(f.Date_time), "yyyy-MM-dd") === value
      );
      internalSetForecastForDate(matched || null);
      setForecastForDate?.(matched || null);
    }
  };

  const handleSubmit = async () => {
    const location = `${selectedState}, ${selectedDistrict}, ${selectedSubDistrict}, ${selectedVillage}`;
    try {
      const response = await getAdvice({
        crop,
        stage,
        location,
        date,
        latitude: villageLatLon?.latitude,
        longitude: villageLatLon?.longitude,
      });

      if (response?.advice) {
        localStorage.setItem("advice", response.advice);
      }

      if (onSubmit) {
        onSubmit({
          crop,
          stage,
          location,
          date,
          latitude: villageLatLon?.latitude,
          longitude: villageLatLon?.longitude,
        });
      }
    } catch (err) {
      console.error("Error fetching advice:", err);
    }
  };

  return (
    <div className="card">
      <h2>Crop Details</h2>

      <label>Crop</label>
      <select value={crop} onChange={e => setCrop(e.target.value)}>
        {Object.keys(cropStages).map(c => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>

      <label>Crop Stage</label>
      <select value={stage} onChange={e => setStage(e.target.value)}>
        <option value="">-- Select Stage --</option>
        {cropStages[crop].map((s, i) => (
          <option key={i} value={s}>{s}</option>
        ))}
      </select>

      <label>State</label>
      <select value={selectedState} onChange={e => handleStateChange(e.target.value)}>
        <option value="">-- Select State --</option>
        {states.map(s => (
          <option key={s.id} value={s.id}>{s.name}</option>
        ))}
      </select>

      {selectedState && (
        <>
          <label>District</label>
          <select value={selectedDistrict} onChange={e => handleDistrictChange(e.target.value)}>
            <option value="">-- Select District --</option>
            {districts.map(d => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </>
      )}

      {selectedDistrict && (
        <>
          <label>Sub-District</label>
          <select value={selectedSubDistrict} onChange={e => handleSubDistrictChange(e.target.value)}>
            <option value="">-- Select Sub-District --</option>
            {subDistricts.map(sd => (
              <option key={sd.id} value={sd.id}>{sd.name}</option>
            ))}
          </select>
        </>
      )}

      {selectedSubDistrict && (
        <>
          <label>Village</label>
          <select value={selectedVillage} onChange={e => handleVillageChange(e.target.value)}>
            <option value="">-- Select Village --</option>
            {villages.map(v => (
              <option key={v.id} value={v.id}>{v.name}</option>
            ))}
          </select>
        </>
      )}

      {villageLatLon && (
        <p style={{ fontSize: '0.9rem', color: 'gray' }}>
          📍 Coordinates: {villageLatLon.latitude}, {villageLatLon.longitude}
        </p>
      )}

      <label>Date</label>
      <input type="date" value={date} onChange={e => handleDateChange(e.target.value)} />

      <br /><br />
      <button onClick={handleSubmit}>🍃 Get AI Advice</button>

      {/*  Weather forecast display here */}
      {forecastForDate && (
        <div className="sidebar">
          <WeatherBox
            rainfall={forecastForDate.Rainfall}
            temperatureMin={forecastForDate.Tmin}
            temperatureMax={forecastForDate.Tmax}
            humidity={forecastForDate.RH}
            windSpeed={forecastForDate.Wind_Speed}
            windDirection={forecastForDate.Wind_Direction}
            soilMoisture={forecastForDate.Soilm10}
            soilTemp={forecastForDate.Soilt10}
          />
        </div>
      )}
    </div>
  );
}
