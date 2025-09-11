// // frontend/src/api/locationApi.js
// import axios from "axios";

// const API_BASE = "http://localhost:8001/location"; // Update if deployed

// // Get all states (from CSV)
// export const getStates = async () => {
//   const res = await axios.get(`${API_BASE}/states`);
//   return res.data;
// };

// // Get districts for a given state name (from CSV)
// export const getDistricts = async (stateName) => {
//   const res = await axios.get(`${API_BASE}/districts/${encodeURIComponent(stateName)}`);
//   return res.data;
// };

// // Get subdistricts for a given district name (from CSV)
// export const getSubDistricts = async (districtName) => {
//   const res = await axios.get(`${API_BASE}/subdistricts/${encodeURIComponent(districtName)}`);
//   return res.data;
// };

// // Get villages for a given subdistrict name (from CSV)
// export const getVillages = async (subDistrictName) => {
//   const res = await axios.get(`${API_BASE}/villages/${encodeURIComponent(subDistrictName)}`);
//   return res.data;
// };

// // Get latitude and longitude for a given village name (from DB)
// export const getVillageLatLon = async (villageName) => {
//   const res = await axios.get(`${API_BASE}/village-latlon/${encodeURIComponent(villageName)}`);
//   return res.data;
// };

// // ✅ Get crop stage for a given village and date
// export const getCropStage = async (villageName, date) => {
//   try {
//     const res = await axios.get(
//       `${API_BASE}/get_stage/${encodeURIComponent(villageName)}/${encodeURIComponent(date)}`
//     );
//     return res.data;
//   } catch (error) {
//     console.error("Error fetching crop stage:", error);
//     throw error;
//   }
// };












//=====================================

// frontend/src/api/locationApi.js
// import axios from "axios";

// const API_BASE = "http://localhost:8001/api/location"; // Update if deployed
// const API_BASE_NO_PREFIX = "http://localhost:8001";

// // =========================
// // Existing APIs
// // =========================

// // Get all states (from CSV)
// export const getStates = async () => {
//   const res = await axios.get(`${API_BASE}/states`);
//   return res.data;
// };

// // Get districts for a given state name (from CSV)
// export const getDistricts = async (stateName) => {
//   const res = await axios.get(
//     `${API_BASE}/districts/${encodeURIComponent(stateName)}`
//   );
//   return res.data;
// };

// // Get subdistricts for a given district name (from CSV)
// export const getSubDistricts = async (districtName) => {
//   const res = await axios.get(
//     `${API_BASE}/subdistricts/${encodeURIComponent(districtName)}`
//   );
//   return res.data;
// };

// // Get villages for a given subdistrict name (from CSV)
// export const getVillages = async (subDistrictName) => {
//   const res = await axios.get(
//     `${API_BASE}/villages/${encodeURIComponent(subDistrictName)}`
//   );
//   return res.data;
// };

// // Get latitude and longitude for a given village name (from DB)
// export const getVillageLatLon = async (villageName) => {
//   const res = await axios.get(
//     `${API_BASE}/village-latlon/${encodeURIComponent(villageName)}`
//   );
//   return res.data;
// };

// // Get crop stage for a given village and date
// export const getCropStage = async (villageName, date) => {
//   try {
//     const res = await axios.get(
//       `${API_BASE}/get_stage/${encodeURIComponent(
//         villageName
//       )}/${encodeURIComponent(date)}`
//     );
//     return res.data;
//   } catch (error) {
//     console.error("Error fetching crop stage:", error);
//     throw error;
//   }
// };

// // =========================
// // New APIs
// // =========================

// // 🔍 Get subdistricts under a district
// export const searchSubDistricts = async (districtName) => {
//   const res = await axios.get(
//     `${API_BASE}/search-subdistricts/${encodeURIComponent(districtName)}`
//   );
//   return res.data;
// };

// // 🔍 Get villages under a subdistrict (with lat/lon from DB)
// export const searchVillages = async (subDistrictName) => {
//   const res = await axios.get(
//     `${API_BASE}/search-villages/${encodeURIComponent(subDistrictName)}`
//   );
//   return res.data;
// };

// // 📂 Get full district details (villages + lat/lon, saved to CSV)
// export const getDistrictDetails = async (districtName) => {
//   const res = await axios.get(
//     `${API_BASE}/district-details/${encodeURIComponent(districtName)}`
//   );
//   return res.data;
// };


// // Generate & fetch full district advisories (weather + qdrant) and save CSV on backend
// export const generateDistrictAdvisories = async (districtName, date, crop = "Paddy") => {
//   const res = await axios.get(
//     `${API_BASE_NO_PREFIX}/location/district-generate/${encodeURIComponent(districtName)}`,
//     { params: { date, crop } }
//   );
//   return res.data;
// };





