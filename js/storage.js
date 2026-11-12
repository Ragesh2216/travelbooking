/* ==========================================================================
   LocalStorage Persistence Layer — Meridian Stays
   Handles wishlist, search state, active promo coupon, newsletter & estimates
   ========================================================================== */

window.MeridianStorage = (function () {
  const KEYS = {
    WISHLIST: "meridian_wishlist_v1",
    SEARCH: "meridian_search_v1",
    COUPON: "meridian_active_coupon_v1",
    NEWSLETTER: "meridian_newsletter_v1",
    ESTIMATES: "meridian_saved_estimates_v1"
  };

  function safeRead(key, fallback) {
    try {
      const raw = window.localStorage.getItem(key);
      if (!raw) return fallback;
      return JSON.parse(raw);
    } catch (err) {
      return fallback;
    }
  }

  function safeWrite(key, value) {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (err) {
      return false;
    }
  }

  return {
    getWishlist() {
      const list = safeRead(KEYS.WISHLIST, []);
      return Array.isArray(list) ? list : [];
    },

    setWishlist(ids) {
      safeWrite(KEYS.WISHLIST, ids);
    },

    toggleWishlist(hotelId) {
      const current = this.getWishlist();
      const exists = current.includes(hotelId);
      const next = exists
        ? current.filter((id) => id !== hotelId)
        : [...current, hotelId];
      this.setWishlist(next);
      return { saved: !exists, wishlist: next };
    },

    clearWishlist() {
      this.setWishlist([]);
      return [];
    },

    getSearchState() {
      return safeRead(KEYS.SEARCH, null);
    },

    setSearchState(searchObj) {
      safeWrite(KEYS.SEARCH, searchObj);
    },

    getActiveCoupon() {
      const code = safeRead(KEYS.COUPON, "");
      return typeof code === "string" ? code : "";
    },

    setActiveCoupon(code) {
      safeWrite(KEYS.COUPON, code || "");
    },

    getNewsletter() {
      return safeRead(KEYS.NEWSLETTER, null);
    },

    setNewsletter(record) {
      safeWrite(KEYS.NEWSLETTER, record);
    },

    getSavedEstimates() {
      const list = safeRead(KEYS.ESTIMATES, []);
      return Array.isArray(list) ? list : [];
    },

    addSavedEstimate(estimateRecord) {
      const current = this.getSavedEstimates();
      const updated = [estimateRecord, ...current].slice(0, 10);
      safeWrite(KEYS.ESTIMATES, updated);
      return updated;
    }
  };
})();
