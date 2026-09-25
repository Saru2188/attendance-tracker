/* =====================================================
   FIREBASE
   ===================================================== */



/* =====================================================
   FIREBASE CONFIG
   ===================================================== */

/*
   WE WILL REPLACE THESE VALUES DURING DEPLOYMENT.
*/

/* =====================================================
   FIREBASE
   ===================================================== */

import { initializeApp }
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
    getFirestore,
    collection,
    addDoc,
    getDocs,
    deleteDoc,
    doc
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
    getAuth,
    GoogleAuthProvider,
    signInWithPopup,
    onAuthStateChanged,
    signOut
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";


/* =====================================================
   FIREBASE CONFIG
   ===================================================== */

const firebaseConfig = {
    apiKey: "AIzaSyDFchsHZlTHqEu_TZTb79erckRKEsmNqIc",
  authDomain: "student-dashboard-d4f82.firebaseapp.com",
  projectId: "student-dashboard-d4f82",
  storageBucket: "student-dashboard-d4f82.firebasestorage.app",
  messagingSenderId: "1053532918772",
  appId: "1:1053532918772:web:1ac4047299f16a16231fa1"
};


const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

const auth = getAuth(app);

const provider = new GoogleAuthProvider();


/* =====================================================
   USER ID
   ===================================================== */

/*
   For Version 1 we use one fixed user.

   Later we can add proper Firebase login.
*/

let USER_ID = null;


/* =====================================================
   PAGE NAVIGATION
   ===================================================== */

window.showPage = function(pageName) {

    document.querySelectorAll(".page")
        .forEach(page => page.classList.remove("active-page"));

    document.getElementById(pageName)
        .classList.add("active-page");


    document.querySelectorAll(".nav-btn")
        .forEach(button => button.classList.remove("active"));


    const buttons = document.querySelectorAll(".nav-btn");

    const pageNames = [
        "dashboard",
        "timetable",
        "tasks",
        "attendance",
        "exams",
        "notes",
        "expenses"
    ];

    const index = pageNames.indexOf(pageName);

    if (index >= 0) {
        buttons[index].classList.add("active");
    }


    document.getElementById("pageTitle").textContent =
        pageName.charAt(0).toUpperCase() + pageName.slice(1);
};


/* =====================================================
   DATE
   ===================================================== */

function updateDate() {

    const today = new Date();

    document.getElementById("currentDate").textContent =
        today.toLocaleDateString("en-IN", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric"
        });
}

updateDate();


/* =====================================================
   FIREBASE COLLECTION HELPER
   ===================================================== */

function userCollection(name) {

    return collection(
        db,
        "users",
        USER_ID,
        name
    );
}


/* =====================================================
   ADD TASK
   ===================================================== */

window.addTask = async function() {

    const title = prompt("Task name:");

    if (!title) return;

    const dueDate = prompt("Due date (YYYY-MM-DD):");

    if (!dueDate) return;


    await addDoc(
        userCollection("tasks"),
        {
            title: title,
            dueDate: dueDate,
            completed: false
        }
    );

    loadTasks();
};


/* =====================================================
   LOAD TASKS
   ===================================================== */

async function loadTasks() {

    const snapshot =
        await getDocs(userCollection("tasks"));

    const container =
        document.getElementById("taskList");

    const dashboard =
        document.getElementById("dashboardTasks");

    container.innerHTML = "";
    dashboard.innerHTML = "";

    let pending = 0;


    snapshot.forEach(item => {

        const data = item.data();

        if (!data.completed) pending++;


        const html = `
            <div class="list-item">

                <div>
                    <h3>${data.title}</h3>
                    <p>Due: ${data.dueDate}</p>
                </div>

                <button
                    class="primary-btn"
                    onclick="deleteTask('${item.id}')">
                    Delete
                </button>

            </div>
        `;

        container.innerHTML += html;


        if (!data.completed) {

            dashboard.innerHTML += `
                <div class="list-item">

                    <div>
                        <h3>${data.title}</h3>
                        <p>Due: ${data.dueDate}</p>
                    </div>

                </div>
            `;
        }

    });


    document.getElementById("pendingTasks").textContent =
        pending;


    if (dashboard.innerHTML === "") {

        dashboard.innerHTML =
            `<p class="empty">No pending tasks.</p>`;
    }
}


/* =====================================================
   DELETE TASK
   ===================================================== */

