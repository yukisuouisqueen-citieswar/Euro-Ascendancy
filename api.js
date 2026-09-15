/* ============================================================
   EURO ASCENDANCY — API.JS
   Google Apps Script API connection
   ============================================================ */

const SCRIPT_URL =
    "https://script.google.com/macros/s/AKfycbwNIM6NKroex_5dRjrVdcH1N-gkn5ZSVWlLNhT4DeE1Bfgel2LB5iJ7P8LL7_sTavUe/exec";


const API = {

    /* ========================================================
       CORE REQUEST
       ======================================================== */

    async request(params = {}) {
        const query =
            new URLSearchParams();

        Object.keys(params).forEach(
            key => {
                const value =
                    params[key];

                if (
                    value !== undefined &&
                    value !== null
                ) {
                    query.append(
                        key,
                        String(value)
                    );
                }
            }
        );

        const url =
            `${SCRIPT_URL}?${query.toString()}`;

        const response =
            await fetch(url, {
                method: "GET",
                cache: "no-store"
            });

        if (!response.ok) {
            throw new Error(
                `API request failed (${response.status}).`
            );
        }

        const data =
            await response.json();

        if (
            data &&
            data.status === "error"
        ) {
            throw new Error(
                data.error ||
                "API request failed."
            );
        }

        return data;
    },


    /* ========================================================
       AUTHENTICATION
       ======================================================== */

    async login(
        player,
        password
    ) {
        return this.request({
            action: "login",
            player,
            password
        });
    },


    async claimAccount(
        player,
        password
    ) {
        return this.request({
            action: "claimAccount",
            player,
            password,
            newPassword: password
        });
    },


    async changePassword(
        player,
        password,
        newPassword
    ) {
        return this.request({
            action: "changePassword",
            player,
            password,
            newPassword
        });
    },


    async getSession(
        player,
        password
    ) {
        return this.request({
            action: "getSession",
            player,
            password
        });
    },


    async logout(
        player,
        password
    ) {
        return this.request({
            action: "logout",
            player,
            password
        });
    },


    /* ========================================================
       STOCKPILE
       ======================================================== */

    async getStockpile(
        player,
        password
    ) {
        return this.request({
            action: "getWeapons",
            player,
            password
        });
    },


    async getWeapons(
        player,
        password
    ) {
        return this.request({
            action: "getWeapons",
            player,
            password
        });
    },


    async updateWeapon(
        player,
        password,
        weapon,
        quantity
    ) {
        return this.request({
            action: "updateWeapon",
            player,
            password,
            weapon,
            quantity
        });
    },


    async getLeaderboard(
        player,
        password
    ) {
        return this.request({
            action: "getLeaderboard",
            player,
            password
        });
    },


    /* ========================================================
       BANK
       ======================================================== */

    async getBank(
        player,
        password
    ) {
        return this.request({
            action: "getBank",
            player,
            password
        });
    },


    async getBalance(
        player,
        password
    ) {
        return this.request({
            action: "getBalance",
            player,
            password
        });
    },


    async getTransactions(
        player,
        password,
        targetPlayer = ""
    ) {
        return this.request({
            action: "getTransactions",
            player,
            password,
            targetPlayer
        });
    },


    async transfer(
        player,
        password,
        toPlayer,
        amount
    ) {
        return this.request({
            action: "transfer",
            player,
            password,
            toPlayer,
            amount
        });
    },


    /* ========================================================
       CLAIMS
       ======================================================== */

    async submitClaim(
        player,
        password,
        type,
        amount,
        notes = ""
    ) {
        return this.request({
            action: "submitClaim",
            player,
            password,
            type,
            claimType: type,
            amount,
            notes
        });
    },


    async submitTroopClaim(
        player,
        password,
        troopsLost,
        notes = ""
    ) {
        return this.request({
            action: "submitTroopClaim",
            player,
            password,
            troopsLost,
            troops: troopsLost,
            notes
        });
    },


    async submitRegionalClaim(
        player,
        password,
        medals,
        notes = ""
    ) {
        return this.request({
            action: "submitRegionalClaim",
            player,
            password,
            medals,
            regionalMedals: medals,
            notes
        });
    },


    async submitBorderClaim(
        player,
        password,
        days,
        notes = ""
    ) {
        return this.request({
            action: "submitBorderClaim",
            player,
            password,
            days,
            borderDays: days,
            notes
        });
    },


    async getMyClaims(
        player,
        password
    ) {
        return this.request({
            action: "getMyClaims",
            player,
            password
        });
    },


    async getPendingClaims(
        player,
        password
    ) {
        return this.request({
            action: "getPendingClaims",
            player,
            password
        });
    },


    async adminClaimAction(
        player,
        password,
        claimId,
        claimAction
    ) {
        return this.request({
            action: "adminClaimAction",
            player,
            password,
            claimId,
            claimAction
        });
    },


    /* ========================================================
       BORDERS
       ======================================================== */

    async getBorders(
        player,
        password
    ) {
        return this.request({
            action: "getBorders",
            player,
            password
        });
    },


    async getBorderStats(
        player,
        password
    ) {
        return this.request({
            action: "getBorderStats",
            player,
            password
        });
    },


    /* ========================================================
       ADMIN — OVERVIEW
       ======================================================== */

    async adminOverview(
        player,
        password
    ) {
        return this.request({
            action: "adminOverview",
            player,
            password
        });
    },


    async adminDashboard(
        player,
        password
    ) {
        return this.request({
            action: "adminDashboard",
            player,
            password
        });
    },


    async adminFindPlayer(
        player,
        password,
        targetPlayer
    ) {
        return this.request({
            action: "adminFindPlayer",
            player,
            password,
            targetPlayer
        });
    },


    async adminPlayerOverview(
        player,
        password,
        targetPlayer
    ) {
        return this.request({
            action: "adminPlayerOverview",
            player,
            password,
            targetPlayer
        });
    },


    async adminGetAllBankStats(
        player,
        password
    ) {
        return this.request({
            action: "adminGetAllBankStats",
            player,
            password
        });
    },


    /* ========================================================
       ADMIN — ACCOUNT CONTROL
       ======================================================== */

    async adminSetDisabled(
        player,
        password,
        targetPlayer,
        disabled
    ) {
        return this.request({
            action: "adminSetDisabled",
            player,
            password,
            targetPlayer,
            disabled
        });
    },


    async adminResetPassword(
        player,
        password,
        targetPlayer,
        newPassword
    ) {
        return this.request({
            action: "adminResetPassword",
            player,
            password,
            targetPlayer,
            newPassword
        });
    },


    /* ========================================================
       ADMIN — GOLD
       ======================================================== */

    async adminAdjustBalance(
        player,
        password,
        targetPlayer,
        amount,
        notes = ""
    ) {
        return this.request({
            action: "adminBalanceAdjust",
            player,
            password,
            targetPlayer,
            amount,
            notes
        });
    },


    /* ========================================================
       ADMIN — WEAPONS
       ======================================================== */

    async adminWeaponUpdate(
        player,
        password,
        targetPlayer,
        weapon,
        quantity
    ) {
        return this.request({
            action: "adminWeaponUpdate",
            player,
            password,
            targetPlayer,
            weapon,
            quantity
        });
    },


    /* ========================================================
       ADMIN — BORDERS
       ======================================================== */

    async adminUpdateBorders(
        player,
        password,
        targetPlayer,
        borderDays
    ) {
        return this.request({
            action: "adminUpdateBorders",
            player,
            password,
            targetPlayer,
            borderDays
        });
    }

};


/* ============================================================
   MAKE API AVAILABLE GLOBALLY
   ============================================================ */

window.API = API;
