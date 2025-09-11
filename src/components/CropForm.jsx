import { useState, useEffect } from 'react';
import { getAdvice } from '../api/adviceApi';
import {
  getStates,
  getDistricts,
  getSubDistricts,
  getVillages,
  getVillageLatLon,
  getCropStage,
} from '../api/locationApi';
import WeatherBox from './WeatherBox';
import { parseISO, format } from 'date-fns';
// import { downloadApiTimings } from "../api/locationApi"; // adjust path

// import AdviceBox from './AdviceBox';
// import DistrictAdvisoryPage from "./DistrictAdvisoryPage";
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
  const cropSeasonMap = {
    Kharif: [
      "Amaranthus",
      "Banana",
      "Blackgram",
      "Brinjal",
      "Cashew",
      "Castor",
      "Coconut",
      "Colocasia",
      "Cotton",
      "Cowpea",
      "Cucurbits",
      "Groundnut",
      "Greengram",
      "Horsegram",
      "Jute",
      "Mango",
      "Maize",
      "Niger seed",
      "Okra",
      "Papaya",
      "Pigeonpea (Redgram/Arhar)",
      "Ragi",
      "Rice",
      "Sesamum",
      "Small millets",
      "Sorghum",
      "Sugarcane",
      "Tomato",
    ],
    Rabi: [
      "Beetroot",
      "Blackgram",
      "Brinjal",
      "Cabbage",
      "Capsicum",
      "Carrot",
      "Cauliflower",
      "Chickpea",
      "Coriander",
      "Fieldpea",
      "Garlic",
      "Greengram",
      "Groundnut",
      "Guava",
      "Lathyrus",
      "leafy_vegetables",
      "Lemon",
      "Lentil",
      "Linseed",
      "Litchi",
      "Maize",
      "Mustard",
      "Onion",
      "Potato",
      "Pomegranate",
      "Radish",
      "Sapota",
      "Sugarcane",
      "Sunflower",
      "Tomato",
      "Wheat",
    ],
  };
  const getSeason = (month) => {
    if ([6, 7, 8, 9, 10].includes(month)) return "Kharif";
    if ([11, 12, 1, 2, 3].includes(month)) return "Rabi";
    return null;
  };

  const cropStagesKharif = {
    Amaranthus: ["Sowing", "Vegetative Growth", "Leaf Harvest", "Maturity"],
    Banana: [
      "Planting",
      "Vegetative Growth",
      "Sucker Formation",
      "Flowering",
      "Bunch Development",
      "Harvesting",
    ],
    Blackgram: [
      "Sowing",
      "Seedling",
      "Vegetative",
      "Flowering",
      "Pod Formation",
      "Maturity",
      "Harvesting",
    ],
    Brinjal: [
      "Nursery Raising",
      "Transplanting",
      "Vegetative Growth",
      "Flowering",
      "Fruit Setting",
      "Fruit Development",
      "Harvesting",
    ],
    Cashew: [
      "Vegetative",
      "Flower Initiation",
      "Flowering",
      "Nut Development",
      "Harvest",
    ],
    Castor: [
      "Sowing",
      "Vegetative Growth",
      "Flowering",
      "Capsule Formation",
      "Maturity",
      "Harvesting",
    ],
    Coconut: [
      "Vegetative Growth",
      "Flowering",
      "Nut Setting",
      "Nut Development",
      "Harvesting",
    ],
    Colocasia: [
      "Planting",
      "Vegetative Growth",
      "Corm Development",
      "Maturity",
      "Harvesting",
    ],
    Cotton: [
      "Sowing",
      "Seedling",
      "Square Formation",
      "Flowering",
      "Boll Development",
      "Boll Opening",
      "Harvesting",
    ],
    Cowpea: [
      "Sowing",
      "Vegetative",
      "Flowering",
      "Pod Formation",
      "Maturity",
      "Harvesting",
    ],
    Cucurbits: [
      "Sowing",
      "Vine Growth",
      "Flowering",
      "Fruit Development",
      "Harvesting",
    ],
    Greengram: [
      "Sowing",
      "Vegetative",
      "Flowering",
      "Pod Formation",
      "Maturity",
      "Harvesting",
    ],
    Groundnut: [
      "Sowing",
      "Vegetative",
      "Flowering",
      "Pegging",
      "Pod Formation",
      "Maturity",
      "Harvesting",
    ],
    Horsegram: [
      "Sowing",
      "Vegetative",
      "Flowering",
      "Pod Development",
      "Maturity",
      "Harvesting",
    ],
    Jute: [
      "Sowing",
      "Vegetative",
      "Stem Elongation",
      "Branching",
      "Harvesting",
    ],
    Maize: [
      "Sowing",
      "Seedling",
      "Vegetative Growth",
      "Tasseling",
      "Silking",
      "Grain Filling",
      "Maturity",
      "Harvesting",
    ],
    Mango: [
      "Vegetative",
      "Flowering",
      "Fruit Set",
      "Fruit Development",
      "Harvesting",
    ],
    "Niger seed": [
      "Sowing",
      "Vegetative",
      "Flowering",
      "Seed Formation",
      "Maturity",
      "Harvesting",
    ],
    Okra: [
      "Sowing",
      "Seedling",
      "Vegetative",
      "Flowering",
      "Pod Formation",
      "Harvesting",
    ],
    Papaya: [
      "Planting",
      "Vegetative Growth",
      "Flowering",
      "Fruit Development",
      "Harvesting",
    ],
    "Pigeonpea (Redgram/Arhar)": [
      "Sowing",
      "Vegetative",
      "Flowering",
      "Pod Development",
      "Maturity",
      "Harvesting",
    ],
    Ragi: [
      "Sowing",
      "Tillering",
      "Panicle Initiation",
      "Flowering",
      "Grain Filling",
      "Maturity",
      "Harvesting",
    ],
    Sesamum: [
      "Sowing",
      "Vegetative",
      "Flowering",
      "Capsule Formation",
      "Maturity",
      "Harvesting",
    ],
    "Small millets": [
      "Sowing",
      "Vegetative",
      "Flowering",
      "Grain Filling",
      "Maturity",
      "Harvesting",
    ],
    Sorghum: [
      "Sowing",
      "Vegetative",
      "Booting",
      "Flowering",
      "Grain Filling",
      "Maturity",
      "Harvesting",
    ],
    Sugarcane: [
      "Planting",
      "Germination",
      "Tillering",
      "Grand Growth",
      "Cane Formation",
      "Harvesting",
    ],
    Tomato: [
      "Nursery Raising",
      "Transplanting",
      "Vegetative Growth",
      "Flowering",
      "Fruit Set",
      "Fruit Development",
      "Harvesting",
    ],
  };

  const cropStagesRabi = {
    Beetroot: [
      "Sowing",
      "Vegetative Growth",
      "Root Bulking",
      "Maturity",
      "Harvesting",
    ],
    Blackgram: [
      "Sowing",
      "Vegetative",
      "Flowering",
      "Pod Formation",
      "Maturity",
      "Harvesting",
    ],
    Brinjal: [
      "Nursery Raising",
      "Transplanting",
      "Vegetative Growth",
      "Flowering",
      "Fruit Setting",
      "Fruit Development",
      "Harvesting",
    ],
    Cabbage: [
      "Nursery Raising",
      "Transplanting",
      "Vegetative Growth",
      "Head Formation",
      "Maturity",
      "Harvesting",
    ],
    Capsicum: [
      "Nursery Raising",
      "Transplanting",
      "Vegetative Growth",
      "Flowering",
      "Fruit Development",
      "Harvesting",
    ],
    Carrot: [
      "Sowing",
      "Vegetative Growth",
      "Root Development",
      "Maturity",
      "Harvesting",
    ],
    Cauliflower: [
      "Nursery Raising",
      "Transplanting",
      "Vegetative Growth",
      "Curd Initiation",
      "Curd Development",
      "Harvesting",
    ],
    Chickpea: [
      "Sowing",
      "Vegetative Growth",
      "Flowering",
      "Pod Formation",
      "Seed Filling",
      "Maturity",
      "Harvesting",
    ],
    Coriander: [
      "Sowing",
      "Vegetative (Leaf Harvest)",
      "Flowering",
      "Seed Development",
      "Maturity",
      "Harvesting",
    ],
    Fieldpea: [
      "Sowing",
      "Vegetative",
      "Flowering",
      "Pod Formation",
      "Maturity",
      "Harvesting",
    ],
    Garlic: [
      "Clove Planting",
      "Vegetative Growth",
      "Bulb Initiation",
      "Bulb Development",
      "Harvesting",
    ],
    Greengram: [
      "Sowing",
      "Vegetative",
      "Flowering",
      "Pod Formation",
      "Maturity",
      "Harvesting",
    ],
    Groundnut: [
      "Sowing",
      "Vegetative",
      "Flowering",
      "Pegging",
      "Pod Formation",
      "Maturity",
      "Harvesting",
    ],
    Guava: [
      "Vegetative",
      "Flowering",
      "Fruit Set",
      "Fruit Development",
      "Harvesting",
    ],
    Lathyrus: [
      "Sowing",
      "Vegetative",
      "Flowering",
      "Pod Formation",
      "Maturity",
      "Harvesting",
    ],
    leafy_vegetables: ["Sowing", "Vegetative Growth", "Leaf Harvesting"],
    Lemon: ["Vegetative", "Flowering", "Fruit Development", "Harvesting"],
    Lentil: [
      "Sowing",
      "Vegetative",
      "Flowering",
      "Pod Formation",
      "Seed Filling",
      "Maturity",
      "Harvesting",
    ],
    Linseed: [
      "Sowing",
      "Vegetative",
      "Flowering",
      "Capsule Formation",
      "Maturity",
      "Harvesting",
    ],
    Litchi: [
      "Planting",
      "Vegetative Growth",
      "Flowering",
      "Fruit Development",
      "Harvesting",
    ],
    Maize: [
      "Sowing",
      "Seedling",
      "Vegetative Growth",
      "Tasseling",
      "Silking",
      "Grain Filling",
      "Maturity",
      "Harvesting",
    ],
    Mustard: [
      "Sowing",
      "Rosette Stage",
      "Stem Elongation",
      "Flowering",
      "Pod Formation",
      "Maturity",
      "Harvesting",
    ],
    Onion: [
      "Sowing/Transplanting",
      "Vegetative Growth",
      "Bulb Formation",
      "Bulb Maturation",
      "Harvesting",
    ],
    Potato: [
      "Planting",
      "Sprouting",
      "Vegetative Growth",
      "Tuber Initiation",
      "Tuber Bulking",
      "Maturity",
      "Harvesting",
    ],
    Pomegranate: ["Vegetative", "Flowering", "Fruit Development", "Harvesting"],
    Radish: [
      "Sowing",
      "Vegetative Growth",
      "Root Development",
      "Maturity",
      "Harvesting",
    ],
    Sapota: ["Vegetative", "Flowering", "Fruit Development", "Harvesting"],
    Sugarcane: [
      "Planting",
      "Germination",
      "Tillering",
      "Grand Growth",
      "Cane Formation",
      "Harvesting",
    ],
    Sunflower: [
      "Sowing",
      "Vegetative Growth",
      "Bud Initiation",
      "Flowering",
      "Seed Development",
      "Maturity",
      "Harvesting",
    ],
    Tomato: [
      "Nursery Raising",
      "Transplanting",
      "Vegetative Growth",
      "Flowering",
      "Fruit Set",
      "Fruit Development",
      "Harvesting",
    ],
    Wheat: [
      "Sowing",
      "Crown Root Initiation (CRI)",
      "Tillering",
      "Jointing",
      "Booting",
      "Flowering",
      "Grain Filling",
      "Maturity",
      "Harvesting",
    ],
  };


  const allCropStages = {
    ...cropStagesKharif,
    ...cropStagesRabi
  };

  useEffect(() => {
    getStates().then(setStates);
  }, []);

  //  Fetch crop stage automatically if crop = Paddy
  useEffect(() => {
    const fetchStage = async () => {
      // Trigger auto-fetch only if crop is Paddy or Rice
      if ((crop === "Paddy" || crop === "Rice") && selectedVillage && date) {
        try {
          const data = await getCropStage(selectedVillage, date);
          if (data?.crop_stage) {
            setStage(data.crop_stage);
          } else {
            showCustomPopup("Crop stage data not available for this village.");
            setStage(""); // reset if not found
          }
        } catch (err) {
          console.error("Failed to fetch crop stage:", err);
          setStage("");
          showCustomPopup("Failed to fetch crop stage. Please retry.");
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
        if (!data?.latitude || !data?.longitude) {
          showCustomPopup("Location data not available for this village.");
          return;
        }
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
        showCustomPopup("Failed to fetch village location. Please try again.");
      }
    }
  };

  const handleDateChange = (value) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const picked = new Date(value);
    picked.setHours(0, 0, 0, 0);

    const futureLimit = new Date();
    futureLimit.setDate(today.getDate() + 15);

    if (picked < today) {
      showCustomPopup(" Wrong date! Please select from today onwards.");
      setDate("");
      return;
    }

    if (picked > futureLimit) {
      showCustomPopup(" Wrong date! Please select within 15 days from today.");
      setDate("");
      return;
    }
    setDate(value);
    internalSetForecastForDate(null);
    if (villageLatLon?.niruthi_data?.["Forecast data"]) {
      const matched = villageLatLon.niruthi_data["Forecast data"].find(
        (f) => format(parseISO(f.Date_time), "yyyy-MM-dd") === value
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
      setLoading(true)
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
        showCustomPopup(" advice generation failed. Please try again.");
      }

    } catch (error) {
      console.error("Error fetching advice:", error);
      showCustomPopup(" Failed to fetch advice. Please try again later.");
    } finally {
      setLoading(false);
    }
  };
  const [popupMsg, setPopupMsg] = useState("");
  const [showPopup, setShowPopup] = useState(false);

  const showCustomPopup = (msg) => {
    setPopupMsg(msg);
    setShowPopup(true);
  };


  return (
    <div className="card">
      <div className={`cropbox fade-in ${adviceList.length > 0 ? 'tall' : ''}`}>
        <h2>Crop Details</h2>

        {/* <div className="form-row">
          <label>Crop</label>
          <select value={crop} onChange={e => setCrop(e.target.value)}>
            <option value="Rice">Rice</option>
            {Object.keys(cropStages).map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div> */}
        <div className="form-row">
          <label>Crop</label>
          <select value={crop} onChange={(e) => setCrop(e.target.value)}>
            <option value="">-- Select Crop --</option>
            {(() => {
              const today = new Date();
              const month = today.getMonth() + 1;
              const season = getSeason(month);
              const seasonCrops = season ? cropSeasonMap[season] : [];

              return seasonCrops.map(c => (
                <option key={c} value={c}>{c}</option>
              ));
            })()}
          </select>
        </div>

        {/* <div className="form-row">
          <label>Crop Stage</label>
          {crop?.toLowerCase() === "rice" ? (
            <input
              type="text"
              value={stage}
              readOnly
              placeholder="Auto-fetched from API"
            />
          ) : (
            <select value={stage} onChange={(e) => setStage(e.target.value)}>
              <option value="">-- Select Stage --</option>
              {(allCropStages[crop] || []).map((s, i) => (
                <option key={i} value={s}>{s}</option>
              ))}
            </select>
          )}
        </div> */}



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
              {allCropStages[crop]?.map((s, i) => (
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
              <option key={s} value={s}>  {s.charAt(0) + s.slice(1).toLowerCase()}</option>
            ))}
          </select>
        </div>

        {selectedState && (
          <div className="form-row">
            <label>District</label>
            <select
              value={selectedDistrict}
              onChange={(e) => handleDistrictChange(e.target.value)}
            >
              <option value="">-- Select District --</option>
              {districts
                .slice()
                .sort((a, b) => a.localeCompare(b))
                .map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
            </select>
          </div>
        )}

        {selectedDistrict && (
          <div className="form-row">
            <label>Sub-District</label>
            <select
              value={selectedSubDistrict}
              onChange={(e) => handleSubDistrictChange(e.target.value)}
            >
              <option value="">-- Select Sub-District --</option>
              {subDistricts
                .slice()
                .sort((a, b) => a.localeCompare(b))
                .map((sd) => {
                  const formatted =
                    sd.charAt(0).toUpperCase() + sd.slice(1).toLowerCase();
                  return (
                    <option key={sd} value={sd}>
                      {formatted}
                    </option>
                  );
                })}
            </select>
          </div>
        )}

        {selectedSubDistrict && (
          <div className="form-row">
            <label>Village</label>
            <select
              value={selectedVillage}
              onChange={(e) => handleVillageChange(e.target.value)}
            >
              <option value="">-- Select Village --</option>
              {villages
                .slice()
                .sort((a, b) => a.localeCompare(b))
                .map((v) => {
                  const formatted =
                    v.charAt(0).toUpperCase() + v.slice(1).toLowerCase();
                  return (
                    <option key={v} value={v}>
                      {formatted}
                    </option>
                  );
                })}
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
          {loading ? (
            <div className="loading-text">
              Loading
              <span className="loading-dots">
                <span>.</span>
                <span>.</span>
                <span>.</span>
                <span>.</span>
                <span>.</span>
                <span>.</span>
                <span>.</span>
              </span>
            </div>
          ) : (
            "Get AI Advice"
          )}
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

      {showPopup && (
        <div className="popup-overlay">
          <div className="popup">
            <p>{popupMsg}</p>
            <button onClick={() => setShowPopup(false)}>OK</button>
          </div>
        </div>
      )}
    </div>
  );
}
