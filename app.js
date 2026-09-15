/* ============================================================
   EURO ASCENDANCY — APP.JS
   Main frontend application logic
   ============================================================ */

const AppState = {
    user: "",
    password: "",
    isAdmin: false,
    weaponCatalog: [],

    setSession(user, password, isAdmin) {
        this.user = user;
        this.password = password;
        this.isAdmin = !!isAdmin;

        sessionStorage.setItem("ea_user", user);
        sessionStorage.setItem("ea_password", password);
        sessionStorage.setItem(
            "ea_isAdmin",
            this.isAdmin ? "true" : "false"
        );
    },

    restoreSession() {
        this.user = sessionStorage.getItem("ea_user") || "";
        this.password = sessionStorage.getItem("ea_password") || "";
        this.isAdmin =
            sessionStorage.getItem("ea_isAdmin") === "true";
    },

    clearSession() {
        this.user = "";
        this.password = "";
        this.isAdmin = false;

        sessionStorage.removeItem("ea_user");
        sessionStorage.removeItem("ea_password");
        sessionStorage.removeItem("ea_isAdmin");
    },

    isLoggedIn() {
        return !!this.user && !!this.password;
    }
};


/* ============================================================
   FALLBACK WEAPON LIST
   ============================================================ */

const WEAPONS = [
    "ICBM",
    "BRBM",
    "SRBM",
    "MRBM",
    "IRBM",
    "GHOST",
    "M240",
    "M16 Rifle",
    "Frigate",
    "Submarine",
    "SPG-9",
    "2S25",
    "Destroyer",
    "BM-21",
    "T-90MS",
    "Abrams M1A2",
    "Merkava",
    "Striker 40",
    "Patrol Boat",
    "M41-DK1",
    "Cruiser",
    "Challenger 2",
    "F-22 Raptor",

    // New weapons
    "HK21",
    "M777",
    "M109",
    "Rafale F4",
    "Su-35 Flanker-E",
    "E-3 Sentry",
    "B-2 Spirit"
];


/* ============================================================
   PLAYER LIST
   ============================================================ */

const PLAYERS = [
    "kkoedb",
    "Ant Rose",
    "The Notorious One",
    "lowly poly",
    "pioneer9",
    "Icyz",
    "vipeR.",
    "TheOrthodoxone",
    "Da0Y Khan",
    "AlbertRivera",
    "Al Capone",
    "ReedyTurnip",
    "kalikaka",
    "JohnCox93",
    "WonderfulWand",
    "Stonehatch",
    "Konan",
    "Rhysand",
    "Yuki Suou",
    "Gaby0"
];


/* ============================================================
   DOM HELPERS
   ============================================================ */

function $(id) {
    return document.getElementById(id);
}

function show(id) {
    const el = $(id);

    if (el) {
        el.style.display = "";
    }
}

function hide(id) {
    const el = $(id);

    if (el) {
        el.style.display = "none";
    }
}

function setText(id, value) {
    const el = $(id);

    if (el) {
        el.textContent =
            value === null ||
            value === undefined
                ? ""
                : String(value);
    }
}

function formatNumber(value) {
    const num = Number(value) || 0;

    return num.toLocaleString();
}

function formatGold(value) {
    return `${formatNumber(value)} GOLD`;
}

function formatDate(value) {
    if (!value) return "—";

    const date = new Date(value);

    if (isNaN(date.getTime())) {
        return String(value);
    }

    return date.toLocaleString();
}

