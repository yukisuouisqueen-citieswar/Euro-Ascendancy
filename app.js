/**
 * app.js
 * Frontend controller strictly matching index.html IDs and DOM structure
 */

const AppState = {
  user: localStorage.getItem("ea_user") || null,
  password: localStorage.getItem("ea_password") || null,
  isAdmin: localStorage.getItem("ea_isAdmin") === "true",

  setSession(user, password, isAdmin) {
    this.user = user;
    this.password = password;
    this.isAdmin = Boolean(isAdmin);

    localStorage.setItem("ea_user", user);
    localStorage.setItem("ea_password", password);
    localStorage.setItem("ea_isAdmin", this.isAdmin);
  },

  clearSession() {
    this.user = null;
    this.password = null;
    this.isAdmin = false;
    localStorage.clear();
  },

  isLoggedIn() {
    return Boolean(this.user && this.password);
  }
};

document.addEventListener("DOMContentLoaded", () => {
  initApp();
});

function initApp() {
  setupNavigation();
  setupForms();
  
  if (AppState.isLoggedIn()) {
    showWorkspace();
  } else {
    showLanding();
  }
}

/* ==========================================
   NAVIGATION & UI PANES
   ========================================== */

function setupNavigation() {
  const navButtons = document.querySelectorAll("[data-pane]");
  navButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const paneId = btn.getAttribute("data-pane");
      switchPane(paneId);
    });
  });
}

function switchPane(paneId) {
  // Hide all panes
  const panes = document.querySelectorAll(".pane");
  panes.forEach(pane => pane.style.display = "none");

  // Show target pane
  const targetPane = document.getElementById(paneId);
  if (targetPane) {
    targetPane.style.display = "block";
  }

  // Update active state on nav buttons
  document.querySelectorAll("[data-pane]").forEach(btn => {
    if (btn.getAttribute("data-pane") === paneId) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });

  // Load section specific data
  if (paneId === "stockpilePane") loadStockpile();
  if (paneId === "bankPane") loadBank();
  if (paneId === "historyPane") loadHistory();
}

function showLanding() {
  document.getElementById("landing").style.display = "block";
  document.getElementById("about").style.display = "block";
  document.getElementById("loginWrapper").style.display = "none";
  document.getElementById("appWorkspace").style.display = "none";
  document.getElementById("navLinks").style.display = "none";
  document.getElementById("mobileTabbar").style.display = "none";
}

function showLogin() {
  document.getElementById("landing").style.display = "none";
  document.getElementById("about").style.display = "none";
  document.getElementById("loginWrapper").style.display = "block";
  document.getElementById("appWorkspace").style.display = "none";
}

function showWorkspace() {
  document.getElementById("landing").style.display = "none";
  document.getElementById("about").style.display = "none";
  document.getElementById("loginWrapper").style.display = "none";
  document.getElementById("appWorkspace").style.display = "block";
  
  document.getElementById("navLinks").style.display = "flex";
  document.getElementById("mobileTabbar").style.display = "flex";

  // Toggle Admin Nav Visibility
  if (AppState.isAdmin) {
    document.getElementById("adminNavLink").style.display = "inline-block";
    document.getElementById("mobileAdminTab").style.display = "flex";
  } else {
    document.getElementById("adminNavLink").style.display = "none";
    document.getElementById("mobileAdminTab").style.display = "none";
  }

  switchPane("stockpilePane");
}

function logout() {
  AppState.clearSession();
  showLanding();
}

/* ==========================================
   FORM HANDLERS
   ========================================== */

