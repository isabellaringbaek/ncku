// Front-end logic for the AI Persona demo.
//
// This file runs in the browser. Its main jobs are:
// 1. find and update HTML elements,
// 2. load Persona data from the server,
// 3. send interview questions to the server,
// 4. display the conversation and interface states.

// querySelector() finds an element in index.html using a CSS selector.
// Keeping these references here makes it easy to update the interface later.
const form = document.querySelector("#chatForm");
const input = document.querySelector("#promptInput");
const sendButton = document.querySelector("#sendButton");
const conversation = document.querySelector("#conversation");
const portrait = document.querySelector("#personaPortrait");
const status = document.querySelector("#personaStatus");
const statusText = document.querySelector("#statusText");
const personaName = document.querySelector("#persona-name");
const personaMeta = document.querySelector("#personaMeta");
const personaSummary = document.querySelector("#personaSummary");
const initialAvatar = document.querySelector("#initialAvatar");
const initialAuthor = document.querySelector("#initialAuthor");
const initialMessage = document.querySelector("#initialMessage");

const chatHistoryKey = "ai-persona-chat-history-v1";

// These variables hold data that is loaded after the page starts.
// "let" is used because their values will change later.
let persona = null;
let personaImage = "";
let chatHistory = [];
let memoryWarning = "";

// Move the conversation window to the newest message.
function scrollToLatest() {
  conversation.scrollTop = conversation.scrollHeight;
}

// Automatically grow the textarea as the user types, up to 140 px.
function resizeInput() {
  input.style.height = "auto";
  input.style.height = `${Math.min(input.scrollHeight, 140)}px`;
}

// Create one chat message using DOM elements rather than inserting raw HTML.
// The function receives one object argument and uses destructuring to read it.
function createMessage({ author, text, type, thinking = false }) {
  const row = document.createElement("article");
  row.className = `message-row ${type}-message-row`;

  // Persona messages include an avatar. User messages do not.
  if (type === "persona") {
    const avatar = document.createElement("img");
    avatar.className = "message-avatar";
    avatar.src = personaImage;
    avatar.alt = "";
    row.appendChild(avatar);
  }

  const block = document.createElement("div");
  block.className = "message-block";

  const authorLabel = document.createElement("span");
  authorLabel.className = "message-author";
  authorLabel.textContent = author;

  const bubble = document.createElement("div");
  bubble.className = `message-bubble ${type === "persona" ? "persona-bubble" : "user-bubble"}`;
  if (thinking) bubble.classList.add("thinking-bubble");

  // textContent displays text safely without interpreting it as HTML.
  bubble.textContent = text;

  block.append(authorLabel, bubble);
  row.appendChild(block);
  conversation.appendChild(row);
  scrollToLatest();

  // Return references so the caller can update this message later.
  return { row, bubble };
}

// Update the interface while a request is waiting for the AI response.
function setThinking(isThinking) {
  status.classList.toggle("is-thinking", isThinking);
  statusText.textContent = isThinking
    ? `${persona?.name || "Persona"} is thinking...`
    : memoryWarning || "Ready to chat";

  // Disable input while one request is being processed.
  input.disabled = isThinking;
  sendButton.disabled = isThinking;
}

function readChatHistory() {
  const storedHistory = sessionStorage.getItem(chatHistoryKey);
  if (!storedHistory) return [];

  const parsedHistory = JSON.parse(storedHistory);
  const isValid =
    Array.isArray(parsedHistory) &&
    parsedHistory.length % 2 === 0 &&
    parsedHistory.every((message, index) => {
      const expectedRole = index % 2 === 0 ? "user" : "assistant";
      return (
        message !== null &&
        typeof message === "object" &&
        message.role === expectedRole &&
        typeof message.content === "string" &&
        message.content.trim().length > 0
      );
    });

  if (!isValid) {
    throw new Error("Saved chat history has an invalid format.");
  }

  return parsedHistory;
}

function saveChatHistory(history) {
  try {
    sessionStorage.setItem(chatHistoryKey, JSON.stringify(history));
    memoryWarning = "";
  } catch (error) {
    console.error("Could not save chat history for this tab:", error);
    memoryWarning = "Reply received, but this tab could not save its memory.";
  }
}

