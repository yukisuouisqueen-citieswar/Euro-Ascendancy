/**
 * ============================================
 * stockpile.js
 * Player stockpile management
 * ============================================
 */

const trackerForm = document.getElementById("trackerForm");

trackerForm.addEventListener(
    "submit",
    saveWeaponCount
);

/**
 * Save a weapon count.
 */
async function saveWeaponCount(event) {

    event.preventDefault();

    const weapon =
        document.getElementById("weaponSelect").value;

    const quantity =
        document.getElementById("quantityInput").value;

    const button =
        document.getElementById("submitBtn");

    if (!weapon) return;

    showLoading(
        button,
        "UPDATING..."
    );

    try {

        const response =
            await API.updateWeapon(
                weapon,
                quantity
            );

        stopLoading(button);

        if (response.status !== "success") {

            notify(
                response.message ||
                "Unable to save weapon count."
            );

            return;

        }

        AppState.weapons[weapon] = quantity;

        renderWeaponsGrid(AppState.weapons);

        trackerForm.reset();

    }

    catch (error) {

        stopLoading(button);

        notify(
            error.message ||
            "Unable to contact the server."
        );

    }

}

/**
 * Render the player's stockpile.
 */
function renderWeaponsGrid(weapons = {}) {

    const grid =
        document.getElementById("liveWeaponsGrid");

    if (
        !weapons ||
        Object.keys(weapons).length === 0
    ) {

        grid.innerHTML =
            `<p class="empty-note">
                No stockpile data available.
            </p>`;

        return;

    }

    let html = "";

    Object.keys(weapons)
        .sort()
        .forEach(weapon => {

            const value = weapons[weapon];

            const display =
                value !== "" &&
                !isNaN(value)
                    ? Number(value).toLocaleString()
                    : value || "0";

            html += `
                <div class="weapon-row">

                    <span>
                        ${weapon}
                    </span>

                    <span class="weapon-count">
                        ${display}
                    </span>

                </div>
            `;

        });

    grid.innerHTML = html;

}

/**
 * Replace the current stockpile.
 * Useful after login or refresh.
 */
function setWeapons(weapons = {}) {

    AppState.weapons = weapons;

    renderWeaponsGrid(
        AppState.weapons
    );

}

/**
 * Refresh stockpile from server.
 * (Useful later for manual refresh button.)
 */
async function refreshWeapons() {

    if (!API.getWeapons) return;

    try {

        const response =
            await API.getWeapons();

        if (response.status !== "success")
            return;

        setWeapons(
            response.weapons || {}
        );

    }

    catch (error) {

        console.error(error);

    }

}
