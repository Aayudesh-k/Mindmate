// MindMate Server with Gemini AI Integration
require('dotenv').config();
const express = require('express');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
// const PORT = process.env.PORT || 3000; // Remove this

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public'))); // Updated path

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

        // Create system prompt for mental health support
        const systemPrompt = `You are MindMate, a compassionate and empathetic mental health support companion. Your role is to:

1. Listen actively and validate feelings
2. Provide emotional support and encouragement
3. Offer practical coping strategies and mindfulness techniques
4. Be warm, non-judgmental, and caring
5. Keep responses concise (2-4 sentences) but meaningful
6. Never diagnose or provide medical advice
7. Encourage professional help when needed for serious issues

Current detected emotion: ${emotion || 'neutral'}
User's preferred language: ${language || 'English'}

Respond with empathy and support. If the emotion is concerning (very sad, anxious, or mentions self-harm), gently suggest professional resources while still being supportive.`;

        // Get the generative model
        const model = genAI.getGenerativeModel({ 
            model: "gemini-2.0-flash-exp",
            systemInstruction: systemPrompt
        });

        // Generate response
        const result = await model.generateContent(message);
        const response = result.response;
        const aiResponse = response.text();

        res.json({ 
            response: aiResponse,
            emotion: emotion
        });

    } catch (error) {
        console.error('Error calling Gemini API:', error);
        
        // Fallback response if API fails
        const fallbackResponse = "I'm here to listen and support you. Could you tell me more about what you're feeling?";
        
        res.json({ 
            response: fallbackResponse,
            error: 'Using fallback response',
            emotion: req.body.emotion
        });
    }
});

// Quick Action endpoint for Gemini-generated content
app.post('/api/quick-action', async (req, res) => {
    try {
        const { prompt, language } = req.body;

        if (!prompt) {
            return res.status(400).json({ error: 'Prompt is required' });
        }

        // System prompt for quick actions
        const systemPrompt = `You are MindMate, a compassionate mental health companion. Generate helpful, concise content based on the user's request. Keep it supportive and positive. User's language: ${language || 'English'}.`;

        const model = genAI.getGenerativeModel({ 
            model: "gemini-2.0-flash-exp",
            systemInstruction: systemPrompt
        });

        const result = await model.generateContent(prompt);
        const response = result.response;
        const aiResponse = response.text();

        res.json({ 
            response: aiResponse
        });

    } catch (error) {
        console.error('Error calling Gemini API for quick action:', error);
        
        // Fallback based on prompt type (basic)
        let fallback = "I'm here to help with that. Take a deep breath and let's try together.";
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
        aiEnabled: !!process.env.GEMINI_API_KEY
    });
});

// Check API key on startup
if (!process.env.GEMINI_API_KEY) {
    console.warn('\n⚠️  WARNING: GEMINI_API_KEY not found in .env file');
    console.warn('⚠️  AI responses will use fallback mode');
    console.warn('⚠️  Get your API key from: https://aistudio.google.com/app/apikey\n');
}

// Start server (REMOVED for Vercel - it handles this)

// Graceful shutdown (keep for logs, but optional)
process.on('SIGTERM', () => {
    console.log('\n👋 MindMate is shutting down...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('\n👋 MindMate is shutting down...');
    process.exit(0);
});

// Vercel export
module.exports = app;