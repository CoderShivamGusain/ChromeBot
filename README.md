# ChromeBot

ChromeBot is an intelligent, context-aware Chrome Extension that acts as your personal AI assistant for any web page. It reads the live DOM of the page you are currently viewing and allows you to ask questions about the content using top-tier LLMs (OpenAI, Anthropic, Gemini).

##  Features

- **Live Page Context**: Understands exactly what you are seeing, including dynamic React/Vue apps and authenticated dashboards.
- **Strict Privacy Controls**: Configurable "Sensitive Sites" list that prompts for explicit consent before reading page content on domains like banks or emails.
- **Multi-Provider Support**: Switch seamlessly between OpenAI, Anthropic (Claude), and Google Gemini.
- **Bring Your Own Key**: Securely store your API keys locally in your browser. No middleman backend stores your keys or data.

##  Installation & Setup

ChromeBot consists of two parts: the Chrome Extension (frontend) and a FastAPI server (backend).

### 1. Backend Setup (FastAPI)
The backend acts as a router to handle API requests securely.

1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Install the Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Start the server:
   ```bash
   python main.py
   ```
   *The server will start on `http://localhost:8000`.*

### 2. Extension Setup (Chrome)
1. Open Google Chrome and navigate to `chrome://extensions/`.
2. Toggle **Developer mode** on in the top right corner.
3. Click **Load unpacked** and select the `extension` folder from this repository.
4. Pin the ChromeBot icon to your browser toolbar.

##  Configuration

1. Click the ChromeBot extension icon to open the side panel.
2. Click the  Settings icon.
3. Select your preferred AI Provider and enter your API Key.
4. (Optional) Customize your **Sensitive Sites** list to ensure privacy on personal domains.
5. Click **Save Settings**.

##  Privacy First

ChromeBot reads the *Live DOM*. This means it can read logged-in states (like your Amazon cart). To protect your privacy:
- Your API keys are stored locally in `chrome.storage` and never saved on our backend.
- The extension will **alert you** and ask for permission before reading content on sensitive sites.
