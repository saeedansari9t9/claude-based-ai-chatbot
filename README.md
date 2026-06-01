# Balosys Compliance Advisor

A full-stack secure test application using React (Vite + Tailwind CSS) and an Express backend, powered by the Anthropic Claude API.

## Project Structure

- `/client` - The React Vite frontend with Tailwind CSS.
- `/server` - The Node.js Express backend.

## Security Requirements Achieved

- **Server-Side System Prompt:** The system prompt is kept entirely on the server inside `server/index.js` and is never sent to or visible in the frontend.
- **Secure API Key Handling:** The Anthropic API Key is kept entirely on the server using environment variables (`.env`).
- **Clean Network Payloads:** The frontend only sends the user's message payload to the server and receives streamed chunks of text in response, keeping internal logic obscured.

## How to Run the Application

### 1. Backend Setup

1. Open a terminal and navigate to the `server` directory:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file from the example:
   ```bash
   cp .env.example .env
   ```
4. **Important:** Edit `.env` and add your real Anthropic API key to the `ANTHROPIC_API_KEY` variable.
5. Start the server:
   ```bash
   node index.js
   ```
   *The server will run on http://localhost:5000*

### 2. Frontend Setup

1. Open a new terminal and navigate to the `client` directory:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *The frontend will run on http://localhost:5173*

## Security Verification

To verify that the system prompt and API keys are not leaked:

1. Open the application in your browser (`http://localhost:5173`).
2. Open the Browser DevTools (F12 or Right Click -> Inspect).
3. Navigate to the **Network** tab.
4. Send a test message in the chat interface.
5. Find the `chat` request in the Network tab:
   - Check the **Payload** (or Request) section: you will see it only contains `{"message":"your message"}`.
   - Check the **Response** section: you will see only the SSE data chunks of the response text, with no internal prompts or keys exposed.
