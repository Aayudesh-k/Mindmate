// MindMate - Mental Health Companion App with OpenAI AI
class MindMate {
    constructor() {
        this.currentLanguage = 'en-US';
        this.conversationHistory = [];
        this.isMuted = false; // Track mute state
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.showWelcomeMessage();
    }

    setupEventListeners() {
        document.getElementById('typeBtn').addEventListener('click', () => this.toggleTextInput());
        document.getElementById('sendBtn').addEventListener('click', () => this.sendTextMessage());
        document.getElementById('textInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendTextMessage();
        });

        // Mute toggle listener
        document.getElementById('muteBtn').addEventListener('click', () => this.toggleMute());

        document.getElementById('language').addEventListener('change', (e) => {
            this.currentLanguage = e.target.value;
        });

        document.querySelectorAll('.action-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.target.getAttribute('data-action');
                this.handleQuickAction(action);
            });
        });
    }

    toggleTextInput() {
        const container = document.getElementById('textInputContainer');
        container.style.display = container.style.display === 'none' ? 'flex' : 'none';
    }

    // Toggle mute with immediate cancel
    toggleMute() {
        this.isMuted = !this.isMuted;
        const btn = document.getElementById('muteBtn');
        if (this.isMuted) {
            // Immediately stop any ongoing speech
            if ('speechSynthesis' in window) {
                speechSynthesis.cancel();
            }
            btn.innerHTML = '<span class="btn-icon">🔇</span>Unmute';
            btn.classList.add('muted');
        } else {
            btn.innerHTML = '<span class="btn-icon">🔊</span>Mute';
            btn.classList.remove('muted');
        }
    }

    sendTextMessage() {
        const input = document.getElementById('textInput');
        const message = input.value.trim();
        
        if (message) {
            this.handleUserInput(message);
            input.value = '';
        }
    }

    async handleUserInput(message) {
        // Add user message to chat
        this.addMessage(message, 'user');
        
        // Show typing indicator
        this.addTypingIndicator();
        
        // Detect emotion
        const emotion = this.detectEmotion(message);
        
        try {
            console.log('Sending to API:', message);
            
            // Call API
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: message,
                    emotion: emotion,
                    language: this.getLanguageName()
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('Received from API:', data);
            
            // Remove typing indicator
            this.removeTypingIndicator();
            
            // Add AI response to chat
            this.addMessage(data.response, 'mindmate');
            
            // Update mood display
            this.updateMoodDisplay(emotion);
            
            // Speak the response (if not muted)
            if (!this.isMuted) {
                this.speak(data.response);
            }
            
            // Save to conversation history
            this.conversationHistory.push({
                user: message,
                assistant: data.response,
                emotion: emotion,
                timestamp: new Date().toISOString()
            });
            
        } catch (error) {
            console.error('Error getting AI response:', error);
            this.removeTypingIndicator();
            
            // Show error message
            const errorMessage = "I'm having trouble connecting right now. Please check that the server is running and try again.";
            this.addMessage(errorMessage, 'mindmate');
            if (!this.isMuted) {
                this.speak(errorMessage);
            }
        }
    }

    addTypingIndicator() {
        const chatContainer = document.getElementById('chatContainer');
        const typingDiv = document.createElement('div');
        typingDiv.className = 'chat-message mindmate typing-indicator';
        typingDiv.id = 'typingIndicator';
        typingDiv.innerHTML = '<span class="dot"></span><span class="dot"></span><span class="dot"></span>';
        chatContainer.appendChild(typingDiv);
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    removeTypingIndicator() {
        const typingIndicator = document.getElementById('typingIndicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    getLanguageName() {
        const languageMap = {
            'en-US': 'English',
            'es-ES': 'Spanish',
            'hi-IN': 'Hindi'
        };
        return languageMap[this.currentLanguage] || 'English';
    }

    // Multilingual emotion detection with improved Hindi support
    detectEmotion(text) {
        const lowerText = text.toLowerCase().trim(); // Normalize
        const langCode = this.currentLanguage.split('-')[0]; // 'en', 'es', 'hi'

        // Keyword maps for each language (expanded Hindi with transliterations)
        const emotionKeywords = {
            en: {
                sad: ['sad', 'depressed', 'down', 'unhappy', 'crying', 'tears', 'miserable', 'lonely', 'hopeless', 'hurt', 'pain', 'heartbroken'],
                anxious: ['anxious', 'worried', 'stress', 'nervous', 'panic', 'fear', 'scared', 'overwhelmed', 'terrified', 'afraid'],
                angry: ['angry', 'mad', 'furious', 'frustrated', 'annoyed', 'irritated', 'rage', 'hate', 'upset'],
                happy: ['happy', 'joy', 'excited', 'great', 'wonderful', 'amazing', 'good', 'awesome', 'fantastic', 'love', 'brilliant'],
                tired: ['tired', 'exhausted', 'drained', 'weary', 'fatigued', 'sleepy', 'burned out'],
                confused: ['confused', 'lost', 'unsure', 'don\'t know', 'uncertain', 'puzzled'],
                grateful: ['grateful', 'thankful', 'blessed', 'appreciate', 'lucky', 'fortunate'],
                calm: ['calm', 'peaceful', 'relaxed', 'serene', 'content', 'tranquil']
            },
            es: {
                sad: ['triste', 'tristeza', 'llorar', 'deprimido', 'desdichado', 'solo', 'desesperado', 'herido', 'dolor', 'corazón roto'],
                anxious: ['ansioso', 'preocupado', 'estrés', 'nervioso', 'pánico', 'miedo', 'asustado', 'abrumado', 'aterrorizado', 'temor'],
                angry: ['enojado', 'enfadado', 'furioso', 'frustrado', 'molesto', 'irritado', 'rabia', 'odio', 'alterado'],
                happy: ['feliz', 'alegría', 'emocionado', 'genial', 'maravilloso', 'asombroso', 'bueno', 'genial', 'fantástico', 'amor', 'brillante'],
                tired: ['cansado', 'exhausto', 'agotado', 'cansino', 'fatigado', 'somnoliento', 'quemado'],
                confused: ['confundido', 'perdido', 'inseguro', 'no sé', 'incierto', 'desconcertado'],
                grateful: ['agradecido', 'agradecimiento', 'bendecido', 'aprecio', 'afortunado', 'afortunado'],
                calm: ['calmado', 'tranquilo', 'relajado', 'sereno', 'contento', 'plácido']
            },
            hi: {
                sad: ['दुख', 'उदास', 'दुखी', 'रोना', 'आंसू', 'निराश', 'अकेला', 'निराशावादी', 'चोट', 'दर्द', 'दिल टूटा', // Native
                    'dukhi', 'udaas', 'rona', 'aansu', 'niraash', 'akele', 'niraashavaadi', 'chot', 'dard', 'dil toota'], // Romanized transliterations
                anxious: ['चिंतित', 'चिंता', 'तनाव', 'नर्वस', 'पैनिक', 'डर', 'भयभीत', 'अधिक भार', 'भयानक', 'भय', // Native
                    'chintit', 'chinta', 'tanav', 'nervas', 'panic', 'dar', 'bhaybheet', 'adhik bhaar', 'bhayaanak', 'bhay'], // Romanized
                angry: ['गुस्सा', 'गुस्से', 'क्रोध', 'नाराज', 'चिढ़', 'क्रोधित', 'घृणा', 'उत्तेजित', // Native
                    'gussa', 'gusse', 'krodh', 'naraaz', 'chidh', 'krodhit', 'ghruna', 'uttejit'], // Romanized
                happy: ['खुश', 'खुशी', 'उत्साहित', 'अद्भुत', 'शानदार', 'असाधारण', 'अच्छा', 'शानदार', 'फैंटास्टिक', 'प्यार', 'उज्ज्वल', // Native
                    'khush', 'khushi', 'utsaahit', 'adbhut', 'shandaar', 'asaadhaaran', 'achcha', 'shandaar', 'fantastic', 'pyaar', 'ujjwal'], // Romanized
                tired: ['थका', 'थकान', 'निकास', 'थकित', 'थकान', 'नींद', 'जला हुआ', // Native
                    'thaka', 'thakaan', 'nikaas', 'thakit', 'thakaan', 'neend', 'jala hua'], // Romanized
                confused: ['भ्रमित', 'खोया', 'अनिश्चित', 'नहीं जानता', 'अनिश्चित', 'हैरान', // Native
                    'bhramit', 'khoya', 'anishchit', 'nahin jaanta', 'anishchit', 'hairaan'], // Romanized
                grateful: ['आभारी', 'कृतज्ञ', 'आशीर्वादित', 'सराहना', 'भाग्यशाली', 'सौभाग्यशाली', // Native
                    'aabhari', 'kritagya', 'aashirvaadit', 'saraahna', 'bhaagyaashali', 'saubhaagyaashali'], // Romanized
                calm: ['शांत', 'शांतिपूर्ण', 'आरामदायक', 'निश्चल', 'संतुष्ट', 'शांत', // Native
                    'shaant', 'shaantipoorna', 'aaraamdaayak', 'nishchal', 'santusht', 'shaant'] // Romanized
            }
        };

        const emotions = ['sad', 'anxious', 'angry', 'happy', 'tired', 'confused', 'grateful', 'calm'];

        for (const emotion of emotions) {
            const keywords = emotionKeywords[langCode]?.[emotion] || emotionKeywords.en[emotion];
            for (const keyword of keywords) {
                if (lowerText.includes(keyword.toLowerCase())) {
                    return emotion;
                }
            }
        }

        return 'neutral';
    }

    // Quick actions now call API
    async handleQuickAction(action) {
        let prompt = '';
        switch (action) {
            case 'breathing':
                prompt = "Generate a simple, guided breathing exercise for stress relief. Keep it 4 steps, easy to follow.";
                break;
            case 'meditation':
                prompt = "Create a short, 1-minute mindfulness meditation script. Focus on present moment awareness.";
                break;
            case 'affirmation':
                // Add variation with random themes
                const themes = ['self-love', 'inner strength', 'gratitude', 'forgiveness', 'courage', 'peace', 'resilience', 'abundance'];
                const randomTheme = themes[Math.floor(Math.random() * themes.length)];
                prompt = `Provide one empowering positive affirmation focused on ${randomTheme}. Make it unique and uplifting, varying from common phrases.`;
                break;
            default:
                return;
        }

        // Add user action to chat
        this.addMessage(`You selected: ${action.replace('-', ' ')}`, 'user');
        
        // Show typing indicator
        this.addTypingIndicator();

        try {
            const response = await fetch('/api/quick-action', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    prompt: prompt,
                    language: this.getLanguageName()
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            // Remove typing indicator
            this.removeTypingIndicator();
            
            // Add AI response to chat
            this.addMessage(data.response, 'mindmate');
            
            // Speak if not muted
            if (!this.isMuted) {
                this.speak(data.response);
            }
            
        } catch (error) {
            console.error('Error getting quick action response:', error);
            this.removeTypingIndicator();
            const errorMessage = "Sorry, I couldn't generate that right now. Let's try chatting instead.";
            this.addMessage(errorMessage, 'mindmate');
            if (!this.isMuted) {
                this.speak(errorMessage);
            }
        }
    }

    speak(text) {
        if (this.isMuted) return; // Skip if muted
        
        if ('speechSynthesis' in window) {
            // Cancel any ongoing speech
            speechSynthesis.cancel();
            
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 0.9;
            utterance.pitch = 1;
            utterance.volume = 0.8;
            
            // Wait for voices to load
            const setVoice = () => {
                const voices = speechSynthesis.getVoices();
                if (voices.length > 0) {
                    utterance.voice = voices.find(voice => voice.lang.startsWith(this.currentLanguage.split('-')[0])) || voices[0];
                }
                speechSynthesis.speak(utterance);
            };

            if (speechSynthesis.getVoices().length > 0) {
                setVoice();
            } else {
                speechSynthesis.onvoiceschanged = setVoice;
            }
        }
    }

    addMessage(text, sender) {
        const chatContainer = document.getElementById('chatContainer');
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${sender}`;
        messageDiv.textContent = text;
        chatContainer.appendChild(messageDiv);
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    updateMoodDisplay(emotion) {
        const moodDisplay = document.getElementById('moodDisplay');
        const moodIcon = moodDisplay.querySelector('.mood-icon');
        const moodText = moodDisplay.querySelector('.mood-text');

        const moodConfig = {
            sad: { icon: '😢', text: 'Feeling sad', color: 'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)' },
            anxious: { icon: '😰', text: 'Feeling anxious', color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
            angry: { icon: '😠', text: 'Feeling angry', color: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' },
            happy: { icon: '😊', text: 'Feeling happy', color: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)' },
            tired: { icon: '😴', text: 'Feeling tired', color: 'linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)' },
            confused: { icon: '😕', text: 'Feeling confused', color: 'linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%)' },
            grateful: { icon: '🙏', text: 'Feeling grateful', color: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)' },
            calm: { icon: '😌', text: 'Feeling calm', color: 'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)' },
            neutral: { icon: '😐', text: 'Feeling neutral', color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }
        };

        const config = moodConfig[emotion] || moodConfig.neutral;
        moodIcon.textContent = config.icon;
        moodText.textContent = config.text;
        moodDisplay.style.background = config.color;
    }

    showWelcomeMessage() {
        const messages = [
            "Welcome! I'm so glad you're here. How are you feeling today?",
            "Hello friend! I'm here to listen and support you. What's on your mind?",
            "Hi there! It's wonderful to connect with you. How can I help you today?",
            "Welcome back! I'm here whenever you need someone to talk to. How are things?"
        ];
        
        const randomMessage = messages[Math.floor(Math.random() * messages.length)];
        
        setTimeout(() => {
            if (!this.isMuted) {
                this.speak(randomMessage);
            }
        }, 1000);
    }
}

// Initialize the app when page loads
document.addEventListener('DOMContentLoaded', () => {
    const mindmate = new MindMate();
    console.log('MindMate AI initialized and ready to support you! 💚');
    console.log('Check browser console for API call logs');
});