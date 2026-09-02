/**
 * app.js
 * Frontend controller strictly matching index.html IDs and DOM structure
 */

// ===== PLAYER DATA =====
const PLAYERS = [
  "kkoedb", "Ant Rose", "The Notorious One", "lowly poly", "pioneer9",
  "Icyz", "vipeR.", "TheOrthodoxone", "Da0Y Khan", "AlbertRivera",
  "Al Capone", "ReedyTurnip", "kalikaka", "JohnCox93", "WonderfulWand",
  "Stonehatch", "Konan", "Rhysand", "Yuki Suou", "Gaby0"
];

// Local fallback only. The live weapon list is loaded from Weapon Stats
// through getWeapons() once a user is authenticated.
const WEAPONS = [
  "ICBM", "BRBM", "SRBM", "MRBM", "IRBM", "GHOST", "M240", "M16 Rifle",
  "Frigate", "Submarine", "SPG-9", "2S25", "Destroyer", "BM-21", "T-90MS",
  "Abrams M1A2", "Merkava", "Striker 40", "Patrol Boat", "M41-DK1",
  "Cruiser", "Challenger 2", "F-22 Raptor",
  "HK21", "M777", "M109", "Rafale F4", "Su-35 Flanker-E",
  "E-3 Sentry", "B-2 Spirit"
];

// ===== STATE =====
const AppState = {
  user: null,
  password: null,
  isAdmin: false,

  setSession(user, password, isAdmin) {
    this.user = user;
    this.password = password;
    this.isAdmin = Boolean(isAdmin);

    sessionStorage.setItem("ea_user", user);
    sessionStorage.setItem("ea_password", password);
    sessionStorage.setItem("ea_isAdmin", String(this.isAdmin));
  },

  clearSession() {
    this.user = null;
    this.password = null;
    this.isAdmin = false;

    sessionStorage.removeItem("ea_user");
    sessionStorage.removeItem("ea_password");
    sessionStorage.removeItem("ea_isAdmin");
  },

  isLoggedIn() {
    if (!this.user || !this.password) {
      const savedUser = sessionStorage.getItem("ea_user");
      const savedPass = sessionStorage.getItem("ea_password");
      const savedAdmin =
        sessionStorage.getItem("ea_isAdmin") === "true";

      if (savedUser && savedPass) {
        this.user = savedUser;
        this.password = savedPass;
        this.isAdmin = savedAdmin;
        return true;
      }

      return false;
    }

    return true;
  }
};

// ===== INIT =====
document.addEventListener("DOMContentLoaded", () => {
  populateSelects();
  setupNavigation();
  setupForms();
  checkMobile();
  window.addEventListener("resize", checkMobile);

  if (AppState.isLoggedIn()) {
    showWorkspace();
  } else {
    showLanding();
  }
});

function populateSelects() {
  const playerSelects = [
    "loginUser",
    "transferTo",
    "adminTargetUser",
    "overrideTargetUser"
  ];

  playerSelects.forEach(id => {
    const sel = document.getElementById(id);
    if (!sel) return;

    PLAYERS.forEach(player => {
      const opt = document.createElement("option");
      opt.value = player;
      opt.textContent = player;
      sel.appendChild(opt);
    });
  });

  populateWeaponSelect(WEAPONS);
}

function populateWeaponSelect(weapons) {
  const weaponSel = document.getElementById("weaponSelect");
  if (!weaponSel) return;

  const uniqueWeapons = [...new Set(
    (Array.isArray(weapons) ? weapons : [])
      .map(w => String(w || "").trim())
      .filter(Boolean)
  )];

  weaponSel.innerHTML = `
    <option value="">— choose weapon —</option>
  `;

  uniqueWeapons.forEach(weapon => {
    const opt = document.createElement("option");
    opt.value = weapon;
    opt.textContent = weapon;
    weaponSel.appendChild(opt);
  });
}

function checkMobile() {
  const isMobile = window.innerWidth <= 768;
  document.body.classList.toggle("is-mobile", isMobile);
}

// ===== NAVIGATION & UI PANES =====

function setupNavigation() {
  const navButtons = document.querySelectorAll("[data-pane]");

  navButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const paneId = btn.getAttribute("data-pane");
      if (paneId) switchPane(paneId);
    });
  });
}

