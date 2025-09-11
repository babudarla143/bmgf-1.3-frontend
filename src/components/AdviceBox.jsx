// // import { useEffect, useState } from "react";

// // export default function AdviceBox(props) {
// //   const data = props.data || props.adviceData;
// //   const [questions, setQuestions] = useState([]);
// //   const [viewMode, setViewMode] = useState("paragraph");

// //   // --- Clean unwanted junk ---
// //   const cleanAdviceText = (text) => {
// //     if (typeof text !== "string") return text;
// //     return text
// //       .replace(/\*\*paddy_advisories\*\*/g, "")
// //       .replace(/^\*\*advisory\*\*\s*/g, "")
// //       .replace(/ment\.\'}?$/g, "")
// //       .trim();
// //   };

// //   // --- Extract only AI answer ---
// //   const extractAnswer = (text) => {
// //     if (typeof text !== "string") return text;

// //     let answerText = text;

// //     // Ensure it starts from "Answer:"
// //     const idx = answerText.lastIndexOf("Answer:");
// //     if (idx !== -1) {
// //       answerText = answerText.substring(idx).trim();
// //     }

// //     // Cut off unwanted metadata
// //     const cutPoints = [
// //       "In summary",
// //       "Found in collection:",
// //       "Score:",
// //       "### Input Data:",
// //       "Now provide the answer:",
// //     ];
// //     cutPoints.forEach((marker) => {
// //       const markerIdx = answerText.indexOf(marker);
// //       if (markerIdx !== -1) {
// //         answerText = answerText.substring(0, markerIdx).trim();
// //       }
// //     });

// //     return cleanAdviceText(answerText);
// //   };

// //   // --- Detect if from RAG or AI ---
// //   const detectSource = (text) => {
// //     if (typeof text !== "string") return "AI";
// //     if (text.includes("advisory") || text.includes("paddy_advisories")) {
// //       return "RAG model";
// //     }
// //     if (text.includes("Found in collection:")) {
// //       return "RAG model";
// //     }
// //     return "Google";
// //   };

// //   // --- Parse questions safely ---
// //   useEffect(() => {
// //     if (!data) return;

// //     if (Array.isArray(data.generated_questions)) {
// //       setQuestions(data.generated_questions);
// //     } else if (typeof data.generated_questions === "string") {
// //       try {
// //         const parsed = JSON.parse(data.generated_questions);
// //         setQuestions(parsed);
// //       } catch (error) {
// //         console.error("Failed to parse generated_questions:", error);
// //         setQuestions([data.generated_questions]);
// //       }
// //     }
// //   }, [data]);

// //   // --- Copy advice ---
// //   const copyAdvice = () => {
// //     if (data?.advice_list?.length > 0) {
// //       const allAdviceText = data.advice_list
// //         .map((item) => {
// //           const rawText =
// //             typeof item.advice === "object"
// //               ? JSON.stringify(item.advice)
// //               : item.advice;
// //           const answer = extractAnswer(rawText);
// //           const source = detectSource(rawText);

// //           return `Q: ${item.question}\n[Source: ${source}]\n${answer}`;
// //         })
// //         .join("\n\n");
// //       navigator.clipboard.writeText(allAdviceText);
// //     }
// //   };

// //   if (!data) return null;

// //   return (
// //     <div
// //       className="advice-box">
// //       {/* --- AI Advice --- */}
// //       {data.advice_list?.length > 0 ? (
// //         data.advice_list.map((item, index) => {
// //           const rawText =
// //             typeof item.advice === "object"
// //               ? JSON.stringify(item.advice)
// //               : item.advice;
// //           const answer = extractAnswer(rawText);
// //           const source = detectSource(rawText);

// //           return (
// //             <div
// //               key={`${index}`}
// //               style={{
// //                 marginBottom: "5px",
// //                 background: "#fff",
// //                 padding: "10px",
// //                 borderRadius: "6px",
// //                 boxShadow: "0px 2px 4px rgba(0,0,0,0.1)",
// //                 width: "98%",
// //                 maxHeight: "220px",
// //                 overflowY: "auto",
// //               }}
// //             >
// //               <p
// //                 style={{
// //                   paddingLeft: "10px",
// //                   whiteSpace: "pre-line",
// //                   fontStyle: "italic",
// //                   color: "#666",
// //                 }}
// //               >
// //                 Source: {source}
// //               </p>