window.deleteTask = async function(id) {

    await deleteDoc(
        doc(db, "users", USER_ID, "tasks", id)
    );

    loadTasks();
};


/* =====================================================
   ADD CLASS
   ===================================================== */

window.addClass = async function() {

    const day = prompt(
        "Day (Monday/Tuesday/etc.):"
    );

    if (!day) return;


    const time = prompt("Time:");

    if (!time) return;


    const subject = prompt("Subject:");

    if (!subject) return;


    const room = prompt("Room:");

    await addDoc(
        userCollection("timetable"),
        {
            day: day,
            time: time,
            subject: subject,
            room: room || "-"
        }
    );

    loadTimetable();
};


/* =====================================================
   LOAD TIMETABLE
   ===================================================== */

async function loadTimetable() {

    const snapshot =
        await getDocs(
            userCollection("timetable")
        );


    const body =
        document.getElementById("timetableBody");

    const todaySchedule =
        document.getElementById("todaySchedule");

    body.innerHTML = "";
    todaySchedule.innerHTML = "";


    const today =
        new Date().toLocaleDateString(
            "en-US",
            { weekday: "long" }
        );


    let count = 0;


    snapshot.forEach(item => {

        const data = item.data();


        body.innerHTML += `

            <tr>

                <td>${data.day}</td>

                <td>${data.time}</td>

                <td>${data.subject}</td>

                <td>${data.room}</td>

            </tr>
        `;


        if (
            data.day.toLowerCase() ===
            today.toLowerCase()
        ) {

            count++;

            todaySchedule.innerHTML += `

                <div class="list-item">

                    <div>

                        <h3>${data.subject}</h3>

                        <p>
                            ${data.time} •
                            Room ${data.room}
                        </p>

                    </div>

                </div>
            `;
        }

    });


    document.getElementById("todayClasses")
        .textContent = count;


    if (todaySchedule.innerHTML === "") {

        todaySchedule.innerHTML =
            `<p class="empty">No classes today.</p>`;
    }
}


/* =====================================================
   ADD ATTENDANCE
   ===================================================== */

window.addAttendance = async function() {

    const subject =
        prompt("Subject:");

    if (!subject) return;


    const attended =
        Number(prompt("Classes attended:"));


    const conducted =
        Number(prompt("Classes conducted:"));


    if (
        isNaN(attended) ||
        isNaN(conducted) ||
        conducted <= 0
    ) {
        alert("Invalid values.");
        return;
    }


    await addDoc(
        userCollection("attendance"),
        {
            subject: subject,
            attended: attended,
            conducted: conducted
        }
    );


    loadAttendance();
};


/* =====================================================
   LOAD ATTENDANCE
   ===================================================== */

async function loadAttendance() {

    const snapshot =
        await getDocs(
            userCollection("attendance")
        );


    const container =
        document.getElementById("attendanceList");


    container.innerHTML = "";


    let totalAttended = 0;
    let totalConducted = 0;


    snapshot.forEach(item => {

        const data = item.data();


        const percentage =
            (data.attended /
            data.conducted) * 100;


        totalAttended += data.attended;
        totalConducted += data.conducted;


        container.innerHTML += `

            <div class="attendance-card">

                <h3>${data.subject}</h3>

                <div class="attendance-percent">
                    ${percentage.toFixed(1)}%
                </div>

                <p>
                    ${data.attended} /
                    ${data.conducted} classes
                </p>

            </div>
        `;

    });


    if (totalConducted > 0) {

        const overall =
            (totalAttended /
            totalConducted) * 100;

        document.getElementById(
            "overallAttendance"
        ).textContent =
            overall.toFixed(1) + "%";

    } else {

        document.getElementById(
            "overallAttendance"
        ).textContent = "0%";
    }
}


/* =====================================================
   ADD EXAM
   ===================================================== */

window.addExam = async function() {

    const subject =
        prompt("Subject:");

    if (!subject) return;


    const date =
        prompt("Exam date (YYYY-MM-DD):");

    if (!date) return;


    await addDoc(
        userCollection("exams"),
        {
            subject: subject,
            date: date
        }
    );


    loadExams();
};


/* =====================================================
   LOAD EXAMS
   ===================================================== */

