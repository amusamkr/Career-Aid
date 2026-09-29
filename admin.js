/* =========================================================
   ADMIN CONSOLE
   ========================================================= */

/* ================= AUTHENTICATION ================= */
const token = localStorage.getItem("token");
const user = JSON.parse(localStorage.getItem("user") || "null");

if (!token || !user) {
  window.location.href = "admin-login.html";
}

if (user.role !== "admin") {
  document.body.innerHTML = `
    <div class="container">
      <h1>Access Denied</h1>
      <p class="hint" style="text-align:center">This page is for administrators only.</p>
      <button onclick="window.location.href='admin-login.html'">Admin Login</button>
    </div>
  `;
  throw new Error("Not an admin");
}

document.getElementById("adminWelcome").textContent = `Welcome, ${user.fullName}`;
document.getElementById("adminName").textContent = user.fullName;
document.getElementById("adminAvatar").textContent = user.fullName.charAt(0).toUpperCase();

/* ================= LOGOUT ================= */
document.getElementById("logoutBtn")?.addEventListener("click", () => {
  localStorage.clear();
  window.location.href = "admin-login.html";
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
   NAVIGATION - only the clicked section shows, nothing else
   ========================================================= */
function showAdminView(viewName) {
  document.querySelectorAll(".admin-view").forEach(view => view.classList.remove("active"));
  document.getElementById(`adminview-${viewName}`)?.classList.add("active");

  document.querySelectorAll(".nav-item").forEach(item => item.classList.remove("active"));
  document.querySelector(`.nav-item[data-view="${viewName}"]`)?.classList.add("active");

  closeSidebar();

  if (viewName === "overview") loadStats();
  if (viewName === "courses") loadCourses();
}

document.querySelectorAll(".nav-item").forEach(button => {
  button.addEventListener("click", () => showAdminView(button.dataset.view));
});

/* =========================================================
   TOAST MESSAGE
   ========================================================= */
function showAdminMessage(message) {
  const element = document.getElementById("adminMessage");
  element.textContent = message;

  clearTimeout(window.adminMessageTimer);
  window.adminMessageTimer = setTimeout(() => {
    element.textContent = "";
  }, 3500);
}

/* =========================================================
   NOTIFICATIONS
   ========================================================= */
const notificationBtn = document.getElementById("notificationBtn");
const notificationDropdown = document.getElementById("notificationDropdown");
const notificationDot = document.getElementById("notificationDot");

async function loadNotifications() {
  try {
    const res = await fetch("/api/admin/notifications", { headers: authHeaders() });
    const data = await res.json();
    if (!res.ok) return;

    if (data.unreadCount > 0) {
      notificationDot.classList.remove("hidden");
    } else {
      notificationDot.classList.add("hidden");
    }

    const listHtml = data.notifications.length === 0
      ? `<p class="hint" style="padding:12px;">No notifications yet.</p>`
      : data.notifications.map(n => `
          <div class="notification-item ${n.is_read ? "" : "unread"}">
            <p>${n.message}</p>
            <span>${new Date(n.created_at).toLocaleString()}</span>
          </div>
        `).join("");

    notificationDropdown.innerHTML = listHtml;
  } catch (error) {
    console.error(error);
  }
}

notificationBtn?.addEventListener("click", async () => {
  notificationDropdown.classList.toggle("open");

  if (notificationDropdown.classList.contains("open")) {
    await fetch("/api/admin/notifications/mark-read", { method: "POST", headers: authHeaders() });
    notificationDot.classList.add("hidden");
  }
});

document.addEventListener("click", (e) => {
  if (notificationDropdown && !notificationDropdown.contains(e.target) && !notificationBtn.contains(e.target)) {
    notificationDropdown.classList.remove("open");
  }
});

/* =========================================================
   STATS
   ========================================================= */
async function loadStats() {
  const statsDiv = document.getElementById("statsSection");
  statsDiv.innerHTML = `<div class="form-card"><p class="hint">Loading stats...</p></div>`;

  try {
    const res = await fetch("/api/admin/stats", { headers: authHeaders() });
    const data = await res.json();

    if (!res.ok) {
      statsDiv.innerHTML = `<div class="form-card"><p class="hint">${data.error || "Could not load stats."}</p></div>`;
      return;
    }

    statsDiv.innerHTML = `
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon green">✦</div>
          <div><span>Registered Students</span><strong>${data.totalStudents}</strong></div>
        </div>
        <div class="stat-card">
          <div class="stat-icon gold">★</div>
          <div><span>Total Attempts</span><strong>${data.totalAttempts}</strong></div>
        </div>
      </div>

      <div class="form-card">
        <table class="admin-students-table">
          <thead>
            <tr><th>Student</th><th>Email</th><th>Attempts</th></tr>
          </thead>
          <tbody>
            ${data.students.map(s => `
              <tr>
                <td>${s.full_name}</td>
                <td>${s.email}</td>
                <td class="admin-attempts-count">${s.attempts_count}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    `;
  } catch (error) {
    console.error(error);
    statsDiv.innerHTML = `<div class="form-card"><p class="hint">Unable to connect to the server.</p></div>`;
  }
}

/* =========================================================
   COURSES
   ========================================================= */
let allCourses = [];

async function loadCourses() {
  const listDiv = document.getElementById("courseList");
  listDiv.innerHTML = `<div class="form-card"><p class="hint">Loading courses...</p></div>`;

  try {
    const res = await fetch("/api/admin/courses", { headers: authHeaders() });
    const data = await res.json();

    if (!res.ok) {
      listDiv.innerHTML = `<div class="form-card"><p class="hint">${data.error || "Could not load courses."}</p></div>`;
      return;
    }

    allCourses = data.courses;
    renderCourses();
  } catch (error) {
    console.error(error);
    listDiv.innerHTML = `<div class="form-card"><p class="hint">Unable to connect to the server.</p></div>`;
  }
}

const departmentLabels = {
  science: "Science",
  arts: "Arts",
  commercial: "Commercial / Management",
};

function renderCourses() {
  const listDiv = document.getElementById("courseList");
  listDiv.innerHTML = "";

  if (allCourses.length === 0) {
    listDiv.innerHTML = `
      <div class="form-card">
        <div style="text-align:center; padding:30px 10px;">
          <div style="font-size:35px; margin-bottom:10px;">📚</div>
          <h3>No courses yet</h3>
          <p class="hint">Add your first course above.</p>
        </div>
      </div>
    `;
    return;
  }

  allCourses.forEach((course, i) => {
    const card = document.createElement("div");
    card.className = "admin-course-card";
    card.style.animationDelay = `${i * 0.04}s`;
    card.innerHTML = viewModeHtml(course);
    listDiv.appendChild(card);

    card.querySelector(".edit-course-btn").addEventListener("click", () => {
      card.innerHTML = editModeHtml(course);
      wireEditMode(card, course);
    });

    card.querySelector(".delete-course-btn").addEventListener("click", () => deleteCourse(course.course_id));
  });
}

function viewModeHtml(course) {
  const subjects = (course.required_subjects || "").split(",").map(s => s.trim()).filter(Boolean);
  const tagsHtml = subjects.map(s => `<span class="admin-tag">${s}</span>`).join("");

  return `
    <div class="admin-course-top">
      <div>
        <h3>${course.course_name}</h3>
        <p class="admin-course-sub">${course.university || "No university set"} • ${course.faculty || "No faculty set"}</p>
      </div>
      <div class="admin-course-actions">
        <button type="button" class="outline-btn edit-course-btn">Edit</button>
        <button type="button" class="delete-set-btn delete-course-btn">Delete</button>
      </div>
    </div>
    <div class="admin-course-meta">
      <span class="admin-tag admin-tag-gold">${departmentLabels[course.department] || course.department || "No department"}</span>
      <span class="admin-tag admin-tag-gold">${course.related_aptitude_category || "No category"}</span>
      <span class="admin-tag admin-tag-gold">Min grade: ${course.min_grade || "—"}</span>
    </div>
    <div class="admin-course-subjects">${tagsHtml || '<span class="hint">No subjects set</span>'}</div>
  `;
}

function editModeHtml(course) {
  return `
    <div class="admin-edit-form">
      <label>Course Name</label>
      <input type="text" class="edit-courseName" value="${course.course_name || ""}">

      <label>University</label>
      <input type="text" class="edit-university" value="${course.university || ""}">

      <label>Faculty</label>
      <input type="text" class="edit-faculty" value="${course.faculty || ""}">

      <label>Department</label>
      <select class="edit-department">
        <option value="">Select Department</option>
        <option value="science" ${course.department === "science" ? "selected" : ""}>Science</option>
        <option value="arts" ${course.department === "arts" ? "selected" : ""}>Arts</option>
        <option value="commercial" ${course.department === "commercial" ? "selected" : ""}>Commercial / Management</option>
      </select>

      <label>Aptitude Category</label>
      <select class="edit-aptitude">
        ${["Analytical", "Creative", "Practical", "Social"].map(cat =>
          `<option value="${cat}" ${course.related_aptitude_category === cat ? "selected" : ""}>${cat}</option>`
        ).join("")}
      </select>

      <label>Required Subjects (comma-separated)</label>
      <input type="text" class="edit-subjects" value="${course.required_subjects || ""}">

      <label>Minimum Grade</label>
      <input type="text" class="edit-minGrade" value="${course.min_grade || ""}" placeholder="e.g. C6">

      <div class="admin-course-actions">
        <button type="button" class="outline-btn cancel-edit-btn">Cancel</button>
        <button type="button" class="primary-btn save-edit-btn">Save Changes</button>
      </div>
    </div>
  `;
}

function wireEditMode(card, course) {
  card.querySelector(".cancel-edit-btn").addEventListener("click", () => {
    card.innerHTML = viewModeHtml(course);
    card.querySelector(".edit-course-btn").addEventListener("click", () => {
      card.innerHTML = editModeHtml(course);
      wireEditMode(card, course);
    });
    card.querySelector(".delete-course-btn").addEventListener("click", () => deleteCourse(course.course_id));
  });

  card.querySelector(".save-edit-btn").addEventListener("click", async () => {
    const saveBtn = card.querySelector(".save-edit-btn");
    saveBtn.disabled = true;
    saveBtn.textContent = "Saving...";

    const body = {
      courseName: card.querySelector(".edit-courseName").value.trim(),
      university: card.querySelector(".edit-university").value.trim(),
      faculty: card.querySelector(".edit-faculty").value.trim(),
      department: card.querySelector(".edit-department").value,
      relatedAptitudeCategory: card.querySelector(".edit-aptitude").value,
      requirementId: course.requirement_id,
      requiredSubjects: card.querySelector(".edit-subjects").value.trim(),
      minGrade: card.querySelector(".edit-minGrade").value.trim(),
    };

    try {
      const res = await fetch(`/api/admin/courses/${course.course_id}`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (!res.ok) {
        showAdminMessage(data.error || "Could not update.");
        saveBtn.disabled = false;
        saveBtn.textContent = "Save Changes";
        return;
      }

      showAdminMessage("Course updated.");
      loadCourses();
    } catch (error) {
      console.error(error);
      showAdminMessage("Unable to connect to the server.");
      saveBtn.disabled = false;
      saveBtn.textContent = "Save Changes";
    }
  });
}

async function deleteCourse(courseId) {
  const confirmed = confirm("Delete this course? This cannot be undone.");
  if (!confirmed) return;

  try {
    const res = await fetch(`/api/admin/courses/${courseId}`, {
      method: "DELETE",
      headers: authHeaders(),
    });

    if (!res.ok) {
      const data = await res.json();
      showAdminMessage(data.error || "Could not delete.");
      return;
    }

    showAdminMessage("Course deleted.");
    loadCourses();
  } catch (error) {
    console.error(error);
    showAdminMessage("Unable to connect to the server.");
  }
}

document.getElementById("addCourseForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const body = {
    courseName: document.getElementById("newCourseName").value.trim(),
    university: document.getElementById("newUniversity").value.trim(),
    faculty: document.getElementById("newFaculty").value.trim(),
    department: document.getElementById("newDepartment").value,
    relatedAptitudeCategory: document.getElementById("newAptitude").value,
    requiredSubjects: document.getElementById("newSubjects").value.trim(),
    minGrade: document.getElementById("newMinGrade").value.trim(),
  };

  if (!body.courseName || !body.department || !body.requiredSubjects || !body.minGrade) {
    showAdminMessage("Course name, department, subjects, and minimum grade are required.");
    return;
  }

  const submitBtn = e.target.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  submitBtn.textContent = "Adding...";

  try {
    const res = await fetch("/api/admin/courses", {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(body),
    });
    const data = await res.json();

    if (!res.ok) {
      showAdminMessage(data.error || "Could not add course.");
      return;
    }

    showAdminMessage("Course added.");
    document.getElementById("addCourseForm").reset();
    loadCourses();
  } catch (error) {
    console.error(error);
    showAdminMessage("Unable to connect to the server.");
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Add Course";
  }
});

/* =========================================================
   INITIAL LOAD - only Overview shows, nothing else
   ========================================================= */
showAdminView("overview");
loadNotifications();
setInterval(loadNotifications, 30000);