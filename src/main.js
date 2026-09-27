import { questionsData } from './questions.js';

// --- STATE MANAGEMENT ---
const defaultState = {
  xp: 540,
  streak: 7,
  completedQuizzes: 12,
  correctAnswers: 42,
  totalAnswers: 51,
  recentQuizzes: [
    { name: 'Science Knowledge', score: '85%' },
    { name: 'Technology Basics', score: '70%' },
    { name: 'General Knowledge', score: '90%' }
  ]
};

let userState = JSON.parse(localStorage.getItem('quizzyState')) || defaultState;

function saveState() {
  localStorage.setItem('quizzyState', JSON.stringify(userState));
  updateUIStats();
}

const categories = [
  { name: 'Science', icon: '🔬', count: 5, color: '#E0F4FF' },
  { name: 'Technology', icon: '💻', count: 5, color: '#EBE4FF' },
  { name: 'General Knowledge', icon: '🌍', count: 5, color: '#E6FFE6' },
  { name: 'Movies', icon: '🎬', count: 5, color: '#FFE6F0' },
  { name: 'Sports', icon: '⚽', count: 5, color: '#FFF2E0' }
];

let quizState = {
  activeQuestions: [],
  currentIndex: 0,
  correctCount: 0,
  wrongCount: 0,
  timerInterval: null,
  timeLeft: 15,
  category: '',
  selectedOption: null,
  answered: false
};

// --- DOM ELEMENTS ---
// Navigation
const navItems = document.querySelectorAll('.nav-item, .mobile-nav-item');
const views = document.querySelectorAll('.view');
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const mobileNavOverlay = document.getElementById('mobile-nav-overlay');
const mobileCloseBtn = document.getElementById('mobile-close-btn');
const sidebarProfile = document.querySelector('.sidebar-profile');
const viewAllLeaderboardBtn = document.getElementById('view-all-leaderboard');

// Home View
const categoriesContainer = document.getElementById('categories-container');
const btnDailyChallenge = document.getElementById('btn-daily-challenge');
const playBtns = document.querySelectorAll('.play-btn');

// Quiz View
const quizCategoryTitle = document.getElementById('quiz-category-title');
const currentQuestionNum = document.getElementById('current-question-num');
const totalQuestionsNum = document.getElementById('total-questions-num');
const quizProgressFill = document.getElementById('quiz-progress-fill');
const quizTimerText = document.getElementById('quiz-timer');
const quizQuestionText = document.getElementById('quiz-question-text');
const quizOptionsContainer = document.getElementById('quiz-options-container');
const btnQuizAction = document.getElementById('btn-quiz-action');

// Result View
const resultMessage = document.getElementById('result-message');
const resultXp = document.getElementById('result-xp');
const resultCorrect = document.getElementById('result-correct');
const resultWrong = document.getElementById('result-wrong');
const resultAccuracy = document.getElementById('result-accuracy');
const resultStreakText = document.getElementById('result-streak-text');
const btnPlayAgain = document.getElementById('btn-play-again');
const btnBackHome = document.getElementById('btn-back-home');

// Stats Elements
const streakXpDisplay = document.getElementById('streak-xp-display');
const profileXpDisplay = document.getElementById('profile-xp-display');
const profileStreakDisplay = document.getElementById('profile-streak-display');
const profileCompleted = document.getElementById('profile-completed');
const profileCorrect = document.getElementById('profile-correct');
const profileAccuracy = document.getElementById('profile-accuracy');
const recentQuizzesList = document.getElementById('recent-quizzes-list');

// --- INITIALIZATION ---
function init() {
  renderCategories();
  updateUIStats();
  setupEventListeners();
}