function switchPane(paneId) {
  document.querySelectorAll(".pane").forEach(pane => {
    pane.style.display = "none";
  });

  document.querySelectorAll(".tab-item").forEach(tab => {
    tab.classList.remove("active");
  });

  document.querySelectorAll(".navlink").forEach(nav => {
    nav.classList.remove("active");
  });

  const targetPane = document.getElementById(paneId);
  if (targetPane) targetPane.style.display = "block";

  document.querySelectorAll(`[data-pane="${paneId}"]`).forEach(el => {
    el.classList.add("active");
  });

  if (paneId === "dashboardPane") loadDashboard();
  if (paneId === "stockpilePane") loadStockpile();
  if (paneId === "bankPane") loadBank();
  if (paneId === "historyPane") loadHistory();
  if (paneId === "claimsPane") loadMyClaims();
  if (paneId === "adminPane") loadAdminData();
}

function showLanding() {
  document.getElementById("landing").style.display = "flex";
  document.getElementById("about").style.display = "block";
  document.getElementById("loginWrapper").style.display = "none";
  document.getElementById("appWorkspace").style.display = "none";
  document.getElementById("navLinks").style.display = "none";
  document.getElementById("mobileTabbar").style.display = "none";
}

function showLogin() {
  document.getElementById("landing").style.display = "none";
  document.getElementById("about").style.display = "none";
  document.getElementById("loginWrapper").style.display = "flex";
  document.getElementById("appWorkspace").style.display = "none";
}

function showWorkspace() {
  document.getElementById("landing").style.display = "none";
  document.getElementById("about").style.display = "none";
  document.getElementById("loginWrapper").style.display = "none";
  document.getElementById("appWorkspace").style.display = "block";

  document.getElementById("navLinks").style.display = "flex";
  document.getElementById("mobileTabbar").style.display = "flex";

  const adminNav = document.getElementById("adminNavLink");
  const mobileAdmin = document.getElementById("mobileAdminTab");

  if (AppState.isAdmin) {
    if (adminNav) adminNav.style.display = "inline-block";
    if (mobileAdmin) mobileAdmin.style.display = "flex";
  } else {
    if (adminNav) adminNav.style.display = "none";
    if (mobileAdmin) mobileAdmin.style.display = "none";
  }

  loadWeaponCatalog();
  switchPane("dashboardPane");
}

function logout() {
  AppState.clearSession();
  showLanding();
}

// ===== FORM HANDLERS =====

