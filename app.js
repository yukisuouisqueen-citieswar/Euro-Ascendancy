const MACRO_URL =
"https://script.google.com/macros/s/AKfycbzOFaofIbsqy8bMW8q7Jf0wZPzKF6aqTIEpuQHzdwielfsuqoP36OVjzCaOWorytQ5J/exec";

const MOBILE_BREAKPOINT = 768;

let activeSessionUser = "";
let activeSessionPassword = ""; // memory only, never stored
let currentCachedWeapons = {};
let claimMode = false;
let isLoggedIn = false;

function updateNavLayout() {
  const isMobile = window.innerWidth <= MOBILE_BREAKPOINT;
  document.body.classList.toggle("is-mobile", isMobile);

  if (!isLoggedIn) return;

  if (isMobile) {
    document.getElementById("navLinks").style.display = "none";
    document.getElementById("mobileTabbar").style.display = "flex";
  } else {
    document.getElementById("navLinks").style.display = "flex";
    document.getElementById("mobileTabbar").style.display = "none";
  }
}

window.addEventListener("resize", updateNavLayout);
updateNavLayout();

const loginForm = document.getElementById("loginForm");
const loginBtn = document.getElementById("loginBtn");
const confirmGroup = document.getElementById("confirmPasswordGroup");
const loginHint = document.getElementById("loginHint");

function showLogin() {
  document.getElementById("landing").style.display = "none";
  document.getElementById("about").style.display = "none";
  document.getElementById("loginWrapper").style.display = "flex";
  window.scrollTo(0, 0);
}

function jsonpRequest(params, onSuccess, onError) {
  const callbackName = "jsonp_" + Math.round(1e6 * Math.random());
  window[callbackName] = function (data) {
    delete window[callbackName];
    document.body.removeChild(scriptTag);
    onSuccess(data);
  };
  const query = new URLSearchParams({
    ...params,
    callback: callbackName,
  }).toString();
  const scriptTag = document.createElement("script");
  scriptTag.src = `${MACRO_URL}?${query}`;
  scriptTag.onerror = function () {
    if (window[callbackName]) delete window[callbackName];
    if (scriptTag.parentNode) document.body.removeChild(scriptTag);
    onError();
  };
  document.body.appendChild(scriptTag);
}

// ---------------- Login / Claim ----------------

loginForm.addEventListener("submit", function (e) {
  e.preventDefault();
  const user = document.getElementById("loginUser").value;
  const pass = document.getElementById("loginPass").value;
  const confirmPass = document.getElementById("confirmPassword").value;
  if (!user) return;

  if (claimMode && pass !== confirmPass) {
    loginHint.textContent = "Passwords don't match.";
    return;
  }

  loginBtn.disabled = true;
  loginBtn.textContent = claimMode
    ? "SETTING PASSWORD..."
    : "AUTHENTICATING...";

  const action = claimMode ? "claim" : "login";
  const params = claimMode
    ? { action, player: user, newPassword: pass }
    : { action, player: user, password: pass };

  jsonpRequest(
    params,
    function (data) {
      loginBtn.disabled = false;

      if (data.status === "unclaimed") {
        claimMode = true;
        confirmGroup.style.display = "block";
        loginHint.textContent =
          "No password set yet. Choose one now (6+ characters) to claim this account.";
        loginBtn.textContent = "SET PASSWORD & CONTINUE";
        return;
      }

      if (data.status === "success") {
        activeSessionUser = user;
        activeSessionPassword = pass;
        currentCachedWeapons = data.weapons || {};
        isLoggedIn = true;

        document.getElementById("loginWrapper").style.display = "none";
        document.getElementById("appWorkspace").style.display = "block";

        if (data.isAdmin) {
          document.getElementById("adminNavLink").style.display = "inline-block";
          document.getElementById("mobileAdminTab").style.display = "flex";
        }

        updateNavLayout();
        renderWeaponsGrid(currentCachedWeapons);
        updateBalanceDisplay(data.balance || 0);
      } else {
        loginBtn.textContent = claimMode
          ? "SET PASSWORD & CONTINUE"
          : "ACCESS DATABASE";
        loginHint.textContent = data.message || "Something went wrong.";
      }
    },
    function () {
      loginBtn.disabled = false;
      loginBtn.textContent = claimMode
        ? "SET PASSWORD & CONTINUE"
        : "ACCESS DATABASE";
      loginHint.textContent =
        "Network error — check your connection and try again.";
    },
  );
});

// ---------------- Tab navigation ----------------