// --- EVENT LISTENERS ---
function setupEventListeners() {
  // Navigation
  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      const target = e.currentTarget.getAttribute('data-target');
      navigateTo(target);
      mobileNavOverlay.classList.remove('open');
    });
  });

  sidebarProfile.addEventListener('click', () => navigateTo('profile-view'));
  viewAllLeaderboardBtn.addEventListener('click', () => navigateTo('leaderboard-view'));

  mobileMenuBtn.addEventListener('click', () => {
    mobileNavOverlay.classList.add('open');
  });

  mobileCloseBtn.addEventListener('click', () => {
    mobileNavOverlay.classList.remove('open');
  });

  // Start Quiz triggers
  btnDailyChallenge.addEventListener('click', () => {
    // Random category for daily challenge
    const randomCat = categories[Math.floor(Math.random() * categories.length)].name;
    startQuiz(randomCat);
  });

  playBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const category = e.currentTarget.getAttribute('data-category');
      startQuiz(category);
    });
  });

  // Quiz Actions
  btnQuizAction.addEventListener('click', handleQuizAction);
  
  // Result Actions
  btnPlayAgain.addEventListener('click', () => startQuiz(quizState.category));
  btnBackHome.addEventListener('click', () => navigateTo('home-view'));
}

// --- NAVIGATION ---
function navigateTo(viewId) {
  views.forEach(view => {
    view.classList.remove('active-view');
    if (!view.classList.contains('hidden')) {
      view.classList.add('hidden');
    }
  });
  
  const targetView = document.getElementById(viewId);
  targetView.classList.remove('hidden');
  targetView.classList.add('active-view');

  // Update active nav items
  navItems.forEach(item => {
    item.classList.remove('active');
    if (item.getAttribute('data-target') === viewId) {
      item.classList.add('active');
    }
  });

  window.scrollTo(0, 0);
}

// --- UI UPDATES ---
function renderCategories() {
  categoriesContainer.innerHTML = '';
  categories.forEach(cat => {
    const card = document.createElement('div');
    card.className = 'category-card';
    card.style.backgroundColor = cat.color;
    card.style.borderColor = cat.color;
    card.innerHTML = `
      <div class="category-icon">${cat.icon}</div>
      <h4>${cat.name}</h4>
      <p>${cat.count} Quizzes</p>
    `;
    card.addEventListener('click', () => startQuiz(cat.name));
    categoriesContainer.appendChild(card);
  });
}

function updateUIStats() {
  streakXpDisplay.textContent = userState.xp;
  profileXpDisplay.textContent = userState.xp;
  profileStreakDisplay.textContent = userState.streak;
  profileCompleted.textContent = userState.completedQuizzes;
  profileCorrect.textContent = userState.correctAnswers;
  
  const accuracy = userState.totalAnswers > 0 
    ? Math.round((userState.correctAnswers / userState.totalAnswers) * 100) 
    : 0;
  profileAccuracy.textContent = `${accuracy}%`;

  // Update recent quizzes
  recentQuizzesList.innerHTML = '';
  userState.recentQuizzes.forEach(quiz => {
    const div = document.createElement('div');
    div.className = 'recent-item';
    div.innerHTML = `
      <span class="recent-name">${quiz.name}</span>
      <span class="recent-score">${quiz.score}</span>
    `;
    recentQuizzesList.appendChild(div);
  });
}

// --- QUIZ LOGIC ---
function startQuiz(category) {
  // Filter questions by category
  let questions = questionsData.filter(q => q.category === category);
  // Shuffle options for each question
  questions = questions.map(q => {
    const shuffledOptions = [...q.options].sort(() => Math.random() - 0.5);
    return { ...q, options: shuffledOptions };
  });
  // Shuffle questions and pick up to 5
  questions = questions.sort(() => Math.random() - 0.5).slice(0, 5);

  quizState = {
    activeQuestions: questions,
    currentIndex: 0,
    correctCount: 0,
    wrongCount: 0,
    timerInterval: null,
    timeLeft: 15,
    category: category,
    selectedOption: null,
    answered: false
  };

  quizCategoryTitle.textContent = category;
  totalQuestionsNum.textContent = questions.length;
  
  navigateTo('quiz-view');
  loadQuestion();
}

