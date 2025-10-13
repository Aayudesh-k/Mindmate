# MindMate🧠 **Your Personal AI Mental Health Companion**

An offline-capable web app that listens to your voice or text, detects emotions, and provides empathetic support using Google's Gemini AI. Built for the Gemma 3n Hackathon, it's multilingual (English, Spanish, Hindi) and focuses on quick, caring interactions.

![MindMate Demo](https://mindmate-jh1lmdots-aayudesh-kaparthis-projects.vercel.app/) ---

## ✨ Features

- **Voice & Text Chat**: Speak or type to MindMate – it responds with tailored, empathetic advice.
- **Emotion Detection**: Analyzes your input for feelings like sadness, anxiety, or joy (works in **English, Spanish, Hindi**).
- **Quick Support Actions**: One-click for AI-generated **breathing exercises, meditations, or positive affirmations** (varied themes for freshness).
- **Multilingual**: Switch languages seamlessly; responses adapt via Gemini.
- **Mute Toggle**: Silence voice output instantly (e.g., for public use).
- **Mood Display**: Visual feedback on detected emotions with calming gradients.
- **Offline-Friendly**: Core UI works without net; AI needs connection.
- **Clean UI**: Responsive design, dropdown for mood history (non-tracking version).

**Note**: Not a substitute for professional help – encourages seeking experts when needed.

---

## 🛠 Tech Stack

- **Frontend**: Vanilla JavaScript, HTML, CSS (no frameworks for lightweight).
- **Backend**: Node.js with Express.js.
- **AI**: Google **Gemini API** (`generative-ai` library).
- **Deployment**: Vercel (serverless).
- **Other**: Web Speech API (recognition/synthesis), `dotenv` for env vars.

---

## 🚀 Quick Start (Local)

1.  **Clone the Repo**:
    ```bash
    git clone [https://github.com/Aayudesh-k/Mindmate.git](https://github.com/Aayudesh-k/Mindmate.git)
    cd Mindmate
    ```

2.  **Install Dependencies**:
    ```bash
    npm install
    ```

3.  **Set Up API Key**:
    -   Create `.env` in root:
        ```bash
        GEMINI_API_KEY=your_gemini_key_here
        ```
    -   Get key from [Google AI Studio](https://aistudio.google.com/app/apikey).

4.  **Run Locally**:
    ```bash
    npm start
    ```
    -   Open [http://localhost:3000](http://localhost:3000).

5.  **Test**:
    -   Click "Start Talking" or type a message.
    -   Try quick actions like "Breathing Exercise".

---

## 📱 Usage

-   **Chat**: Voice (🎤) or text (⌨️) – MindMate detects emotion and responds.
-   **Quick Actions**: Buttons for instant AI-guided support.
-   **Language**: Dropdown to switch (updates speech/recognition).
-   **Mute**: Toggle 🔊/🔇 to silence responses mid-flow.
-   **Mood Journey**: Collapsed dropdown shows recent detected moods (no persistent tracking).

For production, deploy to Vercel (see below).

---

## ☁️ Deployment (Vercel)

1.  **Connect GitHub Repo** to [Vercel](https://vercel.com).
2.  **Add Env Var**: In Vercel Dashboard > Settings > Environment Variables:
    -   `GEMINI_API_KEY`: Your key.
3.  **Deploy**: Auto-builds on push. Get URL like `mindmate.vercel.app`.
**Custom Domain**: Add in Vercel > Settings > Domains.

---

## 🔧 Development

-   **Scripts**:
    -   `npm start`: Run server.
    -   `npm dev`: Alias for start.
-   **Folder Structure**:
    ```
    Mindmate/
    ├── api/          # Serverless backend (index.js)
    ├── public/       # Frontend (app.js, index.html, styles.css)
    ├── .env          # Secrets (gitignored)
    ├── package.json
    ├── vercel.json   # Vercel config
    └── README.md
    ```
-   **Browser Support**: Chrome/Edge for speech features.

---

## 🤝 Contributing

1.  Fork the repo.
2.  Create a branch: `git checkout -b feature/amazing-feature`.
3.  Commit: `git commit -m "Add amazing feature"`.
4.  Push: `git push origin feature/amazing-feature`.
5.  Open a Pull Request.

**Ideas**: Add more languages, emotion visuals, or PWA offline mode?

---

## ⚠️ Disclaimer

MindMate offers supportive chats but **is not medical advice**. For serious issues, contact professionals (e.g., hotlines like **988 in US**).

---

## 📄 License

ISC License – See [LICENSE](LICENSE) (or add one).

---

## 🙏 Acknowledgments

-   Built with ❤️ for mental health awareness.
-   Powered by [Google Gemini](https://ai.google.dev).

**Questions?** Open an issue or chat in the repo. 💚

***Last Updated: October 13, 2025***