function setupForms() {
  // Login
  const loginForm = document.getElementById("loginForm");

  if (loginForm) {
    loginForm.addEventListener("submit", async e => {
      e.preventDefault();

      const user = document.getElementById("loginUser").value;
      const pass = document.getElementById("loginPass").value;
      const hint = document.getElementById("loginHint");

      if (!user) {
        hint.textContent = "Please select your name.";
        return;
      }

      if (!pass || pass.length < 6) {
        hint.textContent =
          "Password must be at least 6 characters.";
        return;
      }

      hint.textContent = "Authenticating...";

      try {
        const res = await API.login(user, pass);

        if (res.status === "success") {
          AppState.setSession(
            res.player,
            pass,
            res.isAdmin
          );

          hint.textContent = "";
          showWorkspace();
        } else {
          hint.textContent =
            res.error || "Login failed.";
        }
      } catch (err) {
        hint.textContent = "Error: " + err.message;
      }
    });
  }

  // Weapon Count
  const trackerForm = document.getElementById("trackerForm");

  if (trackerForm) {
    trackerForm.addEventListener("submit", async e => {
      e.preventDefault();

      const weapon =
        document.getElementById("weaponSelect").value;

      const quantity = parseInt(
        document.getElementById("quantityInput").value,
        10
      );

      if (!weapon) {
        alert("Please select a weapon.");
        return;
      }

      if (!Number.isFinite(quantity) || quantity < 0) {
        alert(
          "Please enter a valid non-negative quantity."
        );
        return;
      }

      try {
        const res = await API.updateWeapon(
          AppState.user,
          AppState.password,
          weapon,
          quantity
        );

        if (res.status === "success") {
          alert(
            `Stockpile updated: ${weapon} set to ${quantity}`
          );

          trackerForm.reset();
          await loadStockpile();
          await loadDashboard();
        } else {
          alert(
            res.error ||
            "Failed to update stockpile."
          );
        }
      } catch (err) {
        alert(err.message);
      }
    });
  }

  // Transfer
  const transferForm =
    document.getElementById("transferForm");

  if (transferForm) {
    transferForm.addEventListener("submit", async e => {
      e.preventDefault();

      const toPlayer =
        document.getElementById("transferTo").value;

      const amount = parseFloat(
        document.getElementById("transferAmount").value
      );

      if (!toPlayer) {
        alert("Please select a recipient.");
        return;
      }

      if (!Number.isFinite(amount) || amount <= 0) {
        alert("Please enter a valid amount.");
        return;
      }

      try {
        const res = await API.transfer(
          AppState.user,
          AppState.password,
          toPlayer,
          amount
        );

        if (res.status === "success") {
          alert(res.message);
          transferForm.reset();

          await loadBank();
          await loadDashboard();
        } else {
          alert(res.error || "Transfer failed.");
        }
      } catch (err) {
        alert(err.message);
      }
    });
  }

  setupClaimTypeUI();

  // Bank Claim Form
  const claimForm =
    document.getElementById("claimForm");

  if (claimForm) {
    claimForm.addEventListener("submit", async e => {
      e.preventDefault();

      const type =
        document.getElementById("claimType").value;

      const amount = parseInt(
        document.getElementById("claimAmount").value,
        10
      );

      const notes =
        document.getElementById("claimNotes").value;

      if (!Number.isFinite(amount) || amount <= 0) {
        alert("Please enter a valid amount.");
        return;
      }

      try {
        let res;

        if (type === "troops") {
          res = await API.submitTroopClaim(
            AppState.user,
            AppState.password,
            amount,
            notes
          );
        } else if (type === "regional") {
          res = await API.submitRegionalClaim(
            AppState.user,
            AppState.password,
            amount,
            notes
          );
        } else if (type === "borderday") {
          res = await API.submitBorderClaim(
            AppState.user,
            AppState.password,
            amount,
            notes
          );
        } else {
          res = await API.submitClaim(
            AppState.user,
            AppState.password,
            type,
            amount,
            notes
          );
        }

        if (res.status === "success") {
          alert("Claim submitted successfully!");
          claimForm.reset();

          await loadMyClaims();
          await loadDashboard();
        } else {
          alert(
            res.error ||
            "Claim submission failed."
          );
        }
      } catch (err) {
        alert(err.message);
      }
    });
  }

  // Claims Pane
  const claimsForm =
    document.getElementById("claimsForm");

  if (claimsForm) {
    claimsForm.addEventListener("submit", async e => {
      e.preventDefault();

      const type =
        document.getElementById("claimTypeSelect").value;

      const amount = parseInt(
        document.getElementById("troopsLostInput").value,
        10
      );

      const notes =
        document.getElementById("claimNotesInput").value;

      const hint =
        document.getElementById("claimsHint");

      if (!type) {
        hint.textContent =
          "Please select a claim type.";
        return;
      }

      if (!Number.isFinite(amount) || amount <= 0) {
        hint.textContent =
          "Please enter an amount greater than 0.";
        return;
      }

      hint.textContent = "Submitting...";

      try {
        let res;

        if (type === "troops") {
          res = await API.submitTroopClaim(
            AppState.user,
            AppState.password,
            amount,
            notes
          );
        } else if (type === "regional") {
          res = await API.submitRegionalClaim(
            AppState.user,
            AppState.password,
            amount,
            notes
          );
        } else if (type === "borderday") {
          res = await API.submitBorderClaim(
            AppState.user,
            AppState.password,
            amount,
            notes
          );
        }

        if (res && res.status === "success") {
          hint.textContent = "";
          alert("Claim submitted successfully!");
          claimsForm.reset();

          setupClaimTypeUI();

          await loadMyClaims();
          await loadDashboard();
        } else {
          hint.textContent =
            res?.error ||
            "Claim submission failed.";
        }
      } catch (err) {
        hint.textContent =
          "Error: " + err.message;
      }
    });
  }

  // Admin balance override
  const overrideForm =
    document.getElementById("overrideForm");

  if (overrideForm) {
    overrideForm.addEventListener("submit", async e => {
      e.preventDefault();

      const targetUser =
        document.getElementById(
          "overrideTargetUser"
        ).value;

      const amount = parseFloat(
        document.getElementById("overrideAmount").value
      );

      const notes =
        document.getElementById("overrideNotes").value;

      const hint =
        document.getElementById("overrideHint");

      if (!targetUser) {
        hint.textContent =
          "Please select a player.";
        return;
      }

      if (!Number.isFinite(amount) || amount === 0) {
        hint.textContent =
          "Please enter a non-zero amount.";
        return;
      }

      hint.textContent = "Processing...";

      try {
        const res =
          await API.adminAdjustBalance(
            AppState.user,
            AppState.password,
            targetUser,
            amount,
            notes
          );

        if (res.status === "success") {
          hint.textContent = res.message;
          hint.style.color = "var(--good)";
          overrideForm.reset();

          await loadDashboard();
        } else {
          hint.textContent =
            res.error ||
            "Adjustment failed.";

          hint.style.color =
            "var(--crimson)";
        }
      } catch (err) {
        hint.textContent =
          "Error: " + err.message;

        hint.style.color =
          "var(--crimson)";
      }
    });
  }
}

