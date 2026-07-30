/**
 * ============================================
 * bank.js
 * Economy module
 * ============================================
 */

const claimForm = document.getElementById("claimForm");
const transferForm = document.getElementById("transferForm");

claimForm.addEventListener("submit", submitClaim);
transferForm.addEventListener("submit", submitTransfer");

/* ============================================
 * BALANCE
 * ============================================
 */

function updateBalanceDisplay(balance) {

    AppState.balance = Number(balance);

    document.getElementById("balanceAmount").textContent =
        AppState.balance.toLocaleString() + " g";

}

/* ============================================
 * CLAIMS
 * ============================================
 */

async function submitClaim(event) {

    event.preventDefault();

    const button = document.getElementById("claimBtn");

    const type =
        document.getElementById("claimType").value;

    const amount =
        document.getElementById("claimAmount").value;

    const notes =
        document.getElementById("claimNotes").value.trim();

    if (!type || !amount)
        return;

    showLoading(button, "CLAIMING...");

    try {

        let response;

        switch (type) {

            case "troops":

                response =
                    await API.troopClaim(
                        amount,
                        notes
                    );

                break;

            case "regional":

                response =
                    await API.regionalClaim(
                        amount,
                        notes
                    );

                break;

            case "borderday":

                response =
                    await API.borderClaim(
                        amount,
                        notes
                    );

                break;

            default:

                throw new Error("Unknown claim type.");

        }

        stopLoading(button);

        if (response.status !== "success") {

            notify(
                response.message ||
                "Unable to process claim."
            );

            return;

        }

        updateBalanceDisplay(response.balance);

        claimForm.reset();

        notify(
            `Successfully claimed ${Number(response.payout).toLocaleString()} gold.`
        );

    }

    catch (error) {

        stopLoading(button);

        notify(
            error.message ||
            "Unable to process claim."
        );

    }

}

/* ============================================
 * TRANSFERS
 * ============================================
 */

async function submitTransfer(event) {

    event.preventDefault();

    const button =
        document.getElementById("transferBtn");

    const recipient =
        document.getElementById("transferTo").value.trim();

    const amount =
        document.getElementById("transferAmount").value;

    if (!recipient || !amount)
        return;

    showLoading(button, "SENDING...");

    try {

        const response =
            await API.transfer(
                recipient,
                amount
            );

        stopLoading(button);

        if (response.status !== "success") {

            notify(
                response.message ||
                "Transfer failed."
            );

            return;

        }

        updateBalanceDisplay(
            response.balance
        );

        transferForm.reset();

        notify(
            `Transferred ${Number(amount).toLocaleString()} gold to ${recipient}.`
        );

    }

    catch (error) {

        stopLoading(button);

        notify(
            error.message ||
            "Transfer failed."
        );

    }

}

/* ============================================
 * LEDGER
 * ============================================
 */

async function loadHistory() {

    const list =
        document.getElementById("historyList");

    list.innerHTML =
        `<p class="empty-note">Loading...</p>`;

    try {

        const response =
            await API.getLedger();

        if (response.status !== "success") {

            list.innerHTML =
                `<p class="empty-note">${response.message}</p>`;

            return;

        }

        renderLedger(
            response.history || []
        );

    }

    catch (error) {

        list.innerHTML =
            `<p class="empty-note">
                Unable to load transaction history.
            </p>`;

    }

}

function renderLedger(history) {

    const list =
        document.getElementById("historyList");

    if (!history.length) {

        list.innerHTML =
            `<p class="empty-note">
                No transactions yet.
            </p>`;

        return;

    }

    list.innerHTML =
        history.map(entry => {

            const amount =
                Number(entry.amount);

            const positive =
                amount >= 0;

            return `

            <div class="ledger-row">

                <div>

                    <div class="ledger-type">
                        ${entry.type}
                    </div>

                    <div class="ledger-notes">
                        ${entry.notes || ""}
                    </div>

                    <div class="ledger-meta">
                        ${entry.date}
                    </div>

                </div>

                <div class="ledger-amount ${positive ? "positive" : "negative"}">

                    ${positive ? "+" : ""}${amount.toLocaleString()}

                </div>

            </div>

            `;

        }).join("");

}

/* ============================================
 * REFRESH
 * ============================================
 */

async function refreshBalance() {

    if (!API.getBalance)
        return;

    try {

        const response =
            await API.getBalance();

        if (response.status !== "success")
            return;

        updateBalanceDisplay(
            response.balance
        );

    }

    catch {

        // silent refresh failure

    }

}
