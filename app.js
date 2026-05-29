// Paste your newest Google Web App URL right here:
const MACRO_URL = "https://script.google.com/macros/s/AKfycbx6ZEgVTalnu42f8RlUEoMHnISu-1otpDCgHT2NgpilUyEdTWv0gQ6B9hbumXwaovqL/exec";

let activeSessionUser = "";
let currentCachedWeapons = {};

// --- ENGINE MODULE A: AUTHENTICATION LOGIN ROUTINE (BULLETPROOF JSONP) ---
document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    e.stopPropagation();

    const btn = document.getElementById('loginBtn');
    const user = document.getElementById('loginUser').value;
    const pass = document.getElementById('loginPass').value;

    btn.disabled = true;
    btn.innerText = "AUTHENTICATING...";

    const callbackName = 'jsonp_handler_' + Math.round(100000 * Math.random());
    
    window[callbackName] = function(data) {
        delete window[callbackName];
        document.body.removeChild(scriptTag);
        
        btn.disabled = false;
        btn.innerText = "ACCESS DATABASE";

        if (data.status === "success") {
            activeSessionUser = user;
            currentCachedWeapons = data.weapons || {}; 
            
            document.getElementById('loginPass').value = "";
            document.getElementById('loginWrapper').style.display = "none";
            document.getElementById('appWorkspace').style.display = "block";
            
            // Displays name cleanly without the word Operative
            document.getElementById('workspaceTitle').innerText = `${user.toUpperCase()}`;

            // Admin Gate Check
            if (user === "Yuki Suou" || user === "Icyz" || user === "kalikaka") {
                document.getElementById('adminTabBtn').style.display = "block";
            } else {
                document.getElementById('adminTabBtn').style.display = "none";
            }

            renderWeaponsGrid(currentCachedWeapons);
            renderLedgerBox(data.bankHistory);
            switchToTab('weaponsPane'); 
        } else {
            alert("Security Denied: " + data.message);
        }
    };

    const jsonpUrl = `${MACRO_URL}?callback=${callbackName}&action=login&player=${encodeURIComponent(user)}&password=${encodeURIComponent(pass)}`;
    
    const scriptTag = document.createElement('script');
    scriptTag.src = jsonpUrl;
    scriptTag.onerror = function() {
        alert("The portal network path timed out. Re-verify your Macro URL link deployment.");
        btn.disabled = false;
        btn.innerText = "ACCESS DATABASE";
        if (window[callbackName]) delete window[callbackName];
        if (scriptTag.parentNode) document.body.removeChild(scriptTag);
    };
    
    document.body.appendChild(scriptTag);
});

// --- ENGINE MODULE B: BACKGROUND WEAPONS DISPATCH ---
document.getElementById('trackerForm').addEventListener('submit', function(e) {
    e.preventDefault();
    e.stopPropagation();
    
    const weapon = document.getElementById('weaponSelect').value;
    const qty = document.getElementById('quantityInput').value;

    currentCachedWeapons[weapon] = qty;
    renderWeaponsGrid(currentCachedWeapons);

    alert(`Arsenal logs dispatched! Updating your ${weapon} stockpile to ${qty}...`);
    
    document.getElementById('weaponSelect').value = "";
    document.getElementById('quantityInput').value = "";

    const submitUrl = `${MACRO_URL}?action=weapon&player=${encodeURIComponent(activeSessionUser)}&weapon=${encodeURIComponent(weapon)}&quantity=${encodeURIComponent(qty)}`;

    fetch(submitUrl, { method: 'GET', mode: 'no-cors' })
    .catch(err => console.error("Background sync exception: ", err));
});

// --- ENGINE MODULE C: ADMINISTRATIVE REWARDS & AUTOMATED BANKING ---
document.getElementById('adminBankForm').addEventListener('submit', function(e) {
    e.preventDefault();
    e.stopPropagation();

    const btn = document.getElementById('adminBankBtn');
    const targetPlayer = document.getElementById('adminTargetUser').value;
    const transType = document.getElementById('adminTransactionType').value;
    const inputAmount = Number(document.getElementById('adminGoldAmount').value);
    const notes = document.getElementById('adminLogNotes').value;

    btn.disabled = true;
    btn.innerText = "CALCULATING & RECORDING...";

    // --- AUTOMATED IN-GAME MATH SYSTEM ---
    let finalGoldPayout = 0;
    let calculationLog = "";

    if (transType === "Regional Points") {
        finalGoldPayout = inputAmount * 300;
        calculationLog = `[Auto-Math: ${inputAmount} points x 300] `;
    } 
    else if (transType === "Border Day") {
        finalGoldPayout = inputAmount * 10000;
        calculationLog = `[Auto-Math: ${inputAmount} days x 10k] `;
    }
    else if (transType === "Border Defense" || transType === "Regional Defense") {
        finalGoldPayout = (inputAmount / 10) * 10000;
        calculationLog = `[Auto-Math: ${inputAmount} medals / 10 x 10k] `;
    }
    else if (transType === "Disruption Medals") {
        finalGoldPayout = (inputAmount / 10) * 12000;
        calculationLog = `[Auto-Math: ${inputAmount} medals / 10 x 12k] `;
    }
    else {
        finalGoldPayout = inputAmount;
    }

    const finalNotes = calculationLog + notes;
    const callbackName = 'bank_jsonp_' + Math.round(100000 * Math.random());
    
    window[callbackName] = function(data) {
        delete window[callbackName];
        document.body.removeChild(scriptTag);
        
        btn.disabled = false;
        btn.innerText = "LOG GAME REWARD";

        if (data.status === "success") {
            alert(`Success! Dispatched ${finalGoldPayout.toLocaleString()} Gold to ${targetPlayer}'s ledger.`);
            document.getElementById('adminBankForm').reset();
        } else {
            alert("Ledger rejection error: " + data.message);
        }
    };

    const jsonpUrl = `${MACRO_URL}?callback=${callbackName}&action=bank&player=${encodeURIComponent(targetPlayer)}&type=${encodeURIComponent(transType)}&amount=${encodeURIComponent(finalGoldPayout)}&notes=${encodeURIComponent(finalNotes)}`;
    
    const scriptTag = document.createElement('script');
    scriptTag.src = jsonpUrl;
    scriptTag.onerror = function() {
        alert("The server network transaction pipeline timed out.");
        btn.disabled = false;
        btn.innerText = "LOG GAME REWARD";
        if (window[callbackName]) delete window[callbackName];
        if (scriptTag.parentNode) document.body.removeChild(scriptTag);
    };
    
    document.body.appendChild(scriptTag);
});

// --- UI RENDERING & TAB NAVIGATION ---
function switchToTab(paneId) {
    document.querySelectorAll('.app-pane').forEach(p => p.style.display = "none");
    document.getElementById(paneId).style.display = "block";
    
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
        let rawVal = weaponsObj[wKey];
        let displayValue = (rawVal !== "" && !isNaN(rawVal)) ? Number(rawVal).toLocaleString() : rawVal;
        if (displayValue === "") displayValue = "0";

        html += `<div style="display:flex; justify-content:space-between; padding:4px 8px; background:rgba(0,0,0,0.2); border-radius:2px;">
            <span style="color: var(--cream); font-weight:500;">${wKey}:</span>
            <span style="font-weight:bold; color:white;">${displayValue}</span>
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

    [...historyArray].reverse().forEach(item => {
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
