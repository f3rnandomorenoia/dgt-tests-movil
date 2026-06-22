const DATA_URL = "data/tests.json";
const STORAGE_PREFIX = "dgt-tests-mobile:v1:";

const dom = {
  resetBtn: document.querySelector("#resetBtn"),
  testSelect: document.querySelector("#testSelect"),
  statusPill: document.querySelector("#statusPill"),
  questionPanel: document.querySelector("#questionPanel"),
  prevBtn: document.querySelector("#prevBtn"),
  nextBtn: document.querySelector("#nextBtn"),
  finishBtn: document.querySelector("#finishBtn"),
  questionMap: document.querySelector("#questionMap"),
};

const state = {
  database: null,
  test: null,
  current: 0,
  answers: [],
  finished: false,
};

function storageKey(testId) {
  return `${STORAGE_PREFIX}${testId}`;
}

function saveProgress() {
  if (!state.test) return;
  const payload = {
    current: state.current,
    answers: state.answers,
    finished: state.finished,
  };
  localStorage.setItem(storageKey(state.test.id), JSON.stringify(payload));
}

function loadProgress(test) {
  const raw = localStorage.getItem(storageKey(test.id));
  if (!raw) {
    return {
      current: 0,
      answers: Array(test.questions.length).fill(null),
      finished: false,
    };
  }

  try {
    const parsed = JSON.parse(raw);
    const answers = Array(test.questions.length).fill(null);
    parsed.answers?.forEach((answer, index) => {
      if (index < answers.length) answers[index] = answer;
    });
    return {
      current: Math.min(Math.max(Number(parsed.current) || 0, 0), test.questions.length - 1),
      answers,
      finished: Boolean(parsed.finished),
    };
  } catch {
    return {
      current: 0,
      answers: Array(test.questions.length).fill(null),
      finished: false,
    };
  }
}

function selectTest(testId) {
  const test = state.database.tests.find((item) => item.id === testId) ?? state.database.tests[0];
  const progress = loadProgress(test);
  state.test = test;
  state.current = progress.current;
  state.answers = progress.answers;
  state.finished = progress.finished;
  render();
}

function scoreTest() {
  const total = state.test.questions.length;
  const answered = state.answers.filter(Boolean).length;
  const correct = state.test.questions.reduce((count, question, index) => {
    return count + (state.answers[index] === question.answer ? 1 : 0);
  }, 0);
  return {
    total,
    answered,
    correct,
    wrong: total - correct,
    pending: total - answered,
  };
}

function optionClass(question, optionKey, selected) {
  const classes = ["option-button"];
  if (selected === optionKey) classes.push("selected");
  if (state.finished && question.answer === optionKey) classes.push("correct");
  if (state.finished && selected === optionKey && question.answer !== optionKey) classes.push("wrong");
  return classes.join(" ");
}

function renderResults() {
  if (!state.finished) return "";
  const score = scoreTest();
  return `
    <div class="results">
      <h2>${score.correct}/${score.total} correctas</h2>
      <p>${score.wrong} fallos. ${score.pending ? `${score.pending} sin responder.` : "Todas respondidas."}</p>
      <div class="results-actions">
        <button class="secondary-button" id="reviewMissesBtn" type="button">Ver fallos</button>
        <button class="primary-button" id="retryBtn" type="button">Repetir</button>
      </div>
    </div>
  `;
}

