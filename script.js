const questions = [
  {
    question: "log(log_ab a + 1 / log_b ab) is (where ab ≠ 1)",
    options: ["0", "1", "logₐ ab", "log_b ab"],
    correct: "0"
  },
  {
    question: "What is the derivative of sin(x)?",
    options: ["cos(x)", "-cos(x)", "-sin(x)", "tan(x)"],
    correct: "cos(x)"
  },
  {
    question: "Which number is a prime?",
    options: ["4", "6", "9", "7"],
    correct: "7"
  }
];

let currentQuestionIndex = 0;
let selectedAnswers = new Array(questions.length).fill(null);
let timers = new Array(questions.length).fill(0);
let timerInterval;

function startTimer() {
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    timers[currentQuestionIndex]++;
    document.getElementById("timer-text").textContent = `${timers[currentQuestionIndex]}s`;
  }, 1000);
}

function showQuestion() {
  document.getElementById("timer").style.display = "flex";

  const q = questions[currentQuestionIndex];
  document.getElementById("question-text").innerHTML = q.question;

  const optionsContainer = document.getElementById("options-container");
  optionsContainer.innerHTML = "";

  q.options.forEach((opt, i) => {
    const btn = document.createElement("button");
    btn.innerText = `${String.fromCharCode(65 + i)}. ${opt}`;
    btn.className = "option";
    if (selectedAnswers[currentQuestionIndex] === opt) {
      btn.classList.add('selected');
    }
    btn.onclick = () => selectOption(btn, opt);
    optionsContainer.appendChild(btn);
  });

  document.getElementById("resultText").innerText = "";
  document.getElementById("timer-text").textContent = `${timers[currentQuestionIndex]}s`;

  document.getElementById("prevBtn").style.display = currentQuestionIndex > 0 ? "inline-block" : "none";
  document.getElementById("nextBtn").style.display = currentQuestionIndex < questions.length - 1 ? "inline-block" : "none";
  document.getElementById("submitBtn").style.display = currentQuestionIndex === questions.length - 1 ? "inline-block" : "none";

  startTimer();
}

function selectOption(button, value) {
  document.querySelectorAll('.option').forEach(b => b.classList.remove('selected'));
  button.classList.add('selected');
  selectedAnswers[currentQuestionIndex] = value;
}

function clearSelection() {
  selectedAnswers[currentQuestionIndex] = null;
  showQuestion();
}

function nextQuestion() {
  if (currentQuestionIndex < questions.length - 1) {
    currentQuestionIndex++;
    showQuestion();
  }
}

function previousQuestion() {
  if (currentQuestionIndex > 0) {
    currentQuestionIndex--;
    showQuestion();
  }
}

function submitQuiz() {
  clearInterval(timerInterval);
  const totalTime = timers.reduce((sum, t) => sum + t, 0);

  const resultHTML = `
    <h2>🎉 Quiz Completed!</h2>
    <p>You answered <strong>${getCorrectCount()} / ${questions.length}</strong> correctly.</p>
    <p>Total Time Spent: <strong>${totalTime} seconds</strong></p>
    <button onclick="restartQuiz()" class="restart-btn">🔁 Restart Quiz</button>
    <div class="result-analysis">
      <h3>📊 Question Analysis:</h3>
      ${questions.map((q, i) => {
        const selected = selectedAnswers[i];
        const correct = q.correct;
        let status = "";
        let color = "";

        if (!selected) {
          status = "❓ Not Attempted";
          color = "#facc15";
        } else if (selected === correct) {
          status = "✔ Correct";
          color = "#16a34a";
        } else {
          status = "✘ Incorrect";
          color = "#dc2626";
        }

        return `
          <p>
            <strong>Q${i + 1}:</strong> ${q.question}<br/>
            <span style="color:${color};">${status}</span> | Time: ${timers[i]}s<br/>
            Selected: ${selected ?? "None"} | Correct: ${correct}
          </p>
        `;
      }).join("")}
    </div>
  `;

  document.getElementById("quiz-box").innerHTML = resultHTML;
  document.getElementById("timer").style.display = "none";
}

function getCorrectCount() {
  return questions.reduce((count, q, i) =>
    selectedAnswers[i] === q.correct ? count + 1 : count, 0);
}

function restartQuiz() {
  currentQuestionIndex = 0;
  selectedAnswers = new Array(questions.length).fill(null);
  timers = new Array(questions.length).fill(0);

  document.getElementById("timer").style.display = "flex";
  document.getElementById("quiz-box").innerHTML = `
    <h2 id="question-text"></h2>
    <div class="options" id="options-container"></div>
    <button class="clear-btn" onclick="clearSelection()">🧹 Clear Selection</button>
    <div class="controls">
      <button onclick="previousQuestion()" id="prevBtn">⬅ Previous</button>
      <button onclick="nextQuestion()" id="nextBtn">Next ➡</button>
      <button onclick="submitQuiz()" id="submitBtn" style="display: none;">✅ Submit</button>
    </div>
    <p id="resultText"></p>
  `;
  showQuestion();
}

// Initialize
showQuestion();
