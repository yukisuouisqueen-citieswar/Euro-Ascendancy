const MACRO_URL = "https://script.google.com/macros/s/AKfycbygKMX4OTu6VJPSgkdyOs_5_ktmTZ3jNrxKeW_1uxpqk6ycmsthtPsExnxUNtIEBVrJ/exec";

let activeSessionUser = "";
let currentCachedWeapons = {}; // Client-side cache memory for updates

// --- ENGINE MODULE A: AUTHENTICATION LOGIN ROUTINE ---
document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const btn = document.getElementById('loginBtn');
    const user = document.getElementById('loginUser').value;
    const pass = document.getElementById('loginPass').value;

    btn.disabled = true;
    btn.innerText = "AUTHENTICATING...";

    fetch(MACRO_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: "login", player: user, password: pass })
    })
    .then(res => res.json())
    .then(data => {
        if (data.status === "success") {
            activeSessionUser = user;
            currentCachedWeapons = data.weapons || {}; // Cache current stock numbers
            
            document.getElementById('loginPass').value = "";
            document.getElementById('loginWrapper').style.display = "none";
            document.getElementById('appWorkspace').style.display = "block";
            document.getElementById('workspaceTitle').innerText = `OPERATIVE: ${user.toUpperCase()}`;

            // Check security permissions for Administrative Desk
            if (user === "Yuki Suou" || user === "Icyz" || user === "kalikaka") {
                document.getElementById('adminTabBtn').style.display = "block";
            } else {
                document.getElementById('adminTabBtn').style.display = "none";
            }

            // Render inventory grid and banking log layout views
            renderWeaponsGrid(currentCachedWeapons);
            renderLedgerBox(data.bankHistory);
            switchToTab('weaponsPane'); 
        } else {
            alert("Security Denied: " + data.message);
        }
    })
    .catch(err => alert("Connection failure verifying login path: " + err))
    .finally(() => {
        btn.disabled = false;
        btn.innerText = "ACCESS DATABASE";
    });
});

// --- ENGINE MODULE B: INSTANT BACKGROUND WEAPONS DISPATCH ---
document.getElementById('trackerForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const weapon = document.getElementById('weaponSelect').value;
    const qty = document.getElementById('quantityInput').value;

    const payload = {
        action: "weapon",
        player: activeSessionUser,
        weapon: weapon,
        quantity: qty
    };

    // MULTI-THREADED OPTIMISTIC UPDATE: Alter local UI stock display instantly
    currentCachedWeapons[weapon] = qty;
    renderWeaponsGrid(currentCachedWeapons);

    alert(`Arsenal logs dispatched! Updating your ${weapon} stockpile to ${qty}...`);
    
    document.getElementById('weaponSelect').value = "";
    document.getElementById('quantityInput').value = "";

    fetch(MACRO_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    }).catch(err => console.error("Background sync weapon exception: ", err));
});

// --- ENGINE MODULE C: FINANCE DESK LOG ENTRIES SUBMISSION ---
document.getElementById('adminBankForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const target = document.getElementById('adminTargetPlayer').value;
    const type = document.getElementById('adminTransType').value;
    const amt = document.getElementById('adminAmount').value;
    const notes = document.getElementById('adminNotes').value;

    const payload = {
        action: "bankTransaction",
        player: target,
        transactionType: type,
        amount: amt,
        notes: notes,
        borderDays: document.getElementById('mBorderDays').value,
        borderMedals: document.getElementById('mBorderMedals').value,
        regionalPoints: document.getElementById('mRegPoints').value,
        regionalMedals: document.getElementById('mRegMedals').value,
        disruptionMedals: document.getElementById('mDisMedals').value,
        totalDonated: document.getElementById('mTotalDonated').value
    };

    alert(`Financial settlement transmitted for player ${target}! Posting to background ledger...`);
    document.getElementById('adminBankForm').reset();

    fetch(MACRO_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    }).catch(err => console.error("Background admin bank log issue: ", err));
});

