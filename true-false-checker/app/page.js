'use client';

import { useState } from 'react';
import './globals.css';

export default function Home() {
  const [currentScreen, setCurrentScreen] = useState('input');
  const [statement, setStatement] = useState('');
  const [explanation, setExplanation] = useState('');
  const [showExplanation, setShowExplanation] = useState(false);
  const [loading, setLoading] = useState(false);

  const checkStatement = async () => {
    if (!statement.trim() || loading) return;
    
    setLoading(true);
    
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [
            { 
              role: "user", 
              content: `Analyze this statement and determine if it's TRUE or FALSE: "${statement}"
              
              Respond in this exact JSON format with no other text:
              {
                "verdict": "TRUE" or "FALSE",
                "explanation": "Brief explanation of why this is true or false"
              }`
            }
          ],
        })
      });

      const data = await response.json();
      const text = data.content[0].text.trim();
      const cleanText = text.replace(/```json\n?|\n?```/g, '').trim();
      const parsed = JSON.parse(cleanText);
      
      setExplanation(parsed.explanation);
      setCurrentScreen(parsed.verdict === 'TRUE' ? 'true' : 'false');
    } catch (err) {
      console.error("Error:", err);
      setExplanation("Unable to analyze the statement. Please try again.");
      setCurrentScreen('false');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setCurrentScreen('input');
    setStatement('');
    setExplanation('');
    setShowExplanation(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      checkStatement();
    }
  };

  return (
    <>
      {/* Input Screen */}
      {currentScreen === 'input' && (
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
                'Check Statement'
              )}
            </button>
          </div>
        </div>
      )}

      {/* True Screen */}
      {currentScreen === 'true' && (
        <div className="screen true-screen">
          <button className="back-btn" onClick={reset}>← Back</button>
          <div className="giant-letter">T</div>
          <button className="why-button" onClick={() => setShowExplanation(true)}>
            Why?
          </button>
        </div>
      )}

      {/* False Screen */}
      {currentScreen === 'false' && (
        <div className="screen false-screen">
          <button className="back-btn" onClick={reset}>← Back</button>
          <div className="giant-letter">F</div>
          <button className="why-button" onClick={() => setShowExplanation(true)}>
            Why?
          </button>
        </div>
      )}

      {/* Explanation Modal */}
      {showExplanation && (
        <>
          <div className="explanation-overlay" onClick={() => setShowExplanation(false)} />
          <div className="explanation-modal">
            <div className="statement-display">"{statement}"</div>
            <div className="explanation-text">{explanation}</div>
            <button className="close-btn" onClick={() => setShowExplanation(false)}>
              Close
            </button>
          </div>
        </>
      )}
    </>
  );
}