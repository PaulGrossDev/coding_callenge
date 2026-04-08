const client = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

function clearMessageList() {
  const list = document.getElementById("message-list");
  list.innerHTML = "";
}

function formatMessageDate(isoString) {
  if (!isoString) {
    return "";
  }
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  return date.toLocaleString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function addMessageToList(name, content, createdAt) {
  const list = document.getElementById("message-list");
  const li = document.createElement("li");
  const head = document.createElement("div");
  head.className = "message-head";

  const avatar = document.createElement("span");
  avatar.className = "message-avatar";
  avatar.setAttribute("aria-hidden", "true");
  avatar.textContent = getNameInitial(name);

  const title = document.createElement("h3");
  title.className = "message-name";
  const srOnly = document.createElement("span");
  srOnly.className = "sr-only";
  srOnly.textContent = "Nachricht von ";
  title.appendChild(srOnly);
  title.appendChild(document.createTextNode(name));

  head.appendChild(avatar);
  head.appendChild(title);

  const body = document.createElement("p");
  body.textContent = content;

  const timeEl = document.createElement("time");
  const formatted = formatMessageDate(createdAt);
  if (formatted !== "") {
    timeEl.dateTime = createdAt;
    timeEl.textContent = formatted;
    timeEl.className = "message-time";
  }

  li.appendChild(head);
  li.appendChild(body);
  if (formatted !== "") {
    li.appendChild(timeEl);
  }
  list.appendChild(li);
}

function getNameInitial(name) {
  const trimmed = name.trim();
  if (trimmed === "") {
    return "?";
  }
  return trimmed.charAt(0).toUpperCase();
}

async function loadMessages() {
  const list = document.getElementById("message-list");
  clearMessageList();

  const { data, error } = await client
    .from("messages")
    .select("name, content, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    const li = document.createElement("li");
    const p = document.createElement("p");
    p.textContent = "Nachrichten konnten nicht geladen werden.";
    li.appendChild(p);
    list.appendChild(li);
    return;
  }

  if (!data || data.length === 0) {
    return;
  }

  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    addMessageToList(row.name, row.content, row.created_at);
  }
}

async function handleFormSubmit(event) {
  event.preventDefault();

  const nameInput = document.getElementById("name");
  const messageInput = document.getElementById("message");

  const name = nameInput.value.trim();
  const content = messageInput.value.trim();

  if (name === "" || content === "") {
    return;
  }

  const { error } = await client.from("messages").insert({
    name: name,
    content: content,
  });

  if (error) {
    console.error(error);
    alert("Die Nachricht konnte nicht gespeichert werden.");
    return;
  }

  nameInput.value = "";
  messageInput.value = "";
  await loadMessages();
}

document
  .getElementById("message-form")
  .addEventListener("submit", handleFormSubmit);

loadMessages();
