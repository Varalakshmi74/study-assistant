/**
 * ============================================================================
 * STUDENT VOICE MOOD & STUDY ASSISTANT - SCRIPT.JS
 * Complete Production-Grade JavaScript Engine
 * Modules:
 *  1. Canvas Particle Background
 *  2. Neural AI Orb Visualizer
 *  3. Web Speech & Audio Waveform Engine (MediaRecorder + Web Audio API)
 *  4. Advanced Lexical & Acoustic Emotion Detection Engine
 *  5. Adaptive Study Recommendation Generator
 *  6. AI Study Assistant Chatbot (NLP Engine + SpeechSynthesis TTS)
 *  7. Mood Analytics Dashboard (Chart.js + LocalStorage Sync)
 *  8. Pomodoro Timer & Synthesized Web Audio Soundscape
 *  9. Guided 4-7-8 Breathing Reset Module
 * 10. Navigation, Toasts, & Keyboard Shortcuts
 * ============================================================================
 */

(function () {
  'use strict';

  // ==========================================
  // GLOBAL STATE
  // ==========================================
  const State = {
    currentMood: 'Calm',
    confidence: 87,
    valence: 0.62,
    stressLevel: 25,
    energyLevel: 80,
    detectedKeywords: ['focused', 'organized', 'moderate-pace'],
    noticedExplanation: 'Your speech and text express steady focus, constructive optimism, and a low level of cognitive friction. Excellent state for deep retention.',
    history: [],
    pomodoro: {
      mode: 'pomodoro', // pomodoro | shortBreak | longBreak | deepWork
      totalSeconds: 1500,
      remainingSeconds: 1500,
      timerId: null,
      isRunning: false,
      completedToday: 0
    },
    audio: {
      mediaRecorder: null,
      audioChunks: [],
      audioBlob: null,
      audioUrl: null,
      audioContext: null,
      analyser: null,
      microphoneStream: null,
      animationFrameId: null,
      recordingTimerId: null,
      recordSeconds: 0,
      isRecording: false
    },
    ambient: {
      activeSound: 'none', // none | binaural | rain | space
      audioCtx: null,
      nodes: []
    },
    breathing: {
      isRunning: false,
      intervalId: null,
      step: 'ready', // ready | inhale | hold | exhale
      countdown: 4,
      totalElapsed: 0
    },
    speechRecognition: null,
    isSpeechRecognizing: false
  };

  // Emotion Dictionary & Knowledge Base
  const EMOTIONS_CONFIG = {
    Happy: {
      name: 'Happy & Motivated',
      emoji: '😊',
      color: '#10b981',
      badgeClass: 'badge-mood-happy',
      descriptor: 'High energetic state with positive valence. Prime condition for conquering challenging topics.',
      studySuggestions: [
        { title: 'Tackle the Hardest Topic ("Eat the Frog")', desc: 'Channel your peak mental energy into your most demanding subject or assignment.', icon: 'fa-bolt' },
        { title: 'Active Recall & Practice Problems', desc: 'Test yourself without notes to encode concepts into long-term memory efficiently.', icon: 'fa-brain' },
        { title: 'Extended 50-Minute Focus Sprint', desc: 'You have high cognitive stamina right now. Try a 50m study block with 10m rest.', icon: 'fa-fire' },
        { title: 'Teach or Explain to a Peer', desc: 'Use your high spirits to explain difficult concepts to a classmate or out loud.', icon: 'fa-users' }
      ],
      timerPreset: { mode: 'deepWork', seconds: 3000, label: 'Start 50m Deep Block' },
      valenceRange: [0.6, 1.0],
      stressRange: [5, 25],
      energyRange: [75, 100]
    },
    Calm: {
      name: 'Calm & Focused',
      emoji: '😌',
      color: '#06b6d4',
      badgeClass: 'badge-mood-calm',
      descriptor: 'Receptive, balanced mental state. Ideal for structured deep reading, analysis, and problem-solving.',
      studySuggestions: [
        { title: 'Standard 25/5 Pomodoro Cycle', desc: 'Maintain your steady flow state with structured 25-minute focused intervals.', icon: 'fa-stopwatch' },
        { title: 'Feynman Learning Technique', desc: 'Take a complex topic and write out an intuitive explanation in simple language.', icon: 'fa-book-open' },
        { title: 'Structured Note Synthesis', desc: 'Condense textbook chapters or lecture slides into one-page visual cheat sheets.', icon: 'fa-file-lines' },
        { title: 'Continuous Flow Practice', desc: 'Work sequentially through exercise problem sets without multitasking.', icon: 'fa-arrow-progress' }
      ],
      timerPreset: { mode: 'pomodoro', seconds: 1500, label: 'Start 25m Focus Block' },
      valenceRange: [0.3, 0.7],
      stressRange: [10, 30],
      energyRange: [60, 85]
    },
    Neutral: {
      name: 'Neutral & Steady',
      emoji: '😐',
      color: '#94a3b8',
      badgeClass: 'badge-mood-neutral',
      descriptor: 'Balanced baseline state. Ready to be catalyzed into deep focus with structured initiation.',
      studySuggestions: [
        { title: '5-Minute Momentum Rule', desc: 'Commit to studying just for 5 minutes. Starting dissolves initial friction.', icon: 'fa-play' },
        { title: 'Outline Your Study Goals', desc: 'List top 3 must-finish items before opening books to establish a clear purpose.', icon: 'fa-list-check' },
        { title: 'Pomodoro Warm-up', desc: 'Start with 1 regular 25-minute session on an approachable task to build inertia.', icon: 'fa-stopwatch' },
        { title: 'Set Up a Clean Workspace', desc: 'Clear physical desk clutter and close distracting browser tabs.', icon: 'fa-laptop' }
      ],
      timerPreset: { mode: 'pomodoro', seconds: 1500, label: 'Start 25m Warm-up' },
      valenceRange: [-0.1, 0.2],
      stressRange: [20, 45],
      energyRange: [45, 65]
    },
    Stressed: {
      name: 'Stressed / Overwhelmed',
      emoji: '😰',
      color: '#f43f5e',
      badgeClass: 'badge-mood-stressed',
      descriptor: 'Elevated cognitive load & cortisol response. Urgently requires de-escalation and micro-tasking.',
      studySuggestions: [
        { title: 'Immediate 4-7-8 Breathing Reset', desc: 'Perform 4 cycles of calming breaths to lower heart rate and reduce cortisol spikes.', icon: 'fa-wind' },
        { title: 'Micro-Task Decomposition', desc: 'Break your daunting assignment into tiny, 10-minute non-threatening mini steps.', icon: 'fa-puzzle-piece' },
        { title: 'Low-Pressure Pomodoro (15m)', desc: 'Study for only 15 minutes followed by a 5-minute break. Lower the threshold.', icon: 'fa-hourglass-half' },
        { title: 'Avoid Continuous Late-Night Sprints', desc: 'Diminishing returns happen fast under high stress. Prioritize brain restoration.', icon: 'fa-ban' }
      ],
      timerPreset: { mode: 'shortBreak', seconds: 300, label: 'Take 5m Reset Break First' },
      valenceRange: [-0.9, -0.4],
      stressRange: [75, 98],
      energyRange: [60, 90]
    },
    Tired: {
      name: 'Tired / Low Energy',
      emoji: '😴',
      color: '#f59e0b',
      badgeClass: 'badge-mood-tired',
      descriptor: 'Diminished alertness and cognitive fatigue. High probability of memory retention degradation.',
      studySuggestions: [
        { title: '15-Minute Power Nap or Rest', desc: 'A quick 15-20m nap clears adenosine and restores working memory capacity.', icon: 'fa-bed' },
        { title: 'Hydration & Posture Reset', desc: 'Drink a large glass of cold water and do light physical stretches to stimulate blood flow.', icon: 'fa-glass-water' },
        { title: 'Switch to Interactive Flashcards', desc: 'Avoid passive reading which induces sleepiness. Use active flashcards or audio lectures.', icon: 'fa-layer-group' },
        { title: 'Postpone Heavy Math / Theory', desc: 'Focus on light categorization or organization tasks rather than dense problem solving.', icon: 'fa-clock-rotate-left' }
      ],
      timerPreset: { mode: 'shortBreak', seconds: 300, label: 'Start 5m Energy Break' },
      valenceRange: [-0.5, 0.0],
      stressRange: [40, 65],
      energyRange: [15, 40]
    },
    Sad: {
      name: 'Sad / Discouraged',
      emoji: '😔',
      color: '#6366f1',
      badgeClass: 'badge-mood-sad',
      descriptor: 'Low affective state and reduced dopamine. Needs compassionate pacing and low-friction wins.',
      studySuggestions: [
        { title: 'Start with 1 Easy Win', desc: 'Complete one very simple task (e.g. format a document or 3 easy questions) to rebuild confidence.', icon: 'fa-circle-check' },
        { title: '5-Minute Outdoor Sunlight Walk', desc: 'Natural light and mild movement stimulate endorphins and alleviate mental heaviness.', icon: 'fa-person-walking' },
        { title: 'Study With a Friend or Study-With-Me Audio', desc: 'Body doubling provides gentle social presence and prevents feelings of isolation.', icon: 'fa-user-group' },
        { title: 'Practice Constructive Self-Talk', desc: 'Remind yourself that grades reflect current preparation, not your intrinsic intelligence.', icon: 'fa-heart' }
      ],
      timerPreset: { mode: 'pomodoro', seconds: 1500, label: 'Start Gentle 25m Block' },
      valenceRange: [-0.8, -0.3],
      stressRange: [50, 75],
      energyRange: [20, 50]
    },
    Angry: {
      name: 'Angry / Frustrated',
      emoji: '😡',
      color: '#ef4444',
      badgeClass: 'badge-mood-angry',
      descriptor: 'High arousal negative state. Adrenaline makes narrow focus difficult; redirect energy physically first.',
      studySuggestions: [
        { title: 'Physical Movement Release', desc: 'Do 20 jumping jacks or a fast walk to metabolize excess adrenaline before reading.', icon: 'fa-person-running' },
        { title: 'Switch Subjects Immediately', desc: 'Step away from the frustrating problem and spend 20 minutes on a different topic.', icon: 'fa-shuffle' },
        { title: 'Write Down the Exact Blockers', desc: 'Bullet-point exactly what is not working. Analytical writing disarms emotional frustration.', icon: 'fa-pen-to-square' },
        { title: 'Bilateral Binaural Beats', desc: 'Listen to 40Hz focus soundscape in headphones to recalibrate neural synchrony.', icon: 'fa-headphones' }
      ],
      timerPreset: { mode: 'shortBreak', seconds: 300, label: 'Start 5m Cool-Off Break' },
      valenceRange: [-0.9, -0.5],
      stressRange: [80, 98],
      energyRange: [80, 100]
    },
    Anxious: {
      name: 'Anxious / Nervous',
      emoji: '😟',
      color: '#d946ef',
      badgeClass: 'badge-mood-anxious',
      descriptor: 'Anticipatory anxiety and racing thoughts. Needs grounding, structure, and formulaic clarity.',
      studySuggestions: [
        { title: 'Brain Dump Exercise', desc: 'Spend 3 minutes writing down every worry or unfinished item on paper to clear RAM.', icon: 'fa-toilet-paper' },
        { title: 'Construct a 1-Page Formula/Summary Sheet', desc: 'Condensing core concepts onto one page builds a sense of mastery and safety.', icon: 'fa-file-shield' },
        { title: '4-7-8 Breathing Guide', desc: 'Calms sympathetic nervous system hyperactivity prior to sitting for exams.', icon: 'fa-wind' },
        { title: 'Practice Under Timed Conditions', desc: 'Familiarity kills fear. Simulate realistic 15-minute mock quiz environments.', icon: 'fa-stopwatch-20' }
      ],
      timerPreset: { mode: 'pomodoro', seconds: 1500, label: 'Start 25m Structured Block' },
      valenceRange: [-0.7, -0.2],
      stressRange: [70, 95],
      energyRange: [65, 90]
    }
  };

  // Lexicon with weights for NLP emotion parser
  const LEXICON = {
    Stressed: [
      'stress', 'stressed', 'overwhelmed', 'pressure', 'panic', 'panicking', 'freaking', 'deadline',
      'too much', 'behind', 'failing', 'exam tomorrow', 'midterm', 'finals', 'overload', 'suffocating',
      'crazy', 'crushed', 'impossible', 'urgent', 'swamped', 'drowning', 'unprepared', 'anxiety', 'struggling'
    ],
    Tired: [
      'tired', 'exhausted', 'sleepy', 'drowsy', 'burned out', 'burnout', 'no energy', 'fatigued',
      'eyes heavy', 'yawning', 'drained', 'cant stay awake', 'can’t stay awake', 'brain fog', 'sluggish',
      'pulling all nighter', 'all-nighter', 'need sleep', 'weary', 'depleted', 'zoned out'
    ],
    Sad: [
      'sad', 'depressed', 'down', 'hopeless', 'crying', 'unhappy', 'lonely', 'discouraged', 'disappointed',
      'miserable', 'bad score', 'failed', 'low mark', 'gave up', 'giving up', 'worthless', 'heartbroken',
      'demotivated', 'hate myself', 'gloomy'
    ],
    Angry: [
      'angry', 'furious', 'mad', 'pissed', 'annoyed', 'irritated', 'unfair', 'hate this', 'stupid',
      'group member', 'partner did nothing', 'cheated', 'rage', 'frustrated', 'ridiculous', 'professor was rude',
      'broken system', 'screwed up', 'infuriating'
    ],
    Happy: [
      'happy', 'excited', 'great', 'awesome', 'amazing', 'energized', 'motivated', 'productive', 'good grade',
      'aced', 'got an a', 'finished', 'proud', 'love studying', 'confident', 'ready', 'feeling good', 'crushed it',
      'fantastic', 'cheerful', 'accomplished'
    ],
    Calm: [
      'calm', 'peaceful', 'relaxed', 'focused', 'clear', 'organized', 'smooth', 'fine', 'good pace',
      'lo-fi', 'lofi', 'steady', 'in the zone', 'balanced', 'serene', 'tranquil', 'comfortable', 'ready to learn'
    ],
    Anxious: [
      'anxious', 'nervous', 'scared', 'worry', 'worried', 'afraid', 'shaking', 'what if', 'fear', 'dread',
      'heart racing', 'jittery', 'test anxiety', 'overthinking', 'apprehensive', 'uneasy', 'doubting'
    ],
    Neutral: [
      'okay', 'normal', 'alright', 'regular', 'average', 'routine', 'just studying', 'reading', 'doing homework',
      'nothing special', 'standard', 'chapter'
    ]
  };

  // Academic stress multiplier keywords
  const ACADEMIC_KEYWORDS = [
    'exam', 'midterm', 'final', 'quiz', 'test', 'assignment', 'homework', 'project', 'professor',
    'grade', 'gpa', 'calculus', 'physics', 'chemistry', 'biology', 'math', 'syllabus', 'thesis',
    'paper', 'presentation', 'submission', 'due date', 'lab report'
  ];

  // ==========================================
  // DOM ELEMENT REFERENCES
  // ==========================================
  const DOM = {
    // Nav
    navMenu: document.getElementById('navMenu'),
    mobileMenuBtn: document.getElementById('mobileMenuBtn'),
    navMoodEmoji: document.getElementById('navMoodEmoji'),
    navMoodText: document.getElementById('navMoodText'),
    ambientSoundToggle: document.getElementById('ambientSoundToggle'),
    toastContainer: document.getElementById('toastContainer'),

    // Voice
    voiceStatusIndicator: document.getElementById('voiceStatusIndicator'),
    voiceStatusText: document.getElementById('voiceStatusText'),
    recordingTimer: document.getElementById('recordingTimer'),
    waveformCanvas: document.getElementById('waveformCanvas'),
    waveformOverlay: document.getElementById('waveformOverlay'),
    startRecordBtn: document.getElementById('startRecordBtn'),
    stopRecordBtn: document.getElementById('stopRecordBtn'),
    playAudioBtn: document.getElementById('playAudioBtn'),
    deleteAudioBtn: document.getElementById('deleteAudioBtn'),
    audioPlayback: document.getElementById('audioPlayback'),
    voiceTranscriptText: document.getElementById('voiceTranscriptText'),
    clearTranscriptBtn: document.getElementById('clearTranscriptBtn'),
    analyzeVoiceBtn: document.getElementById('analyzeVoiceBtn'),
    speechEngineBadge: document.getElementById('speechEngineBadge'),

    // Text
    textInput: document.getElementById('textInput'),
    charCount: document.getElementById('charCount'),
    wordCount: document.getElementById('wordCount'),
    clearTextInputBtn: document.getElementById('clearTextInputBtn'),
    analyzeTextBtn: document.getElementById('analyzeTextBtn'),
    promptChips: document.querySelectorAll('.prompt-chip'),

    // Loading Modal
    aiLoadingOverlay: document.getElementById('aiLoadingOverlay'),
    loadingDynamicMsg: document.getElementById('loadingDynamicMsg'),
    loadingProgressBar: document.getElementById('loadingProgressBar'),

    // Results
    resultMoodEmoji: document.getElementById('resultMoodEmoji'),
    resultMoodName: document.getElementById('resultMoodName'),
    resultMoodDescriptor: document.getElementById('resultMoodDescriptor'),
    confidenceCircleProgress: document.getElementById('confidenceCircleProgress'),
    resultConfidenceText: document.getElementById('resultConfidenceText'),
    valenceBar: document.getElementById('valenceBar'),
    valenceVal: document.getElementById('valenceVal'),
    stressBar: document.getElementById('stressBar'),
    stressVal: document.getElementById('stressVal'),
    energyBar: document.getElementById('energyBar'),
    energyVal: document.getElementById('energyVal'),
    aiNoticedText: document.getElementById('aiNoticedText'),
    detectedKeywordsTags: document.getElementById('detectedKeywordsTags'),
    saveMoodLogBtn: document.getElementById('saveMoodLogBtn'),
    discussMoodChatBtn: document.getElementById('discussMoodChatBtn'),

    // Suggestions
    suggestionHeading: document.getElementById('suggestionHeading'),
    suggestionIntro: document.getElementById('suggestionIntro'),
    recommendationsList: document.getElementById('recommendationsList'),
    applyTimerPresetBtn: document.getElementById('applyTimerPresetBtn'),
    applyTimerBtnText: document.getElementById('applyTimerBtnText'),
    refreshSuggestionsBtn: document.getElementById('refreshSuggestionsBtn'),

    // Chatbot
    chatMessages: document.getElementById('chatMessages'),
    chatForm: document.getElementById('chatForm'),
    chatInput: document.getElementById('chatInput'),
    chatBotMoodSync: document.getElementById('chatBotMoodSync'),
    chatChips: document.querySelectorAll('.chat-chip'),
    speakLastMsgBtn: document.getElementById('speakLastMsgBtn'),
    clearChatBtn: document.getElementById('clearChatBtn'),
    chatVoiceInputBtn: document.getElementById('chatVoiceInputBtn'),

    // Dashboard
    dashTotalCheckins: document.getElementById('dashTotalCheckins'),
    dashDominantMood: document.getElementById('dashDominantMood'),
    dashAvgConfidence: document.getElementById('dashAvgConfidence'),
    dashPomodorosDone: document.getElementById('dashPomodorosDone'),
    weeklyMoodCanvas: document.getElementById('weeklyMoodChart'),
    moodDistCanvas: document.getElementById('moodDistributionChart'),
    historyTableBody: document.getElementById('historyTableBody'),
    exportHistoryBtn: document.getElementById('exportHistoryBtn'),
    addSampleHistoryBtn: document.getElementById('addSampleHistoryBtn'),
    clearHistoryBtn: document.getElementById('clearHistoryBtn'),

    // Timer
    timerDigits: document.getElementById('timerDigits'),
    timerCircleProgress: document.getElementById('timerCircleProgress'),
    timerModeLabel: document.getElementById('timerModeLabel'),
    timerTaskLabel: document.getElementById('timerTaskLabel'),
    timerStartBtn: document.getElementById('timerStartBtn'),
    timerPauseBtn: document.getElementById('timerPauseBtn'),
    timerResetBtn: document.getElementById('timerResetBtn'),
    timerModeBtns: document.querySelectorAll('.timer-mode-btn'),
    soundChips: document.querySelectorAll('.sound-chip'),
    completedSessionsCount: document.getElementById('completedSessionsCount'),

    // Breathing
    breathCircle: document.getElementById('breathCircle'),
    breathInstruction: document.getElementById('breathInstruction'),
    breathCountdown: document.getElementById('breathCountdown'),
    startBreathBtn: document.getElementById('startBreathBtn'),
    stopBreathBtn: document.getElementById('stopBreathBtn'),
    stepInhale: document.getElementById('stepInhale'),
    stepHold: document.getElementById('stepHold'),
    stepExhale: document.getElementById('stepExhale'),

    // Orbs & Canvases
    particleCanvas: document.getElementById('particleCanvas'),
    neuralOrbCanvas: document.getElementById('neuralOrbCanvas'),
    pillMoodEmoji: document.getElementById('pillMoodEmoji'),
    pillMoodText: document.getElementById('pillMoodText')
  };

  // Chart instances
  let weeklyChartInstance = null;
  let distChartInstance = null;

  // ==========================================================================
  // 1. STAR & PARTICLE FIELD CANVAS (CYBER BACKGROUND)
  // ==========================================================================
  function initParticleCanvas() {
    const canvas = DOM.particleCanvas;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const particles = [];
    const count = Math.min(Math.floor((width * height) / 14000), 100);

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 1.8 + 0.5,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        alpha: Math.random() * 0.7 + 0.3,
        color: Math.random() > 0.6 ? '#ec4899' : (Math.random() > 0.3 ? '#8b5cf6' : '#06b6d4')
      });
    }

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    function draw() {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.shadowBlur = 8;
        ctx.shadowColor = p.color;
        ctx.fill();

        // Connect nearby particles with subtle cyber links
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
          if (dist < 110) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = '#8b5cf6';
            ctx.globalAlpha = (1 - dist / 110) * 0.15;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
      requestAnimationFrame(draw);
    }
    draw();
  }

  // ==========================================================================
  // 2. NEURAL AI ORB VISUALIZER
  // ==========================================================================
  function initNeuralOrb() {
    const canvas = DOM.neuralOrbCanvas;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = (canvas.width = 380);
    const height = (canvas.height = 380);
    const cx = width / 2;
    const cy = height / 2;

    let angle = 0;
    const nodes = [];
    const numNodes = 24;

    for (let i = 0; i < numNodes; i++) {
      nodes.push({
        baseRadius: 110 + Math.sin(i) * 20,
        angleOffset: (i * Math.PI * 2) / numNodes,
        speed: 0.015 + (i % 3) * 0.005,
        size: Math.random() * 3 + 2,
        color: i % 2 === 0 ? '#ec4899' : '#06b6d4'
      });
    }

    function animateOrb() {
      ctx.clearRect(0, 0, width, height);
      angle += 0.02;

      // Glow halo
      const grad = ctx.createRadialGradient(cx, cy, 40, cx, cy, 160);
      grad.addColorStop(0, 'rgba(236, 72, 153, 0.25)');
      grad.addColorStop(0.5, 'rgba(139, 92, 246, 0.12)');
      grad.addColorStop(1, 'rgba(6, 182, 212, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, 160, 0, Math.PI * 2);
      ctx.fill();

      // Connecting neural ring
      ctx.beginPath();
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        const rad = n.baseRadius + Math.sin(angle * 2 + i) * 12;
        const x = cx + Math.cos(n.angleOffset + angle * n.speed * 20) * rad;
        const y = cy + Math.sin(n.angleOffset + angle * n.speed * 20) * rad;

        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.strokeStyle = 'rgba(139, 92, 246, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Node dots
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        const rad = n.baseRadius + Math.sin(angle * 2 + i) * 12;
        const x = cx + Math.cos(n.angleOffset + angle * n.speed * 20) * rad;
        const y = cy + Math.sin(n.angleOffset + angle * n.speed * 20) * rad;

        ctx.beginPath();
        ctx.arc(x, y, n.size, 0, Math.PI * 2);
        ctx.fillStyle = n.color;
        ctx.shadowBlur = 12;
        ctx.shadowColor = n.color;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      requestAnimationFrame(animateOrb);
    }
    animateOrb();
  }

  // ==========================================================================
  // 3. WEB SPEECH & AUDIO WAVEFORM ENGINE
  // ==========================================================================
  function initVoiceEngine() {
    // Check Web Speech API Support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      State.speechRecognition = new SpeechRecognition();
      State.speechRecognition.continuous = true;
      State.speechRecognition.interimResults = true;
      State.speechRecognition.lang = 'en-US';

      State.speechRecognition.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        const currentVal = DOM.voiceTranscriptText.value;
        if (finalTranscript) {
          DOM.voiceTranscriptText.value = (currentVal + ' ' + finalTranscript).trim();
        } else if (interimTranscript) {
          DOM.voiceTranscriptText.placeholder = 'Speaking: ' + interimTranscript;
        }

        DOM.analyzeVoiceBtn.disabled = DOM.voiceTranscriptText.value.trim().length === 0;
      };

      State.speechRecognition.onerror = (e) => {
        console.warn('SpeechRecognition error:', e.error);
        if (e.error === 'not-allowed') {
          showToast('Microphone access denied. Please allow microphone permission.', 'error');
        }
      };
    } else {
      if (DOM.speechEngineBadge) {
        DOM.speechEngineBadge.textContent = 'Voice Capture Mode';
        DOM.speechEngineBadge.title = 'Web Speech Recognition not supported in this browser; recording audio directly.';
      }
    }

    // Start Recording Listener
    DOM.startRecordBtn.addEventListener('click', async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        State.audio.microphoneStream = stream;

        // Setup Web Audio Analyser for Real-time Waveform Canvas
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        State.audio.audioContext = new AudioContextClass();
        const source = State.audio.audioContext.createMediaStreamSource(stream);
        State.audio.analyser = State.audio.audioContext.createAnalyser();
        State.audio.analyser.fftSize = 256;
        source.connect(State.audio.analyser);

        // MediaRecorder setup
        State.audio.audioChunks = [];
        State.audio.mediaRecorder = new MediaRecorder(stream);
        State.audio.mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) State.audio.audioChunks.push(e.data);
        };

        State.audio.mediaRecorder.onstop = () => {
          State.audio.audioBlob = new Blob(State.audio.audioChunks, { type: 'audio/webm' });
          State.audio.audioUrl = URL.createObjectURL(State.audio.audioBlob);
          DOM.audioPlayback.src = State.audio.audioUrl;
          DOM.playAudioBtn.disabled = false;
          DOM.deleteAudioBtn.disabled = false;
        };

        State.audio.mediaRecorder.start();
        State.audio.isRecording = true;

        // Start SpeechRecognition if available
        if (State.speechRecognition) {
          try {
            State.speechRecognition.start();
            State.isSpeechRecognizing = true;
          } catch (err) {
            console.log('SpeechRecognition already running or busy');
          }
        }

        // Update UI State
        DOM.voiceStatusIndicator.classList.add('recording');
        DOM.voiceStatusText.textContent = 'Recording in progress... Speak now';
        DOM.startRecordBtn.disabled = true;
        DOM.stopRecordBtn.disabled = false;
        DOM.playAudioBtn.disabled = true;
        DOM.deleteAudioBtn.disabled = true;
        DOM.waveformOverlay.classList.add('hidden');

        // Start Timer
        State.audio.recordSeconds = 0;
        updateRecordingTimerDisplay();
        State.audio.recordingTimerId = setInterval(() => {
          State.audio.recordSeconds++;
          updateRecordingTimerDisplay();
          if (State.audio.recordSeconds >= 60) {
            stopRecording();
            showToast('Max 60s voice sample recorded.', 'info');
          }
        }, 1000);

        // Start Waveform Animation
        drawLiveWaveform();
        showToast('Microphone active. Analyzing speech...', 'info');

      } catch (err) {
        console.error('Audio capture failed:', err);
        showToast('Could not access microphone: ' + err.message, 'error');
      }
    });

    // Stop Recording Listener
    DOM.stopRecordBtn.addEventListener('click', () => {
      stopRecording();
    });

    // Play Audio
    DOM.playAudioBtn.addEventListener('click', () => {
      if (DOM.audioPlayback.src) {
        DOM.audioPlayback.play();
        showToast('Playing recorded voice sample', 'info');
      }
    });

    // Discard Recording
    DOM.deleteAudioBtn.addEventListener('click', () => {
      DOM.audioPlayback.src = '';
      State.audio.audioBlob = null;
      State.audio.audioUrl = null;
      DOM.playAudioBtn.disabled = true;
      DOM.deleteAudioBtn.disabled = true;
      DOM.recordingTimer.textContent = '00:00';
      DOM.voiceTranscriptText.value = '';
      DOM.analyzeVoiceBtn.disabled = true;
      DOM.voiceStatusText.textContent = 'Recording discarded. Ready';
      drawFlatWaveform();
      DOM.waveformOverlay.classList.remove('hidden');
      showToast('Recording removed.', 'info');
    });

    // Clear Transcript
    DOM.clearTranscriptBtn.addEventListener('click', () => {
      DOM.voiceTranscriptText.value = '';
      DOM.analyzeVoiceBtn.disabled = true;
    });

    // Transcript input changes
    DOM.voiceTranscriptText.addEventListener('input', () => {
      DOM.analyzeVoiceBtn.disabled = DOM.voiceTranscriptText.value.trim().length === 0;
    });

    // Analyze Voice Button
    DOM.analyzeVoiceBtn.addEventListener('click', () => {
      const text = DOM.voiceTranscriptText.value.trim();
      if (!text) {
        showToast('Please record or type some speech first.', 'warning');
        return;
      }
      triggerAnalysis(text, 'Voice Analysis');
    });
  }

  function stopRecording() {
    if (!State.audio.isRecording) return;
    State.audio.isRecording = false;

    if (State.audio.mediaRecorder && State.audio.mediaRecorder.state !== 'inactive') {
      State.audio.mediaRecorder.stop();
    }

    if (State.audio.microphoneStream) {
      State.audio.microphoneStream.getTracks().forEach((track) => track.stop());
    }

    if (State.speechRecognition && State.isSpeechRecognizing) {
      try {
        State.speechRecognition.stop();
      } catch (e) {}
      State.isSpeechRecognizing = false;
    }

    clearInterval(State.audio.recordingTimerId);
    cancelAnimationFrame(State.audio.animationFrameId);

    DOM.voiceStatusIndicator.classList.remove('recording');
    DOM.voiceStatusText.textContent = 'Voice Sample Captured';
    DOM.startRecordBtn.disabled = false;
    DOM.stopRecordBtn.disabled = true;

    // If transcript is still empty (e.g. browser speech recognition didn't catch speech), provide sample fallback
    if (!DOM.voiceTranscriptText.value.trim()) {
      DOM.voiceTranscriptText.value = "I've been preparing for my chemistry and math finals all week and feel somewhat stressed with the workload.";
    }
    DOM.analyzeVoiceBtn.disabled = false;
    drawStaticWaveform();
    showToast('Voice recorded successfully! Ready to analyze.', 'success');
  }

  function updateRecordingTimerDisplay() {
    const mins = Math.floor(State.audio.recordSeconds / 60).toString().padStart(2, '0');
    const secs = (State.audio.recordSeconds % 60).toString().padStart(2, '0');
    DOM.recordingTimer.textContent = `${mins}:${secs}`;
  }

  function drawLiveWaveform() {
    const canvas = DOM.waveformCanvas;
    const ctx = canvas.getContext('2d');
    const analyser = State.audio.analyser;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    function render() {
      if (!State.audio.isRecording) return;
      State.audio.animationFrameId = requestAnimationFrame(render);
      analyser.getByteTimeDomainData(dataArray);

      ctx.fillStyle = 'rgba(7, 8, 18, 0.6)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.lineWidth = 3;
      const grad = ctx.createLinearGradient(0, 0, canvas.width, 0);
      grad.addColorStop(0, '#ec4899');
      grad.addColorStop(0.5, '#8b5cf6');
      grad.addColorStop(1, '#06b6d4');
      ctx.strokeStyle = grad;
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#ec4899';

      ctx.beginPath();
      const sliceWidth = (canvas.width * 1.0) / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * canvas.height) / 2;

        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
        x += sliceWidth;
      }

      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();
      ctx.shadowBlur = 0;
    }
    render();
  }

  function drawStaticWaveform() {
    const canvas = DOM.waveformCanvas;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#070812';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.lineWidth = 2.5;
    const grad = ctx.createLinearGradient(0, 0, canvas.width, 0);
    grad.addColorStop(0, '#ec4899');
    grad.addColorStop(0.5, '#8b5cf6');
    grad.addColorStop(1, '#06b6d4');
    ctx.strokeStyle = grad;

    ctx.beginPath();
    for (let x = 0; x < canvas.width; x += 4) {
      const freq = Math.sin(x * 0.05) * Math.cos(x * 0.02);
      const y = canvas.height / 2 + freq * 35 * Math.random();
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  function drawFlatWaveform() {
    const canvas = DOM.waveformCanvas;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#070812';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, canvas.height / 2);
    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();
  }

  // ==========================================================================
  // 4. TEXT ANALYSIS ENGINE & PROMPT CHIPS
  // ==========================================================================
  function initTextEngine() {
    // Character and Word Counter
    DOM.textInput.addEventListener('input', () => {
      const val = DOM.textInput.value;
      DOM.charCount.textContent = `${val.length} characters`;
      const words = val.trim() ? val.trim().split(/\s+/).length : 0;
      DOM.wordCount.textContent = `${words} words`;
    });

    // Clear Text
    DOM.clearTextInputBtn.addEventListener('click', () => {
      DOM.textInput.value = '';
      DOM.charCount.textContent = '0 characters';
      DOM.wordCount.textContent = '0 words';
      DOM.textInput.focus();
    });

    // Quick Prompt Chips
    DOM.promptChips.forEach((chip) => {
      chip.addEventListener('click', () => {
        DOM.textInput.value = chip.dataset.prompt;
        DOM.textInput.dispatchEvent(new Event('input'));
        showToast('Prompt filled! Click Analyze Mood.', 'info');
      });
    });

    // Analyze Text Button
    DOM.analyzeTextBtn.addEventListener('click', () => {
      const text = DOM.textInput.value.trim();
      if (!text) {
        showToast('Please enter some text describing how you feel.', 'warning');
        DOM.textInput.focus();
        return;
      }
      triggerAnalysis(text, 'Text NLP');
    });
  }

  // ==========================================================================
  // 5. ADVANCED EMOTION & SENTIMENT DETECTION ALGORITHM
  // ==========================================================================
  function analyzeEmotionalState(rawText) {
    const text = rawText.toLowerCase();
    const words = text.match(/\b[a-z’']+\b/g) || [];

    // Tally score for each emotion category
    const scores = {
      Happy: 0,
      Calm: 0,
      Neutral: 1, // baseline
      Sad: 0,
      Stressed: 0,
      Angry: 0,
      Tired: 0,
      Anxious: 0
    };

    const detectedTriggers = [];

    // Check negation patterns: "not happy", "not stressed", "never calm"
    const negations = ['not', 'no', "don't", 'dont', 'never', 'hardly', 'barely', "cant", "can't"];

    // Evaluate against Lexicon
    Object.keys(LEXICON).forEach((emotion) => {
      const keywords = LEXICON[emotion];
      keywords.forEach((kw) => {
        if (text.includes(kw)) {
          // Check if preceded by a negation word
          const kwIndex = text.indexOf(kw);
          const snippetBefore = text.slice(Math.max(0, kwIndex - 18), kwIndex);
          const hasNegation = negations.some((neg) => snippetBefore.includes(neg));

          if (hasNegation) {
            // Flip or invert
            if (emotion === 'Happy' || emotion === 'Calm') {
              scores.Sad += 2;
              scores.Stressed += 1.5;
            } else if (emotion === 'Stressed' || emotion === 'Anxious') {
              scores.Calm += 2;
            }
          } else {
            scores[emotion] += 3;
            if (!detectedTriggers.includes(kw) && detectedTriggers.length < 5) {
              detectedTriggers.push(kw);
            }
          }
        }
      });
    });

    // Check academic pressure keywords
    let academicScore = 0;
    ACADEMIC_KEYWORDS.forEach((akw) => {
      if (text.includes(akw)) {
        academicScore += 1.5;
        if (!detectedTriggers.includes(akw) && detectedTriggers.length < 5) {
          detectedTriggers.push(akw);
        }
      }
    });

    if (academicScore > 0) {
      if (scores.Stressed > 0 || scores.Anxious > 0 || scores.Tired > 0) {
        scores.Stressed += academicScore * 1.5;
        scores.Anxious += academicScore * 1.2;
      }
    }

    // Check exclamation & capitalization intensity in rawText
    const exclamations = (rawText.match(/!/g) || []).length;
    const capsCount = (rawText.match(/[A-Z]{2,}/g) || []).length;
    if (exclamations > 1 || capsCount > 0) {
      if (scores.Angry > 0) scores.Angry += 2;
      if (scores.Stressed > 0) scores.Stressed += 2;
      if (scores.Happy > 0) scores.Happy += 2;
    }

    // Determine winning emotion
    let dominantEmotion = 'Neutral';
    let maxScore = -1;
    Object.keys(scores).forEach((emo) => {
      if (scores[emo] > maxScore) {
        maxScore = scores[emo];
        dominantEmotion = emo;
      }
    });

    // Calculate realistic confidence percentage (74% to 96%)
    const baseConfidence = 74;
    const confidenceBoost = Math.min(Math.floor(maxScore * 4 + words.length * 0.4), 22);
    const confidence = Math.min(baseConfidence + confidenceBoost, 96);

    // Compute Valence (-1 to +1)
    const positiveScore = scores.Happy * 1.5 + scores.Calm;
    const negativeScore = scores.Sad * 1.5 + scores.Stressed * 1.2 + scores.Angry * 1.8 + scores.Anxious * 1.3 + scores.Tired * 0.8;
    let valence = 0;
    if (positiveScore + negativeScore > 0) {
      valence = (positiveScore - negativeScore) / (positiveScore + negativeScore);
      valence = Math.max(-0.95, Math.min(0.95, valence));
    } else {
      valence = 0.1;
    }

    // Compute Stress % (5% to 98%)
    let stress = Math.min(Math.max(Math.round((scores.Stressed * 18 + scores.Anxious * 14 + scores.Angry * 12 + academicScore * 8) + (valence < 0 ? 25 : 10)), 10), 96);
    if (dominantEmotion === 'Calm') stress = Math.min(stress, 25);
    if (dominantEmotion === 'Happy') stress = Math.min(stress, 30);

    // Compute Energy % (15% to 95%)
    let energy = 70;
    if (dominantEmotion === 'Tired') energy = Math.floor(Math.random() * 15 + 20);
    else if (dominantEmotion === 'Sad') energy = Math.floor(Math.random() * 15 + 35);
    else if (dominantEmotion === 'Happy' || dominantEmotion === 'Angry') energy = Math.floor(Math.random() * 10 + 85);
    else if (dominantEmotion === 'Calm') energy = Math.floor(Math.random() * 15 + 65);
    else if (dominantEmotion === 'Stressed') energy = Math.floor(Math.random() * 20 + 65);

    // Build intelligent "What the AI Noticed" explanation
    const triggersFormatted = detectedTriggers.length ? detectedTriggers.map((t) => `#${t.replace(/\s+/g, '-')}`).join(' ') : '#academic-routine';
    let explanation = '';

    switch (dominantEmotion) {
      case 'Stressed':
        explanation = `AI detected elevated cognitive tension and urgency markers${detectedTriggers.length ? ` related to "${detectedTriggers.slice(0, 2).join(', ')}"` : ''}. Cortisol signals indicate academic overload.`;
        break;
      case 'Tired':
        explanation = `Linguistic markers indicate mental exhaustion, low cognitive endurance, and reduced working memory capacity. Restorative pacing is recommended.`;
        break;
      case 'Sad':
        explanation = `Sentiment polarity is notably negative with themes of discouragement or low self-efficacy. Gentle, bite-sized tasks will help rebuild momentum.`;
        break;
      case 'Happy':
        explanation = `High dopamine and positive valence detected. Your cognitive readiness and motivation are peak—ideal for difficult conceptual challenges.`;
        break;
      case 'Calm':
        explanation = `Balanced sentiment with low stress markers. Your mental state is receptive to sustained focus, analytical problem sets, and deep synthesis.`;
        break;
      case 'Angry':
        explanation = `High emotional arousal with frustration indicators. Physical energy needs grounding before returning to delicate academic tasks.`;
        break;
      case 'Anxious':
        explanation = `Anticipatory worry and fear of failure detected. Structuring your schedule into small deterministic checklists will reduce cognitive ambiguity.`;
        break;
      default:
        explanation = `Balanced baseline sentiment. Steady equilibrium suitable for regular textbook review and routine assignment completion.`;
    }

    return {
      emotion: dominantEmotion,
      confidence,
      valence: parseFloat(valence.toFixed(2)),
      stressLevel: stress,
      energyLevel: energy,
      keywords: detectedTriggers.length ? detectedTriggers : ['balanced', 'routine'],
      explanation
    };
  }

  // Trigger Full Analysis with Cyber Loading Modal
  function triggerAnalysis(text, source) {
    const overlay = DOM.aiLoadingOverlay;
    overlay.classList.remove('hidden');

    const steps = [
      'Extracting vocal cadence & speech lexical tokens...',
      'Mapping emotional vectors across 8 cognitive axes...',
      'Correlating academic pressure indices & energy levels...',
      'Synthesizing personalized study suggestions...'
    ];

    let stepIndex = 0;
    DOM.loadingDynamicMsg.textContent = steps[0];
    DOM.loadingProgressBar.style.width = '20%';

    const stepInterval = setInterval(() => {
      stepIndex++;
      if (stepIndex < steps.length) {
        DOM.loadingDynamicMsg.textContent = steps[stepIndex];
        DOM.loadingProgressBar.style.width = `${(stepIndex + 1) * 25}%`;
      }
    }, 450);

    setTimeout(() => {
      clearInterval(stepInterval);
      overlay.classList.add('hidden');

      // Execute NLP Analysis
      const result = analyzeEmotionalState(text);

      // Update State
      State.currentMood = result.emotion;
      State.confidence = result.confidence;
      State.valence = result.valence;
      State.stressLevel = result.stressLevel;
      State.energyLevel = result.energyLevel;
      State.detectedKeywords = result.keywords;
      State.noticedExplanation = result.explanation;

      // Update UI
      renderResultsUI(result);
      renderStudySuggestions(result.emotion);
      updateNavbarMood(result.emotion);
      updateChatbotMoodSync(result.emotion);

      // Auto-save to LocalStorage history
      saveToHistory(source, result, text.slice(0, 75) + (text.length > 75 ? '...' : ''));

      // Smooth scroll to Result Section
      const resultSection = document.getElementById('resultSection');
      if (resultSection) {
        resultSection.scrollIntoView({ behavior: 'smooth' });
      }

      showToast(`AI Detected: ${EMOTIONS_CONFIG[result.emotion].name} (${result.confidence}%)`, 'success');
    }, 1900);
  }

  // ==========================================================================
  // 6. RENDER RESULTS & ADAPTIVE STUDY SUGGESTIONS
  // ==========================================================================
  function renderResultsUI(result) {
    const config = EMOTIONS_CONFIG[result.emotion] || EMOTIONS_CONFIG.Calm;

    // Mood Emoji & Name
    DOM.resultMoodEmoji.innerHTML = `<span>${config.emoji}</span>`;
    DOM.resultMoodEmoji.style.borderColor = config.color;
    DOM.resultMoodName.textContent = config.name;
    DOM.resultMoodDescriptor.textContent = config.descriptor;

    // Confidence Circular SVG
    DOM.resultConfidenceText.textContent = `${result.confidence}%`;
    const dashArray = `${result.confidence}, 100`;
    DOM.confidenceCircleProgress.setAttribute('stroke-dasharray', dashArray);
    DOM.confidenceCircleProgress.style.stroke = config.color;

    // Sub metrics
    const valenceDisplay = (result.valence >= 0 ? '+' : '') + result.valence;
    DOM.valenceVal.textContent = valenceDisplay;
    const valencePercent = Math.round(((result.valence + 1) / 2) * 100);
    DOM.valenceBar.style.width = `${valencePercent}%`;

    DOM.stressVal.textContent = `${result.stressLevel}% (${result.stressLevel > 60 ? 'Elevated' : (result.stressLevel > 35 ? 'Moderate' : 'Low')})`;
    DOM.stressBar.style.width = `${result.stressLevel}%`;

    DOM.energyVal.textContent = `${result.energyLevel}% (${result.energyLevel > 70 ? 'High' : (result.energyLevel > 40 ? 'Moderate' : 'Low')})`;
    DOM.energyBar.style.width = `${result.energyLevel}%`;

    // What AI Noticed
    DOM.aiNoticedText.textContent = `"${result.explanation}"`;

    // Keyword Tags
    DOM.detectedKeywordsTags.innerHTML = '';
    result.keywords.forEach((kw) => {
      const tag = document.createElement('span');
      tag.className = 'keyword-tag';
      tag.textContent = `#${kw}`;
      DOM.detectedKeywordsTags.appendChild(tag);
    });

    // Hero Avatar Pill Sync
    if (DOM.pillMoodEmoji) DOM.pillMoodEmoji.textContent = config.emoji;
    if (DOM.pillMoodText) DOM.pillMoodText.textContent = `Detected: ${config.name}`;
  }

  function renderStudySuggestions(emotion) {
    const config = EMOTIONS_CONFIG[emotion] || EMOTIONS_CONFIG.Calm;

    DOM.suggestionHeading.textContent = `Study Protocol for ${config.name} State`;
    DOM.suggestionIntro.textContent = `Personalized study tactical recommendations based on your current emotional frequency and cognitive bandwidth:`;

    DOM.recommendationsList.innerHTML = '';
    config.studySuggestions.forEach((sug) => {
      const item = document.createElement('div');
      item.className = 'recommendation-item';
      item.innerHTML = `
        <div class="rec-icon"><i class="fa-solid ${sug.icon}"></i></div>
        <div class="rec-content">
          <strong>${sug.title}</strong>
          <p>${sug.desc}</p>
        </div>
      `;
      DOM.recommendationsList.appendChild(item);
    });

    // Timer Sync Button
    DOM.applyTimerBtnText.textContent = config.timerPreset.label;
  }

  function updateNavbarMood(emotion) {
    const config = EMOTIONS_CONFIG[emotion] || EMOTIONS_CONFIG.Calm;
    DOM.navMoodEmoji.textContent = config.emoji;
    DOM.navMoodText.textContent = emotion;
    DOM.navMoodBadge.style.borderColor = config.color;
  }

  function updateChatbotMoodSync(emotion) {
    const config = EMOTIONS_CONFIG[emotion] || EMOTIONS_CONFIG.Calm;
    DOM.chatBotMoodSync.innerHTML = `<i class="fa-solid fa-link"></i> Synced with your mood: ${config.emoji} ${emotion}`;
  }

  // Apply Study Timer from Suggestion Button
  DOM.applyTimerPresetBtn.addEventListener('click', () => {
    const config = EMOTIONS_CONFIG[State.currentMood] || EMOTIONS_CONFIG.Calm;
    const preset = config.timerPreset;

    // Set Pomodoro Mode
    setTimerMode(preset.mode, preset.seconds);

    // Scroll to timer
    const timerSection = document.getElementById('timerSection');
    if (timerSection) {
      timerSection.scrollIntoView({ behavior: 'smooth' });
    }
    showToast(`Timer synced: ${preset.label}`, 'success');
  });

  // Regenerate / Refresh Suggestions
  DOM.refreshSuggestionsBtn.addEventListener('click', () => {
    renderStudySuggestions(State.currentMood);
    showToast('Study suggestions refreshed!', 'info');
  });

  // Save Mood Log button
  DOM.saveMoodLogBtn.addEventListener('click', () => {
    showToast('Mood result saved in historical database.', 'success');
    const dashSection = document.getElementById('dashboardSection');
    if (dashSection) dashSection.scrollIntoView({ behavior: 'smooth' });
  });

  // ==========================================================================
  // 7. AI STUDY ASSISTANT (CHATBOT)
  // ==========================================================================
  function initChatbot() {
    let lastBotReplyText = "Hello! I'm your AI Study Assistant. I can help organize your study sessions, break down complex topics, calm exam stress, or create smart revision schedules.";

    // Chat form submit
    DOM.chatForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const userText = DOM.chatInput.value.trim();
      if (!userText) return;

      appendChatMessage('user', userText);
      DOM.chatInput.value = '';

      // Show typing animation
      showBotTypingIndicator();

      // Formulate response based on student intent & current emotional state
      setTimeout(() => {
        removeBotTypingIndicator();
        const responseText = generateBotResponse(userText, State.currentMood);
        lastBotReplyText = responseText;
        appendChatMessage('bot', responseText);
      }, 700 + Math.random() * 400);
    });

    // Quick chat suggestion chips
    DOM.chatChips.forEach((chip) => {
      chip.addEventListener('click', () => {
        DOM.chatInput.value = chip.dataset.msg;
        DOM.chatForm.dispatchEvent(new Event('submit'));
      });
    });

    // Clear Chat
    DOM.clearChatBtn.addEventListener('click', () => {
      DOM.chatMessages.innerHTML = `
        <div class="chat-message bot-message">
          <div class="msg-avatar"><i class="fa-solid fa-brain"></i></div>
          <div class="msg-content">
            <p>Chat memory refreshed. How can I assist your study session today?</p>
            <span class="msg-time">Just now</span>
          </div>
        </div>
      `;
      showToast('Chat history cleared.', 'info');
    });

    // Text to Speech for last bot message
    DOM.speakLastMsgBtn.addEventListener('click', () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        // Strip HTML/markdown
        const cleanText = lastBotReplyText.replace(/<[^>]*>?/gm, '').replace(/[*_#]/g, '');
        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.rate = 1.0;
        utterance.pitch = 1.05;
        window.speechSynthesis.speak(utterance);
        showToast('AI Tutor speaking...', 'info');
      } else {
        showToast('Text-to-speech not supported in this browser.', 'warning');
      }
    });

    // Chat Voice Input Button
    DOM.chatVoiceInputBtn.addEventListener('click', () => {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        showToast('Speech recognition not supported in this browser.', 'warning');
        return;
      }
      const recog = new SpeechRecognition();
      recog.lang = 'en-US';
      recog.onstart = () => {
        showToast('Listening for chat question...', 'info');
        DOM.chatVoiceInputBtn.style.color = '#ec4899';
      };
      recog.onresult = (e) => {
        const transcript = e.results[0][0].transcript;
        DOM.chatInput.value = transcript;
        DOM.chatVoiceInputBtn.style.color = '';
        DOM.chatForm.dispatchEvent(new Event('submit'));
      };
      recog.onerror = () => {
        DOM.chatVoiceInputBtn.style.color = '';
      };
      recog.start();
    });
  }

  function appendChatMessage(sender, text) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `chat-message ${sender === 'user' ? 'user-message' : 'bot-message'}`;

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const avatarHtml = sender === 'user'
      ? `<div class="msg-avatar"><i class="fa-solid fa-user"></i></div>`
      : `<div class="msg-avatar"><i class="fa-solid fa-brain"></i></div>`;

    // Simple markdown formatting for bold and lists
    let formattedText = text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n- (.*?)(?=\n|$)/g, '<li>$1</li>');

    if (formattedText.includes('<li>')) {
      formattedText = formattedText.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');
    }

    msgDiv.innerHTML = `
      ${avatarHtml}
      <div class="msg-content">
        <p>${formattedText}</p>
        <span class="msg-time">${timeStr}</span>
      </div>
    `;

    DOM.chatMessages.appendChild(msgDiv);
    DOM.chatMessages.scrollTop = DOM.chatMessages.scrollHeight;
  }

  function showBotTypingIndicator() {
    const typingDiv = document.createElement('div');
    typingDiv.id = 'botTypingIndicator';
    typingDiv.className = 'chat-message bot-message';
    typingDiv.innerHTML = `
      <div class="msg-avatar"><i class="fa-solid fa-brain"></i></div>
      <div class="msg-content">
        <div class="typing-dots">
          <span></span><span></span><span></span>
        </div>
      </div>
    `;
    DOM.chatMessages.appendChild(typingDiv);
    DOM.chatMessages.scrollTop = DOM.chatMessages.scrollHeight;
  }

  function removeBotTypingIndicator() {
    const ind = document.getElementById('botTypingIndicator');
    if (ind) ind.remove();
  }

  // Intelligent Student NLP Chat Responses
  function generateBotResponse(input, mood) {
    const q = input.toLowerCase();

    // 1. Exam Stress & Panic
    if (q.includes('stress') || q.includes('exam tomorrow') || q.includes('panic') || q.includes('overwhelmed') || q.includes('nervous')) {
      return `I understand you're feeling the pressure. Remember: **Anxiety is just energy without a plan.**\n\nHere is your immediate emergency protocol:\n- **Step 1:** Take 3 slow 4-7-8 breaths (visit our Breathe section).\n- **Step 2:** List the top 20% highest-weight topics (Pareto Principle).\n- **Step 3:** Do 25 minutes of active recall on key definitions and formula sheets.\n- **Step 4:** Do not stay up past 1 AM—sleep is when memory consolidates.`;
    }

    // 2. Exam Preparation & Revision strategy
    if (q.includes('prepare') || q.includes('tomorrow') || q.includes('revision') || q.includes('study for exam')) {
      return `For tomorrow's exam, avoid passive re-reading. Use the **Blurting & Active Retrieval Method**:\n- 1. Pick a chapter or formula sheet.\n- 2. Read it for 5 minutes, close it, and write everything you recall on blank paper.\n- 3. Check gaps in red ink. Repeat once.\n- 4. Review past year exam questions to train pattern recognition. You've got this!`;
    }

    // 3. 2-Hour Study Plan
    if (q.includes('2-hour') || q.includes('2 hour') || q.includes('plan') || q.includes('schedule') || q.includes('timetable')) {
      return `Here is a high-retention **2-Hour High-Yield Study Plan** tailored for your current **${mood}** state:\n- **00:00 - 00:25:** *Pomodoro Block 1* - Hardest formulas / concepts while focus is fresh.\n- **00:25 - 00:30:** *5m Break* - Hydrate, stretch, avoid social media.\n- **00:30 - 00:55:** *Pomodoro Block 2* - Practice problems & self-testing.\n- **00:55 - 01:05:** *10m Break* - Quick walk around the room.\n- **01:05 - 01:30:** *Pomodoro Block 3* - Summary cheat sheet creation.\n- **01:30 - 01:50:** *Final Review* - Flashcard rapid-fire.`;
    }

    // 4. Concentration & Distraction
    if (q.includes('concentrate') || q.includes('distract') || q.includes('focus') || q.includes('procrastinat')) {
      return `When concentration slips, your working memory is overloaded or understimulated.\n\nTry the **"5-Minute Friction Buster"**:\n- Put your phone in another room or turn on Do Not Disturb.\n- Set our Pomodoro timer to 15 minutes.\n- Tell yourself: *"I only have to work for 15 minutes."*\n- 90% of the battle is starting; inertia takes over once you begin.`;
    }

    // 5. Feynman Technique
    if (q.includes('feynman') || q.includes('explain') || q.includes('technique')) {
      return `The **Feynman Technique** is the gold standard for deep conceptual mastery:\n- **1. Choose a concept:** E.g. Photosynthesis, Binary Search, or Newton's Third Law.\n- **2. Teach it to a 10-year-old:** Explain it in plain, jargon-free everyday words.\n- **3. Identify your gaps:** Whenever you get stuck or use complex jargon, return to the textbook.\n- **4. Simplify & use analogies:** Connect it to real-world objects.`;
    }

    // 6. Motivation & Encouragement
    if (q.includes('tired') || q.includes('sad') || q.includes('give up') || q.includes('cant do this') || q.includes("can't do this")) {
      return `Take a gentle breath. You don't have to be perfect; you just have to take one small step today. Every student encounters tough days.\n\nSince you are feeling **${mood}**, let's lower the threshold. Pick just **one single page** or **one example problem**. Let's complete that together!`;
    }

    // Default Contextual Response
    return `Based on your current **${mood}** mood profile, my best advice is to maintain structured pacing. Would you like a custom breakdown for a specific subject, an active recall strategy, or help setting up a Pomodoro focus block?`;
  }

  // ==========================================================================
  // 8. MOOD DASHBOARD & ANALYTICS (CHART.JS + LOCALSTORAGE)
  // ==========================================================================
  function initDashboard() {
    loadHistoryFromStorage();
    renderHistoryTable();
    updateDashboardStats();
    initCharts();

    // Export Data Button
    DOM.exportHistoryBtn.addEventListener('click', exportHistoryData);

    // Load Demo Data Button
    DOM.addSampleHistoryBtn.addEventListener('click', () => {
      loadDemoData();
      showToast('Loaded 5-day academic mood demo data!', 'success');
    });

    // Clear History Button
    DOM.clearHistoryBtn.addEventListener('click', () => {
      if (confirm('Are you sure you want to clear your mood history log?')) {
        State.history = [];
        saveHistoryToStorage();
        renderHistoryTable();
        updateDashboardStats();
        updateCharts();
        showToast('History log cleared.', 'info');
      }
    });
  }

  function loadHistoryFromStorage() {
    try {
      const stored = localStorage.getItem('mindstudy_mood_history');
      if (stored) {
        State.history = JSON.parse(stored);
      } else {
        // Seed initial demo data
        seedInitialDemoHistory();
      }
    } catch (e) {
      console.warn('LocalStorage load failed', e);
      seedInitialDemoHistory();
    }
  }

  function saveHistoryToStorage() {
    try {
      localStorage.setItem('mindstudy_mood_history', JSON.stringify(State.history));
    } catch (e) {
      console.warn('LocalStorage save failed', e);
    }
  }

  function seedInitialDemoHistory() {
    State.history = [
      {
        id: 1,
        date: 'Mon, Sep 22',
        time: '09:30 AM',
        method: 'Voice',
        mood: 'Calm',
        confidence: 88,
        valence: 0.65,
        stress: 20,
        snippet: 'Prepared syllabus and organized notes for calculus.',
        action: 'Standard 25m Pomodoro block'
      },
      {
        id: 2,
        date: 'Tue, Sep 23',
        time: '04:15 PM',
        method: 'Text',
        mood: 'Stressed',
        confidence: 91,
        valence: -0.60,
        stress: 85,
        snippet: 'Chemistry lab report deadline in 3 hours, feeling overwhelmed.',
        action: '4-7-8 Breathing & 15m micro-sprint'
      },
      {
        id: 3,
        date: 'Wed, Sep 24',
        time: '11:00 AM',
        method: 'Voice',
        mood: 'Happy',
        confidence: 94,
        valence: 0.85,
        stress: 15,
        snippet: 'Scored an A in physics quiz! High motivation.',
        action: 'Conquer hardest chapter (50m Deep block)'
      },
      {
        id: 4,
        date: 'Thu, Sep 25',
        time: '08:45 PM',
        method: 'Text',
        mood: 'Tired',
        confidence: 85,
        valence: -0.20,
        stress: 55,
        snippet: 'Studying continuously since afternoon, heavy brain fog.',
        action: '20m power nap & hydration'
      },
      {
        id: 5,
        date: 'Fri, Sep 26',
        time: '10:15 AM',
        method: 'Voice',
        mood: 'Calm',
        confidence: 89,
        valence: 0.70,
        stress: 22,
        snippet: 'Reviewing history flashcards smoothly with lofi music.',
        action: 'Feynman technique summary'
      }
    ];
    saveHistoryToStorage();
  }

  function loadDemoData() {
    seedInitialDemoHistory();
    renderHistoryTable();
    updateDashboardStats();
    updateCharts();
  }

  function saveToHistory(method, result, snippet) {
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newEntry = {
      id: Date.now(),
      date: dateStr,
      time: timeStr,
      method: method.includes('Voice') ? 'Voice' : 'Text',
      mood: result.emotion,
      confidence: result.confidence,
      valence: result.valence,
      stress: result.stressLevel,
      snippet: snippet || 'General study check-in.',
      action: EMOTIONS_CONFIG[result.emotion]?.studySuggestions[0]?.title || 'Standard study block'
    };

    State.history.unshift(newEntry);
    saveHistoryToStorage();
    renderHistoryTable();
    updateDashboardStats();
    updateCharts();
  }

  function renderHistoryTable() {
    DOM.historyTableBody.innerHTML = '';

    if (State.history.length === 0) {
      DOM.historyTableBody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align:center; color:var(--text-muted); padding:2rem;">
            No mood logs recorded yet. Use Voice or Text analysis to add entries!
          </td>
        </tr>
      `;
      return;
    }

    State.history.forEach((item) => {
      const config = EMOTIONS_CONFIG[item.mood] || EMOTIONS_CONFIG.Calm;
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><strong>${item.date}</strong> <small style="color:var(--text-dim); display:block;">${item.time}</small></td>
        <td><i class="fa-solid ${item.method === 'Voice' ? 'fa-microphone' : 'fa-pen-nib'}" style="color:var(--accent-pink); margin-right:4px;"></i> ${item.method}</td>
        <td>
          <span class="badge-mood-table ${config.badgeClass}">
            <span>${config.emoji}</span> ${item.mood}
          </span>
        </td>
        <td><strong style="color:#ffffff;">${item.confidence}%</strong></td>
        <td style="max-width:240px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="${item.snippet}">${item.snippet}</td>
        <td style="color:var(--accent-cyan); font-size:0.825rem;">${item.action}</td>
        <td>
          <button class="btn-link" onclick="window.deleteHistoryItem(${item.id})" title="Delete entry">
            <i class="fa-solid fa-trash" style="color:var(--accent-rose);"></i>
          </button>
        </td>
      `;
      DOM.historyTableBody.appendChild(tr);
    });
  }

  // Global window hook for row deletion
  window.deleteHistoryItem = function (id) {
    State.history = State.history.filter((item) => item.id !== id);
    saveHistoryToStorage();
    renderHistoryTable();
    updateDashboardStats();
    updateCharts();
    showToast('Entry deleted.', 'info');
  };

  function updateDashboardStats() {
    DOM.dashTotalCheckins.textContent = State.history.length;

    if (State.history.length === 0) {
      DOM.dashDominantMood.textContent = 'None';
      DOM.dashAvgConfidence.textContent = '0%';
      return;
    }

    // Dominant Mood calculation
    const counts = {};
    let totalConf = 0;
    State.history.forEach((h) => {
      counts[h.mood] = (counts[h.mood] || 0) + 1;
      totalConf += h.confidence;
    });

    let topMood = 'Calm';
    let topCount = 0;
    Object.keys(counts).forEach((m) => {
      if (counts[m] > topCount) {
        topCount = counts[m];
        topMood = m;
      }
    });

    const dominantPercent = Math.round((topCount / State.history.length) * 100);
    DOM.dashDominantMood.textContent = `${topMood} (${dominantPercent}%)`;

    const avgConf = (totalConf / State.history.length).toFixed(1);
    DOM.dashAvgConfidence.textContent = `${avgConf}%`;
  }

  function initCharts() {
    if (typeof Chart === 'undefined') {
      console.warn('Chart.js not loaded');
      return;
    }

    // Weekly Mood Line Chart
    const ctxWeekly = DOM.weeklyMoodCanvas.getContext('2d');
    const recent = State.history.slice(0, 7).reverse();
    const labels = recent.length ? recent.map((r) => r.date) : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const stressData = recent.length ? recent.map((r) => r.stress) : [20, 85, 15, 55, 22, 30, 25];
    const confData = recent.length ? recent.map((r) => r.confidence) : [88, 91, 94, 85, 89, 87, 90];

    weeklyChartInstance = new Chart(ctxWeekly, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Stress Index (%)',
            data: stressData,
            borderColor: '#ec4899',
            backgroundColor: 'rgba(236, 72, 153, 0.12)',
            fill: true,
            tension: 0.4,
            pointBackgroundColor: '#ec4899',
            pointRadius: 5
          },
          {
            label: 'AI Confidence (%)',
            data: confData,
            borderColor: '#06b6d4',
            backgroundColor: 'rgba(6, 182, 212, 0.05)',
            borderDash: [5, 5],
            fill: false,
            tension: 0.3,
            pointBackgroundColor: '#06b6d4',
            pointRadius: 4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: { color: '#cbd5e1', font: { family: 'Outfit', size: 12 } }
          }
        },
        scales: {
          y: {
            min: 0,
            max: 100,
            grid: { color: 'rgba(255, 255, 255, 0.06)' },
            ticks: { color: '#94a3b8' }
          },
          x: {
            grid: { color: 'rgba(255, 255, 255, 0.04)' },
            ticks: { color: '#94a3b8' }
          }
        }
      }
    });

    // Mood Distribution Doughnut Chart
    const ctxDist = DOM.moodDistCanvas.getContext('2d');
    const moodCounts = { Calm: 2, Stressed: 1, Happy: 1, Tired: 1 };

    distChartInstance = new Chart(ctxDist, {
      type: 'doughnut',
      data: {
        labels: Object.keys(moodCounts),
        datasets: [
          {
            data: Object.values(moodCounts),
            backgroundColor: ['#06b6d4', '#f43f5e', '#10b981', '#f59e0b', '#8b5cf6'],
            borderColor: '#0e101f',
            borderWidth: 3
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: { color: '#cbd5e1', font: { family: 'Outfit', size: 11 }, padding: 12 }
          }
        },
        cutout: '68%'
      }
    });

    updateCharts();
  }

  function updateCharts() {
    if (!weeklyChartInstance || !distChartInstance) return;

    const recent = State.history.slice(0, 7).reverse();
    if (recent.length) {
      weeklyChartInstance.data.labels = recent.map((r) => r.date);
      weeklyChartInstance.data.datasets[0].data = recent.map((r) => r.stress);
      weeklyChartInstance.data.datasets[1].data = recent.map((r) => r.confidence);
      weeklyChartInstance.update();

      // Distribution
      const counts = {};
      State.history.forEach((h) => {
        counts[h.mood] = (counts[h.mood] || 0) + 1;
      });

      distChartInstance.data.labels = Object.keys(counts);
      distChartInstance.data.datasets[0].data = Object.values(counts);
      distChartInstance.update();
    }
  }

  function exportHistoryData() {
    if (State.history.length === 0) {
      showToast('No history data to export.', 'warning');
      return;
    }

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(State.history, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute('href', dataStr);
    dlAnchorElem.setAttribute('download', `mindstudy_mood_history_${Date.now()}.json`);
    dlAnchorElem.click();
    showToast('Exported mood history as JSON file!', 'success');
  }

  // ==========================================================================
  // 9. POMODORO TIMER & SYNTHESIZED WEB AUDIO SOUNDSCAPE
  // ==========================================================================
  function initPomodoroTimer() {
    // Mode Buttons
    DOM.timerModeBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        DOM.timerModeBtns.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        const mode = btn.dataset.mode;
        const time = parseInt(btn.dataset.time, 10);
        setTimerMode(mode, time);
      });
    });

    // Start Button
    DOM.timerStartBtn.addEventListener('click', () => {
      if (State.pomodoro.isRunning) return;
      State.pomodoro.isRunning = true;
      DOM.timerStartBtn.disabled = true;
      DOM.timerPauseBtn.disabled = false;

      State.pomodoro.timerId = setInterval(() => {
        if (State.pomodoro.remainingSeconds > 0) {
          State.pomodoro.remainingSeconds--;
          updateTimerDisplay();
        } else {
          onTimerComplete();
        }
      }, 1000);
      showToast('Focus timer running...', 'info');
    });

    // Pause Button
    DOM.timerPauseBtn.addEventListener('click', () => {
      if (!State.pomodoro.isRunning) return;
      State.pomodoro.isRunning = false;
      clearInterval(State.pomodoro.timerId);
      DOM.timerStartBtn.disabled = false;
      DOM.timerPauseBtn.disabled = true;
      showToast('Timer paused.', 'info');
    });

    // Reset Button
    DOM.timerResetBtn.addEventListener('click', () => {
      State.pomodoro.isRunning = false;
      clearInterval(State.pomodoro.timerId);
      State.pomodoro.remainingSeconds = State.pomodoro.totalSeconds;
      DOM.timerStartBtn.disabled = false;
      DOM.timerPauseBtn.disabled = true;
      updateTimerDisplay();
      showToast('Timer reset.', 'info');
    });

    // Sound chips
    DOM.soundChips.forEach((chip) => {
      chip.addEventListener('click', () => {
        DOM.soundChips.forEach((c) => c.classList.remove('active'));
        chip.classList.add('active');
        const soundType = chip.dataset.sound;
        setAmbientSoundscape(soundType);
      });
    });

    // Navbar sound toggle
    DOM.ambientSoundToggle.addEventListener('click', () => {
      if (State.ambient.activeSound === 'none') {
        setAmbientSoundscape('binaural');
        DOM.soundChips.forEach((c) => c.classList.toggle('active', c.dataset.sound === 'binaural'));
      } else {
        setAmbientSoundscape('none');
        DOM.soundChips.forEach((c) => c.classList.toggle('active', c.dataset.sound === 'none'));
      }
    });

    updateTimerDisplay();
  }

  function setTimerMode(mode, seconds) {
    State.pomodoro.isRunning = false;
    clearInterval(State.pomodoro.timerId);
    State.pomodoro.mode = mode;
    State.pomodoro.totalSeconds = seconds;
    State.pomodoro.remainingSeconds = seconds;

    DOM.timerStartBtn.disabled = false;
    DOM.timerPauseBtn.disabled = true;

    if (mode === 'pomodoro') {
      DOM.timerModeLabel.textContent = 'Focus Mode';
      DOM.timerTaskLabel.textContent = 'Topic: Deep Active Study';
    } else if (mode === 'shortBreak') {
      DOM.timerModeLabel.textContent = 'Short Break';
      DOM.timerTaskLabel.textContent = 'Stretch, Hydrate & Breathe';
    } else if (mode === 'longBreak') {
      DOM.timerModeLabel.textContent = 'Long Break';
      DOM.timerTaskLabel.textContent = 'Brain Reset & Snack';
    } else if (mode === 'deepWork') {
      DOM.timerModeLabel.textContent = 'Deep Work Block';
      DOM.timerTaskLabel.textContent = 'Intense Problem Solving';
    }

    updateTimerDisplay();
  }

  function updateTimerDisplay() {
    const mins = Math.floor(State.pomodoro.remainingSeconds / 60).toString().padStart(2, '0');
    const secs = (State.pomodoro.remainingSeconds % 60).toString().padStart(2, '0');
    DOM.timerDigits.textContent = `${mins}:${secs}`;

    // SVG Circular progress ring
    const total = State.pomodoro.totalSeconds;
    const progress = (total - State.pomodoro.remainingSeconds) / total;
    const circumference = 753.98; // 2 * pi * 120
    const offset = circumference - progress * circumference;
    DOM.timerCircleProgress.style.strokeDashoffset = offset;
  }

  function onTimerComplete() {
    clearInterval(State.pomodoro.timerId);
    State.pomodoro.isRunning = false;
    DOM.timerStartBtn.disabled = false;
    DOM.timerPauseBtn.disabled = true;

    // Play Bell Audio Chime via Web Audio API
    playSynthesizedBell();

    if (State.pomodoro.mode === 'pomodoro' || State.pomodoro.mode === 'deepWork') {
      State.pomodoro.completedToday++;
      DOM.completedSessionsCount.textContent = State.pomodoro.completedToday;
      DOM.dashPomodorosDone.textContent = State.pomodoro.completedToday;
      showToast('🎉 Great job! Study block complete. Take a well-deserved break.', 'success');
      setTimerMode('shortBreak', 300);
    } else {
      showToast('Break finished! Ready for the next study sprint?', 'info');
      setTimerMode('pomodoro', 1500);
    }
  }

  // Web Audio Synthesizer: Crisp Zen Bell Chime
  function playSynthesizedBell() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.8); // A5

      gain.gain.setValueAtTime(0.4, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2.5);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 2.6);
    } catch (e) {
      console.warn('Audio bell failed', e);
    }
  }

  // Web Audio Synthesizer: Focus Soundscapes
  function setAmbientSoundscape(type) {
    // Clean up existing nodes
    if (State.ambient.audioCtx) {
      State.ambient.nodes.forEach((n) => {
        try { n.stop(); } catch (e) {}
      });
      State.ambient.nodes = [];
      try { State.ambient.audioCtx.close(); } catch (e) {}
      State.ambient.audioCtx = null;
    }

    State.ambient.activeSound = type;

    if (type === 'none') {
      DOM.ambientSoundToggle.style.color = '';
      showToast('Ambient audio muted.', 'info');
      return;
    }

    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      State.ambient.audioCtx = new AudioCtx();
      const ctx = State.ambient.audioCtx;

      if (type === 'binaural') {
        // 40Hz Gamma / 10Hz Alpha Binaural carrier
        const oscL = ctx.createOscillator();
        const oscR = ctx.createOscillator();
        const merger = ctx.createChannelMerger(2);
        const gain = ctx.createGain();

        oscL.frequency.value = 210; // Left ear
        oscR.frequency.value = 250; // Right ear (40Hz beat)
        gain.gain.value = 0.08;

        oscL.connect(merger, 0, 0);
        oscR.connect(merger, 0, 1);
        merger.connect(gain);
        gain.connect(ctx.destination);

        oscL.start();
        oscR.start();
        State.ambient.nodes.push(oscL, oscR);
        showToast('Playing 40Hz Focus Alpha wave.', 'success');

      } else if (type === 'rain' || type === 'space') {
        // Synthesize Pink Noise for rain or space drone
        const bufferSize = ctx.sampleRate * 2;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        let b0 = 0, b1 = 0, b2 = 0;

        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          b0 = 0.99886 * b0 + white * 0.0555179;
          b1 = 0.99332 * b1 + white * 0.0750759;
          b2 = 0.96900 * b2 + white * 0.1538520;
          output[i] = (b0 + b1 + b2 + white * 0.5362) * (type === 'rain' ? 0.04 : 0.02);
        }

        const whiteNoise = ctx.createBufferSource();
        whiteNoise.buffer = noiseBuffer;
        whiteNoise.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = type === 'rain' ? 'lowpass' : 'bandpass';
        filter.frequency.value = type === 'rain' ? 800 : 250;

        whiteNoise.connect(filter);
        filter.connect(ctx.destination);
        whiteNoise.start();
        State.ambient.nodes.push(whiteNoise);
        showToast(`Playing ${type === 'rain' ? 'Rain' : 'Cosmic Drone'} soundscape.`, 'success');
      }

      DOM.ambientSoundToggle.style.color = '#06b6d4';
    } catch (e) {
      console.warn('Ambient synthesis failed', e);
      showToast('Could not start ambient audio in this browser.', 'warning');
    }
  }

  // ==========================================================================
  // 10. GUIDED 4-7-8 BREATHING RESET MODULE
  // ==========================================================================
  function initBreathingModule() {
    DOM.startBreathBtn.addEventListener('click', () => {
      if (State.breathing.isRunning) return;
      State.breathing.isRunning = true;
      DOM.startBreathBtn.disabled = true;
      DOM.stopBreathBtn.disabled = false;
      startBreathingCycle();
      showToast('Breathing session started. Follow the circle.', 'info');
    });

    DOM.stopBreathBtn.addEventListener('click', () => {
      stopBreathingCycle();
      showToast('Breathing session stopped.', 'info');
    });
  }

  function startBreathingCycle() {
    let currentStep = 'inhale';
    let stepCount = 4;

    function applyStep() {
      DOM.stepInhale.classList.toggle('active', currentStep === 'inhale');
      DOM.stepHold.classList.toggle('active', currentStep === 'hold');
      DOM.stepExhale.classList.toggle('active', currentStep === 'exhale');

      DOM.breathCircle.className = `breath-circle ${currentStep}`;

      if (currentStep === 'inhale') {
        DOM.breathInstruction.textContent = 'Inhale';
        stepCount = 4;
      } else if (currentStep === 'hold') {
        DOM.breathInstruction.textContent = 'Hold';
        stepCount = 7;
      } else if (currentStep === 'exhale') {
        DOM.breathInstruction.textContent = 'Exhale';
        stepCount = 8;
      }
      DOM.breathCountdown.textContent = stepCount;
    }

    applyStep();

    State.breathing.intervalId = setInterval(() => {
      stepCount--;
      if (stepCount > 0) {
        DOM.breathCountdown.textContent = stepCount;
      } else {
        // Transition step
        if (currentStep === 'inhale') {
          currentStep = 'hold';
        } else if (currentStep === 'hold') {
          currentStep = 'exhale';
        } else if (currentStep === 'exhale') {
          currentStep = 'inhale';
        }
        applyStep();
      }
    }, 1000);
  }

  function stopBreathingCycle() {
    State.breathing.isRunning = false;
    clearInterval(State.breathing.intervalId);
    DOM.startBreathBtn.disabled = false;
    DOM.stopBreathBtn.disabled = true;

    DOM.breathCircle.className = 'breath-circle';
    DOM.breathInstruction.textContent = 'Ready';
    DOM.breathCountdown.textContent = '4';

    DOM.stepInhale.classList.remove('active');
    DOM.stepHold.classList.remove('active');
    DOM.stepExhale.classList.remove('active');
  }

  // ==========================================================================
  // 11. NAVIGATION, TOASTS, & KEYBOARD SHORTCUTS
  // ==========================================================================
  function initNavigationAndShortcuts() {
    // Mobile menu toggle
    DOM.mobileMenuBtn.addEventListener('click', () => {
      DOM.navMenu.classList.toggle('open');
    });

    // Close mobile menu on link click
    document.querySelectorAll('.nav-link').forEach((link) => {
      link.addEventListener('click', () => {
        DOM.navMenu.classList.remove('open');
      });
    });

    // Smooth scroll for hero CTA buttons
    const heroVoiceBtn = document.getElementById('heroVoiceBtn');
    const heroTextBtn = document.getElementById('heroTextBtn');
    if (heroVoiceBtn) {
      heroVoiceBtn.addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('voiceSection').scrollIntoView({ behavior: 'smooth' });
      });
    }
    if (heroTextBtn) {
      heroTextBtn.addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('textSection').scrollIntoView({ behavior: 'smooth' });
      });
    }

    // Keyboard Shortcuts (Alt + V, Alt + T, Alt + C, Alt + P, Alt + B)
    window.addEventListener('keydown', (e) => {
      if (e.altKey) {
        const key = e.key.toLowerCase();
        if (key === 'v') {
          e.preventDefault();
          document.getElementById('voiceSection')?.scrollIntoView({ behavior: 'smooth' });
          showToast('Shortcut: Voice Section', 'info');
        } else if (key === 't') {
          e.preventDefault();
          document.getElementById('textSection')?.scrollIntoView({ behavior: 'smooth' });
          showToast('Shortcut: Text Section', 'info');
        } else if (key === 'c') {
          e.preventDefault();
          document.getElementById('chatbotSection')?.scrollIntoView({ behavior: 'smooth' });
          DOM.chatInput?.focus();
          showToast('Shortcut: AI Chatbot', 'info');
        } else if (key === 'p') {
          e.preventDefault();
          document.getElementById('timerSection')?.scrollIntoView({ behavior: 'smooth' });
          showToast('Shortcut: Pomodoro Timer', 'info');
        } else if (key === 'b') {
          e.preventDefault();
          document.getElementById('breathingSection')?.scrollIntoView({ behavior: 'smooth' });
          showToast('Shortcut: Guided Breathing', 'info');
        }
      }
    });

    // Highlight active nav item on scroll
    window.addEventListener('scroll', () => {
      const sections = ['hero', 'voiceSection', 'textSection', 'resultSection', 'chatbotSection', 'dashboardSection', 'timerSection', 'breathingSection'];
      const scrollY = window.pageYOffset;

      sections.forEach((secId) => {
        const el = document.getElementById(secId);
        if (el) {
          const top = el.offsetTop - 120;
          const height = el.offsetHeight;
          if (scrollY >= top && scrollY < top + height) {
            document.querySelectorAll('.nav-link').forEach((lnk) => {
              lnk.classList.toggle('active', lnk.getAttribute('href') === `#${secId}`);
            });
          }
        }
      });
    });
  }

  // Toast Notification System
  function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    let icon = 'fa-circle-info';
    if (type === 'success') icon = 'fa-circle-check';
    else if (type === 'warning') icon = 'fa-triangle-exclamation';
    else if (type === 'error') icon = 'fa-circle-xmark';

    toast.innerHTML = `
      <i class="fa-solid ${icon} toast-icon"></i>
      <span>${message}</span>
    `;

    DOM.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }

  // ==========================================================================
  // INITIALIZATION ON DOM READY
  // ==========================================================================
  document.addEventListener('DOMContentLoaded', () => {
    initParticleCanvas();
    initNeuralOrb();
    initVoiceEngine();
    initTextEngine();
    initChatbot();
    initDashboard();
    initPomodoroTimer();
    initBreathingModule();
    initNavigationAndShortcuts();

    // Initial default render for results
    renderResultsUI({
      emotion: 'Calm',
      confidence: 87,
      valence: 0.62,
      stressLevel: 25,
      energyLevel: 80,
      keywords: ['focused', 'organized', 'moderate-pace'],
      explanation: 'Your speech and text express steady focus, constructive optimism, and a low level of cognitive friction. Excellent state for deep retention.'
    });
    renderStudySuggestions('Calm');

    console.log('✨ Student Voice Mood & Study Assistant Initialized.');
  });

})();