// ===== CLAIM UI =====

function setupClaimTypeUI() {
  const select =
    document.getElementById("claimTypeSelect");

  const label =
    document.querySelector(
      'label[for="troopsLostInput"]'
    );

  const input =
    document.getElementById("troopsLostInput");

  if (!select || !label || !input) return;

  if (!select._eaBound) {
    select.addEventListener(
      "change",
      setupClaimTypeUI
    );

    select._eaBound = true;
  }

  if (select.value === "regional") {
    label.textContent = "Regional Medals";
    input.placeholder = "e.g. 4";
  } else if (select.value === "borderday") {
    label.textContent = "Border Days";
    input.placeholder = "e.g. 3";
  } else {
    label.textContent = "Troops Lost";
    input.placeholder = "e.g. 150";
  }
}

// ===== UTILS =====

function setDashboardDate() {
  const el =
    document.getElementById("dashboardDate");

  if (!el) return;

  const now = new Date();

  el.textContent = now.toLocaleString([], {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).toUpperCase();
}

function formatNumber(value) {
  return Number(value || 0).toLocaleString();
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// ===== DATA-DRIVEN WEAPON CATALOG =====

async function loadWeaponCatalog() {
  try {
    const res = await API.getStockpile(
      AppState.user,
      AppState.password
    );

    if (
      res.status === "success" &&
      res.weaponStats &&
      typeof res.weaponStats === "object"
    ) {
      const weapons =
        Object.keys(res.weaponStats);

      if (weapons.length > 0) {
        populateWeaponSelect(weapons);
      }
    }
  } catch (err) {
    console.warn(
      "Could not load weapon catalog:",
      err
    );
    // Keep fallback list if the catalog fails.
  }
}

// ===== DASHBOARD =====

async function loadDashboard() {
  setDashboardDate();

  const playerEl =
    document.getElementById("dashboardPlayer");

  const roleEl =
    document.getElementById("dashboardRole");

  const goldEl =
    document.getElementById("dashboardGold");

  const claimsEl =
    document.getElementById("dashboardClaims");

  const claimsLabelEl =
    document.getElementById(
      "dashboardClaimsLabel"
    );

  const unitsEl =
    document.getElementById("dashboardUnits");

  const attackEl =
    document.getElementById("dashboardAttack");

  const defenceEl =
    document.getElementById(
      "dashboardDefence"
    );

  const powerBarEl =
    document.getElementById(
      "dashboardPowerBar"
    );

  const activityEl =
    document.getElementById(
      "dashboardActivity"
    );

  if (playerEl) {
    playerEl.textContent =
      AppState.user || "—";
  }

  if (roleEl) {
    roleEl.textContent =
      AppState.isAdmin
        ? "ADMINISTRATOR"
        : "MEMBER";
  }

  if (goldEl) goldEl.textContent = "Loading...";
  if (claimsEl) claimsEl.textContent = "Loading...";
  if (unitsEl) unitsEl.textContent = "—";
  if (attackEl) attackEl.textContent = "—";
  if (defenceEl) defenceEl.textContent = "—";

  if (activityEl) {
    activityEl.innerHTML =
      "<p class='empty-note'>Loading activity...</p>";
  }

  try {
    const [
      bankRes,
      weaponRes,
      txRes,
      claimsRes
    ] = await Promise.all([
      API.getBank(
        AppState.user,
        AppState.password
      ),

      API.getStockpile(
        AppState.user,
        AppState.password
      ),

      API.getTransactions(
        AppState.user,
        AppState.password
      ),

      AppState.isAdmin
        ? API.getPendingClaims(
            AppState.user,
            AppState.password
          )
        : API.getMyClaims(
            AppState.user,
            AppState.password
          )
    ]);

    if (goldEl) {
      goldEl.textContent =
        bankRes.status === "success"
          ? formatNumber(bankRes.goldBalance)
          : "ERROR";
    }

    if (claimsEl) {
      if (
        claimsRes.status === "success" &&
        Array.isArray(claimsRes.claims)
      ) {
        const pending =
          claimsRes.claims.filter(
            claim =>
              String(
                claim.Status || ""
              ).toUpperCase() === "PENDING"
          ).length;

        claimsEl.textContent =
          formatNumber(pending);

        if (claimsLabelEl) {
          claimsLabelEl.textContent =
            AppState.isAdmin
              ? "AWAITING ADMIN REVIEW"
              : "YOUR PENDING CLAIMS";
        }
      } else {
        claimsEl.textContent = "0";
      }
    }

    if (
      weaponRes.status === "success" &&
      weaponRes.stockpile &&
      weaponRes.weaponStats
    ) {
      let totalUnits = 0;
      let totalAtk = 0;
      let totalDef = 0;

      Object.keys(
        weaponRes.weaponStats
      ).forEach(weapon => {
        const count =
          Number(
            weaponRes.stockpile[weapon]
          ) || 0;

        const stat =
          weaponRes.weaponStats[weapon] || {};

        totalUnits += count;

        totalAtk +=
          count *
          (Number(stat.attack) || 0);

        totalDef +=
          count *
          (Number(stat.defence) || 0);
      });

      if (unitsEl) {
        unitsEl.textContent =
          formatNumber(totalUnits);
      }

      if (attackEl) {
        attackEl.textContent =
          formatNumber(totalAtk);
      }

      if (defenceEl) {
        defenceEl.textContent =
          formatNumber(totalDef);
      }

      const combined =
        totalAtk + totalDef;

      const strengthPercent =
        combined > 0
          ? Math.min(
              100,
              Math.max(
                8,
                (
                  totalAtk /
                  Math.max(
                    totalAtk,
                    totalDef,
                    1
                  )
                ) * 100
              )
            )
          : 0;

      if (powerBarEl) {
        powerBarEl.style.width =
          `${strengthPercent}%`;
      }
    }

    if (activityEl) {
      if (
        txRes.status === "success" &&
        Array.isArray(
          txRes.transactions
        ) &&
        txRes.transactions.length
      ) {
        const recent =
          [...txRes.transactions]
            .sort((a, b) =>
              String(
                b.Timestamp || ""
              ).localeCompare(
                String(
                  a.Timestamp || ""
                )
              )
            )
            .slice(0, 4);

        activityEl.innerHTML =
          recent.map(tx => {
            const amount =
              Number(tx.Amount) || 0;

            const amountClass =
              amount >= 0
                ? "positive"
                : "negative";

            const sign =
              amount >= 0
                ? "+"
                : "";

            return `
              <div class="dashboard-activity-item">
                <div class="dashboard-activity-top">
                  <strong>
                    ${escapeHtml(
                      tx.Type ||
                      "Transaction"
                    )}
                  </strong>

                  <span
                    class="dashboard-activity-amount ${amountClass}"
                  >
                    ${sign}${formatNumber(
                      amount
                    )} Gold
                  </span>
                </div>

                <small class="dashboard-activity-meta">
                  ${escapeHtml(
                    tx.Timestamp || ""
                  )}
                  ${
                    tx.Notes
                      ? " • " +
                        escapeHtml(
                          tx.Notes
                        )
                      : ""
                  }
                </small>
              </div>
            `;
          }).join("");
      } else {
        activityEl.innerHTML =
          "<p class='empty-note'>No treasury activity yet.</p>";
      }
    }
  } catch (err) {
    if (goldEl) goldEl.textContent = "ERROR";
    if (claimsEl) claimsEl.textContent = "ERROR";

    if (activityEl) {
      activityEl.innerHTML =
        `<p class='empty-note'>Error: ${escapeHtml(err.message)}</p>`;
    }
  }
}

// ===== STOCKPILE =====

async function loadStockpile() {
  const grid =
    document.getElementById(
      "liveWeaponsGrid"
    );

  if (!grid) return;

  grid.innerHTML =
    "<p class='empty-note'>Loading inventory...</p>";

  try {
    const res =
      await API.getStockpile(
        AppState.user,
        AppState.password
      );

    if (
      res.status === "success" &&
      res.stockpile &&
      res.weaponStats
    ) {
      grid.innerHTML = "";

      const stockpile =
        res.stockpile;

      const stats =
        res.weaponStats;

      Object.keys(stats).forEach(
        weapon => {
          const count =
            Number(
              stockpile[weapon]
            ) || 0;

          const div =
            document.createElement(
              "div"
            );

          div.className =
            "weapon-row";

          div.innerHTML = `
            <span>
              ${escapeHtml(weapon)}
            </span>

            <span class="weapon-count">
              ${count.toLocaleString()}
            </span>
          `;

          grid.appendChild(div);
        }
      );
    } else {
      grid.innerHTML =
        "<p class='empty-note'>No weapon data available.</p>";
    }
  } catch (err) {
    grid.innerHTML =
      `<p class='empty-note'>Error: ${escapeHtml(err.message)}</p>`;
  }
}

// ===== BANK =====

async function loadBank() {
  const balanceEl =
    document.getElementById(
      "balanceAmount"
    );

  if (!balanceEl) return;

  balanceEl.textContent = "Loading...";

  try {
    const res =
      await API.getBank(
        AppState.user,
        AppState.password
      );

    if (res.status === "success") {
      balanceEl.textContent =
        formatNumber(
          res.goldBalance
        ) + " Gold";
    } else {
      balanceEl.textContent = "Error";
    }
  } catch (err) {
    balanceEl.textContent = "Error";
  }
}

// ===== HISTORY =====

async function loadHistory() {
  const historyList =
    document.getElementById(
      "historyList"
    );

  if (!historyList) return;

  historyList.innerHTML =
    "<p class='empty-note'>Loading transactions...</p>";

  try {
    const res =
      await API.getTransactions(
        AppState.user,
        AppState.password
      );

    if (
      res.status === "success" &&
      Array.isArray(
        res.transactions
      )
    ) {
      if (
        res.transactions.length === 0
      ) {
        historyList.innerHTML =
          "<p class='empty-note'>No transactions found.</p>";
        return;
      }

      historyList.innerHTML = "";

      [...res.transactions]
        .reverse()
        .forEach(tx => {
          const item =
            document.createElement(
              "div"
            );

          item.className =
            "history-item";

          const amount =
            Number(tx.Amount) || 0;

          const amountClass =
            amount >= 0
              ? "positive"
              : "negative";

          const amountSign =
            amount >= 0
              ? "+"
              : "";

          item.innerHTML = `
            <div>
              <strong>
                ${escapeHtml(
                  tx.Type ||
                  "Transaction"
                )}
              </strong>
            </div>

            <small>
              ${escapeHtml(
                tx.Timestamp || ""
              )}
              ${
                tx.Notes
                  ? " | " +
                    escapeHtml(
                      tx.Notes
                    )
                  : ""
              }
            </small>

            <div class="ledger-amount ${amountClass}">
              ${amountSign}${formatNumber(
                amount
              )} Gold
            </div>

            <small>
              Balance:
              ${formatNumber(
                tx["Balance After"] || 0
              )}
            </small>
          `;

          historyList.appendChild(item);
        });
    } else {
      historyList.innerHTML =
        "<p class='empty-note'>No transactions found.</p>";
    }
  } catch (err) {
    historyList.innerHTML =
      `<p class='empty-note'>Error: ${escapeHtml(err.message)}</p>`;
  }
}

// ===== MY CLAIMS =====

async function loadMyClaims() {
  const list =
    document.getElementById(
      "myClaimsList"
    );

  const card =
    document.getElementById(
      "myClaimsCard"
    );

  if (!list || !card) return;

  card.style.display = "block";

  list.innerHTML =
    "<p class='empty-note'>Loading claims...</p>";

  try {
    const res =
      await API.getMyClaims(
        AppState.user,
        AppState.password
      );

    if (
      res.status !== "success" ||
      !Array.isArray(
        res.claims
      )
    ) {
      list.innerHTML =
        `<p class='empty-note'>${escapeHtml(res.error || "Unable to load claims.")}</p>`;
      return;
    }

    if (res.claims.length === 0) {
      list.innerHTML =
        "<p class='empty-note'>No claims found.</p>";
      return;
    }

    list.innerHTML = "";

    [...res.claims]
      .reverse()
      .forEach(claim => {
        const item =
          document.createElement(
            "div"
          );

        item.className =
          "claim-item";

        const type =
          String(
            claim.Type ||
            "Claim"
          );

        const upperType =
          type.toUpperCase();

        const status =
          String(
            claim.Status ||
            "PENDING"
          ).toLowerCase();

        const troops =
          Number(
            claim.Troops ||
            claim["Troops Lost"] ||
            0
          );

        const medals =
          Number(
            claim.Medals ||
            claim["Regional Medals"] ||
            0
          );

        const days =
          Number(
            claim["Border Days"] ||
            claim.Days ||
            0
          );

        let amountText =
          "Claim submitted";

        if (
          upperType.includes("TROOP") ||
          upperType.includes("LOSS")
        ) {
          amountText =
            `${troops.toLocaleString()} troops lost`;
        } else if (
          upperType.includes("REGIONAL") ||
          upperType.includes("MEDAL")
        ) {
          amountText =
            `${medals.toLocaleString()} regional medals`;
        } else if (
          upperType.includes("BORDER")
        ) {
          amountText =
            `${days.toLocaleString()} border days`;
        }

        item.innerHTML = `
          <div>
            <strong>
              ${escapeHtml(type)}
            </strong>

            <span class="claim-status ${escapeHtml(status)}">
              ${escapeHtml(status)}
            </span>
          </div>

          <small>
            ID:
            ${escapeHtml(
              String(
                claim["Claim ID"] || ""
              )
            )}
            |
            ${escapeHtml(
              String(
                claim.Date || ""
              )
            )}
          </small>

          <div>
            ${escapeHtml(
              amountText
            )}
          </div>

          ${
            Number(claim.Gold) > 0
              ? `<div>Paid: ${formatNumber(
                  claim.Gold
                )} Gold</div>`
              : ""
          }

          ${
            claim["Approved By"]
              ? `<small>Processed by: ${escapeHtml(
                  String(
                    claim["Approved By"]
                  )
                )}</small>`
              : ""
          }

          ${
            claim.Notes
              ? `<small>${escapeHtml(
                  String(
                    claim.Notes
                  )
                )}</small>`
              : ""
          }
        `;

        list.appendChild(item);
      });
  } catch (err) {
    list.innerHTML =
      `<p class='empty-note'>Error: ${escapeHtml(err.message)}</p>`;
  }
}

// ===== ADMIN CLAIMS =====

async function loadAdminData() {
  if (!AppState.isAdmin) return;

  const pendingList =
    document.getElementById(
      "pendingClaimsList"
    );

  if (!pendingList) return;

  pendingList.innerHTML =
    "<p class='empty-note'>Loading pending claims...</p>";

  try {
    const res =
      await API.getPendingClaims(
        AppState.user,
        AppState.password
      );

    if (
      res.status !== "success" ||
      !Array.isArray(
        res.claims
      )
    ) {
      pendingList.innerHTML =
        `<p class='empty-note'>${escapeHtml(res.error || "Unable to load pending claims.")}</p>`;
      return;
    }

    if (res.claims.length === 0) {
      pendingList.innerHTML =
        "<p class='empty-note'>No pending claims.</p>";
      return;
    }

    pendingList.innerHTML = "";

    res.claims.forEach(claim => {
      const item =
        document.createElement(
          "div"
        );

      item.className =
        "claim-item";

      const claimId =
        String(
          claim["Claim ID"] || ""
        );

      const player =
        String(
          claim.Player ||
          "Unknown"
        );

      const type =
        String(
          claim.Type ||
          "Claim"
        );

      const date =
        String(
          claim.Date || ""
        );

      const notes =
        String(
          claim.Notes || ""
        );

      const upperType =
        type.toUpperCase();

      const troops =
        Number(
          claim.Troops ||
          claim["Troops Lost"] ||
          0
        );

      const medals =
        Number(
          claim.Medals ||
          claim["Regional Medals"] ||
          0
        );

      const days =
        Number(
          claim["Border Days"] ||
          claim.Days ||
          0
        );

      let amountText =
        "Unknown amount";

      let payout = 0;

      if (
        upperType.includes("TROOP") ||
        upperType.includes("LOSS")
      ) {
        amountText =
          `${troops.toLocaleString()} troops lost`;

        payout =
          troops * 30;

      } else if (
        upperType.includes("REGIONAL") ||
        upperType.includes("MEDAL")
      ) {
        amountText =
          `${medals.toLocaleString()} regional medals`;

        payout =
          medals * 750;

      } else if (
        upperType.includes("BORDER")
      ) {
        amountText =
          `${days.toLocaleString()} border days`;

        payout =
          days * 10000;
      }

      const approveDisabled =
        payout <= 0;

      item.innerHTML = `
        <div>
          <strong>
            ${escapeHtml(type)}
          </strong>

          <span class="claim-status pending">
            PENDING
          </span>
        </div>

        <div>
          <strong>Player:</strong>
          ${escapeHtml(player)}
        </div>

        <small>
          ID:
          ${escapeHtml(claimId)}
          |
          ${escapeHtml(date)}
        </small>

        <div>
          <strong>Claim:</strong>
          ${escapeHtml(amountText)}
        </div>

        <div>
          <strong>Payout:</strong>
          ${formatNumber(payout)} Gold
        </div>

        ${
          notes
            ? `<small>Notes: ${escapeHtml(
                notes
              )}</small>`
            : ""
        }

        <div class="admin-claim-actions">
          <button
            class="btn btn-primary"
            ${approveDisabled ? "disabled" : ""}
            data-claim-action="approve"
            data-claim-id="${escapeHtml(
              claimId
            )}"
          >
            APPROVE
          </button>

          <button
            class="btn btn-outline"
            data-claim-action="reject"
            data-claim-id="${escapeHtml(
              claimId
            )}"
          >
            REJECT
          </button>
        </div>

        ${
          approveDisabled
            ? `<p class="hint">This claim has no valid amount and cannot be approved.</p>`
            : ""
        }
      `;

      const approveBtn =
        item.querySelector(
          '[data-claim-action="approve"]'
        );

      const rejectBtn =
        item.querySelector(
          '[data-claim-action="reject"]'
        );

      if (approveBtn) {
        approveBtn.addEventListener(
          "click",
          () =>
            handleClaimAction(
              claimId,
              "APPROVE"
            )
        );
      }

      if (rejectBtn) {
        rejectBtn.addEventListener(
          "click",
          () =>
            handleClaimAction(
              claimId,
              "REJECT"
            )
        );
      }

      pendingList.appendChild(
        item
      );
    });
  } catch (err) {
    pendingList.innerHTML =
      `<p class='empty-note'>Error: ${escapeHtml(err.message)}</p>`;
  }
}

// ===== ADMIN ACTIONS =====

async function handleDisableEnable(action) {
  const target =
    document.getElementById(
      "adminTargetUser"
    ).value;

  const hint =
    document.getElementById(
      "adminDisableHint"
    );

  if (!target) {
    hint.textContent =
      "Please select a player.";
    return;
  }

  hint.textContent =
    "Processing...";

  try {
    const isDisable =
      action === "disable";

    const res =
      await API.adminSetDisabled(
        AppState.user,
        AppState.password,
        target,
        isDisable
      );

    if (res.status === "success") {
      hint.textContent =
        res.message;

      hint.style.color =
        "var(--good)";
    } else {
      hint.textContent =
        res.error ||
        "Action failed.";

      hint.style.color =
        "var(--crimson)";
    }
  } catch (err) {
    hint.textContent =
      "Error: " + err.message;

    hint.style.color =
      "var(--crimson)";
  }
}

async function handleClaimAction(
  claimId,
  action
) {
  const verb =
    action === "APPROVE"
      ? "approve"
      : "reject";

  if (
    !confirm(
      `Are you sure you want to ${verb} claim ${claimId}?`
    )
  ) {
    return;
  }

  const pendingList =
    document.getElementById(
      "pendingClaimsList"
    );

  if (pendingList) {
    pendingList.style.opacity =
      "0.6";

    pendingList.style.pointerEvents =
      "none";
  }

  try {
    const res =
      await API.adminClaimAction(
        AppState.user,
        AppState.password,
        claimId,
        action
      );

    if (res.status === "success") {
      alert(
        res.message ||
        `Claim ${verb}ed successfully.`
      );

      await loadAdminData();

      if (action === "APPROVE") {
        await loadBank();
        await loadDashboard();
      }
    } else {
      alert(
        res.error ||
        "Claim action failed."
      );
    }
  } catch (err) {
    alert(
      "Error: " + err.message
    );
  } finally {
    if (pendingList) {
      pendingList.style.opacity = "";
      pendingList.style.pointerEvents = "";
    }
  }
}
