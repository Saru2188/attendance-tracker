const TARGET_PERCENTAGE = 85;

// DOM Elements
const form = document.getElementById("attendance-form");
const totalInput = document.getElementById("total-classes");
const attendedInput = document.getElementById("attended-classes");
const percentageDisplay = document.getElementById("percentage");
const statusMessage = document.getElementById("status-message");

const btnPresent = document.getElementById("btn-present");
const btnBunked = document.getElementById("btn-bunked");

// Load stored data on app open
document.addEventListener("DOMContentLoaded", () => {
  const savedTotal = localStorage.getItem("total_classes");
  const savedAttended = localStorage.getItem("attended_classes");

  if (savedTotal !== null && savedAttended !== null) {
    totalInput.value = savedTotal;
    attendedInput.value = savedAttended;
    calculateAndRender();
  }
});

// Update data manually via form
form.addEventListener("submit", (e) => {
  e.preventDefault();
  saveData(totalInput.value, attendedInput.value);
  calculateAndRender();
});

// Quick action: Present
btnPresent.addEventListener("click", () => {
  let total = parseInt(totalInput.value || 0) + 1;
  let attended = parseInt(attendedInput.value || 0) + 1;
  updateData(total, attended);
});

// Quick action: Bunked
btnBunked.addEventListener("click", () => {
  let total = parseInt(totalInput.value || 0) + 1;
  let attended = parseInt(attendedInput.value || 0);
  updateData(total, attended);
});

function updateData(total, attended) {
  totalInput.value = total;
  attendedInput.value = attended;
  saveData(total, attended);
  calculateAndRender();
}

function saveData(total, attended) {
  localStorage.setItem("total_classes", total);
  localStorage.setItem("attended_classes", attended);
}

function calculateAndRender() {
  const total = parseInt(totalInput.value);
  const attended = parseInt(attendedInput.value);

  if (isNaN(total) || isNaN(attended) || total <= 0) {
    percentageDisplay.textContent = "0%";
    statusMessage.textContent = "Please enter valid numbers.";
    return;
  }

  const currentPct = ((attended / total) * 100).toFixed(1);
  percentageDisplay.textContent = `${currentPct}%`;

  if (currentPct >= TARGET_PERCENTAGE) {
    percentageDisplay.className = "percentage-display safe";
    
    // Calculate how many future classes can be safely bunked
    // Formula: (Attended / 0.85) - Total
    const maxBunks = Math.floor((attended / (TARGET_PERCENTAGE / 100)) - total);
    
    if (maxBunks > 0) {
      statusMessage.textContent = `You're safe! You can safely bunk the next ${maxBunks} class(es) and stay above 85%.`;
    } else {
      statusMessage.textContent = `You're on the edge! Don't bunk the next class or you'll drop below 85%.`;
    }
  } else {
    percentageDisplay.className = "percentage-display warning";
    
    // Calculate how many consecutive classes need to be attended
    // Formula: (0.85 * Total - Attended) / (1 - 0.85)
    const requiredClasses = Math.ceil(((TARGET_PERCENTAGE / 100) * total - attended) / (1 - (TARGET_PERCENTAGE / 100)));
    
    statusMessage.textContent = `You are short! You need to attend the next ${requiredClasses} class(es) continuously to reach 85%.`;
  }
}