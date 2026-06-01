import express from 'express';
import cors from 'cors';
import session from 'express-session';
import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env'), override: true });

const app = express();
const port = process.env.PORT || 5000;


app.use(cors({
  origin: true, // Allows all domains to connect
  credentials: true,
}));

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Balosys AI Server is running perfectly! 🚀');
});


app.use(session({
  secret: 'super-secret-compliance-key-1234',
  resave: false,
  saveUninitialized: true,
  cookie: { 
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
  }
}));


const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});


const SYSTEM_PROMPT = "You are a professional compliance advisor. Answer the user's compliance question clearly and concisely.";

app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;


    if (!message || typeof message !== 'string' || message.trim() === '') {
      return res.status(400).json({ error: 'Message is required and must be a non-empty string.' });
    }


    if (!req.session.history) {
      req.session.history = [];
    }


    req.session.history.push({ role: 'user', content: message });


    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');


    const stream = await anthropic.messages.create({
      model: process.env.ANTHROPIC_MODEL || "claude-sonnet-4-6",
      max_tokens: 1024,
      temperature: 0.5,
      system: SYSTEM_PROMPT,
      messages: req.session.history,
      stream: true,
    });

    let assistantFullResponse = '';


    for await (const event of stream) {
      if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
        const textChunk = event.delta.text;
        assistantFullResponse += textChunk;
        

        res.write(`data: ${JSON.stringify({ text: textChunk })}\n\n`);
      }
    }


    req.session.history.push({ role: 'assistant', content: assistantFullResponse });


    res.write(`data: [DONE]\n\n`);
    res.end();

  } catch (error) {
    console.error("Backend Error:", error);

    if (res.headersSent) {
      res.write(`data: ${JSON.stringify({ error: "An internal server error occurred while processing your request." })}\n\n`);
      res.end();
    } else {
      res.status(500).json({ error: 'An internal server error occurred.' });
    }
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
