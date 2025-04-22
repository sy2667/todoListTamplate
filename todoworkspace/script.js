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
  if (e.target.classList.contains("delete-btn")) {
    todos.splice(index, 1);
  } else if (e.target.tagName === "LI") {
    todos[index].done = !todos[index].done;
  }
  saveAndRender();
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

  // 기존 캘린더가 있으면 제거
  calendarEl.innerHTML = "";

  const calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: "dayGridMonth",
    locale: "ko",
    height: 600,
    events: todos.map((todo) => ({
      title: `[${todo.category}] ${todo.text}`,
      start: todo.date,
      allDay: true,
    })),
  });

  calendar.render();
}

// 목록 렌더링 함수
function renderList() {
  // 날짜 기준 정렬
  todos.sort((a, b) => new Date(a.date) - new Date(b.date));

  list.innerHTML = "";

  // ✅ 날짜 필터링 (선택된 날짜가 있으면 해당 날짜만)
  const filtered = selectedDateFilter
    ? todos.filter((todo) => todo.date === selectedDateFilter)
    : todos;

  filtered.forEach((todo, i) => {
    const li = document.createElement("li");
    li.dataset.index = i;
    if (todo.done) li.classList.add("done");

    li.innerHTML = `
        <div>
          <strong>[${todo.category}]</strong> ${todo.text}
          <br /><small>${todo.date}</small>
        </div>
      `;

    const delBtn = document.createElement("button");
    delBtn.textContent = "🗑";
    delBtn.classList.add("delete-btn");
    delBtn.dataset.index = i;

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

      // ✅ 기존 fake 및 모든 이벤트 제거
      calendar.removeAllEvents();

      // ✅ todos로부터 다시 추가
      getAllEvents().forEach((event) => calendar.addEvent(event));

      // ✅ 선택한 날짜 하이라이트
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
