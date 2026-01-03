async function logProgress() {
  await api("/progress/log", "POST", {
    skillId: "PUT_SKILL_ID",
    completionRate: 50,
    timeSpent: 30
  });
  alert("Progress logged");
}