async function loadExams() {

    const snapshot =
        await getDocs(
            userCollection("exams")
        );


    const container =
        document.getElementById("examList");


    container.innerHTML = "";


    let count = 0;


    snapshot.forEach(item => {

        const data = item.data();

        count++;


        container.innerHTML += `

            <div class="list-item">

                <div>

                    <h3>${data.subject}</h3>

                    <p>
                        Exam: ${data.date}
                    </p>

                </div>

            </div>
        `;

    });


    document.getElementById(
        "upcomingExams"
    ).textContent = count;
}


/* =====================================================
   ADD NOTE
   ===================================================== */

window.addNote = async function() {

    const title =
        prompt("Note title:");

    if (!title) return;


    const content =
        prompt("Note:");

    if (!content) return;


    await addDoc(
        userCollection("notes"),
        {
            title: title,
            content: content
        }
    );


    loadNotes();
};


/* =====================================================
   LOAD NOTES
   ===================================================== */

async function loadNotes() {

    const snapshot =
        await getDocs(
            userCollection("notes")
        );


    const container =
        document.getElementById("notesList");


    container.innerHTML = "";


    snapshot.forEach(item => {

        const data = item.data();


        container.innerHTML += `

            <div class="note">

                <h3>${data.title}</h3>

                <p>${data.content}</p>

            </div>
        `;

    });
}


/* =====================================================
   ADD EXPENSE
   ===================================================== */

window.addExpense = async function() {

    const description =
        prompt("Expense description:");

    if (!description) return;


    const amount =
        Number(prompt("Amount (₹):"));


    if (isNaN(amount) || amount <= 0) {

        alert("Invalid amount.");

        return;
    }


    await addDoc(
        userCollection("expenses"),
        {
            description: description,
            amount: amount
        }
    );


    loadExpenses();
};


/* =====================================================
   LOAD EXPENSES
   ===================================================== */

async function loadExpenses() {

    const snapshot =
        await getDocs(
            userCollection("expenses")
        );


    const container =
        document.getElementById("expenseList");


    container.innerHTML = "";


    let total = 0;


    snapshot.forEach(item => {

        const data = item.data();

        total += data.amount;


        container.innerHTML += `

            <div class="list-item">

                <div>

                    <h3>
                        ${data.description}
                    </h3>

                    <p>
                        ₹${data.amount}
                    </p>

                </div>

            </div>
        `;

    });


    document.getElementById(
        "totalExpenses"
    ).textContent =
        "₹" + total.toFixed(2);
}


/* =====================================================
   INITIAL LOAD
   ===================================================== */

async function initializeDashboard() {

    try {

        await loadTasks();
        await loadTimetable();
        await loadAttendance();
        await loadExams();
        await loadNotes();
        await loadExpenses();


        document.getElementById(
            "syncStatus"
        ).textContent =
            "Synced with cloud ☁️";


    } catch (error) {

        console.error(error);

        document.getElementById(
            "syncStatus"
        ).textContent =
            "Firebase not connected";

    }
}


/* =====================================================
   GOOGLE LOGIN
   ===================================================== */

const loginScreen =
    document.getElementById("loginScreen");

const appScreen =
    document.getElementById("app");

const googleLoginBtn =
    document.getElementById("googleLoginBtn");

const loginError =
    document.getElementById("loginError");


/* ================= LOGIN ================= */

googleLoginBtn.addEventListener("click", async () => {

    try {

        loginError.textContent = "";

        await signInWithPopup(
            auth,
            provider
        );

    } catch (error) {

        console.error(error);

        loginError.textContent =
            "Login failed. Please try again.";

    }

});


/* ================= AUTH STATE ================= */

onAuthStateChanged(auth, async (user) => {

    if (user) {

        console.log("Logged in:", user.email);

        /*
           Use the Google account's unique UID
           as the Firestore user ID.
        */

        USER_ID = user.uid;


        /* Show dashboard */

        loginScreen.style.display = "none";

        appScreen.style.display = "flex";


        /* Update profile */

        const profileName =
            document.querySelector(".profile span");

        if (profileName) {

            profileName.textContent =
                user.displayName || "Student";

        }


        /* Update avatar */

        const avatar =
            document.querySelector(".avatar");

        if (avatar) {

            avatar.textContent =
                (user.displayName || "S")
                .charAt(0)
                .toUpperCase();

        }


        /* Load dashboard */

        initializeDashboard();


    } else {

        console.log("No user logged in.");

        USER_ID = null;

        loginScreen.style.display = "flex";

        appScreen.style.display = "none";

    }

});