function switchPane(paneId) {
    document.querySelectorAll(".navlink[data-pane]").forEach((b) => b.classList.remove("active"));
    document.querySelectorAll(".tab-item[data-pane]").forEach((b) => b.classList.remove("active"));
    const desktopBtn = document.querySelector(`.navlink[data-pane="${paneId}"]`);
    const mobileBtn = document.querySelector(`.tab-item[data-pane="${paneId}"]`);
    if (desktopBtn) desktopBtn.classList.add("active");
    if (mobileBtn) mobileBtn.classList.add("active");
    document.querySelectorAll(".pane").forEach((p) => (p.style.display = "none"));
    const pane = document.getElementById(paneId);
    pane.style.display = "block";
    if (paneId === "historyPane") loadHistory();
}

document.querySelectorAll(".navlink[data-pane]").forEach((btn) => {
  btn.addEventListener("click", () => switchPane(btn.dataset.pane));
});

document.querySelectorAll(".tab-item[data-pane]").forEach((btn) => {
  btn.addEventListener("click", () => switchPane(btn.dataset.pane));
});

// ---------------- Stockpile ----------------

document.getElementById("trackerForm").addEventListener("submit", function (e) {
  e.preventDefault();
  const btn = document.getElementById("submitBtn");
  const weapon = document.getElementById("weaponSelect").value;
  const qty = document.getElementById("quantityInput").value;
  if (!weapon) return;

  btn.disabled = true;
  btn.textContent = "UPDATING...";

  jsonpRequest(
    {
      action: "weapon",
      player: activeSessionUser,
      password: activeSessionPassword,
      weapon,
      quantity: qty,
    },
    function (data) {
      btn.disabled = false;
      btn.textContent = "SAVE COUNT";
      if (data.status === "success") {
        currentCachedWeapons[weapon] = qty;
        renderWeaponsGrid(currentCachedWeapons);
        document.getElementById("weaponSelect").value = "";
        document.getElementById("quantityInput").value = "";
      } else {
        alert("Couldn't save: " + (data.message || "unknown error"));
      }
    },
    function () {
      btn.disabled = false;
      btn.textContent = "SAVE COUNT";
      alert("Network error — the update may not have saved. Try again.");
    },
  );
});

function renderWeaponsGrid(weaponsObj) {
  const grid = document.getElementById("liveWeaponsGrid");
  if (!weaponsObj || Object.keys(weaponsObj).length === 0) {
    grid.innerHTML = `<p class="empty-note">No stockpile data on file yet.</p>`;
    return;
  }
  let html = "";
  Object.keys(weaponsObj)
    .sort()
    .forEach((key) => {
      const raw = weaponsObj[key];
      const display =
        raw !== "" && !isNaN(raw) ? Number(raw).toLocaleString() : raw || "0";
      html += `<div class="weapon-row"><span>${key}</span><span class="weapon-count">${display}</span></div>`;
    });
  grid.innerHTML = html;
}

// ---------------- Bank: balance / claim / transfer ----------------

function updateBalanceDisplay(balance) {
  document.getElementById("balanceAmount").textContent =
    Number(balance).toLocaleString() + " g";
}

document.getElementById("claimForm").addEventListener("submit", function (e) {
  e.preventDefault();
  const btn = document.getElementById("claimBtn");
  const type = document.getElementById("claimType").value;
  const amount = document.getElementById("claimAmount").value;
  const notes = document.getElementById("claimNotes").value;

  const actionMap = {
    troops: "claimTroops",
    regional: "claimRegional",
    borderday: "claimBorderDay",
  };
  const amountKeyMap = {
    troops: "amount",
    regional: "medals",
    borderday: "days",
  };
  const amountKey = amountKeyMap[type];

  btn.disabled = true;
  btn.textContent = "CLAIMING...";

  jsonpRequest(
    {
      action: actionMap[type],
      player: activeSessionUser,
      password: activeSessionPassword,
      [amountKey]: amount,
      notes,
    },
    function (data) {
      btn.disabled = false;
      btn.textContent = "CLAIM";
      if (data.status === "success") {
        updateBalanceDisplay(data.balance);
        document.getElementById("claimForm").reset();
        alert(`Claimed ${Number(data.payout).toLocaleString()} gold.`);
      } else {
        alert("Couldn't claim: " + (data.message || "unknown error"));
      }
    },
    function () {
      btn.disabled = false;
      btn.textContent = "CLAIM";
      alert("Network error — try again.");
    },
  );
});

