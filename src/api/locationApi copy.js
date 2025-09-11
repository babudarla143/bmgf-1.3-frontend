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
import axios from "axios";

const API_BASE = "http://localhost:8001/api/location"; // Update if deployed
const API_BASE_NO_PREFIX = "http://localhost:8001";

// =========================
// Existing APIs
// =========================

// Get all states (from CSV)
export const getStates = async () => {
  const res = await axios.get(`${API_BASE}/states`);
  return res.data;
};

// Get districts for a given state name (from CSV)
export const getDistricts = async (stateName) => {
  const res = await axios.get(
    `${API_BASE}/districts/${encodeURIComponent(stateName)}`
  );
  return res.data;
};

// Get subdistricts for a given district name (from CSV)
export const getSubDistricts = async (districtName) => {
  const res = await axios.get(
    `${API_BASE}/subdistricts/${encodeURIComponent(districtName)}`
  );
  return res.data;
};

// Get villages for a given subdistrict name (from CSV)
export const getVillages = async (subDistrictName) => {
  const res = await axios.get(
    `${API_BASE}/villages/${encodeURIComponent(subDistrictName)}`
  );
  return res.data;
};

// Get latitude and longitude for a given village name (from DB)
export const getVillageLatLon = async (villageName) => {
  const res = await axios.get(
    `${API_BASE}/village-latlon/${encodeURIComponent(villageName)}`
  );
  return res.data;
};

// Get crop stage for a given village and date
export const getCropStage = async (villageName, date) => {
  try {
    const res = await axios.get(
      `${API_BASE}/get_stage/${encodeURIComponent(
        villageName
      )}/${encodeURIComponent(date)}`
    );
    return res.data;
  } catch (error) {
    console.error("Error fetching crop stage:", error);
    throw error;
  }
};

// =========================
// New APIs
// =========================

// 🔍 Get subdistricts under a district
export const searchSubDistricts = async (districtName) => {
  const res = await axios.get(
    `${API_BASE}/search-subdistricts/${encodeURIComponent(districtName)}`
  );
  return res.data;
};

// 🔍 Get villages under a subdistrict (with lat/lon from DB)
export const searchVillages = async (subDistrictName) => {
  const res = await axios.get(
    `${API_BASE}/search-villages/${encodeURIComponent(subDistrictName)}`
  );
  return res.data;
};

// 📂 Get full district details (villages + lat/lon, saved to CSV)
export const getDistrictDetails = async (districtName) => {
  const res = await axios.get(
    `${API_BASE}/district-details/${encodeURIComponent(districtName)}`
  );
  return res.data;
};


// Generate & fetch full district advisories (weather + qdrant) and save CSV on backend
export const generateDistrictAdvisories = async (districtName, date, crop = "Paddy") => {
  const res = await axios.get(
    `${API_BASE_NO_PREFIX}/location/district-generate/${encodeURIComponent(districtName)}`,
    { params: { date, crop } }
  );
  return res.data;
};





// ==================================================================================================================\\

// import axios from "axios";
// import XLSX from "xlsx";
// import fs from "fs";

// const API_BASE = "http://localhost:8001/api/location"; // Update if deployed
// const API_BASE_NO_PREFIX = "http://localhost:8001";

// // Excel file path
// const EXCEL_FILE = "./api_timings.xlsx";

// // Mapping URL patterns to API names
// const apiNameMap = [
//   { pattern: "/states", name: "getStates" },
//   { pattern: "/districts/", name: "getDistricts" },
//   { pattern: "/subdistricts/", name: "getSubDistricts" },
//   { pattern: "/villages/", name: "getVillages" },
//   { pattern: "/village-latlon/", name: "getVillageLatLon" },
//   { pattern: "/get_stage/", name: "getCropStage" },
//   { pattern: "/search-subdistricts/", name: "searchSubDistricts" },
//   { pattern: "/search-villages/", name: "searchVillages" },
//   { pattern: "/district-details/", name: "getDistrictDetails" },
//   { pattern: "/district-generate/", name: "generateDistrictAdvisories" },
// ];

// // Function to get friendly API name from URL
// const getApiName = (url) => {
//   const match = apiNameMap.find((item) => url.includes(item.pattern));
//   return match ? match.name : url;
// };

// // Function to log API call timings
// const logApiTiming = (apiUrl, startTime, endTime) => {
//   const apiName = getApiName(apiUrl);

//   let data = [];
//   if (fs.existsSync(EXCEL_FILE)) {
//     const workbook = XLSX.readFile(EXCEL_FILE);
//     const sheetName = workbook.SheetNames[0];
//     data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
//   }

//   data.push({
//     API: apiName,
//     URL: apiUrl,
//     StartTime: startTime.toISOString(),
//     EndTime: endTime.toISOString(),
//     DurationMs: endTime - startTime,
//   });

//   const worksheet = XLSX.utils.json_to_sheet(data);
//   const workbook = XLSX.utils.book_new();
//   XLSX.utils.book_append_sheet(workbook, worksheet, "APITimings");
//   XLSX.writeFile(workbook, EXCEL_FILE);
// };

// // ---------------------------
// // Intercept axios GET requests
// // ---------------------------
// axios.interceptors.request.use((config) => {
//   config.metadata = { startTime: new Date() };
//   return config;
// });

// axios.interceptors.response.use(
//   (response) => {
//     const endTime = new Date();
//     const startTime = response.config.metadata.startTime;
//     logApiTiming(response.config.url, startTime, endTime);
//     return response;
//   },
//   (error) => {
//     if (error.config && error.config.metadata) {
//       const endTime = new Date();
//       const startTime = error.config.metadata.startTime;
//       logApiTiming(error.config.url, startTime, endTime);
//     }
//     return Promise.reject(error);
//   }
// );

// // =========================
// // Your existing APIs (unchanged)
// // =========================

// export const getStates = async () => {
//   const res = await axios.get(`${API_BASE}/states`);
//   return res.data;
// };

// export const getDistricts = async (stateName) => {
//   const res = await axios.get(
//     `${API_BASE}/districts/${encodeURIComponent(stateName)}`
//   );
//   return res.data;
// };

// export const getSubDistricts = async (districtName) => {
//   const res = await axios.get(
//     `${API_BASE}/subdistricts/${encodeURIComponent(districtName)}`
//   );
//   return res.data;
// };

// export const getVillages = async (subDistrictName) => {
//   const res = await axios.get(
//     `${API_BASE}/villages/${encodeURIComponent(subDistrictName)}`
//   );
//   return res.data;
// };

// export const getVillageLatLon = async (villageName) => {
//   const res = await axios.get(
//     `${API_BASE}/village-latlon/${encodeURIComponent(villageName)}`
//   );
//   return res.data;
// };

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

// export const searchSubDistricts = async (districtName) => {
//   const res = await axios.get(
//     `${API_BASE}/search-subdistricts/${encodeURIComponent(districtName)}`
//   );
//   return res.data;
// };

// export const searchVillages = async (subDistrictName) => {
//   const res = await axios.get(
//     `${API_BASE}/search-villages/${encodeURIComponent(subDistrictName)}`
//   );
//   return res.data;
// };

// export const getDistrictDetails = async (districtName) => {
//   const res = await axios.get(
//     `${API_BASE}/district-details/${encodeURIComponent(districtName)}`
//   );
//   return res.data;
// };

// export const generateDistrictAdvisories = async (districtName, date, crop = "Paddy") => {
//   const res = await axios.get(
//     `${API_BASE_NO_PREFIX}/location/district-generate/${encodeURIComponent(districtName)}`,
//     { params: { date, crop } }
//   );
//   return res.data;
// };
