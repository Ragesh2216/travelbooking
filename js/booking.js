/* ==========================================================================
   Booking Validation & Dynamic Price Estimation — Meridian Stays
   ========================================================================== */

window.MeridianBooking = (function () {
  const TAX_RATE = 0.12;
  const EXTRA_ADULT_FEE_PER_NIGHT = 35;

  function toISODate(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  function parseISODate(isoStr) {
    if (!isoStr || !/^\d{4}-\d{2}-\d{2}$/.test(isoStr)) return null;
    const [y, m, d] = isoStr.split("-").map(Number);
    const dt = new Date(y, m - 1, d);
    if (
      dt.getFullYear() !== y ||
      dt.getMonth() !== m - 1 ||
      dt.getDate() !== d
    ) {
      return null;
    }
    dt.setHours(0, 0, 0, 0);
    return dt;
  }

  function getTodayLocal() {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return now;
  }

  function addDays(date, days) {
    const next = new Date(date.getTime());
    next.setDate(next.getDate() + days);
    return next;
  }

  function getDefaultDates() {
    const today = getTodayLocal();
    const checkin = addDays(today, 7);
    const checkout = addDays(checkin, 3);
    return {
      todayISO: toISODate(today),
      checkinISO: toISODate(checkin),
      checkoutISO: toISODate(checkout)
    };
  }

  function validateDates(checkinStr, checkoutStr) {
    const today = getTodayLocal();
    const checkin = parseISODate(checkinStr);
    const checkout = parseISODate(checkoutStr);

    if (!checkin || !checkout) {
      return {
        valid: false,
        nights: 0,
        error: "Please select valid check-in and check-out dates."
      };
    }

    if (checkin < today) {
      return {
        valid: false,
        nights: 0,
        error: "Check-in date cannot be in the past."
      };
    }

    const diffMs = checkout.getTime() - checkin.getTime();
    const nights = Math.round(diffMs / (1000 * 60 * 60 * 24));

    if (nights < 1) {
      return {
        valid: false,
        nights: 0,
        error: "Check-out date must be at least 1 night after check-in."
      };
    }

    if (nights > 30) {
      return {
        valid: false,
        nights: 0,
        error: "Online stays are limited to 30 nights. Contact concierge for extended leases."
      };
    }

    return {
      valid: true,
      nights,
      error: ""
    };
  }

  function evaluateCoupon(rawCode, hotel, nights, roomAndGuestSubtotal) {
    const code = (rawCode || "").trim().toUpperCase();
    if (!code) {
      return {
        applied: false,
        valid: false,
        code: "",
        discountAmount: 0,
        message: ""
      };
    }

    const offer = window.MeridianData.offers.find((o) => o.code === code);
    if (!offer) {
      return {
        applied: false,
        valid: false,
        code,
        discountAmount: 0,
        message: `Promo code "${code}" is not recognized.`
      };
    }

    if (nights < offer.minNights) {
      return {
        applied: false,
        valid: false,
        code,
        discountAmount: 0,
        offer,
        message: `${code} requires a minimum stay of ${offer.minNights} nights.`
      };
    }

    if (roomAndGuestSubtotal < offer.minSubtotal) {
      return {
        applied: false,
        valid: false,
        code,
        discountAmount: 0,
        offer,
        message: `${code} applies to stay subtotals of $${offer.minSubtotal}+.`
      };
    }

    if (
      Array.isArray(offer.eligibleDestinations) &&
      offer.eligibleDestinations.length > 0 &&
      hotel &&
      !offer.eligibleDestinations.includes(hotel.destinationId)
    ) {
      return {
        applied: false,
        valid: false,
        code,
        discountAmount: 0,
        offer,
        message: `${code} is valid only for Santorini, Amalfi Coast, and Maldives stays.`
      };
    }

    let discountAmount = 0;
    if (offer.type === "percent") {
      discountAmount = Math.round((roomAndGuestSubtotal * offer.value) / 100);
    } else if (offer.type === "fixed") {
      discountAmount = Math.min(offer.value, roomAndGuestSubtotal);
    }

    return {
      applied: true,
      valid: true,
      code,
      discountAmount,
      offer,
      message: `${code} applied: saving $${discountAmount.toLocaleString()}!`
    };
  }

  function calculateStayEstimate(hotel, options) {
    const nights = Math.max(1, Number(options.nights) || 1);
    const rooms = Math.max(1, Number(options.rooms) || 1);
    const adults = Math.max(1, Number(options.adults) || 2);
    const children = Math.max(0, Number(options.children) || 0);
    const addons = options.addons || {};
    const couponCode = options.couponCode || "";

    const baseRoomCost = hotel.pricePerNight * nights * rooms;

    // 2 adults included per room; each extra adult adds $35/night
    const includedAdults = rooms * 2;
    const extraAdults = Math.max(0, adults - includedAdults);
    const extraGuestFee = extraAdults * EXTRA_ADULT_FEE_PER_NIGHT * nights;

    const transferFee = addons.transfer ? 55 : 0;
    const breakfastFee = addons.breakfast ? 28 * adults * nights : 0;
    const lateCheckoutFee = addons.lateCheckout ? 40 : 0;
    const addonsTotal = transferFee + breakfastFee + lateCheckoutFee;

    const roomAndGuestSubtotal = baseRoomCost + extraGuestFee;
    const subtotalBeforeDiscount = roomAndGuestSubtotal + addonsTotal;

    const couponResult = evaluateCoupon(
      couponCode,
      hotel,
      nights,
      roomAndGuestSubtotal
    );
    const discountAmount = couponResult.applied ? couponResult.discountAmount : 0;

    const taxableAmount = Math.max(0, subtotalBeforeDiscount - discountAmount);
    const taxes = Math.round(taxableAmount * TAX_RATE);
    const grandTotal = taxableAmount + taxes;

    // Also compute undiscounted grand total for strikethrough comparison
    const undiscountedTaxes = Math.round(subtotalBeforeDiscount * TAX_RATE);
    const totalWithoutDiscount = subtotalBeforeDiscount + undiscountedTaxes;

    return {
      nights,
      rooms,
      adults,
      children,
      baseRoomCost,
      extraAdults,
      extraGuestFee,
      transferFee,
      breakfastFee,
      lateCheckoutFee,
      addonsTotal,
      discountAmount,
      couponResult,
      taxes,
      grandTotal,
      totalWithoutDiscount,
      effectiveNightly: Math.round(grandTotal / nights)
    };
  }

  function formatCurrency(amount) {
    return "$" + Math.round(amount).toLocaleString("en-US");
  }

  return {
    toISODate,
    parseISODate,
    addDays,
    getDefaultDates,
    validateDates,
    evaluateCoupon,
    calculateStayEstimate,
    formatCurrency
  };
})();
