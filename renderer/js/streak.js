async function checkIn() {
  const res = await api("/user/streak/check-in", "POST");
  alert(res.message);
}
