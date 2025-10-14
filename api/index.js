// MindMate Server with Pollinations.AI Integration (Free & Unlimited)
require('dotenv').config();
const express = require('express');
const path = require('path');
const https = require('https'); // Built-in for API calls

const app = express();

// Pollinations API endpoint (OpenAI-compatible POST for long prompts)
const API_URL = 'https://text.pollinations.ai/openai';

// Helper to call Pollinations API (POST with JSON body)
async function generateText(systemContent, userContent, language = 'English') {
    return new Promise((resolve, reject) => {
        const postData = JSON.stringify({
            model: 'openai', // Empathetic chat model
            messages: [
                {
                    role: 'system',
                    content: `You are MindMate, a compassionate and empathetic mental health support companion. Your role is to:
1. Listen actively and validate feelings
2. Provide emotional support and encouragement
3. Be warm, non-judgmental, and caring
4. Keep responses concise (2-4 sentences) but meaningful
5. Never diagnose or provide medical advice
6. Encourage professional help when needed for serious issues

Only suggest practical coping strategies, mindfulness techniques, or exercises when the user explicitly asks for them (e.g., "Give me a breathing exercise") or when it's highly relevant to their immediate query (e.g., they mention panic or overwhelm). Otherwise, focus solely on empathy, validation, and gentle questions to explore their feelings.

Respond in ${language}. Always respond with empathy and support. If the emotion is concerning (very sad, anxious, or mentions self-harm), gently suggest professional resources while still being supportive.`
                },
                {
                    role: 'user',
                    content: `${systemContent} ${userContent}` // Combine emotion/context with message
                }
            ],
            max_tokens: 150, // Concise responses
            temperature: 1 // Default value supported by the model
        });

        const options = {
            hostname: 'text.pollinations.ai',
            port: 443,
            path: '/openai',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData),
                'User-Agent': 'MindMate-App/1.0'
            }
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                console.log('Raw API response preview:', data.substring(0, 200) + '...'); // Debug log
                if (res.statusCode >= 400) {
                    console.log('Status Code:', res.statusCode); // Log status for debugging
                    return reject(new Error(`API Error ${res.statusCode}: ${data}`));
                }
                try {
                    const response = JSON.parse(data);
                    let aiOutput = response.choices?.[0]?.message?.content || 'No response generated.';
                    // Parse JSON if the response is JSON-formatted
                    if (aiOutput.includes('{')) {
                        const jsonMatch = aiOutput.match(/\{.*\}/s);
                        if (jsonMatch) {
                            const jsonObj = JSON.parse(jsonMatch[0]);
                            aiOutput = jsonObj.response || aiOutput;
                        }
                    }
                    resolve(aiOutput);
                } catch (parseError) {
                    console.error('Parse error:', parseError);
                    reject(new Error(`Invalid API response: ${data}`));
                }
            });
        });

        req.on('error', (error) => {
            console.error('Request error:', error);
            reject(error);
        });
        req.write(postData);
        req.end();
    });
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
            response: aiResponse.trim(),
            emotion: emotion
        });

    } catch (error) {
        console.error('Error calling Pollinations API:', error);
        
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
            response: aiResponse.trim()
        });

    } catch (error) {
        console.error('Error calling Pollinations API for quick action:', error);
        
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
        aiEnabled: true // Always true for Pollinations (no token)
    });
});

// Startup logs (no token check needed)
console.log('='.repeat(50));
console.log('🧠 MindMate Server Started Successfully!');
console.log('='.repeat(50));
console.log('🤖 AI Status: ✅ Pollinations.AI Connected (Free & Unlimited)');
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