import axios from "axios";

// Different base URLs for different routers
const API_ADVICE = "https://lindsey-antidogmatical-unsumptuously.ngrok-free.app/api/advice";
const API_VOICE = "https://lindsey-antidogmatical-unsumptuously.ngrok-free.app/api/voice";
const API_VOICE_ADVICE = "https://lindsey-antidogmatical-unsumptuously.ngrok-free.app/api/voice-advice";
const API_AZURE = "https://lindsey-antidogmatical-unsumptuously.ngrok-free.app/api/azure_voice"; 

axios.defaults.headers.common["ngrok-skip-browser-warning"] = "true";
// -------------------------
// 1. Translate Audio (Voice Router)
// -------------------------
export const translateAudio = async (audioFile, lang = "en") => {
  const formData = new FormData();
  formData.append("audio", audioFile);
  formData.append("lang", lang);

  const res = await axios.post(`${API_VOICE}/translate`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

// -------------------------
// 2. Generate Dialogue (Advice Router)
// -------------------------
export const generateDialogue = async (advisoryText) => {
  const formData = new FormData();
  formData.append("advisory_text", advisoryText);

  const res = await axios.post(`${API_VOICE}/generate_dialogue`, formData);
  return res.data;
};

// -------------------------
// 3. Voice Advice (Voice Advice Router)
// -------------------------
export const getVoiceAdvice = async (transcriptText) => {
  const res = await axios.post(`${API_VOICE_ADVICE}/voice_advice`, {
    transcript: transcriptText,
  });
  return res.data;
};

// -------------------------
// 4. Dialogues → Audio (Excel upload) ✅ with sessionId
// -------------------------
export const dialoguesToAudio = async (excelFile, sessionId) => {
  const formData = new FormData();
  formData.append("file", excelFile);
  formData.append("session_id", sessionId);

  const res = await axios.post(`${API_VOICE}/dialogues-to-audio`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

// -------------------------
// 5. Dialogues → Audio (Text input) ✅ with sessionId
// -------------------------
export const dialoguesToAudioText = async (speaker, text, sessionId) => {
  const res = await axios.post(`${API_VOICE}/dialogues-to-audio-text`, {
    speaker,
    text,
    session_id: sessionId,
  });
  return res.data;
};

// -------------------------
// 6. Clear all audio files for session ✅
// -------------------------
export const clearSession = async (sessionId) => {
  const res = await axios.post(`${API_VOICE}/clear-session`, {
    session_id: sessionId,
  });
  return res.data;
};



// export const generateAzureOdiaAudio = async (text) => {
//   try {
//     const res = await axios.post(`${API_VOICE}/azure_generate_audio`, { text });
//     // res.data = { audio_file: "azure_audios/<filename>.wav", message: "Audio generated successfully" }
//     return res.data;
//   } catch (error) {
//     console.error("Odia Audio Generation Error:", error);
//     return { error: error?.response?.data || error.message };
//   }
// };

export const generateAzureOdiaAudio = async (speaker, text) => {
  try {
    const res = await axios.post(`${API_VOICE}/azure_generate_audio`, {
      speaker, // send speaker
      text,    // send text
    });
    // res.data = { audio_file: "azure_audios/<filename>.wav", message: "Audio generated successfully" }
    return res.data;
  } catch (error) {
    console.error("Odia Audio Generation Error:", error);
    return { error: error?.response?.data || error.message };
  }
};
