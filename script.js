// =========================
// AUTHENTICATION
// =========================

function showSignup() {
    document.getElementById("loginPage").classList.add("hidden");
    document.getElementById("signupPage").classList.remove("hidden");
}

function showLogin() {
    document.getElementById("signupPage").classList.add("hidden");
    document.getElementById("loginPage").classList.remove("hidden");
}

function signup() {

    const name = document.getElementById("signupName").value.trim();
    const email = document.getElementById("signupEmail").value.trim();
    const password = document.getElementById("signupPassword").value.trim();

    if (!name || !email || !password) {
        alert("Please fill all fields");
        return;
    }

    const user = {
        name,
        email,
        password
    };

    localStorage.setItem("studyUser", JSON.stringify(user));

    alert("Account created successfully!");

    showLogin();
}

function login() {

    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value.trim();

    const user =
        JSON.parse(localStorage.getItem("studyUser"));

    if (!user) {
        alert("Please create an account first");
        return;
    }

    if (
        email === user.email &&
        password === user.password
    ) {

        localStorage.setItem("loggedIn", "true");

        document.getElementById("loginPage").classList.add("hidden");
        document.getElementById("app").classList.remove("hidden");

        loadDashboard();

    } else {

        alert("Invalid credentials");
    }
}

function logout() {

    localStorage.removeItem("loggedIn");

    location.reload();
}

// =========================
// MODAL
// =========================

function openModal() {
    document.getElementById("planModal").style.display = "flex";
}

function closeModal() {
    document.getElementById("planModal").style.display = "none";
}

// =========================
// NOTIFICATIONS
// =========================

function enableNotifications() {

    if ("Notification" in window) {

        Notification.requestPermission()
            .then(permission => {

                if (permission === "granted") {

                    alert("Notifications Enabled");

                }
            });
    }
}

function sendNotification(title, body) {

    if (
        "Notification" in window &&
        Notification.permission === "granted"
    ) {

        new Notification(title, {
            body: body
        });
    }
}

// =========================
// STUDY PLANS
// =========================

let showingCompleted = false;

function addPlan() {

    const subject =
        document.getElementById("subject").value.trim();

    const topic =
        document.getElementById("topic").value.trim();

    const date =
        document.getElementById("date").value;

    const time =
        document.getElementById("time").value;

    const priority =
        document.getElementById("priority").value;

    if (
        !subject ||
        !topic ||
        !date ||
        !time
    ) {
        alert("Fill all fields");
        return;
    }

    const plans =
        JSON.parse(localStorage.getItem("plans")) || [];

    plans.push({
        id: Date.now(),
        subject,
        topic,
        date,
        time,
        priority,
        completed: false
    });

    localStorage.setItem(
        "plans",
        JSON.stringify(plans)
    );

    closeModal();

    document.getElementById("subject").value = "";
    document.getElementById("topic").value = "";
    document.getElementById("date").value = "";
    document.getElementById("time").value = "";

    loadDashboard();
}

function deletePlan(id) {

    let plans =
        JSON.parse(localStorage.getItem("plans")) || [];

    plans = plans.filter(
        plan => plan.id !== id
    );

    localStorage.setItem(
        "plans",
        JSON.stringify(plans)
    );

    loadDashboard();
}

function completePlan(id) {

    const plans =
        JSON.parse(localStorage.getItem("plans")) || [];

    const plan =
        plans.find(plan => plan.id === id);

    if (plan) {
        plan.completed = true;
    }

    localStorage.setItem(
        "plans",
        JSON.stringify(plans)
    );

    updateStreak();

    loadDashboard();
}

// =========================
// TABS
// =========================

function showUpcoming() {

    showingCompleted = false;

    document.querySelectorAll(".tab-btn")[0]
        .classList.add("active");

    document.querySelectorAll(".tab-btn")[1]
        .classList.remove("active");

    renderPlans();
}

function showCompleted() {

    showingCompleted = true;

    document.querySelectorAll(".tab-btn")[1]
        .classList.add("active");

    document.querySelectorAll(".tab-btn")[0]
        .classList.remove("active");

    renderPlans();
}

// =========================
// RENDER PLANS
// =========================

