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
    const token = localStorage.getItem('token');
    
    const response = await fetch('http://localhost:3000/content', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ topicName: topic })
    });

    const data = await response.json();

    if (response.ok) {
        // Save the full course object for offline access
        localStorage.setItem('activeCourse', JSON.stringify(data.course));
        window.location.href = 'learn.html';
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
    const token = localStorage.getItem('token');
    const currentUser = JSON.parse(localStorage.getItem('user'));

    // Reconstruct the full object as required by your PUT route
    const payload = {
        username: newUsername,
        email: currentUser.email,
        // If password isn't in localStorage, your backend might need 
        // a 'password' field or it might fail validation. 
        // If you don't store password locally, ensure backend accepts partial PUT.
        password: currentUser.password || "********" 
    };

    const url = `http://localhost:3000/auth/${userId}`;
    console.log("Syncing to:", url);

    const response = await fetch(url, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
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
    localStorage.setItem('user', JSON.stringify(currentUser));

    return data;
}