function renderQuestion() {
  const question = state.test.questions[state.current];
  const selected = state.answers[state.current];
  const imageHtml = question.image
    ? `<img class="question-image" src="${question.image.url}" alt="${question.image.alt}" loading="eager" referrerpolicy="no-referrer">`
    : `<div class="image-fallback">Pregunta sin imagen</div>`;
  const review = state.finished
    ? `<p class="review-note">Respuesta correcta: ${question.answer}</p>`
    : "";

  dom.questionPanel.innerHTML = `
    <div class="question-head">
      <div class="question-count">Pregunta ${state.current + 1} de ${state.test.questions.length}</div>
      <a class="source-link" href="${state.test.source.url}" target="_blank" rel="noreferrer">Fuente DGT</a>
    </div>
    <div class="media-wrap">${imageHtml}</div>
    <div class="question-body">
      ${renderResults()}
      <p class="prompt">${question.prompt}</p>
      <div class="options">
        ${question.options
          .map(
            (option) => `
              <button class="${optionClass(question, option.key, selected)}" type="button" data-answer="${option.key}">
                <span class="option-key">${option.key}</span>
                <span class="option-text">${option.text}</span>
              </button>
            `,
          )
          .join("")}
      </div>
      ${review}
    </div>
  `;

  dom.questionPanel.querySelectorAll("[data-answer]").forEach((button) => {
    button.addEventListener("click", () => {
      if (state.finished) return;
      state.answers[state.current] = button.dataset.answer;
      saveProgress();
      render();
    });
  });

  const img = dom.questionPanel.querySelector(".question-image");
  if (img && question.image?.sourceUrl) {
    img.addEventListener("error", () => {
      img.closest(".media-wrap").innerHTML = `
        <div class="image-fallback">
          Imagen no cargada. <a href="${question.image.sourceUrl}" target="_blank" rel="noreferrer">Abrir en DGT</a>
        </div>
      `;
    });
  }

  dom.questionPanel.querySelector("#retryBtn")?.addEventListener("click", resetTest);
  dom.questionPanel.querySelector("#reviewMissesBtn")?.addEventListener("click", () => {
    const index = state.test.questions.findIndex((item, questionIndex) => {
      return state.answers[questionIndex] !== item.answer;
    });
    if (index >= 0) {
      state.current = index;
      saveProgress();
      render();
    }
  });
}

function renderMap() {
  dom.questionMap.innerHTML = state.test.questions
    .map((question, index) => {
      const classes = ["map-button"];
      if (index === state.current) classes.push("current");
      if (state.answers[index]) classes.push("answered");
      if (state.finished && state.answers[index] !== question.answer) classes.push("missed");
      return `<button class="${classes.join(" ")}" type="button" data-index="${index}" aria-label="Pregunta ${index + 1}">${index + 1}</button>`;
    })
    .join("");

  dom.questionMap.querySelectorAll("[data-index]").forEach((button) => {
    button.addEventListener("click", () => {
      state.current = Number(button.dataset.index);
      saveProgress();
      render();
    });
  });
}

function renderControls() {
  const score = scoreTest();
  dom.statusPill.textContent = state.finished
    ? `${score.correct}/${score.total}`
    : `${score.answered}/${score.total}`;
  dom.prevBtn.disabled = state.current === 0;
  dom.nextBtn.disabled = state.current === state.test.questions.length - 1;
  dom.finishBtn.disabled = state.finished;
}

function render() {
  if (!state.test) return;
  dom.testSelect.value = state.test.id;
  renderQuestion();
  renderMap();
  renderControls();
}

function resetTest() {
  if (!state.test) return;
  state.current = 0;
  state.answers = Array(state.test.questions.length).fill(null);
  state.finished = false;
  saveProgress();
  render();
}

function finishTest() {
  if (!state.test || state.finished) return;
  state.finished = true;
  saveProgress();
  render();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function bindEvents() {
  dom.resetBtn.addEventListener("click", resetTest);
  dom.prevBtn.addEventListener("click", () => {
    state.current = Math.max(0, state.current - 1);
    saveProgress();
    render();
  });
  dom.nextBtn.addEventListener("click", () => {
    state.current = Math.min(state.test.questions.length - 1, state.current + 1);
    saveProgress();
    render();
  });
  dom.finishBtn.addEventListener("click", finishTest);
  dom.testSelect.addEventListener("change", () => selectTest(dom.testSelect.value));
}

async function init() {
  bindEvents();

  try {
    const response = await fetch(DATA_URL, { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    state.database = await response.json();
    dom.testSelect.innerHTML = state.database.tests
      .map((test) => `<option value="${test.id}">${test.title}</option>`)
      .join("");
    selectTest(state.database.tests[0].id);
  } catch (error) {
    dom.questionPanel.innerHTML = `<div class="error">No se pudo cargar el test.</div>`;
    dom.statusPill.textContent = "Error";
    console.error(error);
  }
}

init();
