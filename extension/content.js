function extractPageContent() {
  const clone = document.body.cloneNode(true);
  
  // Remove noise
  const noiseSelectors = ['nav', 'footer', 'script', 'style', 'iframe', 'noscript', 'header', 'aside'];
  noiseSelectors.forEach(selector => {
    const elements = clone.querySelectorAll(selector);
    elements.forEach(el => el.remove());
  });

  return {
    title: document.title,
    url: window.location.href,
    content: clone.innerText.substring(0, 15000), // Limit context size
    selectedText: window.getSelection().toString()
  };
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "EXTRACT_DOM") {
    sendResponse(extractPageContent());
  }
});