function escapeHtml(value) {
    if (
        value === null ||
        value === undefined
    ) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/* ============================================================
   INITIALIZATION
   ============================================================ */

document.addEventListener(
    "DOMContentLoaded",
    () => {
        AppState.restoreSession();

        populateSelects();
        setupNavigation();
        setupForms();
        checkMobile();

        if (AppState.isLoggedIn()) {
            showWorkspace();
        } else {
            showLanding();
        }
    }
);


/* ============================================================
   LANDING / WORKSPACE
   ============================================================ */

function showLanding() {
    hide("workspace");
    hide("workspaceView");
    hide("appWorkspace");

    show("landing");

    document.body.classList.remove(
        "logged-in"
    );
}

function showWorkspace() {
    hide("landing");

    show("workspace");
    show("workspaceView");
    show("appWorkspace");

    document.body.classList.add(
        "logged-in"
    );

    setText(
        "currentUser",
        AppState.user
    );

    setText(
        "welcomeUser",
        AppState.user
    );

    const adminLinks = [
        "adminNavLink",
        "mobileAdminTab"
    ];

    adminLinks.forEach(id => {
        const el = $(id);

        if (!el) return;

        el.style.display =
            AppState.isAdmin
                ? ""
                : "none";
    });

    loadWeaponCatalog();
    loadDashboard();
}


/* ============================================================
   NAVIGATION
   ============================================================ */

function setupNavigation() {
    document.querySelectorAll(
        "[data-pane]"
    ).forEach(button => {
        button.addEventListener(
            "click",
            () => {
                const pane =
                    button.dataset.pane;

                if (pane) {
                    switchPane(pane);
                }
            }
        );
    });

    const brand =
        $("brandButton") ||
        $("navBrand");

    if (brand) {
        brand.addEventListener(
            "click",
            () => {
                if (AppState.isLoggedIn()) {
                    switchPane(
                        "dashboardPane"
                    );
                }
            }
        );
    }

    const enterPortal =
        $("enterPortal");

    if (enterPortal) {
        enterPortal.addEventListener(
            "click",
            () => {
                const loginPane =
                    $("loginPane");

                if (loginPane) {
                    switchPane(
                        "loginPane"
                    );
                }
            }
        );
    }
}

function switchPane(paneId) {
    document.querySelectorAll(
        ".pane"
    ).forEach(pane => {
        pane.classList.remove(
            "active"
        );

        pane.style.display = "none";
    });

    const target =
        $(paneId);

    if (!target) {
        console.warn(
            `Pane '${paneId}' not found.`
        );

        return;
    }

    target.classList.add(
        "active"
    );

    target.style.display = "";

    document.querySelectorAll(
        "[data-pane]"
    ).forEach(button => {
        button.classList.toggle(
            "active",
            button.dataset.pane === paneId
        );
    });

    if (
        paneId ===
        "dashboardPane"
    ) {
        loadDashboard();
    }

    if (
        paneId ===
        "stockpilePane"
    ) {
        loadStockpile();
    }

    if (
        paneId ===
        "bankPane"
    ) {
        loadBank();
    }

    if (
        paneId ===
        "historyPane"
    ) {
        loadHistory();
    }

    if (
        paneId ===
        "claimsPane"
    ) {
        loadMyClaims();
    }

    if (
        paneId ===
        "adminPane"
    ) {
        loadAdminData();
    }
}


/* ============================================================
   FORMS
   ============================================================ */

function setupForms() {

    const loginForm =
        $("loginForm");

    if (loginForm) {
        loginForm.addEventListener(
            "submit",
            handleLogin
        );
    }


    const claimAccountForm =
        $("claimAccountForm");

    if (claimAccountForm) {
        claimAccountForm.addEventListener(
            "submit",
            handleClaimAccount
        );
    }


    const stockpileForm =
        $("stockpileForm");

    if (stockpileForm) {
        stockpileForm.addEventListener(
            "submit",
            handleWeaponUpdate
        );
    }


    const transferForm =
        $("transferForm");

    if (transferForm) {
        transferForm.addEventListener(
            "submit",
            handleTransfer
        );
    }


    const claimForm =
        $("claimForm");

    if (claimForm) {
        claimForm.addEventListener(
            "submit",
            handleClaimSubmission
        );
    }


    const claimsForm =
        $("claimsForm");

    if (claimsForm) {
        claimsForm.addEventListener(
            "submit",
            handleClaimsPaneSubmission
        );
    }


    const overrideForm =
        $("overrideForm");

    if (overrideForm) {
        overrideForm.addEventListener(
            "submit",
            handleOverride
        );
    }


    const logoutButton =
        $("logoutButton") ||
        $("logoutBtn");

    if (logoutButton) {
        logoutButton.addEventListener(
            "click",
            handleLogout
        );
    }


    const refreshAdmin =
        $("refreshAdmin") ||
        $("adminRefreshButton");

    if (refreshAdmin) {
        refreshAdmin.addEventListener(
            "click",
            loadAdminData
        );
    }
}


/* ============================================================
   SELECTS
   ============================================================ */

function populateSelects() {
    populatePlayerSelect(
        "loginPlayer",
        PLAYERS
    );

    populatePlayerSelect(
        "claimPlayer",
        PLAYERS
    );

    populatePlayerSelect(
        "toPlayer",
        PLAYERS
    );

    populatePlayerSelect(
        "overrideTargetUser",
        PLAYERS
    );

    populateWeaponSelect(
        "weaponSelect",
        WEAPONS
    );

    populateWeaponSelect(
        "weapon",
        WEAPONS
    );

    populateWeaponSelect(
        "adminWeapon",
        WEAPONS
    );
}

function populatePlayerSelect(
    id,
    players
) {
    const select = $(id);

    if (!select) return;

    const current =
        select.value;

    select.innerHTML =
        `<option value="">Select player</option>`;

    players.forEach(player => {
        const option =
            document.createElement(
                "option"
            );

        option.value = player;
        option.textContent = player;

        select.appendChild(
            option
        );
    });

    if (current) {
        select.value = current;
    }
}

function populateWeaponSelect(
    id,
    weapons
) {
    const select = $(id);

    if (!select) return;

    const current =
        select.value;

    select.innerHTML =
        `<option value="">Select weapon</option>`;

    weapons.forEach(weapon => {
        const option =
            document.createElement(
                "option"
            );

        option.value = weapon;
        option.textContent = weapon;

        select.appendChild(
            option
        );
    });

    if (current) {
        select.value = current;
    }
}


/* ============================================================
   LIVE WEAPON CATALOG
   ============================================================ */

async function loadWeaponCatalog() {
    if (!AppState.isLoggedIn()) {
        return;
    }

    try {
        const res =
            await API.getStockpile(
                AppState.user,
                AppState.password
            );

        if (
            res &&
            res.status === "success" &&
            res.weaponStats
        ) {
            const liveWeapons =
                Object.keys(
                    res.weaponStats
                );

            if (liveWeapons.length) {
                AppState.weaponCatalog =
                    liveWeapons;

                populateWeaponSelect(
                    "weaponSelect",
                    liveWeapons
                );

                populateWeaponSelect(
                    "weapon",
                    liveWeapons
                );

                populateWeaponSelect(
                    "adminWeapon",
                    liveWeapons
                );
            }
        }
    } catch (err) {
        console.warn(
            "Could not load live weapon catalog:",
            err
        );
    }
}


/* ============================================================
   LOGIN
   ============================================================ */

async function handleLogin(event) {
    event.preventDefault();

    const player =
        $("loginPlayer")?.value ||
        $("playerSelect")?.value;

    const password =
        $("loginPassword")?.value ||
        $("password")?.value;

    if (!player || !password) {
        alert(
            "Please enter your player name and password."
        );

        return;
    }

    try {
        setLoading(
            "loginHint",
            "Authenticating..."
        );

        const res =
            await API.login(
                player,
                password
            );

        if (
            !res ||
            res.status !== "success"
        ) {
            throw new Error(
                res?.error ||
                "Login failed."
            );
        }

        AppState.setSession(
            res.player,
            password,
            res.isAdmin
        );

        showWorkspace();

    } catch (err) {
        alert(
            err.message ||
            "Login failed."
        );

        setLoading(
            "loginHint",
            ""
        );
    }
}


/* ============================================================
   CLAIM ACCOUNT
   ============================================================ */

async function handleClaimAccount(
    event
) {
    event.preventDefault();

    const player =
        $("claimAccountPlayer")?.value ||
        $("claimPlayer")?.value;

    const password =
        $("claimAccountPassword")?.value ||
        $("newPassword")?.value;

    if (!player || !password) {
        alert(
            "Please enter a player name and password."
        );

        return;
    }

    if (password.length < 6) {
        alert(
            "Password must be at least 6 characters."
        );

        return;
    }

    try {
        const res =
            await API.claimAccount(
                player,
                password
            );

        if (
            !res ||
            res.status !== "success"
        ) {
            throw new Error(
                res?.error ||
                "Unable to claim account."
            );
        }

        alert(
            "Account claimed successfully. You can now log in."
        );

        event.target.reset();

    } catch (err) {
        alert(
            err.message ||
            "Unable to claim account."
        );
    }
}


/* ============================================================
   LOGOUT
   ============================================================ */

async function handleLogout() {
    try {
        if (
            AppState.isLoggedIn() &&
            API.logout
        ) {
            await API.logout(
                AppState.user,
                AppState.password
            );
        }
    } catch (err) {
        console.warn(
            "Logout request failed:",
            err
        );
    }

    AppState.clearSession();

    showLanding();
}


/* ============================================================
   STOCKPILE
   ============================================================ */

async function loadStockpile() {
    const container =
        $("stockpileList") ||
        $("stockpileContent");

    if (container) {
        container.innerHTML =
            `<div class="loading">Loading stockpile...</div>`;
    }

    try {
        const res =
            await API.getStockpile(
                AppState.user,
                AppState.password
            );

        if (
            !res ||
            res.status !== "success"
        ) {
            throw new Error(
                res?.error ||
                "Unable to load stockpile."
            );
        }

        renderStockpile(res);

    } catch (err) {
        if (container) {
            container.innerHTML =
                `<div class="error">${escapeHtml(err.message)}</div>`;
        }
    }
}

function renderStockpile(res) {
    const container =
        $("stockpileList") ||
        $("stockpileContent");

    if (!container) return;

    const stockpile =
        res.stockpile ||
        res.weapons ||
        {};

    const stats =
        res.weaponStats ||
        {};

    const weaponNames =
        Object.keys(stats).length
            ? Object.keys(stats)
            : Object.keys(stockpile);

    let html = "";

    weaponNames.forEach(
        weapon => {
            const count =
                Number(
                    stockpile[weapon] ||
                    stockpile[weapon]?.count ||
                    0
                );

            const weaponStat =
                stats[weapon] ||
                {};

            html += `
                <div class="weapon-row">
                    <div class="weapon-info">
                        <strong>${escapeHtml(weapon)}</strong>
                        <span>
                            ATK ${formatNumber(
                                weaponStat.attack ||
                                weaponStat.ATK ||
                                0
                            )}
                            ·
                            DEF ${formatNumber(
                                weaponStat.defence ||
                                weaponStat.DEF ||
                                0
                            )}
                        </span>
                    </div>

                    <div class="weapon-count">
                        ${formatNumber(count)}
                    </div>
                </div>
            `;
        }
    );

    container.innerHTML =
        html ||
        `<div class="empty-state">No weapons found.</div>`;

    setText(
        "stockpileTotalUnits",
        formatNumber(
            res.totalUnits || 0
        )
    );

    setText(
        "stockpileTotalAtk",
        formatNumber(
            res.totalAtk || 0
        )
    );

    setText(
        "stockpileTotalDef",
        formatNumber(
            res.totalDef || 0
        )
    );
}

async function handleWeaponUpdate(
    event
) {
    event.preventDefault();

    const weapon =
        $("weaponSelect")?.value ||
        $("weapon")?.value;

    const quantity =
        $("weaponQuantity")?.value ||
        $("quantity")?.value;

    if (!weapon) {
        alert(
            "Please select a weapon."
        );

        return;
    }

    try {
        const res =
            await API.updateWeapon(
                AppState.user,
                AppState.password,
                weapon,
                quantity
            );

        if (
            !res ||
            res.status !== "success"
        ) {
            throw new Error(
                res?.error ||
                "Unable to update weapon."
            );
        }

        alert(
            "Weapon stockpile updated."
        );

        event.target.reset();

        loadStockpile();
        loadDashboard();

    } catch (err) {
        alert(
            err.message ||
            "Unable to update weapon."
        );
    }
}


/* ============================================================
   BANK
   ============================================================ */

async function loadBank() {
    try {
        const res =
            await API.getBank(
                AppState.user,
                AppState.password
            );

        if (
            !res ||
            res.status !== "success"
        ) {
            throw new Error(
                res?.error ||
                "Unable to load bank."
            );
        }

        setText(
            "bankGold",
            formatGold(
                res.goldBalance || 0
            )
        );

        setText(
            "goldBalance",
            formatNumber(
                res.goldBalance || 0
            )
        );

        setText(
            "dashboardGold",
            formatNumber(
                res.goldBalance || 0
            )
        );

    } catch (err) {
        console.error(
            "Bank loading failed:",
            err
        );
    }
}

async function handleTransfer(
    event
) {
    event.preventDefault();

    const toPlayer =
        $("toPlayer")?.value ||
        $("transferTarget")?.value;

    const amount =
        $("transferAmount")?.value ||
        $("amount")?.value;

    if (!toPlayer || !amount) {
        alert(
            "Please enter a recipient and amount."
        );

        return;
    }

    try {
        const res =
            await API.transfer(
                AppState.user,
                AppState.password,
                toPlayer,
                amount
            );

        if (
            !res ||
            res.status !== "success"
        ) {
            throw new Error(
                res?.error ||
                "Transfer failed."
            );
        }

        alert(
            res.message ||
            "Transfer successful."
        );

        event.target.reset();

        loadBank();
        loadHistory();
        loadDashboard();

    } catch (err) {
        alert(
            err.message ||
            "Transfer failed."
        );
    }
}


/* ============================================================
   HISTORY
   ============================================================ */

async function loadHistory() {
    const container =
        $("historyList") ||
        $("historyContent");

    if (container) {
        container.innerHTML =
            `<div class="loading">Loading history...</div>`;
    }

    try {
        const res =
            await API.getTransactions(
                AppState.user,
                AppState.password
            );

        if (
            !res ||
            res.status !== "success"
        ) {
            throw new Error(
                res?.error ||
                "Unable to load history."
            );
        }

        const transactions =
            res.transactions ||
            [];

        if (!container) return;

        if (!transactions.length) {
            container.innerHTML =
                `<div class="empty-state">No transactions yet.</div>`;

            return;
        }

        container.innerHTML =
            transactions
                .map(tx => `
                    <div class="history-row">
                        <div>
                            <strong>
                                ${escapeHtml(
                                    tx["Type"] ||
                                    "Transaction"
                                )}
                            </strong>

                            <span>
                                ${escapeHtml(
                                    tx["Notes"] ||
                                    ""
                                )}
                            </span>
                        </div>

                        <div>
                            <strong>
                                ${formatNumber(
                                    tx["Amount"] || 0
                                )}
                            </strong>

                            <span>
                                ${escapeHtml(
                                    formatDate(
                                        tx["Timestamp"]
                                    )
                                )}
                            </span>
                        </div>

                        <div>
                            Balance:
                            ${formatNumber(
                                tx["Balance After"] || 0
                            )}
                        </div>
                    </div>
                `)
                .join("");

    } catch (err) {
        if (container) {
            container.innerHTML =
                `<div class="error">${escapeHtml(err.message)}</div>`;
        }
    }
}


/* ============================================================
   CLAIM SUBMISSION
   ============================================================ */

async function handleClaimSubmission(
    event
) {
    event.preventDefault();

    const type =
        $("claimType")?.value;

    const amount =
        $("claimAmount")?.value;

    const notes =
        $("claimNotes")?.value || "";

    if (!type) {
        alert(
            "Please select a claim type."
        );

        return;
    }

    try {
        let res;

        if (
            type.toLowerCase() ===
            "troops"
        ) {
            res =
                await API.submitTroopClaim(
                    AppState.user,
                    AppState.password,
                    amount,
                    notes
                );

        } else if (
            type.toLowerCase() ===
            "regional"
        ) {
            res =
                await API.submitRegionalClaim(
                    AppState.user,
                    AppState.password,
                    amount,
                    notes
                );

        } else if (
            type.toLowerCase() ===
            "borderday"
        ) {
            res =
                await API.submitBorderClaim(
                    AppState.user,
                    AppState.password,
                    amount,
                    notes
                );

        } else {
            res =
                await API.submitClaim(
                    AppState.user,
                    AppState.password,
                    type,
                    amount,
                    notes
                );
        }

        if (
            !res ||
            res.status !== "success"
        ) {
            throw new Error(
                res?.error ||
                "Unable to submit claim."
            );
        }

        alert(
            res.message ||
            "Claim submitted successfully!"
        );

        event.target.reset();

        loadMyClaims();

    } catch (err) {
        alert(
            err.message ||
            "Unable to submit claim."
        );
    }
}


/* ============================================================
   CLAIMS PANE
   ============================================================ */

async function handleClaimsPaneSubmission(
    event
) {
    event.preventDefault();

    const type =
        $("claimTypeSelect")?.value;

    const troops =
        $("troopsLostInput")?.value;

    const notes =
        $("claimNotesInput")?.value ||
        "";

    if (!type) {
        alert(
            "Please select a claim type."
        );

        return;
    }

    try {
        let res;

        if (
            type.toLowerCase() ===
            "troops"
        ) {
            if (
                Number(troops) < 0
            ) {
                throw new Error(
                    "Troops lost cannot be negative."
                );
            }

            res =
                await API.submitTroopClaim(
                    AppState.user,
                    AppState.password,
                    troops,
                    notes
                );

        } else if (
            type.toLowerCase() ===
            "regional"
        ) {
            res =
                await API.submitRegionalClaim(
                    AppState.user,
                    AppState.password,
                    troops,
                    notes
                );

        } else if (
            type.toLowerCase() ===
            "borderday"
        ) {
            res =
                await API.submitBorderClaim(
                    AppState.user,
                    AppState.password,
                    troops,
                    notes
                );

        } else {
            res =
                await API.submitClaim(
                    AppState.user,
                    AppState.password,
                    type,
                    troops,
                    notes
                );
        }

        if (
            !res ||
            res.status !== "success"
        ) {
            throw new Error(
                res?.error ||
                "Unable to submit claim."
            );
        }

        alert(
            "Claim submitted successfully!"
        );

        event.target.reset();

        loadMyClaims();

    } catch (err) {
        alert(
            err.message ||
            "Unable to submit claim."
        );
    }
}

async function loadMyClaims() {
    const container =
        $("myClaimsList") ||
        $("claimsList");

    if (container) {
        container.innerHTML =
            `<div class="loading">Loading claims...</div>`;
    }

    try {
        const res =
            await API.getMyClaims(
                AppState.user,
                AppState.password
            );

        if (
            !res ||
            res.status !== "success"
        ) {
            throw new Error(
                res?.error ||
                "Unable to load claims."
            );
        }

        const claims =
            res.claims || [];

        if (!container) return;

        if (!claims.length) {
            container.innerHTML =
                `<div class="empty-state">No claims submitted.</div>`;

            setText(
                "pendingClaimsCount",
                "0"
            );

            return;
        }

        const pending =
            claims.filter(
                claim =>
                    String(
                        claim["Status"] ||
                        "PENDING"
                    ).toUpperCase() ===
                    "PENDING"
            ).length;

        setText(
            "pendingClaimsCount",
            formatNumber(pending)
        );

        container.innerHTML =
            claims
                .map(claim => {
                    const status =
                        String(
                            claim["Status"] ||
                            "PENDING"
                        ).toUpperCase();

                    const troops =
                        claim["Troops"] ||
                        claim["Troops Lost"] ||
                        0;

                    const medals =
                        claim["Medals"] ||
                        claim["Regional Medals"] ||
                        0;

                    const borderDays =
                        claim["Border Days"] ||
                        claim["Days"] ||
                        0;

                    return `
                        <div class="claim-card">
                            <div class="claim-card-header">
                                <strong>
                                    ${escapeHtml(
                                        claim["Type"] ||
                                        "CLAIM"
                                    )}
                                </strong>

                                <span class="status ${status.toLowerCase()}">
                                    ${escapeHtml(status)}
                                </span>
                            </div>

                            <div class="claim-meta">
                                <span>
                                    ID:
                                    ${escapeHtml(
                                        claim["Claim ID"] ||
                                        "—"
                                    )}
                                </span>

                                <span>
                                    ${escapeHtml(
                                        formatDate(
                                            claim["Date"]
                                        )
                                    )}
                                </span>
                            </div>

                            <div class="claim-values">
                                ${
                                    Number(troops) > 0
                                        ? `<span>Troops: ${formatNumber(troops)}</span>`
                                        : ""
                                }

                                ${
                                    Number(medals) > 0
                                        ? `<span>Medals: ${formatNumber(medals)}</span>`
                                        : ""
                                }

                                ${
                                    Number(borderDays) > 0
                                        ? `<span>Border Days: ${formatNumber(borderDays)}</span>`
                                        : ""
                                }

                                <span>
                                    Gold:
                                    ${formatNumber(
                                        claim["Gold"] || 0
                                    )}
                                </span>
                            </div>

                            ${
                                claim["Notes"]
                                    ? `
                                        <div class="claim-notes">
                                            ${escapeHtml(
                                                claim["Notes"]
                                            )}
                                        </div>
                                    `
                                    : ""
                            }
                        </div>
                    `;
                })
                .join("");

    } catch (err) {
        if (container) {
            container.innerHTML =
                `<div class="error">${escapeHtml(err.message)}</div>`;
        }
    }
}


/* ============================================================
   DASHBOARD
   ============================================================ */

async function loadDashboard() {
    if (!AppState.isLoggedIn()) {
        return;
    }

    try {
        const [
            bankRes,
            stockRes,
            claimsRes,
            transactionsRes
        ] = await Promise.all([
            API.getBank(
                AppState.user,
                AppState.password
            ),

            API.getStockpile(
                AppState.user,
                AppState.password
            ),

            API.getMyClaims(
                AppState.user,
                AppState.password
            ),

            API.getTransactions(
                AppState.user,
                AppState.password
            )
        ]);

        if (
            bankRes &&
            bankRes.status ===
                "success"
        ) {
            setText(
                "dashboardGold",
                formatNumber(
                    bankRes.goldBalance || 0
                )
            );

            setText(
                "bankGold",
                formatGold(
                    bankRes.goldBalance || 0
                )
            );
        }

        if (
            stockRes &&
            stockRes.status ===
                "success"
        ) {
            setText(
                "dashboardUnits",
                formatNumber(
                    stockRes.totalUnits || 0
                )
            );

            setText(
                "dashboardAtk",
                formatNumber(
                    stockRes.totalAtk || 0
                )
            );

            setText(
                "dashboardDef",
                formatNumber(
                    stockRes.totalDef || 0
                )
            );

            setText(
                "dashboardTotalUnits",
                formatNumber(
                    stockRes.totalUnits || 0
                )
            );
        }

        if (
            claimsRes &&
            claimsRes.status ===
                "success"
        ) {
            const claims =
                claimsRes.claims || [];

            const pending =
                claims.filter(
                    claim =>
                        String(
                            claim["Status"] ||
                            "PENDING"
                        ).toUpperCase() ===
                        "PENDING"
                );

            setText(
                "dashboardPendingClaims",
                formatNumber(
                    pending.length
                )
            );

            setText(
                "pendingClaimsCount",
                formatNumber(
                    pending.length
                )
            );
        }

        if (
            transactionsRes &&
            transactionsRes.status ===
                "success"
        ) {
            renderDashboardTransactions(
                transactionsRes.transactions ||
                []
            );
        }

    } catch (err) {
        console.warn(
            "Dashboard loading issue:",
            err
        );
    }

    setText(
        "dashboardUser",
        AppState.user
    );

    setText(
        "dashboardRole",
        AppState.isAdmin
            ? "ADMIN"
            : "MEMBER"
    );
}

function renderDashboardTransactions(
    transactions
) {
    const container =
        $("dashboardRecentActivity");

    if (!container) return;

    if (!transactions.length) {
        container.innerHTML =
            `<div class="empty-state">No treasury activity yet.</div>`;

        return;
    }

    container.innerHTML =
        transactions
            .slice(0, 5)
            .map(tx => `
                <div class="activity-row">
                    <div>
                        <strong>
                            ${escapeHtml(
                                tx["Type"] ||
                                "Transaction"
                            )}
                        </strong>

                        <span>
                            ${escapeHtml(
                                tx["Notes"] ||
                                ""
                            )}
                        </span>
                    </div>

                    <strong>
                        ${formatNumber(
                            tx["Amount"] || 0
                        )}
                    </strong>
                </div>
            `)
            .join("");
}


/* ============================================================
   ADMIN
   ============================================================ */

async function loadAdminData() {
    if (!AppState.isAdmin) {
        return;
    }

    const container =
        $("pendingClaimsList");

    if (container) {
        container.innerHTML =
            `<div class="loading">Loading pending claims...</div>`;
    }

    try {
        const res =
            await API.adminOverview(
                AppState.user,
                AppState.password
            );

        if (
            !res ||
            res.status !== "success"
        ) {
            throw new Error(
                res?.error ||
                "Unable to load admin data."
            );
        }

        renderAdminOverview(res);
        renderPendingClaims(
            res.pendingClaims || []
        );
        renderClaimHistory(
            res.claimHistory || []
        );
        renderAdminLogs(
            res.recentLogs || []
        );
        renderAdminMembers(
            res.accounts || []
        );

    } catch (err) {
        console.error(
            "Admin loading failed:",
            err
        );

        if (container) {
            container.innerHTML =
                `<div class="error">${escapeHtml(err.message)}</div>`;
        }
    }
}

function renderAdminOverview(
    data
) {
    setText(
        "adminTotalMembers",
        formatNumber(
            data.totalMembers || 0
        )
    );

    setText(
        "adminPendingClaims",
        formatNumber(
            data.pendingClaimsCount || 0
        )
    );

    setText(
        "adminTotalGold",
        formatNumber(
            data.totalGold || 0
        )
    );

    setText(
        "adminTotalUnits",
        formatNumber(
            data.totalUnits || 0
        )
    );

    setText(
        "adminTotalAtk",
        formatNumber(
            data.totalAtk || 0
        )
    );

    setText(
        "adminTotalDef",
        formatNumber(
            data.totalDef || 0
        )
    );
}

function renderPendingClaims(
    claims
) {
    const container =
        $("pendingClaimsList");

    if (!container) return;

    if (!claims.length) {
        container.innerHTML =
            `<div class="empty-state">No pending claims.</div>`;

        return;
    }

    container.innerHTML =
        claims
            .map(claim => {
                const id =
                    String(
                        claim["Claim ID"] ||
                        ""
                    );

                return `
                    <div class="admin-claim-card">
                        <div class="admin-claim-header">
                            <div>
                                <strong>
                                    ${escapeHtml(
                                        claim["Type"] ||
                                        "CLAIM"
                                    )}
                                </strong>

                                <span>
                                    ${escapeHtml(
                                        claim["Player"] ||
                                        "Unknown"
                                    )}
                                </span>
                            </div>

                            <span class="status pending">
                                PENDING
                            </span>
                        </div>

                        <div class="admin-claim-details">
                            <div>
                                <small>CLAIM ID</small>
                                <strong>
                                    ${escapeHtml(id)}
                                </strong>
                            </div>

                            <div>
                                <small>DATE</small>
                                <strong>
                                    ${escapeHtml(
                                        formatDate(
                                            claim["Date"]
                                        )
                                    )}
                                </strong>
                            </div>

                            <div>
                                <small>TROOPS</small>
                                <strong>
                                    ${formatNumber(
                                        claim["Troops"] ||
                                        claim["Troops Lost"] ||
                                        0
                                    )}
                                </strong>
                            </div>

                            <div>
                                <small>MEDALS</small>
                                <strong>
                                    ${formatNumber(
                                        claim["Medals"] ||
                                        claim["Regional Medals"] ||
                                        0
                                    )}
                                </strong>
                            </div>

                            <div>
                                <small>BORDER DAYS</small>
                                <strong>
                                    ${formatNumber(
                                        claim["Border Days"] ||
                                        claim["Days"] ||
                                        0
                                    )}
                                </strong>
                            </div>

                            <div>
                                <small>GOLD</small>
                                <strong>
                                    ${formatNumber(
                                        claim["Gold"] ||
                                        0
                                    )}
                                </strong>
                            </div>
                        </div>

                        ${
                            claim["Notes"]
                                ? `
                                    <div class="admin-claim-notes">
                                        ${escapeHtml(
                                            claim["Notes"]
                                        )}
                                    </div>
                                `
                                : ""
                        }

                        <div class="admin-claim-actions">
                            <button
                                class="btn btn-primary"
                                onclick="handleClaimAction('${escapeJs(id)}', 'APPROVE')"
                            >
                                APPROVE
                            </button>

                            <button
                                class="btn btn-danger"
                                onclick="handleClaimAction('${escapeJs(id)}', 'REJECT')"
                            >
                                REJECT
                            </button>
                        </div>
                    </div>
                `;
            })
            .join("");
}

function escapeJs(value) {
    return String(
        value || ""
    )
        .replace(/\\/g, "\\\\")
        .replace(/'/g, "\\'")
        .replace(/"/g, '\\"')
        .replace(/\n/g, "\\n")
        .replace(/\r/g, "\\r");
}

async function handleClaimAction(
    claimId,
    action
) {
    if (!claimId) {
        return;
    }

    const confirmation =
        action === "APPROVE"
            ? `Approve claim ${claimId}?`
            : `Reject claim ${claimId}?`;

    if (!confirm(confirmation)) {
        return;
    }

    try {
        const res =
            await API.adminClaimAction(
                AppState.user,
                AppState.password,
                claimId,
                action
            );

        if (
            !res ||
            res.status !== "success"
        ) {
            throw new Error(
                res?.error ||
                `Unable to ${action.toLowerCase()} claim.`
            );
        }

        alert(
            res.message ||
            `Claim ${action.toLowerCase()}d successfully.`
        );

        await loadAdminData();

        loadDashboard();
        loadBank();

    } catch (err) {
        alert(
            err.message ||
            `Unable to ${action.toLowerCase()} claim.`
        );
    }
}


/* ============================================================
   ADMIN MEMBER DIRECTORY
   ============================================================ */

function renderAdminMembers(
    accounts
) {
    const container =
        $("adminMembersList") ||
        $("memberDirectory");

    if (!container) return;

    if (!accounts.length) {
        container.innerHTML =
            `<div class="empty-state">No members found.</div>`;

        return;
    }

    container.innerHTML =
        accounts
            .map(account => `
                <div
                    class="member-row"
                    onclick="showAdminMember('${escapeJs(account.player)}')"
                >
                    <div>
                        <strong>
                            ${escapeHtml(
                                account.player
                            )}
                        </strong>

                        <span>
                            ${
                                account.admin
                                    ? "ADMIN"
                                    : "MEMBER"
                            }

                            ${
                                account.disabled
                                    ? " · DISABLED"
                                    : ""
                            }
                        </span>
                    </div>

                    <div>
                        <strong>
                            ${formatNumber(
                                account.gold
                            )}
                        </strong>

                        <span>
                            ${formatNumber(
                                account.totalUnits
                            )} units
                        </span>
                    </div>
                </div>
            `)
            .join("");

    window.__EA_ADMIN_ACCOUNTS =
        accounts;
}

function showAdminMember(
    player
) {
    const accounts =
        window.__EA_ADMIN_ACCOUNTS ||
        [];

    const account =
        accounts.find(
            item =>
                String(
                    item.player
                ).toLowerCase() ===
                String(
                    player
                ).toLowerCase()
        );

    if (!account) {
        return;
    }

    const panel =
        $("adminMemberDetails");

    if (!panel) {
        return;
    }

    panel.innerHTML = `
        <div class="member-detail-header">
            <h3>
                ${escapeHtml(
                    account.player
                )}
            </h3>

            <span>
                ${
                    account.admin
                        ? "ADMIN"
                        : "MEMBER"
                }
            </span>
        </div>

        <div class="member-detail-grid">
            <div>
                <small>GOLD</small>
                <strong>
                    ${formatNumber(
                        account.gold
                    )}
                </strong>
            </div>

            <div>
                <small>UNITS</small>
                <strong>
                    ${formatNumber(
                        account.totalUnits
                    )}
                </strong>
            </div>

            <div>
                <small>ATK</small>
                <strong>
                    ${formatNumber(
                        account.totalAtk
                    )}
                </strong>
            </div>

            <div>
                <small>DEF</small>
                <strong>
                    ${formatNumber(
                        account.totalDef
                    )}
                </strong>
            </div>

            <div>
                <small>BORDER DAYS</small>
                <strong>
                    ${formatNumber(
                        account.borderDays
                    )}
                </strong>
            </div>

            <div>
                <small>STATUS</small>
                <strong>
                    ${
                        account.disabled
                            ? "DISABLED"
                            : "ACTIVE"
                    }
                </strong>
            </div>
        </div>

        <div class="member-stockpile">
            <h4>Stockpile</h4>

            ${
                Object.keys(
                    account.stockpile ||
                    {}
                ).length
                    ? Object.entries(
                        account.stockpile
                    )
                        .map(
                            ([weapon, count]) => `
                                <div class="stockpile-mini-row">
                                    <span>
                                        ${escapeHtml(
                                            weapon
                                        )}
                                    </span>

                                    <strong>
                                        ${formatNumber(
                                            count
                                        )}
                                    </strong>
                                </div>
                            `
                        )
                        .join("")
                    : `<div class="empty-state">No weapons held.</div>`
            }
        </div>
    `;

    loadAdminPlayerLedger(
        account.player
    );
}

async function loadAdminPlayerLedger(
    player
) {
    const container =
        $("adminPlayerLedger");

    if (!container) return;

    container.innerHTML =
        `<div class="loading">Loading ledger...</div>`;

    try {
        const res =
            await API.getTransactions(
                AppState.user,
                AppState.password,
                player
            );

        if (
            !res ||
            res.status !== "success"
        ) {
            throw new Error(
                res?.error ||
                "Unable to load ledger."
            );
        }

        const transactions =
            res.transactions ||
            [];

        if (!transactions.length) {
            container.innerHTML =
                `<div class="empty-state">No ledger entries.</div>`;

            return;
        }

        container.innerHTML =
            transactions
                .slice(0, 15)
                .map(tx => `
                    <div class="history-row">
                        <div>
                            <strong>
                                ${escapeHtml(
                                    tx["Type"] ||
                                    "Transaction"
                                )}
                            </strong>

                            <span>
                                ${escapeHtml(
                                    tx["Notes"] ||
                                    ""
                                )}
                            </span>
                        </div>

                        <div>
                            ${formatNumber(
                                tx["Amount"] ||
                                0
                            )}
                        </div>

                        <div>
                            ${formatNumber(
                                tx["Balance After"] ||
                                0
                            )}
                        </div>
                    </div>
                `)
                .join("");

    } catch (err) {
        container.innerHTML =
            `<div class="error">${escapeHtml(err.message)}</div>`;
    }
}


/* ============================================================
   ADMIN CLAIM HISTORY
   ============================================================ */

function renderClaimHistory(
    claims
) {
    const container =
        $("claimHistoryList");

    if (!container) return;

    if (!claims.length) {
        container.innerHTML =
            `<div class="empty-state">No processed claims yet.</div>`;

        return;
    }

    container.innerHTML =
        claims
            .slice(0, 50)
            .map(claim => `
                <div class="history-row">
                    <div>
                        <strong>
                            ${escapeHtml(
                                claim["Claim ID"] ||
                                "CLAIM"
                            )}
                        </strong>

                        <span>
                            ${escapeHtml(
                                claim["Player"] ||
                                ""
                            )}
                        </span>
                    </div>

                    <div>
                        ${escapeHtml(
                            claim["Status"] ||
                            ""
                        )}
                    </div>

                    <div>
                        ${formatNumber(
                            claim["Gold"] ||
                            0
                        )}
                    </div>
                </div>
            `)
            .join("");
}


/* ============================================================
   ADMIN AUDIT LOG
   ============================================================ */

function renderAdminLogs(
    logs
) {
    const container =
        $("adminLogsList") ||
        $("adminAuditList");

    if (!container) return;

    if (!logs.length) {
        container.innerHTML =
            `<div class="empty-state">No admin actions recorded.</div>`;

        return;
    }

    container.innerHTML =
        logs
            .map(log => `
                <div class="history-row">
                    <div>
                        <strong>
                            ${escapeHtml(
                                log["Action"] ||
                                ""
                            )}
                        </strong>

                        <span>
                            ${escapeHtml(
                                log["Admin"] ||
                                ""
                            )}
                        </span>
                    </div>

                    <div>
                        ${escapeHtml(
                            log["Target"] ||
                            ""
                        )}
                    </div>

                    <div>
                        ${escapeHtml(
                            formatDate(
                                log["Timestamp"]
                            )
                        )}
                    </div>
                </div>
            `)
            .join("");
}


/* ============================================================
   ADMIN BALANCE OVERRIDE
   ============================================================ */

async function handleOverride(
    event
) {
    event.preventDefault();

    const target =
        $("overrideTargetUser")?.value;

    const amount =
        $("overrideAmount")?.value;

    const notes =
        $("overrideNotes")?.value ||
        "";

    if (!target) {
        alert(
            "Please select a player."
        );

        return;
    }

    if (
        amount === "" ||
        amount === null ||
        amount === undefined
    ) {
        alert(
            "Please enter an amount."
        );

        return;
    }

    try {
        const res =
            await API.adminAdjustBalance(
                AppState.user,
                AppState.password,
                target,
                amount,
                notes
            );

        if (
            !res ||
            res.status !== "success"
        ) {
            throw new Error(
                res?.error ||
                "Unable to adjust balance."
            );
        }

        alert(
            res.message ||
            "Balance adjusted successfully."
        );

        event.target.reset();

        loadAdminData();

    } catch (err) {
        alert(
            err.message ||
            "Unable to adjust balance."
        );
    }
}


/* ============================================================
   ADMIN DISABLE / ENABLE
   ============================================================ */

async function handleDisableEnable(
    action
) {
    const target =
        $("adminTargetUser")?.value;

    if (!target) {
        alert(
            "Please select a player."
        );

        return;
    }

    const disable =
        action === "disable";

    if (
        !confirm(
            `${disable ? "Disable" : "Enable"} account for ${target}?`
        )
    ) {
        return;
    }

    try {
        const res =
            await API.adminSetDisabled(
                AppState.user,
                AppState.password,
                target,
                disable
            );

        if (
            !res ||
            res.status !== "success"
        ) {
            throw new Error(
                res?.error ||
                "Unable to change account status."
            );
        }

        alert(
            res.message ||
            "Account status updated."
        );

        loadAdminData();

    } catch (err) {
        alert(
            err.message ||
            "Unable to change account status."
        );
    }
}


/* ============================================================
   MOBILE
   ============================================================ */

function checkMobile() {
    document.body.classList.toggle(
        "mobile",
        window.innerWidth <= 768
    );
}

window.addEventListener(
    "resize",
    checkMobile
);


/* ============================================================
   LOADING HELPERS
   ============================================================ */

function setLoading(
    id,
    message
) {
    const el = $(id);

    if (!el) return;

    el.textContent =
        message || "";
}


/* ============================================================
   GLOBAL FUNCTIONS
   ============================================================ */

window.switchPane =
    switchPane;

window.handleClaimAction =
    handleClaimAction;

window.handleDisableEnable =
    handleDisableEnable;

window.showAdminMember =
    showAdminMember;
