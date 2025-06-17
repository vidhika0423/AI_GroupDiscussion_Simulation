import React, { useState, useEffect } from "react";
import "./GDRoom.css";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

export default function GDRoom() {
  const location = useLocation();
  const navigate = useNavigate();
  const topic = location.state?.topic || "No topic selected";

  const [transcript, setTranscript] = useState([]);
  const [userResponses, setUserResponses] = useState([]); 
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);

  
  const TOTAL_TIME = 15 * 60;
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME);
  const [countingUp, setCountingUp] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (!countingUp) {
          if (prev <= 1) {
            setCountingUp(true);
            return 1;
          }
          return prev - 1;
        } else {
          return prev + 1;
        }
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [countingUp]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const handleMicClick = async () => {
    if (!isRecording) {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const audioChunks = [];

      recorder.ondataavailable = (event) => audioChunks.push(event.data);
      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
        const formData = new FormData();
        formData.append("audio", audioBlob, "recording.wav");
        formData.append("topic", topic);
        formData.append("history", generateHistory(transcript));

        try {
          const response = await axios.post("http://localhost:8000/gd/", formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });

          const { user_response, bot_response } = response.data;

          // update full transcript
          setTranscript((prev) => [
            ...prev,
            { speaker: "You", text: user_response },
            { speaker: "Bot", text: bot_response },
          ]);

          // update only user responses
          setUserResponses((prev) => [...prev, user_response]);

          if (response.data.audio_url) {
            const audio = new Audio(response.data.audio_url);
            audio.play();
          }
        } catch (err) {
          console.error("Error in pipeline:", err);
        }
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    } else {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  const generateHistory = (dialogues) => {
    return dialogues.map((d) => `${d.speaker}: ${d.text}`).join("\n");
  };

  const handleFinish = () => {
    navigate("/analysis", {
      state: { userResponses, topic } //  pass only user responses and topic
    });
  };

  return (
    <div className="gd-room">
      <div className="gd-header">
        <div className="timer">⏱ {formatTime(timeLeft)}</div>
        <div className="gd-topic">Group Discussion Topic: {topic}</div>
        <button className="finish-btn" onClick={handleFinish}>Finish</button>
      </div>

      <div className="gd-body">
        <div className="bot-section">
          <video
            className="bot-face"
            src="/public/thinking.mp4"
            autoPlay
            muted
            loop
          />
          <div className="mic">
            <button className="mic-btn" onClick={handleMicClick}>
              {isRecording ? "Stop" : "Mic"}
            </button>
          </div>
        </div>

        <div className="transcript-section">
          <h3>Live Transcript</h3>
          <div className="transcript-box">
            {transcript.map((line, index) => (
              <p key={index}>
                <strong>{line.speaker}:</strong> {line.text}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