function renderPlans() {

    const container =
        document.getElementById("plansContainer");

    const plans =
        JSON.parse(localStorage.getItem("plans")) || [];

    const filtered =
        plans.filter(
            plan => plan.completed === showingCompleted
        );

    if (filtered.length === 0) {

        container.innerHTML = `
        <div class="empty-state">
            <h2>No Plans Found</h2>
        </div>
        `;

        return;
    }

    container.innerHTML = "";

    filtered.forEach(plan => {

        let priorityClass = "priority-low";

        if (plan.priority === "High")
            priorityClass = "priority-high";

        if (plan.priority === "Medium")
            priorityClass = "priority-medium";

        const card =
        `
        <div class="plan-card">

            <h3>${plan.subject}</h3>

            <p>📖 ${plan.topic}</p>

            <p>📅 ${plan.date}</p>

            <p>⏰ ${plan.time}</p>

            <p class="${priorityClass}">
                ${plan.priority}
            </p>

            <div class="plan-actions">

            ${
                !plan.completed
                ?
                `<button
                    class="complete-btn"
                    onclick="completePlan(${plan.id})">
                    Complete
                </button>`
                :
                ""
            }

            <button
                class="delete-btn"
                onclick="deletePlan(${plan.id})">
                Delete
            </button>

            </div>

        </div>
        `;

        container.innerHTML += card;
    });
}

// =========================
// DASHBOARD
// =========================

function loadDashboard() {

    const plans =
        JSON.parse(localStorage.getItem("plans")) || [];

    const total = plans.length;

    const completed =
        plans.filter(p => p.completed).length;

    const pending =
        total - completed;

    const rate =
        total === 0
        ? 0
        : Math.round((completed / total) * 100);

    document.getElementById("totalPlans")
        .textContent = total;

    document.getElementById("completedPlans")
        .textContent = completed;

    document.getElementById("pendingPlans")
        .textContent = pending;

    document.getElementById("completionRate")
        .textContent = rate + "%";

    document.getElementById("upcomingCount")
        .textContent = pending;

    document.getElementById("completedCount")
        .textContent = completed;

    renderPlans();

    loadStreak();
}

// =========================
// STREAK
// =========================

function updateStreak() {

    const today =
        new Date().toDateString();

    const last =
        localStorage.getItem("lastStudyDay");

    let streak =
        parseInt(
            localStorage.getItem("currentStreak")
        ) || 0;

    let best =
        parseInt(
            localStorage.getItem("bestStreak")
        ) || 0;

    if (last !== today) {

        streak++;

        localStorage.setItem(
            "currentStreak",
            streak
        );

        localStorage.setItem(
            "lastStudyDay",
            today
        );

        if (streak > best) {

            best = streak;

            localStorage.setItem(
                "bestStreak",
                best
            );
        }
    }
}

function loadStreak() {

    const streak =
        parseInt(
            localStorage.getItem("currentStreak")
        ) || 0;

    const best =
        parseInt(
            localStorage.getItem("bestStreak")
        ) || 0;

    document.getElementById("currentStreak")
        .textContent = streak;

    document.getElementById("bestStreak")
        .textContent = best;

    document.getElementById("streakCurrent")
        .textContent = streak;

    document.getElementById("streakBest")
        .textContent = best;
}

// =========================
// REMINDER CHECKER
// =========================

function checkReminders() {

    const plans =
        JSON.parse(localStorage.getItem("plans")) || [];

    const now = new Date();

    plans.forEach(plan => {

        if (plan.completed) return;

        const planTime =
            new Date(`${plan.date}T${plan.time}`);

        const diff =
            planTime.getTime() -
            now.getTime();

        if (
            diff > 0 &&
            diff < 60000
        ) {

            sendNotification(
                "📚 Study Reminder",
                `${plan.subject} - ${plan.topic}`
            );
        }
    });
}

// =========================
// STARTUP
// =========================

window.onload = () => {

    if (
        localStorage.getItem("loggedIn") === "true"
    ) {

        document
            .getElementById("loginPage")
            .classList.add("hidden");

        document
            .getElementById("app")
            .classList.remove("hidden");

        loadDashboard();
    }

    setInterval(
        checkReminders,
        30000
    );
};