function loadQuestion() {
  const currentQ = quizState.activeQuestions[quizState.currentIndex];
  
  currentQuestionNum.textContent = quizState.currentIndex + 1;
  const progressPercent = (quizState.currentIndex / quizState.activeQuestions.length) * 100;
  quizProgressFill.style.width = `${progressPercent}%`;
  
  quizQuestionText.textContent = currentQ.question;
  quizOptionsContainer.innerHTML = '';
  
  currentQ.options.forEach(option => {
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.textContent = option;
    btn.addEventListener('click', () => selectAnswer(btn, option));
    quizOptionsContainer.appendChild(btn);
  });

  quizState.selectedOption = null;
  quizState.answered = false;
  btnQuizAction.textContent = 'CHECK ANSWER';
  btnQuizAction.disabled = true;

  startTimer();
}

function selectAnswer(btn, optionText) {
  if (quizState.answered) return;

  // Visual selection
  const allBtns = document.querySelectorAll('.option-btn');
  allBtns.forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');

  quizState.selectedOption = optionText;
  btnQuizAction.disabled = false;
}

function handleQuizAction() {
  if (!quizState.answered) {
    checkAnswer();
  } else {
    nextQuestion();
  }
}

function checkAnswer() {
  clearInterval(quizState.timerInterval);
  quizState.answered = true;
  
  const currentQ = quizState.activeQuestions[quizState.currentIndex];
  const allBtns = document.querySelectorAll('.option-btn');
  
  let isCorrect = false;

  allBtns.forEach(btn => {
    if (btn.textContent === currentQ.answer) {
      btn.classList.add('correct');
    }
    if (btn.classList.contains('selected') && btn.textContent !== currentQ.answer) {
      btn.classList.add('wrong');
    }
  });

  if (quizState.selectedOption === currentQ.answer) {
    isCorrect = true;
    quizState.correctCount++;
  } else {
    quizState.wrongCount++;
  }

  btnQuizAction.textContent = 'NEXT QUESTION';
}

function nextQuestion() {
  quizState.currentIndex++;
  if (quizState.currentIndex < quizState.activeQuestions.length) {
    loadQuestion();
  } else {
    showResult();
  }
}

function startTimer() {
  clearInterval(quizState.timerInterval);
  quizState.timeLeft = 15;
  quizTimerText.textContent = `${quizState.timeLeft}s`;
  
  quizState.timerInterval = setInterval(() => {
    quizState.timeLeft--;
    quizTimerText.textContent = `${quizState.timeLeft}s`;
    
    if (quizState.timeLeft <= 0) {
      clearInterval(quizState.timerInterval);
      // Auto-submit as wrong if time is up
      if (!quizState.selectedOption) {
        quizState.selectedOption = "TIMEOUT";
      }
      checkAnswer();
    }
  }, 1000);
}

function showResult() {
  const total = quizState.activeQuestions.length;
  const accuracy = Math.round((quizState.correctCount / total) * 100);
  const xpEarned = quizState.correctCount * 15; // 15 XP per correct answer

  resultCorrect.textContent = quizState.correctCount;
  resultWrong.textContent = quizState.wrongCount;
  resultAccuracy.textContent = `${accuracy}%`;
  resultXp.textContent = xpEarned;
  
  if (accuracy >= 80) resultMessage.textContent = 'Excellent!';
  else if (accuracy >= 60) resultMessage.textContent = 'Great job!';
  else if (accuracy >= 40) resultMessage.textContent = 'Nice work!';
  else resultMessage.textContent = 'Keep practicing!';

  resultStreakText.textContent = `${userState.streak} DAY STREAK`;

  // Update Global State
  userState.xp += xpEarned;
  userState.completedQuizzes++;
  userState.correctAnswers += quizState.correctCount;
  userState.totalAnswers += total;
  
  // Add to recent
  userState.recentQuizzes.unshift({
    name: `${quizState.category} Quiz`,
    score: `${accuracy}%`
  });
  if (userState.recentQuizzes.length > 3) {
    userState.recentQuizzes.pop();
  }

  saveState();
  navigateTo('result-view');
}

// Start the app
document.addEventListener('DOMContentLoaded', init);
