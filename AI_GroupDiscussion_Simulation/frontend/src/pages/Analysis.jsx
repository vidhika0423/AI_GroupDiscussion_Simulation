import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import './Analysis.css'
export default function Analysis() {
  const location = useLocation();
  const userResponses = location.state?.userResponses || [];
  const topic = location.state?.topic || "No topic provided";
  const [analysisData, setAnalysisData] = useState([]);

  const cleanAnalysis = (rawList) => {
    return rawList.map((item) => {
      try {
        const parts = item.split("Return your output only in JSON format.\n\n```json");
        if (parts.length > 1) {
          const jsonPart = parts[1].split("```")[0].trim();
          return JSON.parse(jsonPart);
        }
      } catch (err) {
        console.error("Failed to parse JSON", err);
      }
      return null;
    }).filter(Boolean);
  };

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        const response = await axios.post("http://localhost:8000/analysis", {
          speaker: "User",
          userResponses: userResponses,
        });

        const cleaned = cleanAnalysis(response.data.analysis || []);
        setAnalysisData(cleaned);
      } catch (err) {
        console.error("Error fetching analysis:", err);
      }
    };

    if (userResponses.length > 0) fetchAnalysis();
  }, [userResponses]);

  return (
    <div className="analysis-container" style={{ padding: "20px" }}>
      <h2 className="analysis-header">Topic: {topic}</h2>
      <h3>Detailed Analysis</h3>
      {analysisData.length > 0 ? (
        analysisData.map((entry, index) => (
          <div
            key={index}
            className="analysis-content "
          >
            {Object.entries(entry).map(([key, value], i) => (
              <p key={i}>
                <strong>{key.replace(/_/g, " ")}:</strong>{" "}
                {typeof value === "string" || typeof value === "number"
                  ? value
                  : JSON.stringify(value)}
              </p>
            ))}
          </div>
        ))
      ) : (
        <p>Loading Analysis...</p>
      )}
    </div>
  );
}
