import { useState, useEffect, useRef } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import "./styles.css";
import CropForm from "./components/CropForm";
import WeatherBox from "./components/WeatherBox";
import AdviceBox from "./components/AdviceBox";
import DistrictAdvisoryPage from "./components/DistrictAdvisoryPage";
import { downloadApiTimings } from "./api/locationApi";
function App() {
  const [adviceData, setAdviceData] = useState(null);
  const [forecastForDate, setForecastForDate] = useState(null);
  const [enabled, setEnabled] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const [language, setLanguage] = useState("en-IN");
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const LANG_MAP = {
    "en-IN": "en",
    "te-IN": "te",
    "hi-IN": "hi",
    "or-IN": "or",
  };
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editableTranscript, setEditableTranscript] = useState(transcript);
  const [activeTab, setActiveTab] = useState("form");
 
  const handleStartRecording = async () => {
    if (!isRecording) {
      // --- START recording ---
      setTranscript("");
      setIsRecording(true);
      audioChunksRef.current = [];
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        mediaRecorderRef.current = new window.MediaRecorder(stream);
 
        mediaRecorderRef.current.ondataavailable = (e) => {
          audioChunksRef.current.push(e.data);
        };
 
        mediaRecorderRef.current.onstop = async () => {
          setTranscript("Processing...");
          const audioBlob = new Blob(audioChunksRef.current, {
            type: "audio/wav",
          });
          const formData = new FormData();
          formData.append("audio", audioBlob, "recording.wav");
          formData.append("lang", LANG_MAP[language] || "en");
 
          try {
            const response = await fetch(
              "https://lindsey-antidogmatical-unsumptuously.ngrok-free.app/api/voice/translate",
              {
                method: "POST",
                body: formData,
              }
            );
            if (!response.ok) {
              setTranscript("Backend error: " + response.status);
              return;
            }
            const data = await response.json();
            setTranscript(
              typeof data.translation === "object" && data.translation.asr
                ? data.translation.asr
                : data.translation || "No transcript received."
            );
          } catch (err) {
            setTranscript("Network or server error.");
          }
        };
 
        mediaRecorderRef.current.start();
        setTranscript("Recording...");
      } catch (err) {
        setTranscript("Microphone permission denied. Please allow access.");
        setIsRecording(false);
        alert(
          "Microphone permission was denied. Please enable it in your browser settings and try again."
        );
      }
    } else {
      // --- STOP recording ---
      setIsRecording(false);
      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state === "recording"
      ) {
        mediaRecorderRef.current.stop();
      }
    }
  };
 
  const handleFormSubmit = (data) => {
    console.log("Form Submitted:", data);
  };
  const handleGetAdvisory = async (text) => {
    const payload = { transcript: text };
    try {
      const response = await fetch(
        "https://lindsey-antidogmatical-unsumptuously.ngrok-free.app/api/voice-advice/voice_advice",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const advice = await response.json();
      setAdviceData(advice);
    } catch (err) {
      console.error("Failed to fetch advisory:", err);
    }
  };
 
  useEffect(() => {
    setAdviceData(null);
    setForecastForDate(null);
    setFormKey((prev) => prev + 1);
  }, [enabled]);
  useEffect(() => {
    setEditableTranscript(transcript);
  }, [transcript]);
 
  return (
    <div className="container">
    <div
      style={{
        display: "flex",
        alignItems: "center",
        padding: "10px 20px",
      }}
    >
      <h1>AI AgroAdvisor</h1>
      <div className="button-group">
        <button onClick={downloadApiTimings} className="download-btn">
          ⬇ API Timings
        </button>
        {/* <button
          onClick={() => {
            localStorage.removeItem("isLoggedIn");
            window.location.href = "/login";
          }}
          className="logout-btn"
        >
           Logout
        </button> */}
      </div>
    </div>
 
      <p
        style={{
          textAlign: "center",
          maxWidth: "600px",
          margin: "auto",
          color: "#555",
        }}
      >
        Get personalized, AI-powered agricultural advice by providing details
        about your crop, its current stage, and your location.
      </p>
      <div className="navbar">
        <button
          className={activeTab === "form" ? "nav-active" : ""}
          onClick={() => {
            setActiveTab("form");
            setEnabled(false);
          }}
        >
          Form Input
        </button>
        <button
          className={activeTab === "voice" ? "nav-active" : ""}
          onClick={() => {
            setActiveTab("voice");
            setEnabled(true);
          }}
        >
          Voice Input
        </button>
        <button
          className={activeTab === "district" ? "nav-active" : ""}
          onClick={() => setActiveTab("district")}
        >
          District Advisory Generator
        </button>
      </div>
 
      {/* Only show Form/Voice UI if not on District Advisory Generator */}
      {activeTab === "form" && (
        <div
          style={{
            display: "flex",
            flexWrap: "nowrap",
            marginTop: "10px",
            marginRight: "170px",
            marginLeft: "150px",
            gap: "90px",
          }}
        >
          <div style={{ flex: 2 }}>
            <CropForm
              key={formKey}
              setForecastForDate={setForecastForDate}
              onSubmit={handleFormSubmit}
              setAdviceData={setAdviceData}
            />
          </div>
          <div style={{ flex: 1 }}>
            <WeatherBox forecastData={forecastForDate} />
            {adviceData && (
              <div style={{ marginTop: "10px" }}>
                <AdviceBox adviceData={adviceData}  />
              </div>
            )}
          </div>
        </div>
      )}
 
      {activeTab === "voice" && (
        <div
          style={{
            display: "flex",
            flexWrap: "nowrap",
            marginTop: "10px",
            marginRight: "170px",
            marginLeft: "150px",
            gap: "80px",
          }}
        >
          <div style={{ flex: 2 }}>
            <div
              className="voice-input-box fade-in"
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <p style={{ marginBottom: "15px", color: "#555" }}>
                Speak your crop details...
              </p>
 
              <label htmlFor="language" className="language-label">
                Choose Language
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="border p-2 rounded w-full"
              >
                <option value="en-IN">English</option>
                <option value="te-IN">తెలుగు (Telugu)</option>
                <option value="hi-IN">हिन्दी (Hindi)</option>
                <option value="or-IN">ଓଡ଼ିଆ (Odia)</option>
              </select>
 
              <div className="mb-8">
                <button
                  onClick={handleStartRecording}
                  className="btn btn-green"
                >
                  {isRecording ? "Stop..." : "Start Recording..."}
                </button>
                <br />
                {isRecording && (
                  <p
                    style={{
                      fontSize: "0.85rem",
                      color: "#777",
                      marginTop: "12px",
                      textAlign: "center",
                    }}
                  >
                    Please clearly mention the following details:
                    <br />
                    Crop, Crop Stage, State, District, Sub-district, Village
                  </p>
                )}
              </div>
 
              {transcript && (
                <div className="transcript-wrapper">
                  {isEditing ? (
                    <textarea
                      className="transcript-edit-box"
                      value={editableTranscript}
                      onChange={(e) => setEditableTranscript(e.target.value)}
                    />
                  ) : (
                    <p className="transcript-box">
                      {editableTranscript || transcript}
                    </p>
                  )}
 
                  <div className="transcript-actions">
                    <button
                      className="edit-btn"
                      onClick={() => {
                        if (isEditing) {
                          setTranscript(editableTranscript);
                        }
                        setIsEditing(!isEditing);
                      }}
                    >
                      {isEditing ? "Save" : "Edit"}
                    </button>
                    <button
                      className="advisory-btn"
                      onClick={() => handleGetAdvisory(editableTranscript)}
                    >
                      Get Advisory
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
 
          {/* Right side: Weather + Advice shown together */}
          {adviceData && (
            <div style={{ flex: 1 }}>
              <WeatherBox forecastData={adviceData.weather_data} />
              <div style={{ marginTop: "10px" }}>
                <AdviceBox adviceData={adviceData} />
              </div>
            </div>
          )}
        </div>
      )}
      {/* WeatherBox for form input mode sidebar */}
      {activeTab === "form" && forecastForDate && (
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
 
      {/* Only show DistrictAdvisoryPage on District Advisory Generator tab */}
      {activeTab === "district" && <DistrictAdvisoryPage />}
 
      {/* <footer style={{ textAlign: "center", marginTop: "30px", color: "#aaa" }}>
        © 2025 AgriAdvisor AI. All rights reserved.
      </footer> */}
    </div>
  );
}
// function App() {
//   const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
 
//   return (
//     <Router>
//       <Routes>
//         <Route path="/login" element={<Login />} />
//         <Route
//           path="/home"
//           element={isLoggedIn ? <MainApp /> : <Navigate to="/login" />}
//         />
//         <Route path="/" element={<Navigate to="/login" />} />
//       </Routes>
//     </Router>
//   );
// }
 
 
export default App;
