// Session management for anonymous gaming
export const getSessionId = () => {
  let sessionId = localStorage.getItem("astro_session_id");

  if (!sessionId) {
    // Generate unique session ID
    sessionId =
      "astro_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
    localStorage.setItem("astro_session_id", sessionId);
  }

  return sessionId;
};

export const clearSession = () => {
  localStorage.removeItem("astro_session_id");
};

// Game progress tracking
export const saveGameProgress = (progress) => {
  localStorage.setItem(
    "astro_game_progress",
    JSON.stringify({
      ...progress,
      lastSaved: Date.now(),
    })
  );
};

export const getLocalGameProgress = () => {
  try {
    const saved = localStorage.getItem("astro_game_progress");
    return saved ? JSON.parse(saved) : null;
  } catch (error) {
    return null;
  }
};

// Achievement handling
export const markAchievementsSeen = (achievements) => {
  const seen = getSeenAchievements();
  const newSeen = [...seen, ...achievements.map((a) => a.name)];
  localStorage.setItem("astro_seen_achievements", JSON.stringify(newSeen));
};

export const getSeenAchievements = () => {
  try {
    const seen = localStorage.getItem("astro_seen_achievements");
    return seen ? JSON.parse(seen) : [];
  } catch (error) {
    return [];
  }
};

export const getNewAchievements = (allAchievements) => {
  const seen = getSeenAchievements();
  return allAchievements.filter(
    (achievement) => !seen.includes(achievement.name)
  );
};
