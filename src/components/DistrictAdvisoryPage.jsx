// import { useEffect, useState } from "react";
// import {
//   getStates,
//   getDistricts,
//   generateDistrictAdvisories,
// } from "../api/locationApi";

// import "./DistrictAdvisoryPage.css";

// export default function DistrictAdvisoryPage() {
//   const [states, setStates] = useState([]);
//   const [districts, setDistricts] = useState([]);

//   const [selectedState, setSelectedState] = useState("");
//   const [selectedDistrict, setSelectedDistrict] = useState("");
//   const [date, setDate] = useState("");
//   const [crop, setCrop] = useState("Paddy");

//   const [loading, setLoading] = useState(false);
//   const [rows, setRows] = useState([]);
//   const [filePath, setFilePath] = useState("");

//   useEffect(() => {
//     getStates().then(setStates);
//   }, []);

//   useEffect(() => {
//     if (selectedState) {
//       getDistricts(selectedState).then(setDistricts);
//     } else {
//       setDistricts([]);
//       setSelectedDistrict("");
//     }
//   }, [selectedState]);

//   const onGenerate = async () => {
//     if (!selectedDistrict || !date) {
//       alert("Please select district and date");
//       return;
//     }
//     setLoading(true);
//     try {
//       const data = await generateDistrictAdvisories(selectedDistrict, date, crop);
//       setRows(data?.rows || []);
//       setFilePath(data?.file || "");
//     } catch (e) {
//       console.error(e);
//       alert("Failed to generate advisories");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div style={{ padding: 16 }}>
//       <div className="card_2" style={{ padding: 16, marginBottom: 24 }}>
//         <h2>District Advisory Generator</h2>

//         <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
//           <div>
//             <label>State</label>
//             <select value={selectedState} onChange={(e) => setSelectedState(e.target.value)}>
//               <option value="">-- Select State --</option>
//               {states.map((s) => (
//                 <option key={s} value={s}>{s}</option>
//               ))}
//             </select>
//           </div>

//           <div>
//             <label>District</label>
//             <select value={selectedDistrict} onChange={(e) => setSelectedDistrict(e.target.value)} disabled={!selectedState}>
//               <option value="">-- Select District --</option>
//               {districts.map((d) => (
//                 <option key={d} value={d}>{d}</option>
//               ))}
//             </select>
//           </div>

//           <div>
//             <label>Date</label>
//             <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
//           </div>

//           <div>
//             <label>Crop</label>
//             <select value={crop} onChange={(e) => setCrop(e.target.value)}>
//               <option value="Paddy">Paddy</option>
//               <option value="Wheat">Wheat</option>
//               <option value="Potato">Potato</option>
//             </select>
//           </div>
//         </div>

//         <div style={{ marginTop: 12 }}>
//           <button onClick={onGenerate} disabled={loading}>
//             {loading ? "Generating..." : "Generate advisories"}
//           </button>
//           {!!filePath && (
//             <span style={{ marginLeft: 12, fontSize: 12 }}>
//               Saved on server: <code>{filePath}</code>
//             </span>
//           )}
//         </div>
//       </div>

//       {/* ---- Output Table in a separate card ---- */}
//       {rows.length > 0 && (
//         <div className="card_2" style={{ padding: 16 }}>
//           <h3>Generated Advisories</h3>
//           <div
//             style={{
//               flex: 1,
//               marginTop: 16,
//               width: "100%",
//               height: "100%",
//               overflow: "auto",
//             }}
//           >
//             <table
//               rules="all"
//               className="table"
//               style={{
//                 width: "100%",
//                 tableLayout: "auto",
//                 borderCollapse: "collapse",
//                 textAlign: "center",
//                 border: "1px solid black",
//               }}
//             >
//               <thead>
//                 <tr>
//                   {/* <th>Subdistrict</th> */}
//                   <th>Village</th>
//                   <th>Latitude</th>
//                   <th>Longitude</th>
//                   <th>Date</th>
//                   <th>Crop</th>
//                   <th>Stage</th>
//                   <th>Rainfall</th>
//                   <th>Tmin</th>
//                   <th>Tmax</th>
//                   <th>RH</th>
//                   <th>Wind_Speed</th>
//                   <th>Wind_Direction</th>
//                   <th>Advisory</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {rows.map((r, idx) => (
//                   <tr key={idx}>
//                     {/* <td>{r.subdistrict}</td> */}
//                     <td>{r.village}</td>
//                     <td>{r.latitude ? r.latitude.toFixed(3) : ""}</td>
//                     <td>{r.longitude ? r.longitude.toFixed(3) : ""}</td>
//                     <td>{r.date}</td>
//                     <td>{r.crop}</td>
//                     <td>{r.stage}</td>
//                     <td>{r.Rainfall ? r.Rainfall.toFixed(2) : ""}</td>
//                     <td>{r.Tmin ? r.Tmin.toFixed(2) : ""}</td>
//                     <td>{r.Tmax ? r.Tmax.toFixed(2) : ""}</td>
//                     <td>{r.RH ? r.RH.toFixed(2) : ""}</td>
//                     <td>{r.Wind_Speed ? r.Wind_Speed.toFixed(2) : ""}</td>
//                     <td>{r.Wind_Direction ? r.Wind_Direction.toFixed(2) : ""}</td>
//                     <td className="advice">{r.advisory}</td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }



