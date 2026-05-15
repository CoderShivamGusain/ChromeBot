const providerEl = document.getElementById('provider');
const modelEl = document.getElementById('model');
const apiKeyEl = document.getElementById('api-key');
const sensitiveSitesEl = document.getElementById('sensitive-sites');
const saveBtn = document.getElementById('save-btn');
const saveMsg = document.getElementById('save-msg');
const deleteBtn = document.getElementById('delete-btn');
const deleteMsg = document.getElementById('delete-msg');

// Load existing
chrome.storage.sync.get(['provider', 'model', 'apiKey', 'sensitiveSites'], (res) => {
  if (res.provider) providerEl.value = res.provider;
  if (res.model) modelEl.value = res.model;
  if (res.apiKey) apiKeyEl.value = res.apiKey;
  if (res.sensitiveSites) {
    sensitiveSitesEl.value = res.sensitiveSites.join('\n');
  } else {
    sensitiveSitesEl.value = "mail.google.com\ngithub.com\nbank.com";
  }
});

saveBtn.addEventListener('click', () => {
  const sites = sensitiveSitesEl.value.split('\n').map(s => s.trim()).filter(s => s);
  chrome.storage.sync.set({
    provider: providerEl.value,
    model: modelEl.value,
    apiKey: apiKeyEl.value,
    sensitiveSites: sites
  }, () => {
    saveMsg.style.display = 'inline';
    // Auto-close the settings page after 1.5 seconds
    setTimeout(() => {
      saveMsg.style.display = 'none';
      window.close();
    }, 1500);
  });
});

deleteBtn.addEventListener('click', () => {
  chrome.storage.sync.remove('apiKey', () => {
    apiKeyEl.value = '';
    deleteMsg.style.display = 'inline';
    setTimeout(() => deleteMsg.style.display = 'none', 3000);
  });
});
