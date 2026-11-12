/* ==========================================================================
   Main Application Controller — Stackly Travel
   Wires state, LocalStorage, search/date validation, filters, estimator & slider
   ========================================================================== */

document.addEventListener("DOMContentLoaded", function () {
  const Data = window.MeridianData;
  const Store = window.MeridianStorage;
  const Booking = window.MeridianBooking;
  const UI = window.MeridianUI;

  // ---------- Application State ----------
  const defaults = Booking.getDefaultDates();
  const savedSearch = Store.getSearchState();

  // Restore saved dates only if still valid (checkin >= today)
  let initialCheckin = defaults.checkinISO;
  let initialCheckout = defaults.checkoutISO;
  if (savedSearch && Booking.validateDates(savedSearch.checkin, savedSearch.checkout).valid) {
    initialCheckin = savedSearch.checkin;
    initialCheckout = savedSearch.checkout;
  }

  const state = {
    searchQuery: savedSearch && typeof savedSearch.destination === "string" ? savedSearch.destination : "",
    checkin: initialCheckin,
    checkout: initialCheckout,
    nights: Booking.validateDates(initialCheckin, initialCheckout).nights || 3,
    adults: savedSearch && savedSearch.adults ? Math.min(12, Math.max(1, savedSearch.adults)) : 2,
    children: savedSearch && typeof savedSearch.children === "number" ? Math.min(8, Math.max(0, savedSearch.children)) : 0,
    rooms: savedSearch && savedSearch.rooms ? Math.min(6, Math.max(1, savedSearch.rooms)) : 1,
    regionFilter: "all",
    hotelDestFilter: "all",
    hotelMaxPrice: 850,
    hotelMinRating: 0,
    hotelTagFilter: "all",
    hotelSort: "recommended",
    activeCoupon: Store.getActiveCoupon(),
    wishlist: Store.getWishlist(),
    activeEstimatorHotelId: null,
    sliderIndex: 0,
    sliderTimer: null
  };

  // Apply URL query handoff (?q=...) such as redirects from 404.html
  const urlParams = new URLSearchParams(window.location.search);
  const urlQuery = (urlParams.get("q") || "").trim();
  if (urlQuery) {
    state.searchQuery = urlQuery;
    const exactMatch = Data.destinations.find(
      (d) =>
        d.name.toLowerCase() === urlQuery.toLowerCase() ||
        d.country.toLowerCase() === urlQuery.toLowerCase()
    );
    state.hotelDestFilter = exactMatch ? exactMatch.id : "all";
    persistSearch();
  }

  // ---------- AOS Initialization (with Scroll/Hash/Offline Reliability) ----------
  function revealVisibleAOS() {
    const vh = window.innerHeight || document.documentElement.clientHeight;
    document.querySelectorAll("[data-aos]").forEach((el) => {
      if (el.classList.contains("aos-animate")) return;
      const rect = el.getBoundingClientRect();
      if (rect.top <= vh * 0.98) {
        el.classList.add("aos-animate");
      }
    });
  }

  function initAOS() {
    if (typeof window.AOS !== "undefined" && typeof window.AOS.init === "function") {
      window.AOS.init({
        duration: 500,
        easing: "ease-out-cubic",
        once: true,
        offset: 40
      });
    } else {
      // Graceful offline fallback if CDN is unreachable
      const style = document.createElement("style");
      style.textContent =
        "[data-aos]{opacity:0;transform:translateY(18px);transition:opacity 520ms ease,transform 520ms ease}[data-aos].aos-animate{opacity:1;transform:none}";
      document.head.appendChild(style);
    }

    // Ensure elements revealed via hash navigation (#hotels, #offers) or fast scroll never stay stuck at opacity: 0
    if ("IntersectionObserver" in window) {
      const safetyObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("aos-animate");
              safetyObserver.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.02 }
      );
      document.querySelectorAll("[data-aos]").forEach((el) => safetyObserver.observe(el));
    }

    revealVisibleAOS();
    window.addEventListener("scroll", revealVisibleAOS, { passive: true });
    window.addEventListener("load", () => {
      if (window.AOS && typeof window.AOS.refresh === "function") {
        window.AOS.refresh();
      }
      revealVisibleAOS();
    });
    window.addEventListener("hashchange", () => window.setTimeout(revealVisibleAOS, 80));
    window.setTimeout(revealVisibleAOS, 200);
    window.setTimeout(revealVisibleAOS, 600);
  }

  // ---------- DOM References ----------
  const headerEl = document.getElementById("site-header");
  const mobileToggleBtn = document.getElementById("mobile-menu-toggle");
  const mobileCloseBtn = document.getElementById("mobile-menu-close");
  const mobileNav = document.getElementById("mobile-nav");
  const mobileBackdrop = document.getElementById("mobile-nav-backdrop");

  const searchForm = document.getElementById("hero-search-form");
  const destInput = document.getElementById("search-destination");
  const clearDestBtn = document.getElementById("clear-destination-btn");
  const suggestionsBox = document.getElementById("destination-suggestions");
  const checkinInput = document.getElementById("checkin-date");
  const checkoutInput = document.getElementById("checkout-date");
  const nightsPill = document.getElementById("search-nights-pill");
  const searchMsg = document.getElementById("search-validation-msg");

  const guestTrigger = document.getElementById("guest-trigger");
  const guestPopover = document.getElementById("guest-popover");
  const guestDoneBtn = document.getElementById("guest-done-btn");
  const guestSummaryText = document.getElementById("guest-summary-text");
  const guestHint = document.getElementById("guest-capacity-hint");

  const filterDestSelect = document.getElementById("filter-destination");
  const filterPriceSlider = document.getElementById("filter-max-price");
  const priceReadout = document.getElementById("price-filter-value");
  const filterRatingSelect = document.getElementById("filter-rating");
  const sortHotelsSelect = document.getElementById("sort-hotels");
  const resetHotelsBtn = document.getElementById("reset-hotels-btn");
  const emptyResetHotelsBtn = document.getElementById("empty-reset-hotels-btn");

  const headerCouponPill = document.getElementById("header-coupon-pill");
  const headerCouponCode = document.getElementById("header-coupon-code");
  const summaryStayPill = document.getElementById("summary-stay-pill");
  const summaryCouponPill = document.getElementById("summary-coupon-pill");

  const wishlistDrawer = document.getElementById("wishlist-drawer");
  const wishlistBackdrop = document.getElementById("wishlist-backdrop");

  const estimatorBackdrop = document.getElementById("estimator-modal-backdrop");
  const estimatorModal = document.getElementById("estimator-modal");

  // ---------- Persist Search State ----------
  function persistSearch() {
    Store.setSearchState({
      destination: state.searchQuery,
      checkin: state.checkin,
      checkout: state.checkout,
      adults: state.adults,
      children: state.children,
      rooms: state.rooms
    });
  }

  // ---------- Sticky Header ----------
  function updateHeaderScroll() {
    if (!headerEl) return;
    if (window.scrollY > 24) {
      headerEl.classList.add("is-scrolled");
    } else {
      headerEl.classList.remove("is-scrolled");
    }
  }
  window.addEventListener("scroll", updateHeaderScroll, { passive: true });
  updateHeaderScroll();

  // ---------- Mobile Navigation Drawer ----------
  function setMobileMenu(open) {
    if (!mobileNav || !mobileBackdrop || !mobileToggleBtn) return;
    mobileNav.classList.toggle("is-open", open);
    mobileBackdrop.classList.toggle("is-open", open);
    mobileNav.setAttribute("aria-hidden", String(!open));
    mobileToggleBtn.setAttribute("aria-expanded", String(open));
    document.body.style.overflow = open ? "hidden" : "";
  }

  if (mobileToggleBtn) {
    mobileToggleBtn.addEventListener("click", () => {
      const isOpen = mobileNav.classList.contains("is-open");
      setMobileMenu(!isOpen);
    });
  }
  if (mobileCloseBtn) mobileCloseBtn.addEventListener("click", () => setMobileMenu(false));
  if (mobileBackdrop) mobileBackdrop.addEventListener("click", () => setMobileMenu(false));
  document.querySelectorAll(".mobile-nav-link").forEach((link) => {
    link.addEventListener("click", () => setMobileMenu(false));
  });

  // ---------- Active Coupon & Summary Sync ----------
  function syncSummaryPills() {
    const totalGuests = state.adults + state.children;
    const guestLabel = `${totalGuests} ${totalGuests === 1 ? "Guest" : "Guests"}`;
    const roomLabel = `${state.rooms} ${state.rooms === 1 ? "Room" : "Rooms"}`;
    const nightLabel = `${state.nights} ${state.nights === 1 ? "Night" : "Nights"}`;

    if (summaryStayPill) {
      summaryStayPill.textContent = `${nightLabel} · ${guestLabel} · ${roomLabel}`;
    }

    if (nightsPill) {
      nightsPill.textContent = nightLabel.toLowerCase();
    }

    if (state.activeCoupon) {
      if (headerCouponPill && headerCouponCode) {
        headerCouponCode.textContent = state.activeCoupon;
        headerCouponPill.classList.remove("is-hidden");
      }
      if (summaryCouponPill) {
        summaryCouponPill.textContent = `Promo: ${state.activeCoupon} (Click to clear)`;
        summaryCouponPill.classList.remove("is-hidden");
        summaryCouponPill.style.cursor = "pointer";
      }
    } else {
      if (headerCouponPill) headerCouponPill.classList.add("is-hidden");
      if (summaryCouponPill) summaryCouponPill.classList.add("is-hidden");
    }
  }

  function clearActiveCoupon() {
    state.activeCoupon = "";
    Store.setActiveCoupon("");
    syncSummaryPills();
    UI.renderOffers(Data.offers, state.activeCoupon);
    refreshHotels(false);
    UI.renderWishlistDrawer(state.wishlist, getBookingContext());
    UI.showToast("Promo code removed.");
  }

  if (headerCouponPill) headerCouponPill.addEventListener("click", clearActiveCoupon);
  if (summaryCouponPill) summaryCouponPill.addEventListener("click", clearActiveCoupon);

  // ---------- Booking Context Helper ----------
  function getBookingContext() {
    return {
      nights: state.nights,
      rooms: state.rooms,
      adults: state.adults,
      children: state.children,
      activeCoupon: state.activeCoupon,
      wishlist: state.wishlist
    };
  }

  // ---------- Destinations Filtering & Rendering ----------
  function getFilteredDestinations() {
    const q = state.searchQuery.trim().toLowerCase();
    return Data.destinations.filter((dest) => {
      const regionMatch = state.regionFilter === "all" || dest.region === state.regionFilter;
      const queryMatch =
        !q ||
        dest.name.toLowerCase().includes(q) ||
        dest.country.toLowerCase().includes(q) ||
        dest.region.toLowerCase().includes(q);
      return regionMatch && queryMatch;
    });
  }

  function refreshDestinations(isFirstLoad = false) {
    UI.renderDestinations(getFilteredDestinations(), isFirstLoad);
  }

  // ---------- Hotels Filtering, Sorting & Rendering ----------
  function hasActiveHotelFilters() {
    return (
      state.hotelDestFilter !== "all" ||
      state.hotelMaxPrice < 850 ||
      state.hotelMinRating > 0 ||
      state.hotelTagFilter !== "all" ||
      state.hotelSort !== "recommended" ||
      state.searchQuery.trim() !== ""
    );
  }

  function getFilteredAndSortedHotels() {
    const q = state.searchQuery.trim().toLowerCase();

    const filtered = Data.hotels.filter((hotel) => {
      // Destination dropdown filter
      if (state.hotelDestFilter !== "all" && hotel.destinationId !== state.hotelDestFilter) {
        return false;
      }

      // Search query match (only if user hasn't picked a separate specific dropdown destination, or combine gracefully)
      if (q && state.hotelDestFilter === "all") {
        const destObj = Data.destinations.find((d) => d.id === hotel.destinationId);
        const hay = `${hotel.name} ${hotel.destinationLabel} ${hotel.type} ${destObj ? destObj.region : ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }

      // Price filter
      if (hotel.pricePerNight > state.hotelMaxPrice) return false;

      // Rating filter
      if (hotel.rating < state.hotelMinRating) return false;

      // Tag / Wishlist filter
      if (state.hotelTagFilter === "wishlist") {
        if (!state.wishlist.includes(hotel.id)) return false;
      } else if (state.hotelTagFilter !== "all") {
        if (!hotel.categories.includes(state.hotelTagFilter)) return false;
      }

      return true;
    });

    // Sort
    const sorted = [...filtered];
    switch (state.hotelSort) {
      case "price-asc":
        sorted.sort((a, b) => a.pricePerNight - b.pricePerNight);
        break;
      case "price-desc":
        sorted.sort((a, b) => b.pricePerNight - a.pricePerNight);
        break;
      case "rating-desc":
        sorted.sort((a, b) => b.rating - a.rating);
        break;
      case "reviews-desc":
        sorted.sort((a, b) => b.reviews - a.reviews);
        break;
      default:
        sorted.sort((a, b) => a.featuredOrder - b.featuredOrder);
    }

    return sorted;
  }

  function refreshHotels(isFirstLoad = false) {
    const list = getFilteredAndSortedHotels();
    UI.renderHotels(list, getBookingContext(), isFirstLoad);
    if (resetHotelsBtn) {
      resetHotelsBtn.classList.toggle("is-hidden", !hasActiveHotelFilters());
    }
  }

  // ---------- Search Widget: Destination Autocomplete & Filtering ----------
  function renderSuggestions(query) {
    if (!suggestionsBox) return;
    const q = query.trim().toLowerCase();
    const matches = Data.destinations.filter(
      (d) =>
        !q ||
        d.name.toLowerCase().includes(q) ||
        d.country.toLowerCase().includes(q) ||
        d.region.toLowerCase().includes(q)
    );

    if (!matches.length) {
      suggestionsBox.innerHTML = `<div style="padding: 12px; font-size: 0.86rem; color: var(--text-muted);">No curated destinations match "${UI.escapeHtml(query)}".</div>`;
      suggestionsBox.classList.remove("is-hidden");
      return;
    }

    suggestionsBox.innerHTML = matches
      .map(
        (d) => `
        <button type="button" class="suggestion-item" role="option" data-suggest-id="${UI.escapeHtml(d.id)}" data-suggest-name="${UI.escapeHtml(d.name)}">
          <div>
            <div class="suggestion-main">${UI.escapeHtml(d.name)}, ${UI.escapeHtml(d.country)}</div>
            <div class="suggestion-sub">${UI.escapeHtml(d.region)} &middot; ${d.staysCount} curated stays</div>
          </div>
          <span class="suggestion-price">From $${d.startingPrice}</span>
        </button>
      `
      )
      .join("");
    suggestionsBox.classList.remove("is-hidden");
  }

  if (destInput) {
    destInput.value = state.searchQuery;
    if (clearDestBtn) clearDestBtn.classList.toggle("is-hidden", !state.searchQuery);

    destInput.addEventListener("focus", () => renderSuggestions(destInput.value));
    destInput.addEventListener("input", () => {
      state.searchQuery = destInput.value;
      state.hotelDestFilter = "all";
      if (filterDestSelect) filterDestSelect.value = "all";
      if (clearDestBtn) clearDestBtn.classList.toggle("is-hidden", !state.searchQuery);
      renderSuggestions(state.searchQuery);
      persistSearch();
      refreshDestinations(false);
      refreshHotels(false);
    });
  }

  if (suggestionsBox) {
    suggestionsBox.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-suggest-id]");
      if (!btn) return;
      const destId = btn.dataset.suggestId;
      const destName = btn.dataset.suggestName;
      state.searchQuery = destName;
      state.hotelDestFilter = destId;
      if (destInput) destInput.value = destName;
      if (clearDestBtn) clearDestBtn.classList.remove("is-hidden");
      if (filterDestSelect) filterDestSelect.value = destId;
      suggestionsBox.classList.add("is-hidden");
      persistSearch();
      refreshDestinations(false);
      refreshHotels(false);
    });
  }

  if (clearDestBtn) {
    clearDestBtn.addEventListener("click", () => {
      state.searchQuery = "";
      state.hotelDestFilter = "all";
      if (destInput) destInput.value = "";
      if (filterDestSelect) filterDestSelect.value = "all";
      clearDestBtn.classList.add("is-hidden");
      persistSearch();
      refreshDestinations(false);
      refreshHotels(false);
    });
  }

  document.querySelectorAll("[data-quick-dest]").forEach((chip) => {
    chip.addEventListener("click", () => {
      const targetName = chip.dataset.quickDest;
      const matched = Data.destinations.find(
        (d) => d.name.toLowerCase() === targetName.toLowerCase()
      );
      state.searchQuery = targetName;
      state.hotelDestFilter = matched ? matched.id : "all";
      if (destInput) destInput.value = targetName;
      if (clearDestBtn) clearDestBtn.classList.remove("is-hidden");
      if (filterDestSelect) filterDestSelect.value = state.hotelDestFilter;
      persistSearch();
      refreshDestinations(false);
      refreshHotels(false);
      const hotelsSec = document.getElementById("hotels");
      if (hotelsSec) hotelsSec.scrollIntoView({ behavior: "smooth" });
    });
  });

  // ---------- Date Picker Validation ----------
  function showSearchFeedback(msg, isError) {
    if (!searchMsg) return;
    if (!msg) {
      searchMsg.textContent = "";
      searchMsg.classList.add("is-hidden");
      searchMsg.classList.remove("is-error", "is-info");
      return;
    }
    searchMsg.textContent = msg;
    searchMsg.classList.remove("is-hidden", "is-error", "is-info");
    searchMsg.classList.add(isError ? "is-error" : "is-info");
  }

  function syncDateInputs() {
    if (!checkinInput || !checkoutInput) return;
    checkinInput.min = defaults.todayISO;
    checkinInput.value = state.checkin;
    checkoutInput.value = state.checkout;
  }

  function handleDateChange(source) {
    if (!checkinInput || !checkoutInput) return;
    const ci = checkinInput.value;
    const co = checkoutInput.value;

    // Auto-shift checkout if user picked check-in >= checkout
    if (source === "checkin" && ci) {
      const ciDate = Booking.parseISODate(ci);
      const coDate = Booking.parseISODate(co);
      if (ciDate && (!coDate || coDate <= ciDate)) {
        const nextCo = Booking.toISODate(Booking.addDays(ciDate, 1));
        checkoutInput.value = nextCo;
      }
    }

    const result = Booking.validateDates(checkinInput.value, checkoutInput.value);
    checkinInput.classList.toggle("is-invalid", !result.valid);
    checkoutInput.classList.toggle("is-invalid", !result.valid);

    if (!result.valid) {
      showSearchFeedback(result.error, true);
      return false;
    }

    showSearchFeedback("", false);
    state.checkin = checkinInput.value;
    state.checkout = checkoutInput.value;
    state.nights = result.nights;
    persistSearch();
    syncSummaryPills();
    refreshHotels(false);
    UI.renderWishlistDrawer(state.wishlist, getBookingContext());
    return true;
  }

  syncDateInputs();
  if (checkinInput) checkinInput.addEventListener("change", () => handleDateChange("checkin"));
  if (checkoutInput) checkoutInput.addEventListener("change", () => handleDateChange("checkout"));

  // ---------- Guest & Room Selector ----------
  function syncGuestUI() {
    const adultsEl = document.getElementById("adults-count");
    const childrenEl = document.getElementById("children-count");
    const roomsEl = document.getElementById("rooms-count");

    if (adultsEl) adultsEl.textContent = String(state.adults);
    if (childrenEl) childrenEl.textContent = String(state.children);
    if (roomsEl) roomsEl.textContent = String(state.rooms);

    if (guestSummaryText) {
      const aText = `${state.adults} ${state.adults === 1 ? "Adult" : "Adults"}`;
      const cText = state.children > 0 ? `, ${state.children} ${state.children === 1 ? "Child" : "Children"}` : "";
      const rText = `${state.rooms} ${state.rooms === 1 ? "Room" : "Rooms"}`;
      guestSummaryText.textContent = `${aText}${cText} · ${rText}`;
    }

    if (guestHint) {
      const extraAdults = Math.max(0, state.adults - state.rooms * 2);
      if (extraAdults > 0) {
        guestHint.textContent = `Includes ${extraAdults} extra adult(s) beyond 2/room (+$35/night each).`;
      } else {
        guestHint.textContent = "Recommended up to 2 adults & 1 child per room.";
      }
    }

    document.querySelectorAll("[data-guest-field]").forEach((btn) => {
      const field = btn.dataset.guestField;
      const action = btn.dataset.guestAction;
      if (field === "adults") {
        btn.disabled = (action === "dec" && state.adults <= 1) || (action === "inc" && state.adults >= 12);
      } else if (field === "children") {
        btn.disabled = (action === "dec" && state.children <= 0) || (action === "inc" && state.children >= 8);
      } else if (field === "rooms") {
        btn.disabled = (action === "dec" && state.rooms <= 1) || (action === "inc" && state.rooms >= 6);
      }
    });
  }

  function setGuestPopover(open) {
    if (!guestPopover || !guestTrigger) return;
    guestPopover.classList.toggle("is-hidden", !open);
    guestTrigger.setAttribute("aria-expanded", String(open));
  }

  if (guestTrigger) {
    guestTrigger.addEventListener("click", (e) => {
      e.stopPropagation();
      const willOpen = guestPopover.classList.contains("is-hidden");
      setGuestPopover(willOpen);
    });
  }

  if (guestPopover) {
    guestPopover.addEventListener("click", (e) => {
      e.stopPropagation();
      const btn = e.target.closest("[data-guest-action]");
      if (!btn) return;
      const field = btn.dataset.guestField;
      const delta = btn.dataset.guestAction === "inc" ? 1 : -1;

      if (field === "adults") state.adults = Math.min(12, Math.max(1, state.adults + delta));
      if (field === "children") state.children = Math.min(8, Math.max(0, state.children + delta));
      if (field === "rooms") state.rooms = Math.min(6, Math.max(1, state.rooms + delta));

      syncGuestUI();
      syncSummaryPills();
      persistSearch();
      refreshHotels(false);
      UI.renderWishlistDrawer(state.wishlist, getBookingContext());
    });
  }

  if (guestDoneBtn) guestDoneBtn.addEventListener("click", () => setGuestPopover(false));

  // Close popovers on outside click
  document.addEventListener("click", (e) => {
    if (suggestionsBox && !e.target.closest(".search-field-dest")) {
      suggestionsBox.classList.add("is-hidden");
    }
    if (guestPopover && !e.target.closest(".search-field-guests")) {
      setGuestPopover(false);
    }
  });

  // Search Submit
  if (searchForm) {
    searchForm.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!handleDateChange("submit")) return;
      if (suggestionsBox) suggestionsBox.classList.add("is-hidden");
      setGuestPopover(false);

      // Try matching destination select if query aligns closely
      const q = state.searchQuery.trim().toLowerCase();
      if (q) {
        const exactDest = Data.destinations.find(
          (d) => d.name.toLowerCase() === q || d.country.toLowerCase() === q
        );
        if (exactDest) {
          state.hotelDestFilter = exactDest.id;
          if (filterDestSelect) filterDestSelect.value = exactDest.id;
        }
      }

      refreshDestinations(false);
      refreshHotels(false);

      const matchesCount = getFilteredAndSortedHotels().length;
      showSearchFeedback(
        `Updated estimates for ${state.nights} nights (${state.adults} adults, ${state.rooms} ${state.rooms === 1 ? "room" : "rooms"}) — ${matchesCount} ${matchesCount === 1 ? "stay" : "stays"} found.`,
        false
      );

      const hotelsSec = document.getElementById("hotels");
      if (hotelsSec) hotelsSec.scrollIntoView({ behavior: "smooth" });
    });
  }

  // ---------- Popular Destinations Events ----------
  document.querySelectorAll("[data-region]").forEach((tab) => {
    tab.addEventListener("click", () => {
      document.querySelectorAll("[data-region]").forEach((t) => {
        t.classList.remove("is-active");
        t.setAttribute("aria-selected", "false");
      });
      tab.classList.add("is-active");
      tab.setAttribute("aria-selected", "true");
      state.regionFilter = tab.dataset.region;
      refreshDestinations(false);
    });
  });

  const resetDestBtn = document.getElementById("reset-destinations-btn");
  if (resetDestBtn) {
    resetDestBtn.addEventListener("click", () => {
      state.regionFilter = "all";
      state.searchQuery = "";
      if (destInput) destInput.value = "";
      if (clearDestBtn) clearDestBtn.classList.add("is-hidden");
      document.querySelectorAll("[data-region]").forEach((t) => {
        const isAll = t.dataset.region === "all";
        t.classList.toggle("is-active", isAll);
        t.setAttribute("aria-selected", String(isAll));
      });
      persistSearch();
      refreshDestinations(false);
      refreshHotels(false);
    });
  }

  const destinationsGrid = document.getElementById("destinations-grid");
  if (destinationsGrid) {
    destinationsGrid.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-explore-dest]");
      if (!btn) return;
      const destId = btn.dataset.exploreDest;
      filterToDestination(destId);
    });
  }

  function filterToDestination(destId) {
    state.hotelDestFilter = destId;
    state.hotelTagFilter = "all";
    if (filterDestSelect) filterDestSelect.value = destId;
    document.querySelectorAll("[data-hotel-tag]").forEach((p) => {
      p.classList.toggle("is-active", p.dataset.hotelTag === "all");
    });
    refreshHotels(false);
    const hotelsSec = document.getElementById("hotels");
    if (hotelsSec) hotelsSec.scrollIntoView({ behavior: "smooth" });
  }

  // Footer quick destination links
  document.querySelectorAll("[data-footer-dest]").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const targetName = link.dataset.footerDest.toLowerCase();
      const matched = Data.destinations.find((d) => d.name.toLowerCase() === targetName);
      if (matched) filterToDestination(matched.id);
    });
  });

  // ---------- Hotel Filter & Sort Events ----------
  UI.populateDestinationFilter(Data.destinations);
  if (filterDestSelect && state.hotelDestFilter !== "all") {
    filterDestSelect.value = state.hotelDestFilter;
  }

  if (filterDestSelect) {
    filterDestSelect.addEventListener("change", () => {
      state.hotelDestFilter = filterDestSelect.value;
      if (state.hotelDestFilter === "all" && state.searchQuery) {
        state.searchQuery = "";
        if (destInput) destInput.value = "";
        if (clearDestBtn) clearDestBtn.classList.add("is-hidden");
        persistSearch();
        refreshDestinations(false);
      }
      refreshHotels(false);
    });
  }

  if (filterPriceSlider) {
    filterPriceSlider.addEventListener("input", () => {
      state.hotelMaxPrice = Number(filterPriceSlider.value);
      if (priceReadout) priceReadout.textContent = `Up to $${state.hotelMaxPrice}`;
      refreshHotels(false);
    });
  }

  if (filterRatingSelect) {
    filterRatingSelect.addEventListener("change", () => {
      state.hotelMinRating = Number(filterRatingSelect.value);
      refreshHotels(false);
    });
  }

  if (sortHotelsSelect) {
    sortHotelsSelect.addEventListener("change", () => {
      state.hotelSort = sortHotelsSelect.value;
      refreshHotels(false);
    });
  }

  document.querySelectorAll("[data-hotel-tag]").forEach((pill) => {
    pill.addEventListener("click", () => {
      document.querySelectorAll("[data-hotel-tag]").forEach((p) => p.classList.remove("is-active"));
      pill.classList.add("is-active");
      state.hotelTagFilter = pill.dataset.hotelTag;
      refreshHotels(false);
    });
  });

  function resetAllHotelFilters() {
    state.searchQuery = "";
    state.hotelDestFilter = "all";
    state.hotelMaxPrice = 850;
    state.hotelMinRating = 0;
    state.hotelTagFilter = "all";
    state.hotelSort = "recommended";

    if (destInput) destInput.value = "";
    if (clearDestBtn) clearDestBtn.classList.add("is-hidden");
    if (filterDestSelect) filterDestSelect.value = "all";
    if (filterPriceSlider) filterPriceSlider.value = "850";
    if (priceReadout) priceReadout.textContent = "Up to $850";
    if (filterRatingSelect) filterRatingSelect.value = "0";
    if (sortHotelsSelect) sortHotelsSelect.value = "recommended";
    document.querySelectorAll("[data-hotel-tag]").forEach((p) => {
      p.classList.toggle("is-active", p.dataset.hotelTag === "all");
    });

    persistSearch();
    refreshDestinations(false);
    refreshHotels(false);
  }

  if (resetHotelsBtn) resetHotelsBtn.addEventListener("click", resetAllHotelFilters);
  if (emptyResetHotelsBtn) emptyResetHotelsBtn.addEventListener("click", resetAllHotelFilters);

  // ---------- Wishlist Toggle & Drawer ----------
  function setWishlistDrawer(open) {
    if (!wishlistDrawer || !wishlistBackdrop) return;
    wishlistDrawer.classList.toggle("is-open", open);
    wishlistBackdrop.classList.toggle("is-hidden", !open);
    wishlistDrawer.setAttribute("aria-hidden", String(!open));
    document.body.style.overflow = open ? "hidden" : "";
  }

  function handleToggleWishlist(hotelId) {
    const hotel = Data.hotels.find((h) => h.id === hotelId);
    const result = Store.toggleWishlist(hotelId);
    state.wishlist = result.wishlist;
    refreshHotels(false);
    UI.renderWishlistDrawer(state.wishlist, getBookingContext());

    if (hotel) {
      UI.showToast(
        result.saved ? `Saved "${hotel.name}" to your wishlist.` : `Removed "${hotel.name}" from wishlist.`,
        result.saved ? "success" : "default"
      );
    }
  }

  const hotelsGrid = document.getElementById("hotels-grid");
  if (hotelsGrid) {
    hotelsGrid.addEventListener("click", (e) => {
      const wishBtn = e.target.closest("[data-wishlist-toggle]");
      if (wishBtn) {
        handleToggleWishlist(wishBtn.dataset.wishlistToggle);
        return;
      }

      const estBtn = e.target.closest("[data-open-estimator]");
      if (estBtn) {
        openEstimatorModal(estBtn.dataset.openEstimator);
      }
    });
  }

  const openWishlistBtn = document.getElementById("open-wishlist-btn");
  const mobileWishlistBtn = document.getElementById("mobile-wishlist-btn");
  const footerWishlistBtn = document.getElementById("footer-wishlist-btn");
  const closeWishlistBtn = document.getElementById("close-wishlist-btn");
  const clearWishlistBtn = document.getElementById("clear-wishlist-btn");
  const wishlistExploreBtn = document.getElementById("wishlist-explore-btn");
  const wishlistContainer = document.getElementById("wishlist-items-container");

  if (openWishlistBtn) openWishlistBtn.addEventListener("click", () => setWishlistDrawer(true));
  if (mobileWishlistBtn) {
    mobileWishlistBtn.addEventListener("click", () => {
      setMobileMenu(false);
      setWishlistDrawer(true);
    });
  }
  if (footerWishlistBtn) footerWishlistBtn.addEventListener("click", () => setWishlistDrawer(true));
  if (closeWishlistBtn) closeWishlistBtn.addEventListener("click", () => setWishlistDrawer(false));
  if (wishlistBackdrop) wishlistBackdrop.addEventListener("click", () => setWishlistDrawer(false));
  if (wishlistExploreBtn) {
    wishlistExploreBtn.addEventListener("click", () => {
      setWishlistDrawer(false);
      const hotelsSec = document.getElementById("hotels");
      if (hotelsSec) hotelsSec.scrollIntoView({ behavior: "smooth" });
    });
  }
  if (clearWishlistBtn) {
    clearWishlistBtn.addEventListener("click", () => {
      state.wishlist = Store.clearWishlist();
      refreshHotels(false);
      UI.renderWishlistDrawer(state.wishlist, getBookingContext());
      UI.showToast("Wishlist cleared.");
    });
  }
  if (wishlistContainer) {
    wishlistContainer.addEventListener("click", (e) => {
      const removeBtn = e.target.closest("[data-drawer-remove]");
      if (removeBtn) {
        handleToggleWishlist(removeBtn.dataset.drawerRemove);
        return;
      }
      const estBtn = e.target.closest("[data-drawer-estimate]");
      if (estBtn) {
        setWishlistDrawer(false);
        openEstimatorModal(estBtn.dataset.drawerEstimate);
      }
    });
  }

  // ---------- Offers & Coupon Code Copying ----------
  function copyTextToClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise((resolve, reject) => {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      try {
        document.execCommand("copy");
        resolve();
      } catch (err) {
        reject(err);
      } finally {
        ta.remove();
      }
    });
  }

  const offersGrid = document.getElementById("offers-grid");
  if (offersGrid) {
    offersGrid.addEventListener("click", (e) => {
      const copyBtn = e.target.closest("[data-copy-coupon]");
      if (copyBtn) {
        const code = copyBtn.dataset.copyCoupon;
        copyTextToClipboard(code)
          .then(() => {
            const orig = copyBtn.textContent;
            copyBtn.textContent = "Copied ✓";
            UI.showToast(`Coupon "${code}" copied to clipboard!`, "success");
            window.setTimeout(() => {
              copyBtn.textContent = orig;
            }, 1800);
          })
          .catch(() => {
            UI.showToast(`Promo code: ${code}`);
          });
        return;
      }

      const applyBtn = e.target.closest("[data-apply-coupon]");
      if (applyBtn) {
        const code = applyBtn.dataset.applyCoupon;
        if (state.activeCoupon === code) {
          clearActiveCoupon();
          return;
        }
        state.activeCoupon = code;
        Store.setActiveCoupon(code);
        syncSummaryPills();
        UI.renderOffers(Data.offers, state.activeCoupon);
        refreshHotels(false);
        UI.renderWishlistDrawer(state.wishlist, getBookingContext());
        UI.showToast(`Applied ${code} to eligible stay estimates!`, "success");
      }
    });
  }

  // ---------- Dynamic Booking Price Estimator Modal ----------
  const estCheckin = document.getElementById("est-checkin");
  const estCheckout = document.getElementById("est-checkout");
  const estDateError = document.getElementById("est-date-error");
  const estAddonTransfer = document.getElementById("addon-transfer");
  const estAddonBreakfast = document.getElementById("addon-breakfast");
  const estAddonLate = document.getElementById("addon-latecheckout");
  const estCouponInput = document.getElementById("est-coupon-input");
  const estCouponApplyBtn = document.getElementById("est-apply-coupon-btn");
  const estCouponStatus = document.getElementById("est-coupon-status");
  const estQuickPromos = document.getElementById("est-quick-promos");
  const estBreakdownList = document.getElementById("est-breakdown-list");
  const estGrandTotal = document.getElementById("est-grand-total");
  const estPerNightEff = document.getElementById("est-per-night-effective");
  const estConfirmBtn = document.getElementById("est-confirm-btn");
  const estConfirmation = document.getElementById("est-confirmation");
  const closeEstimatorBtn = document.getElementById("close-estimator-btn");

  const estimatorState = {
    checkin: state.checkin,
    checkout: state.checkout,
    nights: state.nights,
    adults: state.adults,
    children: state.children,
    rooms: state.rooms,
    coupon: state.activeCoupon
  };

  function openEstimatorModal(hotelId, options = {}) {
    const hotel = Data.hotels.find((h) => h.id === hotelId);
    if (!hotel || !estimatorBackdrop) return;

    state.activeEstimatorHotelId = hotelId;
    estimatorState.checkin = state.checkin;

    if (options && typeof options.suggestedNights === "number" && options.suggestedNights >= 1) {
      const ciDate = Booking.parseISODate(estimatorState.checkin) || Booking.parseISODate(defaults.checkinISO);
      const coDate = Booking.addDays(ciDate, options.suggestedNights);
      estimatorState.checkin = Booking.toISODate(ciDate);
      estimatorState.checkout = Booking.toISODate(coDate);
      estimatorState.nights = options.suggestedNights;
    } else {
      estimatorState.checkout = state.checkout;
      estimatorState.nights = state.nights;
    }

    estimatorState.adults = state.adults;
    estimatorState.children = state.children;
    estimatorState.rooms = state.rooms;
    estimatorState.coupon = state.activeCoupon;

    document.getElementById("est-hotel-img").src = hotel.image;
    document.getElementById("est-hotel-img").alt = hotel.alt;
    document.getElementById("est-hotel-type").textContent = hotel.type;
    document.getElementById("estimator-hotel-name").textContent = hotel.name;
    document.getElementById("est-hotel-location").textContent = hotel.destinationLabel;
    document.getElementById("est-nightly-rate").textContent = Booking.formatCurrency(hotel.pricePerNight);

    if (estCheckin) {
      estCheckin.min = defaults.todayISO;
      estCheckin.value = estimatorState.checkin;
    }
    if (estCheckout) estCheckout.value = estimatorState.checkout;
    if (estDateError) estDateError.classList.add("is-hidden");
    if (estAddonTransfer) estAddonTransfer.checked = false;
    if (estAddonBreakfast) estAddonBreakfast.checked = false;
    if (estAddonLate) estAddonLate.checked = false;
    if (estCouponInput) estCouponInput.value = estimatorState.coupon;
    if (estConfirmation) estConfirmation.classList.add("is-hidden");

    if (estQuickPromos) {
      estQuickPromos.innerHTML = Data.offers
        .map(
          (o) =>
            `<button type="button" class="est-promo-chip" data-est-promo="${UI.escapeHtml(o.code)}">${UI.escapeHtml(o.code)} (${UI.escapeHtml(o.badge)})</button>`
        )
        .join("");
    }

    updateEstimatorView();
    estimatorBackdrop.classList.remove("is-hidden");
    document.body.style.overflow = "hidden";
  }

  function closeEstimatorModal() {
    if (!estimatorBackdrop) return;
    estimatorBackdrop.classList.add("is-hidden");
    document.body.style.overflow = "";
  }

  function updateEstimatorView() {
    const hotel = Data.hotels.find((h) => h.id === state.activeEstimatorHotelId);
    if (!hotel) return;

    document.getElementById("est-adults-count").textContent = String(estimatorState.adults);
    document.getElementById("est-children-count").textContent = String(estimatorState.children);
    document.getElementById("est-rooms-count").textContent = String(estimatorState.rooms);

    const dateCheck = Booking.validateDates(estimatorState.checkin, estimatorState.checkout);
    if (!dateCheck.valid) {
      if (estDateError) {
        estDateError.textContent = dateCheck.error;
        estDateError.classList.remove("is-hidden");
      }
      if (estConfirmBtn) estConfirmBtn.disabled = true;
      return;
    }

    if (estDateError) estDateError.classList.add("is-hidden");
    if (estConfirmBtn) estConfirmBtn.disabled = false;
    estimatorState.nights = dateCheck.nights;

    const estimate = Booking.calculateStayEstimate(hotel, {
      nights: estimatorState.nights,
      rooms: estimatorState.rooms,
      adults: estimatorState.adults,
      children: estimatorState.children,
      couponCode: estimatorState.coupon,
      addons: {
        transfer: estAddonTransfer && estAddonTransfer.checked,
        breakfast: estAddonBreakfast && estAddonBreakfast.checked,
        lateCheckout: estAddonLate && estAddonLate.checked
      }
    });

    if (estCouponStatus) {
      estCouponStatus.classList.remove("is-valid", "is-invalid");
      if (estimatorState.coupon) {
        estCouponStatus.textContent = estimate.couponResult.message;
        estCouponStatus.classList.add(estimate.couponResult.applied ? "is-valid" : "is-invalid");
      } else {
        estCouponStatus.textContent = "";
      }
    }

    const rows = [
      `<div class="breakdown-row">
        <span>${Booking.formatCurrency(hotel.pricePerNight)} &times; ${estimate.nights} nights &times; ${estimate.rooms} ${estimate.rooms === 1 ? "room" : "rooms"}</span>
        <span>${Booking.formatCurrency(estimate.baseRoomCost)}</span>
      </div>`
    ];

    if (estimate.extraGuestFee > 0) {
      rows.push(
        `<div class="breakdown-row">
          <span>Extra adult occupancy (${estimate.extraAdults} &times; ${estimate.nights} nights)</span>
          <span>${Booking.formatCurrency(estimate.extraGuestFee)}</span>
        </div>`
      );
    }

    if (estimate.addonsTotal > 0) {
      rows.push(
        `<div class="breakdown-row">
          <span>Selected trip enhancements</span>
          <span>${Booking.formatCurrency(estimate.addonsTotal)}</span>
        </div>`
      );
    }

    if (estimate.discountAmount > 0) {
      rows.push(
        `<div class="breakdown-row is-discount">
          <span>Promo (${UI.escapeHtml(estimate.couponResult.code)})</span>
          <span>&minus;${Booking.formatCurrency(estimate.discountAmount)}</span>
        </div>`
      );
    }

    rows.push(
      `<div class="breakdown-row">
        <span>Taxes &amp; hospitality fees (12%)</span>
        <span>${Booking.formatCurrency(estimate.taxes)}</span>
      </div>`
    );

    if (estBreakdownList) estBreakdownList.innerHTML = rows.join("");
    if (estGrandTotal) estGrandTotal.textContent = Booking.formatCurrency(estimate.grandTotal);
    if (estPerNightEff) {
      estPerNightEff.textContent = `Avg ${Booking.formatCurrency(estimate.effectiveNightly)} / night incl. taxes`;
    }
  }

  if (closeEstimatorBtn) closeEstimatorBtn.addEventListener("click", closeEstimatorModal);
  if (estimatorBackdrop) {
    estimatorBackdrop.addEventListener("click", (e) => {
      if (e.target === estimatorBackdrop) closeEstimatorModal();
    });
  }

  if (estimatorModal) {
    estimatorModal.addEventListener("click", (e) => {
      const stepperBtn = e.target.closest("[data-est-action]");
      if (stepperBtn) {
        const field = stepperBtn.dataset.estField;
        const delta = stepperBtn.dataset.estAction === "inc" ? 1 : -1;
        if (field === "adults") estimatorState.adults = Math.min(12, Math.max(1, estimatorState.adults + delta));
        if (field === "children") estimatorState.children = Math.min(8, Math.max(0, estimatorState.children + delta));
        if (field === "rooms") estimatorState.rooms = Math.min(6, Math.max(1, estimatorState.rooms + delta));
        updateEstimatorView();
        return;
      }

      const promoChip = e.target.closest("[data-est-promo]");
      if (promoChip && estCouponInput) {
        const code = promoChip.dataset.estPromo;
        estCouponInput.value = code;
        estimatorState.coupon = code;
        updateEstimatorView();
      }
    });
  }

  if (estCheckin) {
    estCheckin.addEventListener("change", () => {
      estimatorState.checkin = estCheckin.value;
      updateEstimatorView();
    });
  }
  if (estCheckout) {
    estCheckout.addEventListener("change", () => {
      estimatorState.checkout = estCheckout.value;
      updateEstimatorView();
    });
  }
  [estAddonTransfer, estAddonBreakfast, estAddonLate].forEach((cb) => {
    if (cb) cb.addEventListener("change", updateEstimatorView);
  });

  if (estCouponApplyBtn && estCouponInput) {
    estCouponApplyBtn.addEventListener("click", () => {
      estimatorState.coupon = estCouponInput.value.trim().toUpperCase();
      updateEstimatorView();
    });
  }

  if (estConfirmBtn) {
    estConfirmBtn.addEventListener("click", () => {
      const hotel = Data.hotels.find((h) => h.id === state.activeEstimatorHotelId);
      if (!hotel) return;
      const estimate = Booking.calculateStayEstimate(hotel, {
        nights: estimatorState.nights,
        rooms: estimatorState.rooms,
        adults: estimatorState.adults,
        children: estimatorState.children,
        couponCode: estimatorState.coupon,
        addons: {
          transfer: estAddonTransfer && estAddonTransfer.checked,
          breakfast: estAddonBreakfast && estAddonBreakfast.checked,
          lateCheckout: estAddonLate && estAddonLate.checked
        }
      });

      const refId = "STK-" + Math.floor(10000 + Math.random() * 89999);
      Store.addSavedEstimate({
        refId,
        hotelId: hotel.id,
        hotelName: hotel.name,
        checkin: estimatorState.checkin,
        checkout: estimatorState.checkout,
        nights: estimate.nights,
        rooms: estimate.rooms,
        grandTotal: estimate.grandTotal,
        savedAt: new Date().toISOString()
      });

      if (estConfirmation) {
        estConfirmation.textContent = `Estimate ${refId} saved to your browser for ${hotel.name} (${Booking.formatCurrency(estimate.grandTotal)} total).`;
        estConfirmation.classList.remove("is-hidden");
      }
      UI.showToast(`Estimate ${refId} saved!`, "success");
      window.location.href = "404.html";
    });
  }

  // ---------- Testimonial Slider ----------
  const testimonialViewport = document.getElementById("testimonial-viewport");
  const testimonialTrack = document.getElementById("testimonial-track");
  const testimonialDots = document.getElementById("testimonial-dots");
  const prevSlideBtn = document.getElementById("testimonial-prev");
  const nextSlideBtn = document.getElementById("testimonial-next");

  function getSlidesPerView() {
    if (window.innerWidth <= 720) return 1;
    if (window.innerWidth <= 960) return 2;
    return 3;
  }

  function updateSlider() {
    if (!testimonialTrack) return;
    const total = Data.testimonials.length;
    const perView = getSlidesPerView();
    const maxIndex = Math.max(0, total - perView);
    state.sliderIndex = Math.min(Math.max(0, state.sliderIndex), maxIndex);

    const firstCard = testimonialTrack.querySelector(".testimonial-card");
    const gap = 22;
    const cardWidth = firstCard ? firstCard.getBoundingClientRect().width : 0;
    const offsetPx = state.sliderIndex * (cardWidth + gap);
    testimonialTrack.style.transform = `translateX(-${offsetPx}px)`;

    if (prevSlideBtn) prevSlideBtn.disabled = state.sliderIndex === 0;
    if (nextSlideBtn) nextSlideBtn.disabled = state.sliderIndex >= maxIndex;

    if (testimonialDots) {
      const dotCount = maxIndex + 1;
      testimonialDots.innerHTML = Array.from({ length: dotCount })
        .map(
          (_, i) =>
            `<button type="button" class="slider-dot ${i === state.sliderIndex ? "is-active" : ""}" data-slide-dot="${i}" role="tab" aria-selected="${i === state.sliderIndex}" aria-label="Show testimonial group ${i + 1}"></button>`
        )
        .join("");
    }
  }

  function stepSlider(delta) {
    const total = Data.testimonials.length;
    const maxIndex = Math.max(0, total - getSlidesPerView());
    if (state.sliderIndex + delta > maxIndex) {
      state.sliderIndex = 0;
    } else if (state.sliderIndex + delta < 0) {
      state.sliderIndex = maxIndex;
    } else {
      state.sliderIndex += delta;
    }
    updateSlider();
  }

  function startSliderAutoplay() {
    stopSliderAutoplay();
    state.sliderTimer = window.setInterval(() => stepSlider(1), 6000);
  }

  function stopSliderAutoplay() {
    if (state.sliderTimer) {
      window.clearInterval(state.sliderTimer);
      state.sliderTimer = null;
    }
  }

  if (prevSlideBtn) prevSlideBtn.addEventListener("click", () => stepSlider(-1));
  if (nextSlideBtn) nextSlideBtn.addEventListener("click", () => stepSlider(1));
  if (testimonialDots) {
    testimonialDots.addEventListener("click", (e) => {
      const dot = e.target.closest("[data-slide-dot]");
      if (!dot) return;
      state.sliderIndex = Number(dot.dataset.slideDot);
      updateSlider();
    });
  }

  if (testimonialViewport) {
    testimonialViewport.addEventListener("mouseenter", stopSliderAutoplay);
    testimonialViewport.addEventListener("mouseleave", startSliderAutoplay);

    // Touch swipe support
    let touchStartX = 0;
    testimonialViewport.addEventListener(
      "touchstart",
      (e) => {
        touchStartX = e.changedTouches[0].clientX;
      },
      { passive: true }
    );
    testimonialViewport.addEventListener(
      "touchend",
      (e) => {
        const diff = touchStartX - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 40) {
          stepSlider(diff > 0 ? 1 : -1);
        }
      },
      { passive: true }
    );
  }

  window.addEventListener("resize", updateSlider);

  // ---------- Newsletter Form Validation ----------
  const newsletterForm = document.getElementById("newsletter-form");
  const newsletterEmail = document.getElementById("newsletter-email");
  const newsletterFeedback = document.getElementById("newsletter-feedback");
  const interestChips = document.querySelectorAll(".interest-chip");

  interestChips.forEach((chip) => {
    chip.addEventListener("click", () => {
      chip.classList.toggle("is-selected");
    });
  });

  function showNewsletterMessage(msg, isSuccess) {
    if (!newsletterFeedback) return;
    newsletterFeedback.textContent = msg;
    newsletterFeedback.classList.remove("is-hidden", "is-error", "is-success");
    newsletterFeedback.classList.add(isSuccess ? "is-success" : "is-error");
  }

  const existingSubscriber = Store.getNewsletter();
  if (existingSubscriber && existingSubscriber.email) {
    if (newsletterEmail) newsletterEmail.value = existingSubscriber.email;
    showNewsletterMessage(
      `You are subscribed (${existingSubscriber.email}). Enjoy $100 off your first stay with code WELCOME100.`,
      true
    );
  }

  if (newsletterForm) {
    newsletterForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const email = (newsletterEmail ? newsletterEmail.value : "").trim();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

      if (!email) {
        showNewsletterMessage("Please enter your email address before subscribing.", false);
        if (newsletterEmail) newsletterEmail.focus();
        return;
      }

      if (!emailRegex.test(email)) {
        showNewsletterMessage("Please enter a valid email address (for example, name@domain.com).", false);
        if (newsletterEmail) newsletterEmail.focus();
        return;
      }

      const prev = Store.getNewsletter();
      if (prev && prev.email && prev.email.toLowerCase() === email.toLowerCase()) {
        showNewsletterMessage(
          `Already subscribed with ${email}! Use code WELCOME100 in the estimator.`,
          true
        );
        return;
      }

      const selectedInterests = Array.from(interestChips)
        .filter((c) => c.classList.contains("is-selected"))
        .map((c) => c.dataset.interest);

      Store.setNewsletter({
        email,
        interests: selectedInterests,
        subscribedAt: new Date().toISOString()
      });

      showNewsletterMessage(
        `Welcome to The Sunday Dispatch! Code WELCOME100 is unlocked for ${email}.`,
        true
      );
      UI.showToast("Subscribed to Stackly Travel dispatch!", "success");
    });
  }

  // ---------- Curated Experiences Filter Interaction ----------
  const experiencesGrid = document.getElementById("experiences-grid");
  if (experiencesGrid) {
    experiencesGrid.addEventListener("click", (e) => {
      const card = e.target.closest("[data-experience-tag]");
      const btn = e.target.closest("[data-experience-btn]");
      const tag = (btn && btn.dataset.experienceBtn) || (card && card.dataset.experienceTag);
      if (!tag) return;

      state.searchQuery = "";
      state.hotelDestFilter = "all";
      state.hotelTagFilter = tag;

      if (destInput) destInput.value = "";
      if (clearDestBtn) clearDestBtn.classList.add("is-hidden");
      if (filterDestSelect) filterDestSelect.value = "all";
      document.querySelectorAll("[data-hotel-tag]").forEach((p) => {
        p.classList.toggle("is-active", p.dataset.hotelTag === tag);
      });

      persistSearch();
      refreshDestinations(false);
      refreshHotels(false);
      UI.showToast(`Filtered stays by "${tag}".`);

      const hotelsSec = document.getElementById("hotels");
      if (hotelsSec) hotelsSec.scrollIntoView({ behavior: "smooth" });
    });
  }

  // ---------- Signature Packages Estimator Launch ----------
  const packagesGrid = document.getElementById("packages-grid");
  if (packagesGrid) {
    packagesGrid.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-estimate-package]");
      if (!btn) return;
      const pkg = Data.packages.find((p) => p.id === btn.dataset.estimatePackage);
      if (!pkg) return;

      openEstimatorModal(pkg.hotelId, { suggestedNights: pkg.suggestedNights });
      UI.showToast(`Loaded "${pkg.title}" (${pkg.suggestedNights} nights) in estimator.`, "success");
    });
  }

  // ---------- Travel Journal Modal ----------
  const journalGrid = document.getElementById("journal-grid");
  const journalBackdrop = document.getElementById("journal-modal-backdrop");
  const journalCloseBtn = document.getElementById("close-journal-btn");
  const journalModalImg = document.getElementById("journal-modal-img");
  const journalModalCat = document.getElementById("journal-modal-cat");
  const journalModalTime = document.getElementById("journal-modal-time");
  const journalModalTitle = document.getElementById("journal-modal-title");
  const journalModalParagraphs = document.getElementById("journal-modal-paragraphs");
  const journalModalExploreBtn = document.getElementById("journal-modal-explore-btn");
  let activeJournalDestId = "";

  function openJournalModal(articleId) {
    const article = Data.journalArticles.find((a) => a.id === articleId);
    if (!article || !journalBackdrop) return;

    activeJournalDestId = article.destinationId || "";
    if (journalModalImg) {
      journalModalImg.src = article.image;
      journalModalImg.alt = article.alt;
    }
    if (journalModalCat) journalModalCat.textContent = article.category;
    if (journalModalTime) journalModalTime.textContent = article.readTime;
    if (journalModalTitle) journalModalTitle.textContent = article.title;
    if (journalModalParagraphs) {
      journalModalParagraphs.innerHTML = article.body
        .map((para) => `<p>${UI.escapeHtml(para)}</p>`)
        .join("");
    }

    journalBackdrop.classList.remove("is-hidden");
    journalBackdrop.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeJournalModal() {
    if (!journalBackdrop) return;
    journalBackdrop.classList.add("is-hidden");
    journalBackdrop.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  if (journalGrid) {
    journalGrid.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-open-journal]");
      if (btn) openJournalModal(btn.dataset.openJournal);
    });
  }
  if (journalCloseBtn) journalCloseBtn.addEventListener("click", closeJournalModal);
  if (journalBackdrop) {
    journalBackdrop.addEventListener("click", (e) => {
      if (e.target === journalBackdrop) closeJournalModal();
    });
  }
  if (journalModalExploreBtn) {
    journalModalExploreBtn.addEventListener("click", () => {
      closeJournalModal();
      if (activeJournalDestId) filterToDestination(activeJournalDestId);
    });
  }

  // ---------- FAQ Accordion Interaction ----------
  const faqList = document.getElementById("faq-list");
  if (faqList) {
    faqList.addEventListener("click", (e) => {
      const btn = e.target.closest(".faq-question");
      if (!btn) return;
      const item = btn.closest(".faq-item");
      const answer = item ? item.querySelector(".faq-answer") : null;
      if (!item || !answer) return;

      const willOpen = !item.classList.contains("is-open");

      faqList.querySelectorAll(".faq-item").forEach((other) => {
        other.classList.remove("is-open");
        const otherBtn = other.querySelector(".faq-question");
        const otherAns = other.querySelector(".faq-answer");
        if (otherBtn) otherBtn.setAttribute("aria-expanded", "false");
        if (otherAns) otherAns.hidden = true;
      });

      item.classList.toggle("is-open", willOpen);
      btn.setAttribute("aria-expanded", String(willOpen));
      answer.hidden = !willOpen;
    });
  }

  // ---------- Global Keyboard Escape Handling ----------
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      setMobileMenu(false);
      setWishlistDrawer(false);
      closeEstimatorModal();
      closeJournalModal();
      setGuestPopover(false);
      if (suggestionsBox) suggestionsBox.classList.add("is-hidden");
    }
  });

  // Back to Top & Dynamic Year
  const yearEl = document.getElementById("current-year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  // ---------- Initial Render Sequence ----------
  syncGuestUI();
  syncSummaryPills();
  refreshDestinations(true);
  UI.renderExperiences(Data.experiences);
  refreshHotels(true);
  UI.renderPackages(Data.packages);
  UI.renderOffers(Data.offers, state.activeCoupon);
  UI.renderWhyUs(Data.whyChooseUs);
  UI.renderJournal(Data.journalArticles);
  UI.renderTestimonials(Data.testimonials);
  UI.renderFaqs(Data.faqs);
  UI.renderWishlistDrawer(state.wishlist, getBookingContext());

  // Wait one frame for testimonial card layout measurement before positioning track
  window.requestAnimationFrame(() => {
    updateSlider();
    startSliderAutoplay();
    initAOS();
  });
});
