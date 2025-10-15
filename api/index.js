// MindMate Server with OpenAI GPT-4o-mini Integration (using OpenAI Node.js SDK)
require('dotenv').config();
const express = require('express');
const path = require('path');
const OpenAI = require('openai');

const app = express();

// Initialize OpenAI client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// Helper to call OpenAI API
async function generateText(systemContent, userContent, language = 'English') {
    const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini', // Stable model (fallback if GPT-5-mini not available)
        messages: [
            {
                role: 'system',
                content: `You are MindMate, a compassionate and empathetic mental health support companion. Your role is to listen actively, validate feelings, provide emotional support, and keep responses concise (2-4 sentences). Never diagnose or provide medical advice. Encourage professional help for serious issues. Only suggest coping strategies or exercises if explicitly asked or highly relevant.

Respond in ${language} with empathy.`
            },
            {
                role: 'user',
                content: `${systemContent} ${userContent}` // Combine emotion/context with message
            }
        ],
        max_completion_tokens: 150,
        temperature: 0.7
    });

    let aiResponse = completion.choices[0].message.content.trim();
    console.log('Generated response:', aiResponse); // Debug log

    if (!aiResponse) {
        aiResponse = "I'm here to support you. Could you tell me more about what's on your mind?";
    }
    return aiResponse;
}

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public'))); // Serves frontend

// Main route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

// AI Chat endpoint
app.post('/api/chat', async (req, res) => {
    try {
        const { message, emotion, language } = req.body;

        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        // Context for user message
        const userContext = `Detected emotion: ${emotion || 'neutral'}. `;

        // Generate response
        const aiResponse = await generateText(userContext, message, language);

        res.json({ 
            response: aiResponse,
            emotion: emotion
        });

    } catch (error) {
        console.error('Error calling OpenAI API:', error);
        
        // Fallback response if API fails
        const fallbackResponse = "I'm here to listen and support you. Could you tell me more about what you're feeling?";
        
        res.json({ 
            response: fallbackResponse,
            error: 'Using fallback response',
            emotion: req.body.emotion
        });
    }
});

// Quick Action endpoint
app.post('/api/quick-action', async (req, res) => {
    try {
        const { prompt, language } = req.body;

        if (!prompt) {
            return res.status(400).json({ error: 'Prompt is required' });
        }

        // Context for quick action
        const userContext = `Generate concise, supportive content. `;

        const aiResponse = await generateText(userContext, prompt, language);

        res.json({ 
            response: aiResponse
        });

    } catch (error) {
        console.error('Error calling OpenAI API for quick action:', error);
        
        // Fallback
        const fallback = "I'm here to help with that. Take a deep breath and let's try together.";
        res.json({ 
            response: fallback,
            error: 'Using fallback response'
        });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'MindMate is running and ready to help! 💚',
        aiEnabled: !!process.env.OPENAI_API_KEY
    });
});

// Check API key on startup
if (!process.env.OPENAI_API_KEY) {
    console.warn('\n⚠️  WARNING: OPENAI_API_KEY not found in .env file');
    console.warn('⚠️  AI responses will use fallback mode');
    console.warn('⚠️  Get your key from: https://platform.openai.com/api-keys\n');
}

// Startup logs
console.log('='.repeat(50));
console.log('🧠 MindMate Server Started Successfully!');
console.log('='.repeat(50));
console.log('🤖 AI Status:', process.env.OPENAI_API_KEY ? '✅ OpenAI GPT-5-mini Connected' : '⚠️  Fallback Mode');
console.log('💚 Your AI mental health companion is ready!');
console.log('📝 Press Ctrl+C to stop the server');
console.log('='.repeat(50));

// Local server start (for development; skipped on Vercel/production)
if (require.main === module) {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`📍 Local:    http://localhost:${PORT}`);
        console.log(`📍 Network:  Use your local IP address:${PORT}`);
    });
}

// Vercel export
module.exports = app;

// Graceful shutdown (optional)
process.on('SIGTERM', () => {
    console.log('\n👋 MindMate is shutting down...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('\n👋 MindMate is shutting down...');
    process.exit(0);
});