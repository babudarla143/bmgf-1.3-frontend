import React, { useState, useRef } from "react";

const VoiceRecorder = () => {
  const [recording, setRecording] = useState(false);
  const [status, setStatus] = useState("");
  const [transcript, setTranscript] = useState("");
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const [adviceList, setAdviceList] = useState([]);

  const handleToggleRecording = async () => {
    if (!recording) {
      try {
        setStatus("Recording…");
        setRecording(true);
        audioChunksRef.current = [];

        // Request microphone access
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        mediaRecorderRef.current = new window.MediaRecorder(stream);

        mediaRecorderRef.current.ondataavailable = (e) => {
          audioChunksRef.current.push(e.data);
        };

        mediaRecorderRef.current.onstop = async () => {
          setStatus("Recording stopped.");
          const audioBlob = new Blob(audioChunksRef.current, {
            type: "audio/wav",
          });
          const formData = new FormData();
          formData.append("audio", audioBlob, "recording.wav");

          const response = await fetch("/voice/translate", {
            method: "POST",
            body: formData,
          });
          const data = await response.json();
          setTranscript(data.translation || "No transcript received.");
        };

        mediaRecorderRef.current.start();
      } catch (err) {
        console.error("Microphone access denied or error:", err);
        setStatus("Microphone permission denied. Please allow access.");
        setRecording(false);

        // Optional: show a browser popup to ask again
        alert(
          "Microphone permission was denied. Please enable it in your browser settings and try again."
        );
      }
    } else {
      // Stop recording
      setRecording(false);
      mediaRecorderRef.current.stop();
    }
  };

  return (
    <div>
      <button onClick={handleToggleRecording}>
        {recording ? "Stop Recording" : "Start Recording"}
      </button>
      <div>{status}</div>
      {/* <div><strong>Transcript:</strong> {transcript}</div> */}
    </div>
  );

  {
    adviceList.length > 0 && (
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
    );
  }
};

export default VoiceRecorder;
