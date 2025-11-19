"use client";

import { useState } from "react";
import "./globals.css";

export default function Home() {
  const [currentScreen, setCurrentScreen] = useState("input");
  const [statement, setStatement] = useState("");
  const [explanation, setExplanation] = useState("");
  const [showExplanation, setShowExplanation] = useState(false);
  const [loading, setLoading] = useState(false);

  const checkStatement = async () => {
    if (!statement.trim() || loading) return;

    setLoading(true);

    try {
      const response = await fetch("/api/check-statement", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ statement }),
      });

      const parsed = await response.json();

      setExplanation(parsed.explanation);
      setCurrentScreen(parsed.verdict === "TRUE" ? "true" : "false");
    } catch (err) {
      console.error("Error:", err);
      setExplanation("Unable to analyze the statement. Please try again.");
      setCurrentScreen("false");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setCurrentScreen("input");
    setStatement("");
    setExplanation("");
    setShowExplanation(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      checkStatement();
    }
  };

  return (
    <>
      {/* Input Screen */}
      {currentScreen === "input" && (
        <div className="screen input-screen">
          <div className="giant-letter">T/F</div>
          <div className="input-container">
            <textarea
              className="input-box"
              value={statement}
              onChange={(e) => setStatement(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter a statement to verify..."
              disabled={loading}
            />
            <button
              className="submit-btn"
              onClick={checkStatement}
              disabled={!statement || loading}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Analyzing...
                </>
              ) : (
                "Check Statement"
              )}
            </button>
          </div>
        </div>
      )}

      {/* True Screen */}
      {currentScreen === "true" && (
        <div className="screen true-screen">
          <button className="back-btn" onClick={reset}>
            ← Back
          </button>
          <div className="giant-letter">T</div>
          <button
            className="why-button"
            onClick={() => setShowExplanation(true)}
          >
            Why?
          </button>
        </div>
      )}

      {/* False Screen */}
      {currentScreen === "false" && (
        <div className="screen false-screen">
          <button className="back-btn" onClick={reset}>
            ← Back
          </button>
          <div className="giant-letter">F</div>
          <button
            className="why-button"
            onClick={() => setShowExplanation(true)}
          >
            Why?
          </button>
        </div>
      )}

      {/* Explanation Modal */}
      {showExplanation && (
        <>
          <div
            className="explanation-overlay"
            onClick={() => setShowExplanation(false)}
          />
          <div className="explanation-modal">
            <div className="statement-display">"{statement}"</div>
            <div className="explanation-text">{explanation}</div>
            <button
              className="close-btn"
              onClick={() => setShowExplanation(false)}
            >
              Close
            </button>
          </div>
        </>
      )}
    </>
  );
}
