import React, { useState, useEffect } from "react";
import { Toast, ToastContainer } from "react-bootstrap";

const AchievementNotification = ({ achievements, onClose }) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (achievements && achievements.length > 0) {
      setShow(true);
    }
  }, [achievements]);

  const handleClose = () => {
    setShow(false);
    if (onClose) onClose();
  };

  if (!achievements || achievements.length === 0) return null;

  return (
    <ToastContainer position="top-end" className="p-3">
      {achievements.map((achievement, index) => (
        <Toast
          key={index}
          show={show}
          onClose={handleClose}
          delay={5000}
          autohide
          className="cosmic-achievement"
        >
          <Toast.Header className="cosmic-toast-header">
            <span className="achievement-icon me-2">{achievement.icon}</span>
            <strong className="me-auto">Achievement Unlocked!</strong>
          </Toast.Header>
          <Toast.Body className="cosmic-toast-body">
            <div className="achievement-content">
              <h6 className="achievement-name">{achievement.name}</h6>
              <p className="achievement-description mb-0">
                {achievement.description}
              </p>
            </div>
          </Toast.Body>
        </Toast>
      ))}
    </ToastContainer>
  );
};

export default AchievementNotification;
