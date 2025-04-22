// 요소 선택
const input = document.getElementById("todo-input");
const addBtn = document.getElementById("add-btn");
const list = document.getElementById("todo-list");
let calendar; // 전역으로 선언
let selectedDateFilter = null;

const categoryColors = {
  공부: "#4fc3f7",
  운동: "#81c784",
  일: "#ffb74d",
  개인: "#ba68c8",
  기타: "#90a4ae",
};

// localStorage에서 저장된 데이터 불러오기
let todos = JSON.parse(localStorage.getItem("todos")) || [];
renderList();

// 완료 토글, 삭제 처리
list.addEventListener("click", (e) => {
  const index = e.target.dataset.index;
  const tag = e.target.tagName;
  if (e.target.classList.contains("delete-btn")) {
    todos.splice(index, 1);
  } else if (
    e.target.closest("li") &&
    tag !== "SELECT" &&
    tag !== "OPTION" &&
    tag !== "BUTTON"
  ) {
    todos[index].done = !todos[index].done;
    saveAndRender();
  }
});

// 저장 + 렌더링 함수
function saveAndRender() {
  localStorage.setItem("todos", JSON.stringify(todos));
  renderList();
  renderCalendar(); // 캘린더도 새로고침
}

function renderCalendar() {
  const calendarEl = document.getElementById("calendar");
  if (!calendarEl) return;

  calendarEl.innerHTML = ""; // 기존 제거

  calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: "dayGridMonth",
    locale: "ko",
    height: 600,
    events: getAllEvents(),
  });

  calendar.render();
}

// 목록 렌더링 함수
function renderList() {
  todos.sort((a, b) => new Date(a.date) - new Date(b.date));
  list.innerHTML = "";

  const filtered = selectedDateFilter
    ? todos.filter((todo) => todo.date === selectedDateFilter)
    : todos;

  filtered.forEach((todo, i) => {
    const li = document.createElement("li");
    li.dataset.index = i;
    if (todo.done) li.classList.add("done");

    // ✅ 카테고리 select 박스
    const categorySelect = document.createElement("select");
    ["공부", "운동", "일", "개인", "기타"].forEach((option) => {
      const opt = document.createElement("option");
      opt.value = option;
      opt.text = option;
      if (option === todo.category) opt.selected = true;
      categorySelect.appendChild(opt);
    });

    // ✅ 카테고리 색상 클래스 동적 적용
    categorySelect.classList.remove(
      "option-공부",
      "option-운동",
      "option-일",
      "option-개인",
      "option-기타"
    );
    categorySelect.classList.add(`option-${todo.category}`);

    // ✅ 카테고리 변경 시 저장 + 캘린더 리렌더
    categorySelect.addEventListener("change", (e) => {
      const newCategory = e.target.value;
      todos[i].category = newCategory;

      // ✅ 바뀐 카테고리 색상 반영
      categorySelect.classList.remove(
        "option-공부",
        "option-운동",
        "option-일",
        "option-개인",
        "option-기타"
      );
      categorySelect.classList.add(`option-${newCategory}`);

      localStorage.setItem("todos", JSON.stringify(todos));
      renderCalendar();
    });

    // ✅ 할 일 텍스트 + 날짜
    const contentDiv = document.createElement("div");
    contentDiv.innerHTML = `
        ${todo.text}
        <br><small>${todo.date}</small>
      `;

    // ✅ 삭제 버튼
    const delBtn = document.createElement("button");
    delBtn.textContent = "🗑";
    delBtn.classList.add("delete-btn");
    delBtn.dataset.index = i;

    li.appendChild(categorySelect);
    li.appendChild(contentDiv);
    li.appendChild(delBtn);
    list.appendChild(li);
  });
}

const dateInput = document.getElementById("datepicker");
const categoryInput = document.getElementById("todo-category");

addBtn.addEventListener("click", () => {
  const text = input.value.trim();
  const date = dateInput.value;
  const category = categoryInput.value;

  if (!date) {
    alert("날짜를 선택해주세요!");
    dateInput.focus(); // 자동 포커스
    return;
  }

  if (text === "") {
    alert("할 일을 입력해주세요!");
    return;
  }

  if (text !== "") {
    todos.push({
      text,
      date,
      category,
      done: false,
    });

    input.value = "";
    saveAndRender();
  }
});

function getAllEvents() {
  return todos.map((todo) => ({
    title: `[${todo.category}] ${todo.text}`,
    start: todo.date,
    allDay: true,
    color: categoryColors[todo.category] || "#ccc",
  }));
}

// 캘린더 스크립트
document.addEventListener("DOMContentLoaded", function () {
  const calendarEl = document.getElementById("calendar");

  calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: "dayGridMonth",
    locale: "ko",
    height: 600,
    events: getAllEvents(),
  });

  calendar.render();
});

flatpickr("#datepicker", {
  dateFormat: "Y-m-d",
  defaultDate: "today",
  locale: "ko",
  onChange: function (selectedDates, dateStr) {
    const selectedDate = selectedDates[0];
    selectedDateFilter = dateStr;

    if (calendar) {
      calendar.gotoDate(selectedDate);

      // 기존 fake 및 모든 이벤트 제거
      calendar.removeAllEvents();

      // todos로부터 다시 추가
      getAllEvents().forEach((event) => calendar.addEvent(event));

      // 선택한 날짜 하이라이트
      const highlightColor = document.body.classList.contains("light-mode")
        ? "#cfd8dc"
        : "#ffeb3b";

      calendar.addEvent({
        title: "",
        start: dateStr,
        allDay: true,
        display: "background",
        backgroundColor: highlightColor,
        extendedProps: {
          fake: true,
        },
      });
    }

    renderList();
  },
});

const themeToggle = document.getElementById("theme-toggle");
const body = document.body;
themeToggle.addEventListener("click", () => {
  body.classList.toggle("light-mode");
  themeToggle.textContent = body.classList.contains("light-mode")
    ? "🌞 라이트모드"
    : "🌙 다크모드";

  //  달력 강제로 닫았다가 다시 열기 (재적용)
  const fp = document.querySelector("#datepicker")._flatpickr;
  if (fp.isOpen) {
    fp.close();
    setTimeout(() => fp.open(), 10); // 잠깐 닫았다 다시 열기
  }
});

document.getElementById("show-all").addEventListener("click", () => {
  selectedDateFilter = null;
  renderList();
});
