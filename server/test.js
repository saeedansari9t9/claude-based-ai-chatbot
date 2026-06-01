import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';
dotenv.config();

const anthropic = new Anthropic({
  apiKey: "sk-ant-api03-fake-key",
});

async function test() {
  try {
    const stream = await anthropic.messages.create({
      model: 'claude-2.1',
      max_tokens: 1024,
      temperature: 0.5,
      system: "You are a professional compliance advisor.",
      messages: [{ role: 'user', content: 'hey' }],
      stream: true,
    });
    for await (const event of stream) {
      console.log(event);
    }
  } catch (error) {
    console.error("API ERROR:", error);
  }
}
test();