// //               <p
// //                 style={{
// //                   paddingLeft: "10px",
// //                   whiteSpace: "pre-line",
// //                 }}
// //               >
// //                 {answer}
// //               </p>
// //             </div>
// //           );
// //         })
// //       ) : (
// //         <p>No advice found.</p>
// //       )}

// //       {/* --- Output Formats --- */}
// //       <div
// //         style={{
// //           display: "flex",
// //           justifyContent: "center",
// //           gap: "10px",
// //           marginTop: "10px",
// //           marginBottom: "20px",
// //         }}
// //       >
// //         <button
// //           onClick={copyAdvice}
// //           style={{
// //             backgroundColor: "#2e7d32",
// //             border: "none",
// //             padding: "10px 20px",
// //             borderRadius: "5px",
// //             color: "white",
// //             cursor: "pointer",
// //           }}
// //         >
// //           Paragraph
// //         </button>

// //         <button
// //           onClick={() => alert("Conversation format coming soon!")}
// //           style={{
// //             backgroundColor: "#2e7d32",
// //             border: "none",
// //             padding: "10px 20px",
// //             borderRadius: "5px",
// //             color: "white",
// //             cursor: "pointer",
// //           }}
// //         >
// //           Conversation
// //         </button>

// //         <button
// //           onClick={() => alert("Audio format coming soon!")}
// //           style={{
// //             backgroundColor: "#2e7d32",
// //             border: "none",
// //             padding: "10px 20px",
// //             borderRadius: "5px",
// //             color: "white",
// //             cursor: "pointer",
// //           }}
// //         >
// //           Audio
// //         </button>
// //       </div>

// //       {/* <hr style={{ margin: "20px 0" }} /> */}
// //     </div>
// //   );
// // }

// // # ============================================================================

// ======================================================================================== working code ==========================
import { useEffect, useState, useRef } from "react";
import {
  generateDialogue,
  dialoguesToAudioText,
  clearSession,
  generateAzureOdiaAudio,
} from "../api/voice_dailog";
import { v4 as uuidv4 } from "uuid";
import { Play, Pause } from "lucide-react";

// import { useRef, useState, useEffect } from "react";
// import { Play, Pause } from "lucide-react";

export function WhatsAppAudioPlayer({ src, isUser }) {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [speed, setSpeed] = useState(1);

  const formatTime = (time) => {
    if (!time || isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60).toString().padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  useEffect(() => {
    const audio = audioRef.current;
    const updateProgress = () =>
      setProgress((audio.currentTime / audio.duration) * 100 || 0);

    if (audio) {
      audio.addEventListener("timeupdate", updateProgress);
      return () => audio.removeEventListener("timeupdate", updateProgress);
    }
  }, []);

  const togglePlay = () => {
    if (!isPlaying) audioRef.current.play();
    else audioRef.current.pause();
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e) => {
    const newTime = (e.target.value / 100) * duration;
    audioRef.current.currentTime = newTime;
    setProgress(e.target.value);
  };

  const toggleSpeed = () => {
    const newSpeed = speed === 1 ? 1.5 : speed === 1.5 ? 2 : 1;
    setSpeed(newSpeed);
    audioRef.current.playbackRate = newSpeed;
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "6px",
        width: "260px",   // smaller overall width
        height: "18px",
        margin: "4px",
        flexDirection: "row",
        marginBottom: "5px",
        marginTop: "5px",
      }}
    >
      {/* Play Button */}
      <button
        onClick={togglePlay}
        style={{
          width: "28px",
          height: "28px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "50%",
          boxShadow: "0 1px 2px rgba(0,0,0,0.15)", // soft shadow
          backgroundColor: "#6b7280", // gray background
          color: "#fff", // white emoji/text color
          border: "none",
          cursor: "pointer",
          flexShrink: 0,
          fontSize: "14px", // emoji size
        }}
      >
        {isPlaying ? "II" : "▶"}
      </button>

      {/* Progress Bar + Time */}
      <div
        style={{
          flex: 2,
          display: "flex",
          marginTop: "20px",
          alignItems: "center",
          gap: "4px",
        }}
      >
        <input
          type="range"
          min="0"
          max="100"
          value={progress}
          onChange={handleSeek}
          style={{
            flex: 1,
            height: "1px",
            borderRadius: "9999px",
            appearance: "none",
            background: "#d1d5db",
            accentColor: "#69796fff",
          }}
        />
        <span
          style={{
            fontSize: "10px",
            color: "#374151",
            width: "32px",
            textAlign: "right",
            flexShrink: 0,
            marginBottom: "2px",
          }}
        >
          {formatTime(audioRef.current?.currentTime)}
        </span>
      </div>

      {/* Speed Button */}
      <button
        onClick={toggleSpeed}
        style={{
          padding: "1px 6px",
          borderRadius: "9999px",
          backgroundColor: "#e5e7eb",
          color: "#111827",
          fontSize: "12px",
          fontWeight: 600,
          minWidth: "28px",
          textAlign: "center",
          border: "none",
          cursor: "pointer",
          flexShrink: 0,
        }}
      >
        {speed}x
      </button>

      {/* Audio Element */}
      <audio
        ref={audioRef}
        src={src}
        preload="metadata"
        onLoadedMetadata={(e) => setDuration(e.target.duration)}
        onEnded={() => setIsPlaying(false)}
      />
    </div>

  );
}


