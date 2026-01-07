async function handleAuth(mode, credentials) {
  const url =
    mode === "signin"
      ? "http://localhost:3000/auth/login"
      : "http://localhost:3000/auth/register";

  // Clean up the object: if it's signin, remove the name field
  const payload = {
    email: credentials.email,
    password: credentials.password,
  };

  if (mode === "signup") {
    payload.username = credentials.username; // or 'username' depending on your backend
  }

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload), // Send the cleaned payload
  });

  const data = await response.json();

  if (!response.ok) {
    // Log the exact error from the server to debug
    console.error("Server Error Data:", data);
    throw new Error(data.message || "Auth failed");
  }

  localStorage.setItem("token", data.token);
  localStorage.setItem("user", JSON.stringify(data.user));

  window.location.href = "dashboard.html";
}
async function generateAIPath(topic) {
  const token = localStorage.getItem("token");

  const response = await fetch("http://localhost:3000/content", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ topicName: topic }),
  });

  const data = await response.json();

  if (response.ok) {
    // 1. Save the full course for immediate rendering in learn.html
    localStorage.setItem("activeCourse", JSON.stringify(data.course));

    // 2. CRITICAL: Save IDs needed for the learning session and progress tracking
    
    localStorage.setItem("activeCourseId", data.course._id);
    localStorage.setItem("activeSkillId", data.skill._id);

    // 3. Redirect to the lab
    window.location.href = "learn.html";
  } else {
    alert(data.message || "Orchestrator sync failed");
  }
}

/**
 * Destroys the local session and redirects to the identity portal.
 */
function logout() {
  // 1. Clear the sensitive data
  localStorage.removeItem("token");
  localStorage.removeItem("user");

  // Optional: Clear everything if you don't have other saved settings
  // localStorage.clear();

  // 2. Redirect back to the login page
  window.location.href = "auth.html";
}

/**
 * Updates the user's identity on the server and local state.
 * @param {string} userId - The unique identifier of the user.
 * @param {string} newUsername - The new username string.
 */
async function updateUsername(userId, newUsername) {
  const token = localStorage.getItem("token");
  const currentUser = JSON.parse(localStorage.getItem("user"));

  // Reconstruct the full object as required by your PUT route
  const payload = {
    username: newUsername,
    email: currentUser.email,
    // If password isn't in localStorage, your backend might need
    // a 'password' field or it might fail validation.
    // If you don't store password locally, ensure backend accepts partial PUT.
    password: currentUser.password || "********",
  };

  const url = `http://localhost:3000/auth/${userId}`;
  console.log("Syncing to:", url);

  const response = await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    // Log raw text to see if it's returning HTML (404) or JSON error
    const errorText = await response.text();
    console.error("Server Response:", errorText);
    throw new Error("System Sync Failed. Check console for details.");
  }

  const data = await response.json();

  // Success: Update local storage with new username
  currentUser.username = newUsername;
  localStorage.setItem("user", JSON.stringify(currentUser));

  return data;
}

async function fetchUserSkills() {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  if (!user.id) return [];

  try {
    const response = await fetch(
      `http://localhost:3000/user/${user.id}/skills`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) throw new Error("Failed to fetch skills");

    const skills = await response.json();
    // Store locally for quick access
    localStorage.setItem("userSkills", JSON.stringify(skills));
    return skills;
  } catch (err) {
    console.error("Skill Sync Error:", err);
    return [];
  }
}

/**
 * Redirects the user to the learn page with the specific skill context
 * @param {Object} skillItem - The full skill object from the API array
 */
function openSkill(skillItem) {
  if (!skillItem || !skillItem.skill) return;

  // We store the target content ID and the skill name so learn.html can fetch it
  const learningContext = {
    contentId: skillItem.skill.content, // From your JSON: "6958b23dd06189b9b47bb408"
    skillName: skillItem.skill.name,
    level: skillItem.level,
  };

  localStorage.setItem(
    "activeLearningContext",
    JSON.stringify(learningContext)
  );

  // Redirect to your learning page
  window.location.href = "learn.html";
}

// app.js
function openSkill(item) {
  // 1. Get the course ID stored in the skill's 'content' field
  const courseId = item.skill.content;

  if (!courseId) {
    console.error("No course content found for this skill.");
    return;
  }

  // 2. Store it so learn.html knows what to fetch
  localStorage.setItem("activeCourseId", courseId);

  // 3. Redirect
  window.location.href = "learn.html";
}

function calculateProgress(item) {
  // If completedTopics doesn't exist yet, it's 0%
  if (!item.completedTopics || item.completedTopics.length === 0) return 0;

  // Total topics: Ideally, you'd store 'totalTopics' on the skill object during generation.
  // For now, let's assume a standard course has ~10 topics, or use the dynamic count if available.
  const total = item.totalTopicsCount || 10;
  const progress = Math.round((item.completedTopics.length / total) * 100);

  return progress > 100 ? 100 : progress;
}

// Update your openSkill function to save the Skill ID for progress tracking
function openSkill(item) {
  localStorage.setItem("activeCourseId", item.skill.content); // For loading content
  localStorage.setItem("activeSkillId", item.skill._id); // For saving progress
  window.location.href = "learn.html";
}