// ==================================================================================================================\\

import axios from "axios";
import * as XLSX from "xlsx";

const API_BASE = "https://lindsey-antidogmatical-unsumptuously.ngrok-free.app/api/location"; // Update if deployed
const API_BASE_NO_PREFIX = "https://lindsey-antidogmatical-unsumptuously.ngrok-free.app/";
axios.defaults.headers.common["ngrok-skip-browser-warning"] = "true";

// In-memory array to store API timings
let apiTimings = [];

// Mapping URL patterns to API names
const apiNameMap = [
  { pattern: "/states", name: "getStates" },
  { pattern: "/districts/", name: "getDistricts" },
  { pattern: "/subdistricts/", name: "getSubDistricts" },
  { pattern: "/villages/", name: "getVillages" },
  { pattern: "/village-latlon/", name: "getVillageLatLon" },
  { pattern: "/get_stage/", name: "getCropStage" },
  { pattern: "/search-subdistricts/", name: "searchSubDistricts" },
  { pattern: "/search-villages/", name: "searchVillages" },
  { pattern: "/district-details/", name: "getDistrictDetails" },
  { pattern: "/district-generate/", name: "generateDistrictAdvisories" },
];

// Get friendly API name from URL
const getApiName = (url) => {
  const match = apiNameMap.find((item) => url.includes(item.pattern));
  return match ? match.name : url;
};

// Log API timing in memory
const logApiTiming = (apiUrl, startTime, endTime) => {
  const apiName = getApiName(apiUrl);

  apiTimings.push({
    API: apiName,
    URL: apiUrl,
    StartTime: startTime.toISOString(),
    EndTime: endTime.toISOString(),
    DurationMs: endTime - startTime,
  });
};

// Download API timings as Excel (trigger browser download)
export const downloadApiTimings = () => {
  const worksheet = XLSX.utils.json_to_sheet(apiTimings);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "APITimings");
  XLSX.writeFile(workbook, "api_timings.xlsx"); // Download in browser
};

// ---------------------------
// Axios interceptors to track all API calls
// ---------------------------
axios.interceptors.request.use((config) => {
  config.metadata = { startTime: new Date() };
  return config;
});

axios.interceptors.response.use(
  (response) => {
    const startTime = response.config.metadata.startTime;
    const endTime = new Date();
    logApiTiming(response.config.url, startTime, endTime);
    return response;
  },
  (error) => {
    if (error.config && error.config.metadata) {
      const startTime = error.config.metadata.startTime;
      const endTime = new Date();
      logApiTiming(error.config.url, startTime, endTime);
    }
    return Promise.reject(error);
  }
);

// =========================
// Existing APIs (unchanged)
// =========================

export const getStates = async () => {
  const res = await axios.get(`${API_BASE}/states`);
  return res.data;
};

export const getDistricts = async (stateName) => {
  const res = await axios.get(
    `${API_BASE}/districts/${encodeURIComponent(stateName)}`
  );
  return res.data;
};

export const getSubDistricts = async (districtName) => {
  const res = await axios.get(
    `${API_BASE}/subdistricts/${encodeURIComponent(districtName)}`
  );
  return res.data;
};

export const getVillages = async (subDistrictName) => {
  const res = await axios.get(
    `${API_BASE}/villages/${encodeURIComponent(subDistrictName)}`
  );
  return res.data;
};

export const getVillageLatLon = async (villageName) => {
  const res = await axios.get(
    `${API_BASE}/village-latlon/${encodeURIComponent(villageName)}`
  );
  return res.data;
};

export const getCropStage = async (villageName, date) => {
  try {
    const res = await axios.get(
      `${API_BASE}/get_stage/${encodeURIComponent(villageName)}/${encodeURIComponent(date)}`
    );
    return res.data;
  } catch (error) {
    console.error("Error fetching crop stage:", error);
    throw error;
  }
};

export const searchSubDistricts = async (districtName) => {
  const res = await axios.get(
    `${API_BASE}/search-subdistricts/${encodeURIComponent(districtName)}`
  );
  return res.data;
};

export const searchVillages = async (subDistrictName) => {
  const res = await axios.get(
    `${API_BASE}/search-villages/${encodeURIComponent(subDistrictName)}`
  );
  return res.data;
};

export const getDistrictDetails = async (districtName) => {
  const res = await axios.get(
    `${API_BASE}/district-details/${encodeURIComponent(districtName)}`
  );
  return res.data;
};

export const generateDistrictAdvisories = async (districtName, date, crop = "Paddy") => {
  const res = await axios.get(
    `${API_BASE}/district-generate/${encodeURIComponent(districtName)}`,
    { params: { date, crop } }
  );
  return res.data;
};
