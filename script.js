const TARGET_PERCENTAGE = 85;
let courses = [];

const addForm = document.getElementById("add-course-form");
const courseNameInput = document.getElementById("course-name");
const initialTotalInput = document.getElementById("initial-total");
const initialAttendedInput = document.getElementById("initial-attended");
const courseList = document.getElementById("course-list");

document.addEventListener("DOMContentLoaded", () => {
  const savedData = localStorage.getItem("my_courses_data");
  if (savedData) {
    courses = JSON.parse(savedData);
  }
  renderCourses();
});

addForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = courseNameInput.value.trim();
  const total = parseInt(initialTotalInput.value) || 0;
  const attended = parseInt(initialAttendedInput.value) || 0;

  if (attended > total) {
    alert("Attended classes cannot be greater than total classes.");
    return;
  }

  courses.push({ id: Date.now(), name, total, attended });
  saveAndRender();

  courseNameInput.value = "";
  initialTotalInput.value = "0";
  initialAttendedInput.value = "0";
});

function markAttendance(id, isPresent) {
  courses = courses.map((course) => {
    if (course.id === id) {
      return {
        ...course,
        total: course.total + 1,
        attended: isPresent ? course.attended + 1 : course.attended
      };
    }
    return course;
  });
  saveAndRender();
}

function deleteCourse(id) {
  if (confirm("Are you sure you want to delete this course?")) {
    courses = courses.filter((course) => course.id !== id);
    saveAndRender();
  }
}

function saveAndRender() {
  localStorage.setItem("my_courses_data", JSON.stringify(courses));
  renderCourses();
}

function renderCourses() {
  courseList.innerHTML = "";

  if (courses.length === 0) {
    courseList.innerHTML = "<p style='color: #777; font-size: 0.9rem;'>No courses added yet. Add your subjects above!</p>";
    return;
  }

  courses.forEach((course) => {
    const total = course.total;
    const attended = course.attended;
    const pct = total > 0 ? ((attended / total) * 100).toFixed(1) : 0;
    const isSafe = pct >= TARGET_PERCENTAGE;

    let msg = "";
    if (total === 0) {
      msg = "No classes recorded yet.";
    } else if (isSafe) {
      const maxBunks = Math.floor((attended / (TARGET_PERCENTAGE / 100)) - total);
      msg = maxBunks > 0 
        ? `You can safely bunk ${maxBunks} class(es).` 
        : `Don't bunk the next class or you'll drop below 85%.`;
    } else {
      const required = Math.ceil(((TARGET_PERCENTAGE / 100) * total - attended) / (1 - (TARGET_PERCENTAGE / 100)));
      msg = `Attend next ${required} class(es) continuously to reach 85%.`;
    }

    const card = document.createElement("div");
    card.className = "course-card";
    card.innerHTML = `
      <div class="course-header">
        <span class="course-title">${course.name}</span>
        <button class="btn-delete" onclick="deleteCourse(${course.id})">Delete</button>
      </div>
      <div class="course-stats">
        <div>
          <small>Attended: ${attended} / ${total}</small>
        </div>
        <div class="pct-badge ${isSafe ? 'pct-safe' : 'pct-warn'}">${pct}%</div>
      </div>
      <p class="course-msg">${msg}</p>
      <div class="action-buttons">
        <button class="btn-success" onclick="markAttendance(${course.id}, true)">Present (+1)</button>
        <button class="btn-danger" onclick="markAttendance(${course.id}, false)">Bunked (+0)</button>
      </div>
    `;
    courseList.appendChild(card);
  });
}
