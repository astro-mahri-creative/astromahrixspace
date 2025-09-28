import React, { useState, useEffect, useRef } from "react";
import { Card, Button, ProgressBar, Alert } from "react-bootstrap";
import axios from "axios";

const FrequencyMatch = ({ onScoreUpdate, sessionId }) => {
  const [gameActive, setGameActive] = useState(false);
  const [score, setScore] = useState(0);
  const [targetFreq, setTargetFreq] = useState(440);
  const [userFreq, setUserFreq] = useState(440);
  const [timeLeft, setTimeLeft] = useState(30);
  const [feedback, setFeedback] = useState("");
  const [gameStartTime, setGameStartTime] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const audioContextRef = useRef(null);
  const oscillatorRef = useRef(null);
  const gainNodeRef = useRef(null);
  const intervalRef = useRef(null);

  // Initialize audio context
  useEffect(() => {
    return () => {
      stopSound();
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const generateRandomFrequency = () => {
    // Generate frequencies in musical range (200-800 Hz)
    return Math.floor(Math.random() * 600) + 200;
  };

  const playSound = (frequency) => {
    try {
      stopSound(); // Stop any existing sound

      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext ||
          window.webkitAudioContext)();
      }

      const context = audioContextRef.current;
      const oscillator = context.createOscillator();
      const gainNode = context.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(context.destination);

      oscillator.frequency.setValueAtTime(frequency, context.currentTime);
      oscillator.type = "sine";

      gainNode.gain.setValueAtTime(0.1, context.currentTime);

      oscillator.start();

      oscillatorRef.current = oscillator;
      gainNodeRef.current = gainNode;

      // Stop after 1 second
      setTimeout(() => stopSound(), 1000);
    } catch (error) {
      console.log("Audio not available");
    }
  };

  const stopSound = () => {
    try {
      if (oscillatorRef.current) {
        oscillatorRef.current.stop();
        oscillatorRef.current = null;
      }
      if (gainNodeRef.current) {
        gainNodeRef.current = null;
      }
    } catch (error) {
      // Sound already stopped
    }
  };

  const startGame = () => {
    setGameActive(true);
    setScore(0);
    setTimeLeft(30);
    setTargetFreq(generateRandomFrequency());
    setUserFreq(440);
    setFeedback("");
    setGameStartTime(Date.now());

    // Start countdown
    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          endGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const endGame = () => {
    setGameActive(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    stopSound();
    submitScore();
  };

  const submitScore = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const playTime = gameStartTime
        ? Math.floor((Date.now() - gameStartTime) / 1000)
        : 30;

      const response = await axios.post("/api/game/frequency-match", {
        score,
        sessionId,
        playTime,
      });

      if (onScoreUpdate) {
        onScoreUpdate(response.data);
      }

      setFeedback(`Game complete! Score: ${score}`);
    } catch (error) {
      console.error("Score submission failed:", error);
      setFeedback("Failed to submit score. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const checkFrequency = () => {
    const difference = Math.abs(targetFreq - userFreq);
    let points = 0;

    if (difference <= 5) {
      points = 20; // Perfect match
      setFeedback("🎯 Perfect! +20 points");
    } else if (difference <= 15) {
      points = 15; // Very close
      setFeedback("🎵 Very close! +15 points");
    } else if (difference <= 30) {
      points = 10; // Close
      setFeedback("🎶 Close! +10 points");
    } else if (difference <= 50) {
      points = 5; // Not bad
      setFeedback("🎵 Getting warmer! +5 points");
    } else {
      setFeedback("🎵 Keep trying!");
    }

    setScore((prev) => prev + points);

    // Generate new target after short delay
    setTimeout(() => {
      setTargetFreq(generateRandomFrequency());
      setFeedback("");
    }, 1500);
  };

  const getDifferencePercentage = () => {
    const maxDiff = 300; // Max reasonable difference
    const diff = Math.abs(targetFreq - userFreq);
    return Math.min((diff / maxDiff) * 100, 100);
  };

  return (
    <Card className="cosmic-card game-container">
      <Card.Header className="text-center">
        <h3 className="cosmic-title">🎵 Frequency Match Challenge</h3>
        <p className="text-muted">
          Match the cosmic frequency to unlock exclusive content!
        </p>
      </Card.Header>

      <Card.Body>
        {!gameActive ? (
          <div className="text-center">
            <p className="mb-4">
              Listen to the target frequency, then adjust your frequency to
              match it. Score points based on how close you get!
            </p>
            <Button onClick={startGame} className="spaceship-button" size="lg">
              🚀 Begin Frequency Calibration
            </Button>
          </div>
        ) : (
          <div>
            {/* Game Stats */}
            <div className="d-flex justify-content-between mb-3">
              <div>
                <strong>Score: {score}</strong>
              </div>
              <div>
                <strong>Time: {timeLeft}s</strong>
              </div>
            </div>

            {/* Progress Bar for time */}
            <ProgressBar
              now={(timeLeft / 30) * 100}
              variant="warning"
              className="mb-3"
            />

            {/* Target Frequency */}
            <div className="text-center mb-3">
              <h5>Target Frequency: {targetFreq} Hz</h5>
              <Button
                onClick={() => playSound(targetFreq)}
                variant="outline-primary"
                size="sm"
                className="me-2"
              >
                🔊 Play Target
              </Button>
              <Button
                onClick={() => playSound(userFreq)}
                variant="outline-secondary"
                size="sm"
              >
                🎵 Play Yours
              </Button>
            </div>

            {/* Frequency Slider */}
            <div className="mb-3">
              <label htmlFor="freq-slider" className="form-label">
                Your Frequency: {userFreq} Hz
              </label>
              <input
                id="freq-slider"
                type="range"
                className="form-range frequency-slider"
                min="200"
                max="800"
                value={userFreq}
                onChange={(e) => setUserFreq(parseInt(e.target.value))}
              />

              {/* Visual feedback for closeness */}
              <div className="mt-2">
                <ProgressBar>
                  <ProgressBar
                    variant="success"
                    now={100 - getDifferencePercentage()}
                    label={`${Math.round(
                      100 - getDifferencePercentage()
                    )}% match`}
                  />
                </ProgressBar>
              </div>
            </div>

            {/* Submit Guess Button */}
            <div className="text-center mb-3">
              <Button onClick={checkFrequency} className="spaceship-button">
                🎯 Check Frequency
              </Button>
            </div>

            {/* Feedback */}
            {feedback && (
              <Alert variant="info" className="text-center">
                {feedback}
              </Alert>
            )}

            {/* End Game Button */}
            <div className="text-center">
              <Button onClick={endGame} variant="outline-danger" size="sm">
                End Game
              </Button>
            </div>
          </div>
        )}

        {isSubmitting && (
          <div className="text-center mt-3">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Submitting score...</span>
            </div>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default FrequencyMatch;
