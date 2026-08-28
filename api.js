/**
 * api.js
 * API communication layer connecting to Google Apps Script Backend.gs
 */

const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbz25u2_-bolSV389QIfFmD4WppQ8sIyqMmzjB-r5Mzda1degOWGPxGXhKO5z8rIVrZO/exec";

const API = {
  async request(params) {
    const url = new URL(SCRIPT_URL);
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null) url.searchParams.append(key, params[key]);
    });
    const response = await fetch(url.toString(), { method: "GET", mode: "cors" });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  },

  // Auth
  async login(player, password) { return this.request({ action: "login", player, password }); },
  async claimAccount(player, newPassword) { return this.request({ action: "claimAccount", player, newPassword }); },
  async changePassword(player, currentPassword, newPassword) { return this.request({ action: "changePassword", player, currentPassword, newPassword }); },
  async getSession(player, password) { return this.request({ action: "getSession", player, password }); },
  async logout(player, password) { return this.request({ action: "logout", player, password }); },

  // Stockpile
  async getStockpile(player, password) { return this.request({ action: "getWeapons", player, password }); },
  async updateWeapon(player, password, weapon, quantity) { return this.request({ action: "updateWeapon", player, password, weapon, quantity }); },
  async getLeaderboard() { return this.request({ action: "getLeaderboard" }); },

  // Bank
  async getBank(player, password) { return this.request({ action: "getBank", player, password }); },
  async getBalance(player, password) { return this.request({ action: "getBalance", player, password }); },
  async getTransactions(player, password, targetPlayer) {
    const params = { action: "getTransactions", player, password };
    if (targetPlayer) params.targetPlayer = targetPlayer;
    return this.request(params);
  },
  async transfer(player, password, toPlayer, amount) { return this.request({ action: "transfer", player, password, toPlayer, amount }); },

  // Claims
  async submitClaim(player, password, claimType, amount, notes) { return this.request({ action: "submitClaim", player, password, claimType, amount, notes }); },
  async submitTroopClaim(player, password, troops, notes) { return this.request({ action: "submitTroopClaim", player, password, troops, notes }); },
  async submitRegionalClaim(player, password, medals, notes) { return this.request({ action: "submitRegionalClaim", player, password, medals, notes }); },
  async submitBorderClaim(player, password, days, notes) { return this.request({ action: "submitBorderClaim", player, password, days, notes }); },
  async getMyClaims(player, password) { return this.request({ action: "getMyClaims", player, password }); },
  async getPendingClaims(player, password) { return this.request({ action: "getPendingClaims", player, password }); },

  // Borders
  async getBorders(player, password) { return this.request({ action: "getBorders", player, password }); },
  async getBorderStats(player, password) { return this.request({ action: "getBorderStats", player, password }); },

  // Admin
  async adminDashboard(player, password) { return this.request({ action: "adminDashboard", player, password }); },
  async adminFindPlayer(player, password, targetPlayer) { return this.request({ action: "adminFindPlayer", player, password, targetPlayer }); },
  async adminSetDisabled(player, password, targetPlayer, disabled) { return this.request({ action: "adminSetDisabled", player, password, targetPlayer, disabled: String(disabled) }); },
  async adminResetPassword(player, password, targetPlayer, newPassword) { return this.request({ action: "adminResetPassword", player, password, targetPlayer, newPassword }); },
  async adminAdjustBalance(player, password, targetPlayer, amount, notes) { return this.request({ action: "adminBalanceAdjust", player, password, targetPlayer, amount, notes }); },
  async adminWeaponUpdate(player, password, targetPlayer, weapon, quantity) { return this.request({ action: "adminWeaponUpdate", player, password, targetPlayer, weapon, quantity }); },
  async adminUpdateBorders(player, password, targetPlayer, borderDays) { return this.request({ action: "adminUpdateBorders", player, password, targetPlayer, borderDays }); },
  async adminClaimAction(player, password, claimId, claimAction) { return this.request({ action: "adminClaimAction", player, password, claimId, claimAction }); }
};
