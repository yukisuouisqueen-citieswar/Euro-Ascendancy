const MACRO_URL = "https://script.google.com/macros/s/AKfycbziBtGM0-i2g3jImdm9LhI7i7EG2Y_NFmWQ3fBXc8w7wfkulio-2TqQiOJQVTrkiL8J/exec";


let activeSessionUser = "";
let activeSessionPassword = ""; // kept only in memory for this tab, never stored
let currentCachedWeapons = {};
let claimMode = false;

const loginForm = document.getElementById('loginForm');
const loginBtn = document.getElementById('loginBtn');
const confirmGroup = document.getElementById('confirmPasswordGroup');
const loginHint = document.getElementById('loginHint');

function jsonpRequest(params, onSuccess, onError) {
  const callbackName = 'jsonp_' + Math.round(1e6 * Math.random());
  window[callbackName] = function (data) {
    delete window[callbackName];
    document.body.removeChild(scriptTag);
    onSuccess(data);
  };

  const query = new URLSearchParams({ ...params, callback: callbackName }).toString();
  const scriptTag = document.createElement('script');
  scriptTag.src = `${MACRO_URL}?${query}`;
  scriptTag.onerror = function () {
    if (window[callbackName]) delete window[callbackName];
    if (scriptTag.parentNode) document.body.removeChild(scriptTag);
    onError();
  };
  document.body.appendChild(scriptTag);
}

loginForm.addEventListener('submit', function (e) {
  e.preventDefault();

  const user = document.getElementById('loginUser').value;
  const pass = document.getElementById('loginPass').value;
  const confirmPass = document.getElementById('confirmPassword').value;

  if (!user) return;

  if (claimMode && pass !== confirmPass) {
    loginHint.textContent = "Passwords don't match.";
    return;
  }

  loginBtn.disabled = true;
  loginBtn.textContent = claimMode ? "SETTING PASSWORD..." : "AUTHENTICATING...";

  const action = claimMode ? 'claim' : 'login';
  const params = claimMode
    ? { action, player: user, newPassword: pass }
    : { action, player: user, password: pass };

  jsonpRequest(params, function (data) {
    loginBtn.disabled = false;

    if (data.status === 'unclaimed') {
      claimMode = true;
      confirmGroup.style.display = 'block';
      loginHint.textContent = "No password set for this name yet. Choose one now (6+ characters) to claim this account.";
      loginBtn.textContent = "SET PASSWORD & CONTINUE";
      return;
    }

    if (data.status === 'success') {
      activeSessionUser = user;
      activeSessionPassword = pass;
      currentCachedWeapons = data.weapons || {};

      document.getElementById('loginPass').value = "";
      document.getElementById('confirmPassword').value = "";
      document.getElementById('loginWrapper').style.display = "none";
      document.getElementById('appWorkspace').style.display = "block";
      document.getElementById('workspaceTitle').textContent = user.toUpperCase();

      renderWeaponsGrid(currentCachedWeapons);
    } else {
      loginBtn.textContent = claimMode ? "SET PASSWORD & CONTINUE" : "ACCESS DATABASE";
      loginHint.textContent = data.message || "Something went wrong.";
    }
  }, function () {
    loginBtn.disabled = false;
    loginBtn.textContent = claimMode ? "SET PASSWORD & CONTINUE" : "ACCESS DATABASE";
    loginHint.textContent = "Network error — check your connection and try again.";
  });
});

document.getElementById('trackerForm').addEventListener('submit', function (e) {
  e.preventDefault();

  const btn = document.getElementById('submitBtn');
  const weapon = document.getElementById('weaponSelect').value;
  const qty = document.getElementById('quantityInput').value;
  if (!weapon) return;

  btn.disabled = true;
  btn.textContent = "UPDATING...";

  jsonpRequest(
    { action: 'weapon', player: activeSessionUser, password: activeSessionPassword, weapon, quantity: qty },
    function (data) {
      btn.disabled = false;
      btn.textContent = "SAVE COUNT";

      if (data.status === 'success') {
        currentCachedWeapons[weapon] = qty;
        renderWeaponsGrid(currentCachedWeapons);
        document.getElementById('weaponSelect').value = "";
        document.getElementById('quantityInput').value = "";
      } else {
        alert("Couldn't save: " + (data.message || "unknown error"));
      }
    },
    function () {
      btn.disabled = false;
      btn.textContent = "SAVE COUNT";
      alert("Network error — the update may not have saved. Try again.");
    }
  );
});

function renderWeaponsGrid(weaponsObj) {
  const grid = document.getElementById('liveWeaponsGrid');
  if (!weaponsObj || Object.keys(weaponsObj).length === 0) {
    grid.innerHTML = `<p class="empty-note">No stockpile data on file yet.</p>`;
    return;
  }

  let html = "";
  Object.keys(weaponsObj).sort().forEach((key) => {
    const raw = weaponsObj[key];
    const display = raw !== "" && !isNaN(raw) ? Number(raw).toLocaleString() : (raw || "0");
    html += `
      <div class="weapon-row">
        <span class="weapon-name">${key}</span>
        <span class="weapon-count">${display}</span>
      </div>`;
  });
  grid.innerHTML = html;
}

function logout() {
  activeSessionUser = "";
  activeSessionPassword = "";
  currentCachedWeapons = {};
  claimMode = false;
  confirmGroup.style.display = 'none';
  loginBtn.textContent = "ACCESS DATABASE";
  loginHint.textContent = "";
  document.getElementById('appWorkspace').style.display = "none";
  document.getElementById('loginWrapper').style.display = "block";
  loginForm.reset();
}