document
  .getElementById("transferForm")
  .addEventListener("submit", function (e) {
    e.preventDefault();
    const btn = document.getElementById("transferBtn");
    const toPlayer = document.getElementById("transferTo").value;
    const amount = document.getElementById("transferAmount").value;
    if (!toPlayer) return;

    btn.disabled = true;
    btn.textContent = "SENDING...";

    jsonpRequest(
      {
        action: "transfer",
        player: activeSessionUser,
        password: activeSessionPassword,
        toPlayer,
        amount,
      },
      function (data) {
        btn.disabled = false;
        btn.textContent = "SEND";
        if (data.status === "success") {
          updateBalanceDisplay(data.balance);
          document.getElementById("transferForm").reset();
          alert(`Sent ${Number(amount).toLocaleString()} gold to ${toPlayer}.`);
        } else {
          alert("Couldn't send: " + (data.message || "unknown error"));
        }
      },
      function () {
        btn.disabled = false;
        btn.textContent = "SEND";
        alert("Network error — try again.");
      },
    );
  });

// ---------------- History ----------------

function loadHistory() {
  const list = document.getElementById("historyList");
  list.innerHTML = `<p class="empty-note">Loading...</p>`;

  jsonpRequest(
    {
      action: "ledger",
      player: activeSessionUser,
      password: activeSessionPassword,
    },
    function (data) {
      if (data.status !== "success") {
        list.innerHTML = `<p class="empty-note">${data.message || "Couldn't load history."}</p>`;
        return;
      }
      if (!data.history || data.history.length === 0) {
        list.innerHTML = `<p class="empty-note">No transactions yet.</p>`;
        return;
      }
      let html = "";
      data.history.forEach((item) => {
        const amt = Number(item.amount);
        const cls = amt >= 0 ? "positive" : "negative";
        const sign = amt >= 0 ? "+" : "";
        html += `
          <div class="ledger-row">
            <div>
              <div class="ledger-type">${item.type}</div>
              <div class="ledger-notes">${item.notes || ""}</div>
              <div class="ledger-meta">${item.date}</div>
            </div>
            <div class="ledger-amount ${cls}">${sign}${amt.toLocaleString()}</div>
          </div>`;
      });
      list.innerHTML = html;
    },
    function () {
      list.innerHTML = `<p class="empty-note">Network error loading history.</p>`;
    },
  );
}

// ---------------- Admin ----------------

document.getElementById("adminForm").addEventListener("submit", function (e) {
  e.preventDefault();
  const mode = e.submitter.dataset.mode; // 'disable' or 'enable'
  const target = document.getElementById("adminTargetUser").value;
  const hint = document.getElementById("adminHint");
  if (!target) return;

  hint.textContent = "Working...";
  jsonpRequest(
    {
      action: mode === "disable" ? "disableAccount" : "enableAccount",
      player: activeSessionUser,
      password: activeSessionPassword,
      targetPlayer: target,
    },
    function (data) {
      if (data.status === "success") {
        hint.textContent = `${target} has been ${data.disabled ? "disabled" : "re-enabled"}.`;
      } else {
        hint.textContent = data.message || "Something went wrong.";
      }
    },
    function () {
      hint.textContent = "Network error — try again.";
    },
  );
});

document
  .getElementById("overrideForm")
  .addEventListener("submit", function (e) {
    e.preventDefault();
    const btn = document.getElementById("overrideBtn");
    const target = document.getElementById("overrideTargetUser").value;
    const amount = document.getElementById("overrideAmount").value;
    const notes = document.getElementById("overrideNotes").value;
    const hint = document.getElementById("overrideHint");
    if (!target || !amount) return;

    btn.disabled = true;
    btn.textContent = "APPLYING...";

    jsonpRequest(
      {
        action: "adminAdjust",
        player: activeSessionUser,
        password: activeSessionPassword,
        targetPlayer: target,
        amount,
        notes,
      },
      function (data) {
        btn.disabled = false;
        btn.textContent = "APPLY";
        if (data.status === "success") {
          hint.textContent = `${target}'s new balance: ${Number(data.balance).toLocaleString()} g`;
          document.getElementById("overrideForm").reset();
        } else {
          hint.textContent = data.message || "Something went wrong.";
        }
      },
      function () {
        btn.disabled = false;
        btn.textContent = "APPLY";
        hint.textContent = "Network error — try again.";
      },
    );
  });

// ---------------- Logout ----------------

function logout() {
  activeSessionUser = "";
  activeSessionPassword = "";
  currentCachedWeapons = {};
  claimMode = false;
  isLoggedIn = false;
  confirmGroup.style.display = "none";
  loginBtn.textContent = "ACCESS DATABASE";
  loginHint.textContent = "";
  document.getElementById("navLinks").style.display = "none";
  document.getElementById("mobileTabbar").style.display = "none";
  document.getElementById("adminNavLink").style.display = "none";
  document.getElementById("mobileAdminTab").style.display = "none";
  document.getElementById("appWorkspace").style.display = "none";
  document.getElementById("loginWrapper").style.display = "flex";
  loginForm.reset();
}
