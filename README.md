# 🎓 Student Voice Mood & Study Assistant

> **“Understand your mood. Improve your study. Let AI guide you.”**  
> *“Your mood. Your voice. Your study journey.”*

An AI-powered academic wellness and personalized study optimization platform. It combines real-time speech acoustic analysis, natural language emotion detection, and cognitive study strategies to help students navigate academic pressure and achieve peak focus.

---

## 🌟 Key Features & Modules

### 1. 🎙️ Real-Time Voice Emotion Analysis
- Captures live student speech using the browser **Web Speech API** and **MediaRecorder API**.
- Real-time **Web Audio API** frequency/waveform visualizer.
- Speech-to-text transcription with live editable adjustments.
- Acoustic and lexical sentiment classification into 8 emotional spectra.

### 2. 📝 Natural Language Text Sentiment Engine
- Intuitive prompt chips for instant demo scenarios (*Exam Overwhelmed, Exhausted, Energized, Frustrated, etc.*).
- Deep lexicon sentiment analyzer detecting academic pressure keywords, emotional valence, and stress indices.
- Transparent *"What the AI Noticed"* diagnostic breakdown explaining the linguistic reasoning.

### 3. 📊 Emotion & Cognitive Diagnostic Report
- Circular confidence progress gauge (75%–96% confidence scale).
- Multi-dimensional metrics: **Valence / Positivity**, **Stress Index**, and **Energy Level**.
- Disclaimers highlighting responsible, supportive AI estimation.

### 4. 💡 Adaptive Personalized Study Suggestions
- Dynamically tailored study protocols for each mood:
  - **Stressed:** 4-7-8 parasympathetic reset, micro-tasking, low-pressure 15m intervals.
  - **Tired:** Power nap recommendations, active flashcard recall over passive reading, hydration.
  - **Happy:** High-energy *"Eat the Frog"* strategy, 50m deep work sprints, practice problems.
  - **Calm:** Standard 25/5 Pomodoro, Feynman technique, structured syllabus mapping.
  - **Sad:** Low-friction wins, outdoor walk, study buddy audio.
  - **Angry:** Physical adrenaline release, subject switching, blocker identification.
  - **Anxious:** Brain dump exercises, 1-page formula summaries, timed mock quizzes.
- **One-Click Timer Sync:** Automatically sets the Pomodoro timer to the recommended interval.

### 5. 🤖 24/7 AI Study Assistant (Chatbot)
- Context-aware student tutor synced with the student's current detected mood.
- Instant guidance for exam preparation, 2-hour study plans, concentration tips, and the Feynman technique.
- Realistic typing animation, voice input button, and **Text-to-Speech (TTS)** voice output.

### 6. 📈 Mood & Study Analytics Dashboard
- **Chart.js** 7-day mood & stress timeline and mood distribution doughnut chart.
- Key metric cards: Total Check-Ins, Dominant Mood, Avg Confidence, and Pomodoros Completed.
- **LocalStorage** persistence, CSV/JSON data export, and demo week loader.

### 7. ⏱️ Built-in Pomodoro Study Timer & Ambient Soundscape
- 4 Modes: **Focus (25m)**, **Short Break (5m)**, **Long Break (15m)**, and **Deep Block (50m)**.
- Animated SVG progress ring with millisecond precision.
- Pure **Web Audio API Synthesizer** generating gentle end-of-session chimes and focus soundscapes:
  - 40Hz Alpha / Gamma binaural beat.
  - Pink rain noise.
  - Cosmic drone.

### 8. 🌬️ Guided 4-7-8 Parasympathetic Breathing Break
- Interactive expanding/contracting breathing visualizer with real-time countdown for rapid nervous system calming.

---

## 🎨 Design & Aesthetics
- **Color Palette:** Deep Space Obsidian (`#07070d`, `#0e101f`), Cyber Pink (`#ec4899`), Neon Purple (`#8b5cf6`), and Electric Cyan (`#06b6d4`).
- **Glassmorphism:** Multi-layered blurred backdrops with subtle border glowing highlights.
- **Canvas Visuals:** Interactive background particle/star field and 3D rotating AI neural orb.
- **Typography:** Google Fonts (*Outfit*, *Plus Jakarta Sans*, and *JetBrains Mono*).
- **Responsive:** Optimized for ultra-wide desktop monitors, laptops, tablets, and smartphones.

---

## 🚀 How to Run Locally

### Option 1: Direct Browser
Simply double-click or open `index.html` in Google Chrome, Microsoft Edge, Brave, or Firefox.

### Option 2: Local HTTP Server (Recommended for Microphone & Speech API)
```bash
# Using Python
python -m http.server 8080

# Using Node.js
npx serve .
```
Then navigate to `http://localhost:8080` in your web browser.

---

## ⌨️ Keyboard Shortcuts
- <kbd>Alt</kbd> + <kbd>V</kbd> : Jump to Voice Analysis
- <kbd>Alt</kbd> + <kbd>T</kbd> : Jump to Text Analysis
- <kbd>Alt</kbd> + <kbd>C</kbd> : Open AI Chatbot
- <kbd>Alt</kbd> + <kbd>P</kbd> : Jump to Pomodoro Timer
- <kbd>Alt</kbd> + <kbd>B</kbd> : Open Guided Breathing Break

---

## 🛠️ Technology Stack
- **HTML5 & CSS3:** Semantic structure, CSS custom properties, keyframe animations, glassmorphism.
- **Vanilla JavaScript (ES6+):** Modular architecture, zero heavy external framework dependencies.
- **Web Speech API:** Real-time speech recognition & SpeechSynthesis text-to-speech.
- **Web Audio API:** Real-time live microphone waveform analyzer & tone synthesizers.
- **Chart.js:** Responsive data visualization for mood and stress analytics.
- **LocalStorage:** Secure browser-side client data persistence.