// =========================================================================================================================================================


import { useEffect, useState } from "react";
import {
  getStates,
  getDistricts,
  generateDistrictAdvisories,
} from "../api/locationApi";

import "./DistrictAdvisoryPage.css";

export default function DistrictAdvisoryPage() {
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);

  const [selectedState, setSelectedState] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [date, setDate] = useState("");
  const [crop, setCrop] = useState("Paddy");
  const [stage, setStage] = useState("");

  const cropStages = {
    Wheat: ["Sowing", "Vegetative", "Reproductive", "Maturity"],
    Potato: ["Planting", "Vegetative", "Tuber Formation", "Harvest"],
    Paddy: ["Nursery", "Transplanting", "Tillering", "Flowering", "Maturity"],
    Rice: ["Nursery", "Transplanting", "Tillering", "Flowering", "Maturity"],
  };

  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [filePath, setFilePath] = useState("");

  useEffect(() => {
    getStates().then(setStates);
  }, []);

  useEffect(() => {
    if (selectedState) {
      getDistricts(selectedState).then(setDistricts);
    } else {
      setDistricts([]);
      setSelectedDistrict("");
    }
  }, [selectedState]);

  const onGenerate = async () => {
    if (!selectedDistrict || !date) {
      alert("Please select district and date");
      return;
    }

    setLoading(true);
    try {
      const data = await generateDistrictAdvisories(selectedDistrict, date, crop);
      setRows(data?.rows || []);
      setFilePath(data?.file || "");
    } catch (e) {
      console.error(e);
      alert("Failed to generate advisories");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 16 }}>
      {/* --- Input Card --- */}
      <div className="card_2" style={{ padding: 16, marginBottom: 24 }}>
        <h2>District Advisory Generator</h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(5, 1fr)",
            gap: 20,
            width:"auto",
            height:"auto",
            marginLeft: "150px",
          }}
        >
          {/* State */}
          <div>
            <label>State</label>
            <select value={selectedState} onChange={(e) => setSelectedState(e.target.value)}>
              <option value="">-- Select State --</option>
              {states.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* District */}
          <div>
            <label>District</label>
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              disabled={!selectedState}
            >
              <option value="">-- Select District --</option>
              {districts.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div>
            <label>Date</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>

          {/* Crop */}
          <div style={{
            marginLeft:"30px"
          }
          }>
            <label>Crop</label>
            <select value={crop} onChange={(e) => setCrop(e.target.value)}>
              <option value="Paddy">Paddy</option>
              <option value="Wheat">Wheat</option>
              <option value="Potato">Potato</option>
            </select>
          </div>
        </div>

        {/* Crop Stage */}
        <div className="form-row" style={{ marginTop: 12,
          width:"500px",
          marginLeft:"150px",
         }}>
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
                <option key={i} value={s}>{s}</option>
              ))}
            </select>
          )}
        </div>

        {/* Generate Button */}
        <div style={{ marginTop: 12,marginLeft:"130px" }}>
          <button onClick={onGenerate} disabled={loading}>
            {loading ? "Generating..." : "Generate advisories"}
          </button>
          {!!filePath && (
            <span style={{ marginLeft: 12, fontSize: 12 }}>
              Saved on server: <code>{filePath}</code>
            </span>
          )}
        </div>
      </div>

      {/* --- Output Table --- */}
      {rows.length > 0 && (
        <div className="card_2 fade-in" style={{ padding: 16 }}>
          <h3>Generated Advisories</h3>
          <div style={{ flex: 1, marginTop: 16, width: "100%", height: "100%", overflow: "auto" }}>
            <table
              rules="all"
              className="table"
              style={{
                width: "100%",
                tableLayout: "auto",
                borderCollapse: "collapse",
                textAlign: "center",
                border: "1px solid black",
              }}
            >
              <thead>
                <tr>
                  <th>Village</th>
                  <th>Latitude</th>
                  <th>Longitude</th>
                  <th>Date</th>
                  <th>Crop</th>
                  <th>Stage</th>
                  <th>Rainfall</th>
                  <th>Tmin</th>
                  <th>Tmax</th>
                  <th>RH</th>
                  <th>Wind_Speed</th>
                  <th>Wind_Direction</th>
                  <th>Advisory</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, idx) => (
                  <tr key={idx}>
                    <td>{r.village}</td>
                    <td>{r.latitude ? r.latitude.toFixed(3) : ""}</td>
                    <td>{r.longitude ? r.longitude.toFixed(3) : ""}</td>
                    <td>{r.date}</td>
                    <td>{r.crop}</td>
                    <td>{r.stage}</td>
                    <td>{r.Rainfall ? r.Rainfall.toFixed(2) : ""}</td>
                    <td>{r.Tmin ? r.Tmin.toFixed(2) : ""}</td>
                    <td>{r.Tmax ? r.Tmax.toFixed(2) : ""}</td>
                    <td>{r.RH ? r.RH.toFixed(2) : ""}</td>
                    <td>{r.Wind_Speed ? r.Wind_Speed.toFixed(2) : ""}</td>
                    <td>{r.Wind_Direction ? r.Wind_Direction.toFixed(2) : ""}</td>
                    <td className="advice">{r.advisory}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
