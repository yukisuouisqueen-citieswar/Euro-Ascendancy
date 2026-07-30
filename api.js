/**
 * ==========================================================
 * api.js
 * Sole communication layer between GitHub Pages and Apps Script
 * ==========================================================
 */

const MACRO_URL =
  "https://script.google.com/macros/s/AKfycbwkRTvWrleQBu-sZKC0UylR0C_HigPNAcxkqnH97pk7N2kL5n5RsrhVl2BIjEimmRSQ/exec";

const API = (() => {

    function request(params = {}) {

        return new Promise((resolve, reject) => {

            const callback =
                "jsonp_" + Date.now() + "_" + Math.floor(Math.random() * 1000000);

            const script = document.createElement("script");

            window[callback] = function (response) {
                cleanup();
                resolve(response);
            };

            script.onerror = function () {
                cleanup();
                reject(new Error("Unable to reach the server."));
            };

            function cleanup() {
                delete window[callback];

                if (script.parentNode)
                    script.parentNode.removeChild(script);
            }

            const query = new URLSearchParams({
                ...params,
                callback
            });

            script.src = `${MACRO_URL}?${query.toString()}`;

            document.body.appendChild(script);

        });

    }

    /**
     * Automatically attach logged in credentials.
     */
    function authenticated(params = {}) {

        return request({
            ...params,
            player: AppState.user,
            password: AppState.password
        });

    }

    /* ==========================================
       AUTH
    ========================================== */

    function login(username, password) {

        return request({
            action: "login",
            player: username,
            password
        });

    }

    function claimAccount(username, password) {

        return request({
            action: "claim",
            player: username,
            newPassword: password
        });

    }

    function changePassword(currentPassword, newPassword) {

        return authenticated({
            action: "changePassword",
            currentPassword,
            newPassword
        });

    }

    /* ==========================================
       STOCKPILE
    ========================================== */

    function updateWeapon(weapon, quantity) {

        return authenticated({
            action: "weapon",
            weapon,
            quantity
        });

    }

    /* ==========================================
       BANK
    ========================================== */

    function transfer(toPlayer, amount) {

        return authenticated({
            action: "transfer",
            toPlayer,
            amount
        });

    }

    function troopClaim(amount, notes = "") {

        return authenticated({
            action: "claimTroops",
            amount,
            notes
        });

    }

    function regionalClaim(medals, notes = "") {

        return authenticated({
            action: "claimRegional",
            medals,
            notes
        });

    }

    function borderClaim(days, notes = "") {

        return authenticated({
            action: "claimBorderDay",
            days,
            notes
        });

    }

    function getLedger() {

        return authenticated({
            action: "ledger"
        });

    }

    /* ==========================================
       CLAIMS
    ========================================== */

    function submitClaim(claimType, troops, image = "") {

        return authenticated({
            action: "submitClaim",
            claimType,
            troops,
            image
        });

    }

    /* ==========================================
       ADMIN
    ========================================== */

    function disableAccount(targetPlayer) {

        return authenticated({
            action: "disableAccount",
            targetPlayer
        });

    }

    function enableAccount(targetPlayer) {

        return authenticated({
            action: "enableAccount",
            targetPlayer
        });

    }

    function adjustBalance(targetPlayer, amount, notes = "") {

        return authenticated({
            action: "adminAdjust",
            targetPlayer,
            amount,
            notes
        });

    }

    /* ==========================================
       PUBLIC API
    ========================================== */

    return {

        login,
        claimAccount,
        changePassword,

        updateWeapon,

        transfer,
        troopClaim,
        regionalClaim,
        borderClaim,
        getLedger,

        submitClaim,

        disableAccount,
        enableAccount,
        adjustBalance

    };

})();
