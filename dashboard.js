/* =========================================================
   DASHBOARD
   ========================================================= */

/* ================= AUTHENTICATION ================= */
const token = localStorage.getItem("token");
const user = JSON.parse(localStorage.getItem("user") || "null");

if (!token || !user) {
  window.location.href = "index.html";
}

/* ================= USER INFORMATION ================= */
const welcome = document.getElementById("welcome");
const userName = document.getElementById("userName");
const userAvatar = document.getElementById("userAvatar");

if (user.fullName) {
  if (welcome) welcome.textContent = `Welcome back, ${user.fullName}`;
  if (userName) userName.textContent = user.fullName;
  if (userAvatar) userAvatar.textContent = user.fullName.charAt(0).toUpperCase();
}

/* ================= LOGOUT ================= */
document.getElementById("logoutBtn")?.addEventListener("click", () => {
  localStorage.clear();
  window.location.href = "index.html";
});

/* ================= AUTH HEADERS ================= */
function authHeaders() {
  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`,
  };
}

/* =========================================================
   MOBILE SIDEBAR
   ========================================================= */
const sidebar = document.getElementById("sidebar");
const mobileMenu = document.getElementById("mobileMenu");
const sidebarOverlay = document.getElementById("sidebarOverlay");

function closeSidebar() {
  sidebar?.classList.remove("open");
  sidebarOverlay?.classList.remove("active");
}

mobileMenu?.addEventListener("click", () => {
  sidebar?.classList.toggle("open");
  sidebarOverlay?.classList.toggle("active");
});

sidebarOverlay?.addEventListener("click", closeSidebar);

/* =========================================================
   NAVIGATION
   ========================================================= */
function showView(viewName) {
  document.querySelectorAll(".view").forEach(view => view.classList.remove("active"));

  const target = document.getElementById(`view${viewName}`);
  if (target) target.classList.add("active");

  document.querySelectorAll(".nav-item").forEach(item => item.classList.remove("active"));
  const activeNav = document.querySelector(`.nav-item[data-view="${viewName}"]`);
  if (activeNav) activeNav.classList.add("active");

  closeSidebar();

  const message = document.getElementById("dashMessage");
  if (message) message.textContent = "";

  if (viewName === "list") {
    loadExistingRecommendations();
  }
}

document.querySelectorAll(".nav-item").forEach(button => {
  button.addEventListener("click", () => {
    if (button.dataset.view === "1") resetWizard();
    showView(button.dataset.view);
  });
});

document.getElementById("generateNewBtn")?.addEventListener("click", () => {
  resetWizard();
  showView("1");
});

document.getElementById("viewRecsBtn")?.addEventListener("click", () => showView("list"));
document.getElementById("backToLandingBtn")?.addEventListener("click", () => showView("landing"));
document.getElementById("backToLandingFromCurrentBtn")?.addEventListener("click", () => showView("landing"));
document.getElementById("cancelToHistoryBtn")?.addEventListener("click", () => showView("landing"));
document.getElementById("backToView1Btn")?.addEventListener("click", () => showView("1"));

/* =========================================================
   ACADEMIC RECORDS
   ========================================================= */
const departmentSubjects = {
  science: ["Mathematics", "English Language", "Physics", "Chemistry", "Biology"],
  arts: ["English Language", "Literature in English", "Government", "Christian Religious Studies", "History"],
  commercial: ["Mathematics", "English Language", "Economics", "Financial Accounting", "Commerce"],
};

const academicInputs = document.getElementById("academicInputs");
const departmentSelect = document.getElementById("departmentSelect");
const preferredField = document.getElementById("preferredField");

const gradeToScore = { A: 80, B: 70, C: 60, D: 50, E: 45, F: 35 };
const scoreToGrade = Object.fromEntries(Object.entries(gradeToScore).map(([letter, score]) => [score, letter]));

function renderSubjectRows(department) {
  if (!academicInputs) return;
  academicInputs.innerHTML = "";
  const subjects = departmentSubjects[department] || [];

  subjects.forEach((subject, index) => {
    const div = document.createElement("div");
    div.className = "record-row";
    div.style.animationDelay = `${index * 0.05}s`;

    const options = Object.keys(gradeToScore)
      .map(grade => `<option value="${grade}">${grade}</option>`)
      .join("");

    div.innerHTML = `
      <span>${subject}</span>
      <select data-subject="${subject}">
        <option value="">Grade</option>
        ${options}
      </select>
    `;

    academicInputs.appendChild(div);
  });
}

departmentSelect?.addEventListener("change", () => {
  renderSubjectRows(departmentSelect.value);
});

document.getElementById("saveRecordsBtn")?.addEventListener("click", async () => {
  const field = preferredField ? preferredField.value.trim() : "";

  if (departmentSelect && !departmentSelect.value) {
    showMessage("Please select your department.");
    return;
  }
  if (!field) {
    showMessage("Please enter your preferred career field.");
    preferredField?.focus();
    return;
  }

  const selects = academicInputs.querySelectorAll("select");
  const records = [];
  selects.forEach(select => {
    if (select.value !== "") {
      records.push({
        subjectName: select.dataset.subject,
        ssClass: "SS3",
        score: gradeToScore[select.value],
      });
    }
  });

  if (records.length === 0) {
    showMessage("Please select at least one subject grade.");
    return;
  }

  const button = document.getElementById("saveRecordsBtn");
  button.disabled = true;
  button.innerHTML = "Saving...";

  try {
    const res = await fetch("/api/academic-records", {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ records }),
    });
    const data = await res.json();

    if (!res.ok) {
      showMessage(data.error || "Could not save your records.");
      return;
    }

    showView("2");
  } catch (error) {
    console.error(error);
    showMessage("Unable to connect to the server.");
  } finally {
    button.disabled = false;
    button.innerHTML = "Continue to Aptitude Test →";
  }
});

/* =========================================================
   APTITUDE QUIZ
   ========================================================= */
const quizContainer = document.getElementById("quizContainer");
let quizQuestions = [];
let currentQuestionIndex = 0;
const quizAnswers = {};

fetch("/api/profile/quiz")
  .then(res => res.json())
  .then(data => {
    quizQuestions = data.quiz || [];
    renderCurrentQuestion();
  })
  .catch(error => {
    console.error(error);
    if (quizContainer) quizContainer.innerHTML = `<p class="hint">Unable to load the aptitude quiz.</p>`;
  });

function renderCurrentQuestion() {
  if (!quizContainer) return;
  quizContainer.innerHTML = "";

  if (quizQuestions.length === 0) {
    quizContainer.innerHTML = `<p class="hint">No quiz questions available.</p>`;
    return;
  }

  const q = quizQuestions[currentQuestionIndex];
  const div = document.createElement("div");
  div.className = "quiz-question";

  const optionsHtml = q.options
    .map((option, index) => {
      const checked = quizAnswers[q.questionNumber] === option.key ? "checked" : "";
      return `
        <label class="quiz-option" style="animation-delay: ${index * 0.05}s">
          <input type="radio" name="currentQ" value="${option.key}" ${checked}>
          <span>${option.text}</span>
        </label>
      `;
    })
    .join("");

  div.innerHTML = `
    <div class="quiz-progress">Question ${currentQuestionIndex + 1} of ${quizQuestions.length}</div>
    <strong>${q.questionText}</strong>
    ${optionsHtml}
    <div class="quiz-nav">
      <button type="button" id="prevQBtn" class="outline-btn" ${currentQuestionIndex === 0 ? "disabled" : ""}>← Back</button>
      <button type="button" id="nextQBtn" class="primary-btn">${currentQuestionIndex === quizQuestions.length - 1 ? "Finish" : "Next →"}</button>
    </div>
  `;

  quizContainer.appendChild(div);

  document.getElementById("prevQBtn")?.addEventListener("click", () => {
    currentQuestionIndex--;
    renderCurrentQuestion();
  });

  document.getElementById("nextQBtn")?.addEventListener("click", () => {
    const selected = quizContainer.querySelector('input[name="currentQ"]:checked');
    if (!selected) {
      showMessage("Please select an answer before continuing.");
      return;
    }

    quizAnswers[q.questionNumber] = selected.value;

    if (currentQuestionIndex < quizQuestions.length - 1) {
      currentQuestionIndex++;
      renderCurrentQuestion();
    } else {
      quizContainer.innerHTML = `
        <div style="text-align:center; padding:35px 10px;">
          <div style="font-size:40px; margin-bottom:10px;">🎉</div>
          <h3>Assessment complete!</h3>
          <p class="hint">Click "Generate My Recommendations" below to see your results.</p>
        </div>
        <button type="button" id="saveProfileBtn" class="primary-btn">Generate My Recommendations →</button>
      `;

      const genBtn = quizContainer.querySelector("#saveProfileBtn");
      if (genBtn) {
        genBtn.addEventListener("click", handleGenerate);
      } else {
        console.error("saveProfileBtn was not found right after being created — this should not happen.");
      }
    }
  });
}

/* =========================================================
   SAVE PROFILE + GENERATE
   ========================================================= */
async function handleGenerate() {
  const field = preferredField ? preferredField.value.trim() : "";
  const answers = quizQuestions.map(q => ({
    questionNumber: q.questionNumber,
    selectedKey: quizAnswers[q.questionNumber] || null,
  }));

  if (!field || answers.some(answer => !answer.selectedKey)) {
    showMessage("Please complete all quiz questions.");
    return;
  }

  const saveButton = quizContainer?.querySelector("#saveProfileBtn") || document.getElementById("saveProfileBtn");
  if (saveButton) {
    saveButton.disabled = true;
    saveButton.innerHTML = "Generating recommendations...";
  }

  try {
    const profileRes = await fetch("/api/profile", {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ preferredField: field, answers }),
    });
    const profileData = await profileRes.json();

    if (!profileRes.ok) {
      showMessage(profileData.error || "Could not save profile.");
      return;
    }

    const genRes = await fetch("/api/recommendations/generate", {
      method: "POST",
      headers: authHeaders(),
    });
    const genData = await genRes.json();

    if (!genRes.ok) {
      showMessage(genData.error || "Could not generate recommendations.");
      return;
    }

    showJustGenerated(genData.batch, genData.recommendations || []);
    showView("current");
    updateDashboardStats();
  } catch (error) {
    console.error(error);
    showMessage("Something went wrong. Please try again.");
  } finally {
    if (saveButton) {
      saveButton.disabled = false;
      saveButton.innerHTML = "Generate My Recommendations →";
    }
  }
}

/* =========================================================
   RESULT FORMATTING
   ========================================================= */
function formatDate(isoString) {
  return new Date(isoString).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

function buildBatchHtml(batch, setNumber, showActions) {
  const subjectsHtml = (batch.academic_snapshot || [])
    .map(subject => `<li><strong>${subject.subject}</strong>: ${scoreToGrade[subject.score] || subject.score}</li>`)
    .join("");

  const answers = batch.quiz_snapshot?.answers || [];
  const answersHtml = answers
    .map(answer => `<li><strong>Q${answer.question_number}:</strong> ${answer.question_text}<br><em>Answer:</em> ${answer.selected_answer}</li>`)
    .join("");

  const recommendations = batch.recommendations || [];
  const coursesHtml = recommendations.length === 0
    ? `<p class="hint">No matching courses were found at this time.</p>`
    : recommendations
        .map((rec, index) => `
          <div class="course-card" style="animation-delay: ${index * 0.08}s">
            <div class="match-seal">
              <span class="num">${Math.round(rec.overall_score)}</span>
              <span class="pct">% MATCH</span>
            </div>
            <h3>${rec.course_name}</h3>
            <p>${rec.ai_explanation}</p>
          </div>
        `)
        .join("");

  const actionsHtml = showActions ? `
    <div class="batch-actions">
      <button type="button" class="print-set-btn" data-batch-id="${batch.batch_id}">Save / Print</button>
      <button type="button" class="delete-set-btn" data-batch-id="${batch.batch_id}">Delete</button>
    </div>
  ` : "";

  return `
    <div class="batch-header-row">
      <h2 class="batch-title">
        ${setNumber ? `Assessment ${setNumber}` : "Latest Assessment"} — ${formatDate(batch.created_at)}
      </h2>
      ${actionsHtml}
    </div>

    <div class="batch-inputs">
      <h4>Subjects & Grades</h4>
      <ul>${subjectsHtml}</ul>

      <h4>Career Aspiration</h4>
      <p>${batch.quiz_snapshot?.preferredField || "—"}</p>

      <h4>Aptitude Quiz Answers</h4>
      <ul>${answersHtml}</ul>
    </div>

    <div class="batch-results">
      <h4>Recommended Courses</h4>
      ${coursesHtml}
    </div>
  `;
}

/* =========================================================
   CURRENT RESULT
   ========================================================= */
function showJustGenerated(batch, recommendations) {
  const container = document.getElementById("currentResultDisplay");
  if (!container) return;

  const fullBatch = { ...batch, recommendations };
  container.innerHTML = "";

  const block = document.createElement("div");
  block.className = "batch-block";
  block.dataset.batchId = batch.batch_id;
  block.innerHTML = buildBatchHtml(fullBatch, "", false);
  container.appendChild(block);

  animateSeals(block);

  const goodMatch = recommendations.some(rec => Number(rec.overall_score) >= 75);
  if (goodMatch && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    fireConfetti();
  }
}

/* =========================================================
   ANIMATE MATCH SCORES
   ========================================================= */
function animateSeals(container) {
  const seals = container.querySelectorAll(".match-seal .num");

  seals.forEach(seal => {
    const target = Number(seal.textContent);
    let current = 0;
    const step = Math.max(1, Math.round(target / 20));

    const interval = setInterval(() => {
      current += step;
      if (current >= target) {
        seal.textContent = target;
        clearInterval(interval);
      } else {
        seal.textContent = current;
      }
    }, 25);
  });
}

/* =========================================================
   CONFETTI
   ========================================================= */
function fireConfetti() {
  const colors = ["#D39B36", "#1F6B4F", "#4F7CFF", "#C94B4B"];

  for (let i = 0; i < 28; i++) {
    const piece = document.createElement("div");
    piece.className = "confetti-piece";
    piece.style.left = Math.random() * 100 + "vw";
    piece.style.background = colors[Math.floor(Math.random() * colors.length)];
    piece.style.animationDuration = `${1.8 + Math.random() * 1.2}s`;
    document.body.appendChild(piece);
    setTimeout(() => piece.remove(), 3500);
  }
}

/* =========================================================
   PRINT CURRENT
   ========================================================= */
document.getElementById("printCurrentBtn")?.addEventListener("click", () => {
  const today = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  const header = document.getElementById("printHeaderCurrent");

  if (header) {
    header.innerHTML = `
      <h2>Career Recommendation Report</h2>
      <p><strong>Student:</strong> ${user.fullName}</p>
      <p><strong>Printed on:</strong> ${today}</p>
    `;
  }

  window.print();
});

/* =========================================================
   HISTORY
   ========================================================= */
function renderBatches(batches) {
  const historyDiv = document.getElementById("historySection");
  if (!historyDiv) return;
  historyDiv.innerHTML = "";

  if (!batches || batches.length === 0) {
    historyDiv.innerHTML = `
      <div class="form-card">
        <div style="text-align:center; padding:30px 10px;">
          <div style="font-size:35px; margin-bottom:10px;">📋</div>
          <h3>No assessments yet</h3>
          <p class="hint">Start your first assessment to receive personalized career recommendations.</p>
        </div>
      </div>
    `;
    return;
  }

  const newestFirst = [...batches].reverse();

  newestFirst.forEach((batch, index) => {
    const setNumber = batches.length - index;
    const block = document.createElement("div");
    block.className = "batch-block";
    block.dataset.batchId = batch.batch_id;
    block.innerHTML = buildBatchHtml(batch, setNumber, true);
    historyDiv.appendChild(block);
  });

  animateSeals(historyDiv);

  document.querySelectorAll(".print-set-btn").forEach(button => {
    button.addEventListener("click", () => printSingleBatch(button.dataset.batchId));
  });

  document.querySelectorAll(".delete-set-btn").forEach(button => {
    button.addEventListener("click", () => deleteBatch(button.dataset.batchId));
  });
}

/* =========================================================
   LOAD HISTORY
   ========================================================= */
async function loadExistingRecommendations() {
  const history = document.getElementById("historySection");
  if (!history) return;
  history.innerHTML = `<div class="form-card"><p class="hint">Loading your recommendations...</p></div>`;

  try {
    const res = await fetch("/api/recommendations", { headers: authHeaders() });
    const data = await res.json();

    if (!res.ok) {
      history.innerHTML = `<div class="form-card"><p class="hint">Could not load recommendations.</p></div>`;
      return;
    }

    renderBatches(data.batches || []);
    updateStatsFromBatches(data.batches || []);
  } catch (error) {
    console.error(error);
    history.innerHTML = `<div class="form-card"><p class="hint">Unable to connect to the server.</p></div>`;
  }
}

/* =========================================================
   DELETE ASSESSMENT
   ========================================================= */
async function deleteBatch(batchId) {
  const confirmed = confirm("Delete this recommendation set? This cannot be undone.");
  if (!confirmed) return;

  try {
    const res = await fetch(`/api/recommendations/${batchId}`, { method: "DELETE", headers: authHeaders() });
    const data = await res.json();

    if (!res.ok) {
      showMessage(data.error || "Could not delete assessment.");
      return;
    }

    await loadExistingRecommendations();
  } catch (error) {
    console.error(error);
    showMessage("Unable to connect to the server.");
  }
}

/* =========================================================
   PRINT SINGLE ASSESSMENT
   ========================================================= */
function printSingleBatch(batchId) {
  document.querySelectorAll(".batch-block").forEach(block => {
    block.style.display = String(block.dataset.batchId) === String(batchId) ? "block" : "none";
  });

  const today = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  const header = document.getElementById("printHeader");

  if (header) {
    header.innerHTML = `
      <h2>Career Recommendation Report</h2>
      <p><strong>Student:</strong> ${user.fullName}</p>
      <p><strong>Printed on:</strong> ${today}</p>
    `;
  }

  window.print();

  setTimeout(() => {
    document.querySelectorAll(".batch-block").forEach(block => (block.style.display = ""));
  }, 500);
}

/* =========================================================
   DASHBOARD STATISTICS
   ========================================================= */
function updateStatsFromBatches(batches) {
  const count = document.getElementById("assessmentCount");
  const latest = document.getElementById("latestMatch");
  if (!count || !latest) return;

  count.textContent = batches.length;

  if (batches.length === 0) {
    latest.textContent = "—";
    return;
  }

  const newest = batches[batches.length - 1];
  const recommendations = newest.recommendations || [];

  if (recommendations.length > 0) {
    const score = Math.max(...recommendations.map(rec => Number(rec.overall_score)));
    latest.textContent = `${Math.round(score)}%`;
  } else {
    latest.textContent = "—";
  }
}

async function updateDashboardStats() {
  try {
    const res = await fetch("/api/recommendations", { headers: authHeaders() });
    if (!res.ok) return;
    const data = await res.json();
    updateStatsFromBatches(data.batches || []);
  } catch (error) {
    console.error(error);
  }
}

/* =========================================================
   TOAST MESSAGE
   ========================================================= */
function showMessage(message) {
  const element = document.getElementById("dashMessage");
  if (!element) return;
  element.textContent = message;

  clearTimeout(window.dashboardMessageTimer);
  window.dashboardMessageTimer = setTimeout(() => {
    element.textContent = "";
  }, 3500);
}

/* =========================================================
   RESET WIZARD
   ========================================================= */
function resetWizard() {
  if (preferredField) preferredField.value = "";
  if (departmentSelect) departmentSelect.value = "";
  if (academicInputs) academicInputs.innerHTML = "";

  Object.keys(quizAnswers).forEach(key => delete quizAnswers[key]);
  currentQuestionIndex = 0;

  if (quizQuestions.length > 0) {
    renderCurrentQuestion();
  }
}

/* =========================================================
   INITIAL LOAD
   ========================================================= */
showView("landing");
updateDashboardStats();