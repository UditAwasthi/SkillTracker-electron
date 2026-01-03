(async () => {
  const data = await api("/playlist/today");
  const ul = document.getElementById("list");

  data.playlist.items.forEach(item => {
    const li = document.createElement("li");
    li.innerText = item.title;
    ul.appendChild(li);
  });
})();
