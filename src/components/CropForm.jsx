import { useState, useEffect } from 'react';
import { getAdvice } from '../api/adviceApi';
import {
  getStates,
  getDistricts,
  getSubDistricts,
  getVillages,
  getVillageLatLon,
  getCropStage,   // ✅ added new API
} from '../api/locationApi';
import WeatherBox from './WeatherBox';
import { parseISO, format } from 'date-fns';
// import { downloadApiTimings } from "../api/locationApi"; // adjust path

import AdviceBox from './AdviceBox';
import DistrictAdvisoryPage from "./DistrictAdvisoryPage";
// import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

export default function CropForm({ setForecastForDate, onSubmit, setAdviceData }) {
  const [crop, setCrop] = useState("Paddy");
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
  const [adviceList, setAdviceList] = useState([]);
  const [forecastForDate, internalSetForecastForDate] = useState(null);
  const [loading, setLoading] = useState(false);
  const cropStages = {
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

  //  Fetch crop stage automatically if crop = Paddy
  useEffect(() => {
    const fetchStage = async () => {
      if (crop === "Paddy" && selectedVillage && date) {
        try {
          const data = await getCropStage(selectedVillage, date);
          if (data?.crop_stage) {
            setStage(data.crop_stage);
          }
        } catch (err) {
          console.error("Failed to fetch crop stage:", err);
          setStage(""); // fallback
        }
      }
    };
    fetchStage();
  }, [crop, selectedVillage, date]);

  const handleStateChange = (stateName) => {
    setSelectedState(stateName);
    setSelectedDistrict("");
    setSelectedSubDistrict("");
    setSelectedVillage("");
    setDistricts([]);
    setSubDistricts([]);
    setVillages([]);
    setVillageLatLon(null);
    internalSetForecastForDate(null);
    getDistricts(stateName).then(setDistricts);
  };

  const handleDistrictChange = (districtName) => {
    setSelectedDistrict(districtName);
    setSelectedSubDistrict("");
    setSelectedVillage("");
    setSubDistricts([]);
    setVillages([]);
    setVillageLatLon(null);
    internalSetForecastForDate(null);
    getSubDistricts(districtName).then(setSubDistricts);
  };

  const handleSubDistrictChange = (subDistrictName) => {
    setSelectedSubDistrict(subDistrictName);
    setSelectedVillage("");
    setVillages([]);
    setVillageLatLon(null);
    internalSetForecastForDate(null);
    getVillages(subDistrictName).then(setVillages);
  };

  const handleVillageChange = async (villageName) => {
    setSelectedVillage(villageName);
    setVillageLatLon(null);
    internalSetForecastForDate(null);
    if (villageName) {
      try {
        const data = await getVillageLatLon(villageName);
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
    setLoading(true);
    const location = `${selectedState}, ${selectedDistrict}, ${selectedSubDistrict}, ${selectedVillage}`;
    try {
      const response = await getAdvice({
        crop,
        stage,
        date,
        latitude: villageLatLon?.latitude,
        longitude: villageLatLon?.longitude,
        village: selectedVillage,
      });
      setAdviceData(response);
      if (response?.advice_list?.length > 0) {
        setAdviceList(response.advice_list);
        localStorage.setItem("get_advice", JSON.stringify(response.advice_list));
        if (response.weather_data) {
          internalSetForecastForDate(response.weather_data);
          setForecastForDate?.(response.weather_data);
        }
      } else {
        setAdviceList([]);
        localStorage.removeItem("get_advice");
      }

    } catch (error) {
      console.error("Error fetching advice:", error);
    }finally {
    setLoading(false); 
    }
  };

  return (
    <div className="card">
      <div className={`cropbox fade-in ${adviceList.length > 0 ? 'tall' : ''}`}>
        <h2>Crop Details</h2>

        <div className="form-row">
          <label>Crop</label>
          <select value={crop} onChange={e => setCrop(e.target.value)}>
            <option value="Rice">Rice</option>
            {Object.keys(cropStages).map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="form-row">
          <label>Crop Stage</label>
          {["paddy", "rice"].includes(crop?.toLowerCase().trim()) ? (
            <input
              type="text"
              value={stage}
              readOnly
              placeholder="Auto-fetched stage"
            />
          ) : (
            <select value={stage} onChange={(e) => setStage(e.target.value)}>
              <option value="">-- Select Stage --</option>
              {cropStages[crop]?.map((s, i) => (
                <option key={i} value={s}>
                  {s}
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="form-row">
          <label>State</label>
          <select value={selectedState} onChange={e => handleStateChange(e.target.value)}>
            <option value="">-- Select State --</option>
            {states.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {selectedState && (
          <div className="form-row">
            <label>District</label>
            <select value={selectedDistrict} onChange={e => handleDistrictChange(e.target.value)}>
              <option value="">-- Select District --</option>
              {districts.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        )}

        {selectedDistrict && (
          <div className="form-row">
            <label>Sub-District</label>
            <select value={selectedSubDistrict} onChange={e => handleSubDistrictChange(e.target.value)}>
              <option value="">-- Select Sub-District --</option>
              {subDistricts.map(sd => (
                <option key={sd} value={sd}>{sd}</option>
              ))}
            </select>
          </div>
        )}

        {selectedSubDistrict && (
          <div className="form-row">
            <label>Village</label>
            <select value={selectedVillage} onChange={e => handleVillageChange(e.target.value)}>
              <option value="">-- Select Village --</option>
              {villages.map(v => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          </div>
        )}

        {villageLatLon && (
          <p style={{ fontSize: '0.9rem', color: 'gray', marginLeft: '8px' }}>
            Coordinates: {villageLatLon.latitude}, {villageLatLon.longitude}
          </p>
        )}

        <div className="form-row">
          <label>Date</label>
          <input
            type="date"
            className="inputBox"
            value={date}
            onChange={e => handleDateChange(e.target.value)}
          />
        </div>

        <br />
        <button onClick={handleSubmit} disabled={loading}>
            {loading ? "Fetching....." : "Generate advisories"}
          </button>
      </div>
      {forecastForDate && (
        <div className="weatherbox fade-in">
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
      {/* {adviceList.length > 0 && (
        <div className="advicebox fade-in">
          <AdviceBox
            data={{
              advice_list: adviceList,
              crop,
              stage,
              date,
              latitude: villageLatLon?.latitude,
              longitude: villageLatLon?.longitude,
              generated_questions: [],
            }}
          />
        </div>
      )} */}

      {/* <DistrictAdvisoryPage /> */}
      {/* <button
        onClick={downloadApiTimings}
        style={{
          padding: "8px 16px",
          backgroundColor: "#4CAF50",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
        }}
      >
        Download API Timings
      </button> */}

    </div>
  );
}