export default function AdviceBox(props) {
  const data = props.data || props.adviceData;
  const [questions, setQuestions] = useState([]);
  const [viewMode, setViewMode] = useState("paragraph");
  const [dialogues, setDialogues] = useState({});
  const [typedDialogues, setTypedDialogues] = useState({});
  const [audioDialogues, setAudioDialogues] = useState({});
  const [sessionId] = useState(() => uuidv4());
  const audioDialoguesRef = useRef(audioDialogues);
  const containerRef = useRef(null);
  const [audioDialoguesNormal, setAudioDialoguesNormal] = useState({});
  const [audioDialoguesAzure, setAudioDialoguesAzure] = useState({});


  useEffect(() => {
    audioDialoguesRef.current = audioDialogues;
  }, [audioDialogues]);

  const cleanAdviceText = (text) => {
    if (typeof text !== "string") return text;
    return text.replace(/\*\*paddy_advisories\*\*/g, "")
      .replace(/^\*\*advisory\*\*\s*/g, "")
      .replace(/ment\.\'}?$/g, "")
      .trim();
  };

  const extractAnswer = (text) => {
    if (typeof text !== "string") return text;
    let answerText = text;
    const idx = answerText.lastIndexOf("Advisory:");
    if (idx !== -1) answerText = answerText.substring(idx).trim();
    const cutPoints = ["In summary", "Found in collection:", "Score:", "### Input Data:", "Now provide the answer:"];
    cutPoints.forEach((marker) => {
      const markerIdx = answerText.indexOf(marker);
      if (markerIdx !== -1) answerText = answerText.substring(0, markerIdx).trim();
    });
    return cleanAdviceText(answerText);
  };

  const detectSource = (text) => {
    if (typeof text !== "string") return "Google";

    const lowerText = text.toLowerCase();

    if (
      lowerText.includes("advisories (linewise split)") ||
      lowerText.includes("advisories (original full text)") ||
      lowerText.includes("paddy")
    ) {
      return "paddy_advisories";
    }
    else if (lowerText.includes("now provide the answer:")) {
      return "Google";
    }
    else {
      return "Google";
    }
  };

  useEffect(() => {
    if (!data) return;
    if (Array.isArray(data.generated_questions)) setQuestions(data.generated_questions);
    else if (typeof data.generated_questions === "string") {
      try { setQuestions(JSON.parse(data.generated_questions)); }
      catch { setQuestions([data.generated_questions]); }
    }
  }, [data]);



  useEffect(() => {
    // Whenever the advice content changes → reset everything
    setDialogues({});
    setTypedDialogues({});
    setAudioDialogues({});
    setAudioDialoguesNormal({});
    setAudioDialoguesAzure({});

    // (Optional) clear IndexedDB cache if needed
    const clearDB = async () => {
      const db = await openDB();
      const tx = db.transaction("audios", "readwrite");
      tx.objectStore("audios").clear();
      return tx.complete;
    };
    clearDB();

  }, [data]); // runs every time new advice content comes


  // Conversation fetch
  useEffect(() => {
    if (viewMode !== "conversation" || !data?.advice_list?.length) return;

    const fetchDialogues = async () => {
      for (let index = 0; index < data.advice_list.length; index++) {
        if (dialogues[index]) continue;

        const item = data.advice_list[index];
        const rawText = typeof item.advice === "object" ? JSON.stringify(item.advice) : item.advice;
        const answer = extractAnswer(rawText);

        try {
          const res = await generateDialogue(answer);
          let dialogueText = res?.data?.dialogue ?? answer;
          if (typeof dialogueText !== "string") dialogueText = JSON.stringify(dialogueText);
          const dialogueStart = dialogueText.indexOf("Dialogue:");
          if (dialogueStart !== -1) dialogueText = dialogueText.slice(dialogueStart + 9).trim();

          const dialogueLines = dialogueText.split(/\n+/)
            .map((line) => line.replace(/^\["']|["']$/g, "").trim())
            .filter(Boolean)
            .map((line) => {
              const firstColon = line.indexOf(":");
              let speaker = "Advisor", text = line;
              if (firstColon !== -1) {
                speaker = line.slice(0, firstColon).trim();
                text = line.slice(firstColon + 1).trim();
              }
              if (text.startsWith(`${speaker}:`)) text = text.slice(speaker.length + 1).trim();
              return { speaker, text };
            });

          setDialogues((prev) => ({ ...prev, [index]: dialogueLines }));
        } catch (err) {
          setDialogues((prev) => ({ ...prev, [index]: [{ speaker: "Advisor", text: String(answer) }] }));
        }
      }
    };

    fetchDialogues();
  }, [viewMode, data]);

  // Audio generation effect (local & azure)
  // ======================
  // IndexedDB helper
  // ======================
  let db;
  const openDB = () => {
    return new Promise((resolve, reject) => {
      if (db) return resolve(db);
      const request = indexedDB.open("AudioDB", 1);
      request.onupgradeneeded = (e) => {
        db = e.target.result;
        if (!db.objectStoreNames.contains("audios")) {
          db.createObjectStore("audios");
        }
      };
      request.onsuccess = (e) => {
        db = e.target.result;
        resolve(db);
      };
      request.onerror = (e) => reject(e);
    });
  };

  const storeAudio = async (key, blob) => {
    const db = await openDB();
    const tx = db.transaction("audios", "readwrite");
    const store = tx.objectStore("audios");
    store.put(blob, key);
    return tx.complete;
  };

  const getAudio = async (key) => {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction("audios", "readonly");
      const store = tx.objectStore("audios");
      const req = store.get(key);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
    });
  };

  // ======================
  // Audio generation effect (IndexedDB)
  // ======================
  // Audio generation effect (generate both types once, cache them)
  useEffect(() => {
    if (!data?.advice_list?.length) return;
    console.log()

    const generateAudio = async (type) => {
      for (let index = 0; index < data.advice_list.length; index++) {
        const dialogueLines = dialogues[index];
        if (!dialogueLines) continue;

        try {
          const dialogueWithAudio = await Promise.all(
            dialogueLines.map(async (line) => {
              try {
                let audioUrl = null;
                const speaker = line.speaker || "System";
                const key = `${type}_${index}_${speaker}_${line.text}`;

                const cachedBlob = await getAudio(key);
                if (cachedBlob) {
                  audioUrl = URL.createObjectURL(cachedBlob);
                } else {
                  if (type === "audio") {
                    const audioRes = await dialoguesToAudioText(line.speaker, line.text, sessionId);
                    console.log("results", audioRes)
                    if (audioRes?.audio_url) {
                      const response = await fetch(`https://lindsey-antidogmatical-unsumptuously.ngrok-free.app/outputs/${audioRes.audio_url.replace("./outputs/", "")}`,
                        {
                          headers: {
                            "ngrok-skip-browser-warning": "true", // also set header here for fetch
                          },
                        });
                      const blobData = await response.blob();
                      await storeAudio(key, blobData);
                      audioUrl = URL.createObjectURL(blobData);
                    }
                  } else if (type === "azure_audio") {
                    const audioRes = await generateAzureOdiaAudio(line.speaker, line.text);
                    if (audioRes?.audio_file) {
                      // Extract filename from path
                      const fileName = audioRes.audio_file.split("/").pop();
                      const response = await fetch(`https://lindsey-antidogmatical-unsumptuously.ngrok-free.app/azure_audios/${fileName}`, {
                        headers: { "ngrok-skip-browser-warning": "true" },
                      });

                      console.log("response:", response);
                      const blobData = await response.blob();
                      await storeAudio(key, blobData);
                      audioUrl = URL.createObjectURL(blobData);
                    }
                  }
                }

                return { ...line, speaker, audioUrl };
              } catch (err) {
                console.error("Audio generation failed:", line.text, err);
                return { ...line, speaker: line.speaker || "System", audioUrl: null };
              }
            })
          );

          if (type === "audio") {
            setAudioDialoguesNormal((prev) => ({ ...prev, [index]: dialogueWithAudio }));
          } else {
            setAudioDialoguesAzure((prev) => ({ ...prev, [index]: dialogueWithAudio }));
          }
        } catch (err) {
          console.error("Dialogue audio failed:", err);
        }
      }
    };

    // generate both in parallel (cache + state)
    generateAudio("audio");
    generateAudio("azure_audio");
  }, [data, dialogues, sessionId]);




  // Auto-scroll
  useEffect(() => {
    if (containerRef.current) containerRef.current.scrollTop = containerRef.current.scrollHeight;
  }, [audioDialogues, data, viewMode, dialogues]);
  // Cleanup session on unload
  useEffect(() => {
    const handleBeforeUnload = async () => {
      try {
        // clear backend session
        await clearSession(sessionId);
      } catch (err) {
        console.warn("Failed to clear session audios:", err);
      }

      try {
        // clear IndexedDB audios too
        const db = await openDB();
        const tx = db.transaction("audios", "readwrite");
        tx.objectStore("audios").clear();
        await tx.complete;
      } catch (err) {
        console.warn("Failed to clear IndexedDB audios:", err);
      }
    };

    // Attach listener for page close/refresh
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [sessionId]);


  // Typewriter effect
  useEffect(() => {
    const intervals = [];
    Object.keys(dialogues).forEach((key) => {
      const lines = dialogues[key];
      if (!Array.isArray(lines)) return;
      lines.forEach((line, idx) => {
        let i = 0;
        const interval = setInterval(() => {
          setTypedDialogues((prev) => ({
            ...prev,
            [key]: {
              ...(prev[key] || {}),
              [idx]: line.text.substring(0, i + 1),
            },
          }));
          i++;
          if (i >= line.text.length) clearInterval(interval);
        }, 15);
        intervals.push(interval);
      });
    });
    return () => intervals.forEach((interval) => clearInterval(interval));
  }, [dialogues]);

  // Copy advice
  const copyAdvice = () => {
    if (data?.advice_list?.length > 0) {
      const allAdviceText = data.advice_list
        .map((item) => {
          const rawText = typeof item.advice === "object" ? JSON.stringify(item.advice) : item.advice;
          const answer = extractAnswer(rawText);
          const source = detectSource(rawText);
          return `Q: ${item.question}\n[Source: ${source}]\n${answer}`;
        })
        .join("\n\n");
      navigator.clipboard.writeText(allAdviceText);
    }
  };

  // AudioChat component for both audio modes
  const AudioChat = ({ dialogues, audioDialogues, containerRef }) => (
    <div
      ref={containerRef}
      style={{
        background: "#ece5dd", // WhatsApp chat bg
        padding: "12px",
        borderRadius: "12px",
        height: "35vh",
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
      }}
    >
      {dialogues.map((dialogueLines, index) => {
        const safeDialogueLines = Array.isArray(dialogueLines)
          ? dialogueLines
          : [dialogueLines];

        const mergedLines =
          audioDialogues[index] ||
          safeDialogueLines.map((line) => ({
            ...line,
            speaker: line.speaker || "System",
            audioUrl: null,
          }));

        return (
          <div key={index} style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {mergedLines.map((line, i) => {
              const speaker = line.speaker || "System";
              const normalizedSpeaker = speaker.toLowerCase();
              const isUser = normalizedSpeaker === "hariya"; // only Hariya is user

              return (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    justifyContent: isUser ? "flex-end" : "flex-start",
                  }}
                >
                  <div
                    style={{
                      background: isUser ? "#dcf8c6" : "#ffffff",
                      color: "#303030",
                      padding: "10px 14px",
                      borderRadius: "20px",
                      maxWidth: "75vw",
                      boxShadow: "0px 1px 2px rgba(0,0,0,0.15)",
                    }}
                  >
                    <b>{speaker}:</b>

                    {/* WhatsApp Audio Player */}
                    {line.audioUrl ? (
                      <div style={{ marginTop: "6px", maxWidth: "280px" }}>
                        <WhatsAppAudioPlayer src={line.audioUrl} isUser={isUser} />
                      </div>
                    ) : (
                      <p style={{ margin: 0 }}>{line.text}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );


  if (!data) return null;

  return (
    <div className="advice-box">
      {/* Paragraph View */}
      {viewMode === "paragraph" && data.advice_list?.length > 0 && (
        data.advice_list.map((item, index) => {
          const rawText = typeof item.advice === "object" ? JSON.stringify(item.advice) : item.advice;
          const answer = extractAnswer(rawText);
          const source = detectSource(rawText);
          return (
            <div
              key={index}
              style={{
                marginBottom: "5px",
                background: "#fff",
                padding: "10px",
                borderRadius: "6px",
                boxShadow: "0px 2px 4px rgba(0,0,0,0.1)",
                width: "98%",
                maxHeight: "350px",
                overflowY: "auto",
              }}
            >
              <p style={{ paddingLeft: "10px", whiteSpace: "pre-line", fontStyle: "italic", color: "#666" }}>
                Source: {source}
              </p>
              <p style={{ paddingLeft: "10px", whiteSpace: "pre-line" }}>{answer}</p>
            </div>
          );
        })
      )}

      {/* Conversation View */}
      {viewMode === "conversation" && data.advice_list?.length > 0 && (
        <div
          style={{
            background: "#ece5dd",
            padding: "15px",
            borderRadius: "8px",
            height: "35vh",
            overflowY: "auto",
          }}
        >
          {data.advice_list.map((item, index) => {
            const dialogueLines =
              dialogues[index] || [{ speaker: "System", text: "Loading conversation..." }];
            return (
              <div key={index} style={{ marginBottom: "16px" }}>
                {dialogueLines.map((line, i) => {
                  const isUser = line.speaker.toLowerCase() === "hariya";
                  return (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        justifyContent: isUser ? "flex-end" : "flex-start",
                        marginBottom: "6px",
                      }}
                    >
                      <div
                        style={{
                          background: isUser ? "#dcf8c6" : "#ffffff",
                          color: "#303030",
                          padding: "10px 14px",
                          borderRadius: "20px",
                          maxWidth: "75%",
                          boxShadow: "0px 1px 2px rgba(0,0,0,0.15)",
                        }}
                      >
                        <b>{line.speaker}:</b>
                        <span>{typedDialogues[index]?.[i] || ""}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      )}

      {/* Audio & Azure Audio View */}
      {(viewMode === "audio" || viewMode === "azure_audio") && data.advice_list?.length > 0 && (
        <div>
          <AudioChat
            dialogues={data.advice_list}
            audioDialogues={viewMode === "audio" ? audioDialoguesNormal : audioDialoguesAzure}
            containerRef={containerRef}
          />
        </div>
      )}

      {/* Buttons */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "10px",
          marginTop: "15px",
          marginBottom: "20px",
        }}
      >
        <button onClick={() => setViewMode("paragraph")}>Generated Advisory</button>
        <button onClick={() => setViewMode("conversation")}>Generated Dialouges</button>
        {/* Buttons to switch */}
        <button onClick={() => setViewMode("audio")}> Bhashini Audio</button>
        <button onClick={() => setViewMode("azure_audio")}>Azure Audio</button>
      </div>
    </div>
  );
}
