async function load() {
  const skills = await api("/skills");
  const ul = document.getElementById("list");
  ul.innerHTML = "";

  skills.forEach(s => {
    const li = document.createElement("li");
    li.innerText = s.name;
    ul.appendChild(li);
  });
}

async function addSkill() {
  const name = document.getElementById("skill").value;
  await api("/skills", "POST", { name });
  load();
}

load();
