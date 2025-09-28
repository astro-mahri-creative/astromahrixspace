import React, { useState, useEffect } from "react";
import ModernCard from "./ModernCard";
import ModernButton from "./ModernButton";

const ModernGameInterface = ({
  currentFrequency,
  onFrequencyChange,
  score,
  highScore,
  attempts,
  achievements = [],
}) => {
  const [displayFrequency, setDisplayFrequency] = useState(currentFrequency);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    setDisplayFrequency(currentFrequency);
  }, [currentFrequency]);

  const handleSliderChange = (e) => {
    const newFreq = parseInt(e.target.value);
    setDisplayFrequency(newFreq);
    onFrequencyChange(newFreq);
  };

  const handlePlayToggle = () => {
    setIsPlaying(!isPlaying);
    // Add audio play/pause logic here
  };

  return (
    <div className="game-container">
      <h2 className="game-title">Cosmic Frequency Scanner</h2>

      <div className="frequency-display">{displayFrequency.toFixed(1)} Hz</div>

      <div className="frequency-slider-container">
        <input
          type="range"
          min="20"
          max="20000"
          value={displayFrequency}
          onChange={handleSliderChange}
          className="frequency-slider"
          step="0.1"
        />

        <div className="flex justify-between text-sm text-secondary mt-2">
          <span>20 Hz</span>
          <span>20 kHz</span>
        </div>
      </div>

      <div className="flex justify-center gap-4 mb-6">
        <ModernButton
          variant="accent"
          size="lg"
          onClick={handlePlayToggle}
          icon={<i className={`fas fa-${isPlaying ? "pause" : "play"}`}></i>}
        >
          {isPlaying ? "Pause" : "Play"}
        </ModernButton>

        <ModernButton
          variant="outline"
          size="lg"
          onClick={() => onFrequencyChange(Math.random() * 19980 + 20)}
          icon={<i className="fas fa-random"></i>}
        >
          Random
        </ModernButton>
      </div>

      <div className="game-stats">
        <div className="stat-card">
          <span className="stat-value">{score}</span>
          <span className="stat-label">Current Score</span>
        </div>

        <div className="stat-card">
          <span className="stat-value">{highScore}</span>
          <span className="stat-label">High Score</span>
        </div>

        <div className="stat-card">
          <span className="stat-value">{attempts}</span>
          <span className="stat-label">Attempts</span>
        </div>

        <div className="stat-card">
          <span className="stat-value">{achievements.length}</span>
          <span className="stat-label">Achievements</span>
        </div>
      </div>

      {achievements.length > 0 && (
        <div className="game-achievements">
          <h3 className="text-xl font-semibold mb-4 text-center">
            Achievements
          </h3>
          <div className="achievement-list">
            {achievements.map((achievement, index) => (
              <div
                key={index}
                className={`achievement-badge ${
                  achievement.unlocked ? "unlocked" : ""
                }`}
              >
                <i className={achievement.icon}></i>
                <span>{achievement.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ModernGameInterface;
