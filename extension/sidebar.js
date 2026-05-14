const chatContainer = document.getElementById('chat-container');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const settingsBtn = document.getElementById('settings-btn');

const privacyModal = document.getElementById('privacy-modal');
const sensitiveDomainSpan = document.getElementById('sensitive-domain');
const btnSendContext = document.getElementById('btn-send-context');
const btnSendNoContext = document.getElementById('btn-send-no-context');
const btnCancel = document.getElementById('btn-cancel');

let currentDomain = "";
let pendingMessage = "";
let sensitiveSites = ["mail.google.com", "github.com", "bank.com"]; // Defaults

// Load settings
chrome.storage.sync.get(['sensitiveSites'], (res) => {
  if (res.sensitiveSites) {
    sensitiveSites = res.sensitiveSites;
  }
});

settingsBtn.addEventListener('click', () => {
  chrome.tabs.create({ url: 'settings.html' });
});

userInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    handleSend();
  }
});

sendBtn.addEventListener('click', handleSend);

async function handleSend() {
  const text = userInput.value.trim();
  if (!text) return;

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab || !tab.url) return;
  
  const url = new URL(tab.url);
  currentDomain = url.hostname;
  pendingMessage = text;

  // Check if site is sensitive
  if (sensitiveSites.some(site => currentDomain.includes(site))) {
    sensitiveDomainSpan.textContent = currentDomain;
    privacyModal.classList.remove('hidden');
  } else {
    // Not sensitive, send with context automatically
    await sendMessage(true);
  }
}

btnSendContext.addEventListener('click', async () => {
  privacyModal.classList.add('hidden');
  await sendMessage(true);
});

btnSendNoContext.addEventListener('click', async () => {
  privacyModal.classList.add('hidden');
  await sendMessage(false);
});

btnCancel.addEventListener('click', () => {
  privacyModal.classList.add('hidden');
  pendingMessage = "";
});

function appendMessage(text, sender) {
  const div = document.createElement('div');
  div.className = `message ${sender}`;
  div.textContent = text;
  chatContainer.appendChild(div);
  chatContainer.scrollTop = chatContainer.scrollHeight;
  return div;
}

async function sendMessage(includeContext) {
  const text = pendingMessage;
  userInput.value = '';
  appendMessage(text, 'user');
  
  const botMessageEl = appendMessage("Thinking...", 'bot');

  let pageContent = "";
  let settings = await chrome.storage.sync.get(['provider', 'apiKey', 'model']);
  
  if (!settings.apiKey) {
    botMessageEl.textContent = "Please set your API key in the settings first.";
    return;
  }

  if (includeContext) {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    try {
      const response = await chrome.tabs.sendMessage(tab.id, { action: "EXTRACT_DOM" });
      if (response && response.content) {
        pageContent = response.content;
      }
    } catch (e) {
      console.warn("Could not extract DOM:", e);
      pageContent = "Could not read page content. Maybe it's a restricted Chrome URL.";
    }
  } else {
    pageContent = "No page content provided (User opted out for privacy).";
  }

  try {
    const res = await fetch('http://localhost:8000/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_message: text,
        page_content: pageContent,
        provider: settings.provider || 'openai',
        api_key: settings.apiKey,
        model: settings.model || 'gpt-4o-mini'
      })
    });

    if (!res.ok) throw new Error("API Error");

    const reader = res.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let botReply = "";
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      botReply += chunk;
      botMessageEl.textContent = botReply;
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  } catch (error) {
    botMessageEl.textContent = "Error: Could not connect to backend. Make sure the FastAPI server is running.";
  }
}