// UI RENDERING & TAB CHANGING ENGINE LOGIC
function switchToTab(paneId) {
    document.querySelectorAll('.app-pane').forEach(p => p.style.display = "none");
    document.getElementById(paneId).style.display = "block";
    
    // Switch navigation button accents cleanly
    document.querySelectorAll('.nav-toggle-btn').forEach(b => {
        b.style.borderColor = "transparent";
        b.style.color = "#A8A8B3";
    });
    
    if(paneId === 'weaponsPane') {
        document.getElementById('btnWeapons').style.borderColor = "var(--crimson)";
        document.getElementById('btnWeapons').style.color = "white";
    } else if(paneId === 'ledgerPane') {
        document.getElementById('btnLedger').style.borderColor = "var(--crimson)";
        document.getElementById('btnLedger').style.color = "white";
    } else if(paneId === 'adminPane') {
        document.getElementById('adminTabBtn').style.borderColor = "var(--crimson)";
        document.getElementById('adminTabBtn').style.color = "white";
    }
}

function renderWeaponsGrid(weaponsObj) {
    const grid = document.getElementById('liveWeaponsGrid');
    if (!weaponsObj || Object.keys(weaponsObj).length === 0) {
        grid.innerHTML = `<p style="color: #A8A8B3; grid-column: span 2; text-align: center;">No assets stored on file.</p>`;
        return;
    }

    let html = "";
    Object.keys(weaponsObj).sort().forEach(wKey => {
        const value = weaponsObj[wKey] !== "" ? Number(weaponsObj[wKey]).toLocaleString() : "0";
        html += `<div style="display:flex; justify-content:space-between; padding:4px 8px; background:rgba(0,0,0,0.2); border-radius:2px;">
            <span style="color: var(--cream); font-weight:500;">${wKey}:</span>
            <span style="font-weight:bold; color:white;">${value}</span>
        </div>`;
    });
    grid.innerHTML = html;
}

function renderLedgerBox(historyArray) {
    const box = document.getElementById('historyLogBox');
    if (!historyArray || historyArray.length === 0) {
        box.innerHTML = `<p style="color: #A8A8B3; text-align: center; margin-top:20px;">No financial transactions mapped to this security key.</p>`;
        return;
    }

    let html = `<table style="width:100%; border-collapse: collapse; color: white;">
        <tr style="border-bottom: 1px solid var(--crimson); font-size:0.75rem; color: var(--cream);">
            <th style="text-align:left; padding:8px 4px;">DATE</th>
            <th style="text-align:left; padding:8px 4px;">TYPE</th>
            <th style="text-align:right; padding:8px 4px;">GOLD</th>
            <th style="text-align:left; padding:8px 4px; padding-left:10px;">NOTES</th>
        </tr>`;

    historyArray.forEach(item => {
        const color = Number(item.amount) >= 0 ? "#4CAF50" : "#F44336";
        const prefix = Number(item.amount) >= 0 ? "+" : "";
        html += `<tr style="border-bottom: 1px solid rgba(255,255,255,0.05); font-size: 0.8rem;">
            <td style="padding:8px 4px; color:#A8A8B3;">${item.date}</td>
            <td style="padding:8px 4px; font-weight:bold;">${item.type}</td>
            <td style="padding:8px 4px; text-align:right; color:${color}; font-weight:bold;">${prefix}${Number(item.amount).toLocaleString()}</td>
            <td style="padding:8px 4px; color:#E1E1E6; padding-left:10px;">${item.notes}</td>
        </tr>`;
    });

    html += `</table>`;
    box.innerHTML = html;
}

function logout() {
    activeSessionUser = "";
    currentCachedWeapons = {};
    document.getElementById('appWorkspace').style.display = "none";
    document.getElementById('loginWrapper').style.display = "block";
    document.getElementById('loginForm').reset();
}
