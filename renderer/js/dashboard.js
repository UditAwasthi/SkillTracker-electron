(async () => {
  const data = await api("/user/dashboard");
  document.getElementById("streak").innerText =
    data.streakData.currentStreak;
})();