// Load the public Persona profile from our own Express server.
// fetch() is the browser API used for HTTP requests.
async function loadPersona() {
  const response = await fetch("/api/persona");

  if (!response.ok) {
    throw new Error("Could not load persona profile.");
  }

  // response.json() converts the JSON response into a JavaScript object.
  persona = await response.json();
  personaImage = persona.image;

  // Fill the interface with data received from the Persona JSON on the server.
  document.title = `AI Persona — ${persona.name}`;
  personaName.textContent = persona.name;
  personaMeta.textContent = `${persona.age} years old · ${persona.job}`;
  personaSummary.textContent = `${persona.personality}. Interests: ${persona.interests.join(", ")}.`;

  portrait.src = personaImage;
  portrait.alt = `Portrait of ${persona.name}`;
  initialAvatar.src = personaImage;
  initialAuthor.textContent = persona.name;
  initialMessage.textContent = `Oh, it's you. I'm ${persona.name}. Ask something worth explaining.`;

  try {
    chatHistory = readChatHistory();
  } catch (error) {
    console.error("Could not restore chat history for this tab:", error);
    statusText.textContent = "Memory unavailable";
    initialMessage.textContent =
      "I couldn't restore this tab's saved conversation. Close and reopen the tab to start a new conversation.";
    return;
  }

  for (const message of chatHistory) {
    createMessage({
      author: message.role === "user" ? "You" : persona.name,
      text: message.content,
      type: message.role === "user" ? "user" : "persona",
    });
  }

  input.placeholder = `Ask ${persona.name} something...`;
  statusText.textContent = "Ready to chat";
  input.disabled = false;
  sendButton.disabled = false;
  input.focus();
}

// Send one interview question to the backend and display the response.
async function submitPrompt() {
  const prompt = input.value.trim();

  // Stop if the prompt is empty, a request is already running,
  // or Persona data has not finished loading.
  if (!prompt || sendButton.disabled || !persona) return;

  createMessage({ author: "You", text: prompt, type: "user" });

  input.value = "";
  resizeInput();
  setThinking(true);

  // Add a temporary message that will later be replaced by the AI response.
  const thinkingMessage = createMessage({
    author: persona.name,
    text: "Thinking...",
    type: "persona",
    thinking: true,
  });
  const messages = [...chatHistory, { role: "user", content: prompt }];

  try {
    // POST sends data to the server. JSON.stringify() converts a JavaScript
    // object into JSON text for the HTTP request body.
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ messages }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Chat request failed.");
    }

    if (typeof data.response !== "string" || !data.response.trim()) {
      throw new Error("The Agent returned an empty response.");
    }

    // Replace the temporary Thinking message with the real Agent response.
    thinkingMessage.bubble.classList.remove("thinking-bubble");
    thinkingMessage.bubble.textContent = data.response;

    chatHistory = [...messages, { role: "assistant", content: data.response }];
    saveChatHistory(chatHistory);
  } catch (error) {
    // Network errors and server errors are both handled here.
    thinkingMessage.bubble.classList.remove("thinking-bubble");
    thinkingMessage.bubble.textContent = `Sorry, I couldn’t respond just now. ${error.message}`;
  } finally {
    // finally runs whether the request succeeded or failed.
    setThinking(false);
    input.focus();
    scrollToLatest();
  }
}

// Prevent the browser's normal form submission and use our JavaScript function.
form.addEventListener("submit", (event) => {
  event.preventDefault();
  submitPrompt();
});

// Resize the textarea whenever its content changes.
input.addEventListener("input", resizeInput);

// Enter sends a message. Shift + Enter keeps the normal newline behavior.
input.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    form.requestSubmit();
  }
});

// The interface starts disabled because Persona data has not loaded yet.
input.disabled = true;
sendButton.disabled = true;

// Start loading Persona data as soon as this script runs.
// If loading fails, show the error in the interface instead of crashing silently.
loadPersona().catch((error) => {
  statusText.textContent = "Persona unavailable";
  initialMessage.textContent = error.message;
});
