/**
 * api.js
 * API communication layer connecting to your Google Apps Script Backend.gs
 */

const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxUch-jU47p2kih8V05K-vxkaQSHGJWdyMGnSnjWssG0pcfnd8_iPC2f5Fh_UPT6lho/exec";

const API = {
  async request(params) {
    const url = new URL(SCRIPT_URL);
    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));

    const response = await fetch(url.toString(), {
      method: "GET",
      mode: "cors"
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  },

  async login(player, password) {
    return this.request({ action: "login", player, password });
  },

  async claimAccount(player, newPassword) {
    return this.request({ action: "claimAccount", player, newPassword });
  },

  async getStockpile(player, password) {
    return this.request({ action: "getWeapons", player, password });
  },

  async updateWeapon(player, password, weapon, quantity) {
    return this.request({ action: "updateWeapon", player, password, weapon, quantity });
  },

  async getBank(player, password) {
    return this.request({ action: "getBank", player, password });
  },

  async getTransactions(player, password) {
    return this.request({ action: "getTransactions", player, password });
  },

  async transfer(player, password, toPlayer, amount) {
    return this.request({ action: "transfer", player, password, toPlayer, amount });
  },

  async submitClaim(player, password, claimType, amount, notes) {
    return this.request({ action: "submitClaim", player, password, claimType, amount, notes });
  },

  async adminSetDisabled(player, password, targetPlayer, action) {
    return this.request({ action: "adminSetDisabled", player, password, targetPlayer, disabledAction: action });
  },

  async adminAdjustBalance(player, password, targetPlayer, amount, notes) {
    return this.request({ action: "adminBalanceAdjust", player, password, targetPlayer, amount, notes });
  }
};