function setupForms() {
  // Login Form
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const user = document.getElementById("loginUser").value;
      const pass = document.getElementById("loginPass").value;
      const hint = document.getElementById("loginHint");

      hint.textContent = "Authenticating...";
      try {
        const res = await API.login(user, pass);
        if (res.status === "success") {
          AppState.setSession(res.player, pass, res.isAdmin);
          hint.textContent = "";
          showWorkspace();
        } else {
          hint.textContent = res.error || "Login failed.";
        }
      } catch (err) {
        hint.textContent = "Error: " + err.message;
      }
    });
  }

  // Weapon Count Form
  const trackerForm = document.getElementById("trackerForm");
  if (trackerForm) {
    trackerForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const weapon = document.getElementById("weaponSelect").value;
      const quantity = parseInt(document.getElementById("quantityInput").value, 10);

      try {
        const res = await API.updateWeapon(AppState.user, AppState.password, weapon, quantity);
        if (res.status === "success") {
          alert(`Stockpile updated: ${weapon} set to ${quantity}`);
          loadStockpile();
        } else {
          alert(res.error || "Failed to update stockpile.");
        }
      } catch (err) {
        alert(err.message);
      }
    });
  }

  // Transfer Form
  const transferForm = document.getElementById("transferForm");
  if (transferForm) {
    transferForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const toPlayer = document.getElementById("transferTo").value;
      const amount = parseFloat(document.getElementById("transferAmount").value);

      try {
        const res = await API.transfer(AppState.user, AppState.password, toPlayer, amount);
        if (res.status === "success") {
          alert(res.message);
          transferForm.reset();
          loadBank();
        } else {
          alert(res.error || "Transfer failed.");
        }
      } catch (err) {
        alert(err.message);
      }
    });
  }

  // Claim Form (Bank Pane)
  const claimForm = document.getElementById("claimForm");
  if (claimForm) {
    claimForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const type = document.getElementById("claimType").value;
      const amount = parseInt(document.getElementById("claimAmount").value, 10);
      const notes = document.getElementById("claimNotes").value;

      try {
        const res = await API.submitClaim(AppState.user, AppState.password, type, amount, notes);
        if (res.status === "success") {
          alert("Claim submitted successfully!");
          claimForm.reset();
        } else {
          alert(res.error || "Claim submission failed.");
        }
      } catch (err) {
        alert(err.message);
      }
    });
  }

  // Admin Override Form
  const overrideForm = document.getElementById("overrideForm");
  if (overrideForm) {
    overrideForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const targetUser = document.getElementById("overrideTargetUser").value;
      const amount = parseFloat(document.getElementById("overrideAmount").value);
      const notes = document.getElementById("overrideNotes").value;
      const hint = document.getElementById("overrideHint");

      try {
        const res = await API.adminAdjustBalance(AppState.user, AppState.password, targetUser, amount, notes);
        if (res.status === "success") {
          hint.textContent = res.message;
          overrideForm.reset();
        } else {
          hint.textContent = res.error || "Adjustment failed.";
        }
      } catch (err) {
        hint.textContent = "Error: " + err.message;
      }
    });
  }
}

/* ==========================================
   DATA LOADERS
   ========================================== */

async function loadStockpile() {
  const grid = document.getElementById("liveWeaponsGrid");
  grid.innerHTML = "<p class='empty-note'>Loading inventory...</p>";

  try {
    const res = await API.getStockpile(AppState.user, AppState.password);
    if (res.status === "success" && res.stockpile) {
      grid.innerHTML = "";
      Object.keys(res.weaponStats).forEach(weapon => {
        const count = res.stockpile[weapon] || 0;
        const div = document.createElement("div");
        div.className = "weapon-item";
        div.innerHTML = `<strong>${weapon}</strong>: <span>${count}</span>`;
        grid.appendChild(div);
      });
    }
  } catch (err) {
    grid.innerHTML = `<p class='empty-note'>Error loading stockpile: ${err.message}</p>`;
  }
}

async function loadBank() {
  const balanceEl = document.getElementById("balanceAmount");
  balanceEl.textContent = "Loading...";

  try {
    const res = await API.getBank(AppState.user, AppState.password);
    if (res.status === "success") {
      balanceEl.textContent = Number(res.goldBalance).toLocaleString() + " Gold";
    }
  } catch (err) {
    balanceEl.textContent = "Error";
  }
}

async function loadHistory() {
  const historyList = document.getElementById("historyList");
  historyList.innerHTML = "<p class='empty-note'>Loading transactions...</p>";

  try {
    const res = await API.getTransactions(AppState.user, AppState.password);
    if (res.status === "success" && res.transactions) {
      if (res.transactions.length === 0) {
        historyList.innerHTML = "<p class='empty-note'>No transactions found.</p>";
        return;
      }

      historyList.innerHTML = "";
      res.transactions.reverse().forEach(tx => {
        const item = document.createElement("div");
        item.className = "history-item";
        item.innerHTML = `
          <div><strong>${tx.Type}</strong> - ${tx.Amount} Gold</div>
          <small>${tx.Timestamp} | ${tx.Notes || ""}</small>
        `;
        historyList.appendChild(item);
      });
    }
  } catch (err) {
    historyList.innerHTML = `<p class='empty-note'>Error loading history: ${err.message}</p>`;
  }
}
