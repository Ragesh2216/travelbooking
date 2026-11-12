/* ==========================================================================
   UI Rendering & Interactive Components — Meridian Stays
   ========================================================================== */

window.MeridianUI = (function () {
  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function showToast(message, variant = "default") {
    const container = document.getElementById("toast-container");
    if (!container) return;

    const toast = document.createElement("div");
    toast.className = `toast ${variant === "success" ? "toast-success" : ""}`;
    toast.textContent = message;
    container.appendChild(toast);

    window.setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateY(8px)";
      toast.style.transition = "opacity 200ms ease, transform 200ms ease";
      window.setTimeout(() => toast.remove(), 220);
    }, 3000);
  }

  function getWhyUsIconSvg(iconName) {
    switch (iconName) {
      case "calculator":
        return `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="6" x2="16" y2="6"/><line x1="8" y1="11" x2="10" y2="11"/><line x1="14" y1="11" x2="16" y2="11"/><line x1="8" y1="15" x2="10" y2="15"/><line x1="14" y1="15" x2="16" y2="15"/><line x1="8" y1="19" x2="16" y2="19"/></svg>`;
      case "shield":
        return `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>`;
      case "calendar":
        return `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><path d="M9 16l2 2 4-4"/></svg>`;
      default:
        return `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>`;
    }
  }

  function renderDestinations(destinations, isFirstLoad = false) {
    const grid = document.getElementById("destinations-grid");
    const empty = document.getElementById("destinations-empty");
    if (!grid || !empty) return;

    if (!destinations.length) {
      grid.innerHTML = "";
      empty.classList.remove("is-hidden");
      return;
    }

    empty.classList.add("is-hidden");
    grid.innerHTML = destinations
      .map((dest, idx) => {
        const aosAttr = isFirstLoad
          ? `data-aos="fade-up" data-aos-delay="${(idx % 4) * 60}"`
          : "";
        return `
          <article class="destination-card" ${aosAttr}>
            <div class="dest-media">
              <img
                src="${escapeHtml(dest.image)}"
                alt="${escapeHtml(dest.alt)}"
                class="dest-img"
                loading="lazy"
                width="800"
                height="600"
              />
              <span class="dest-region-badge">${escapeHtml(dest.region)}</span>
              <span class="dest-count-badge">${dest.staysCount} stays</span>
            </div>
            <div class="dest-body">
              <div class="dest-title-row">
                <h3 class="dest-name">${escapeHtml(dest.name)}</h3>
                <span class="dest-country">${escapeHtml(dest.country)}</span>
              </div>
              <p class="dest-tagline">${escapeHtml(dest.tagline)}</p>
              <div class="dest-footer">
                <span class="dest-price">From <strong>$${dest.startingPrice}</strong> / night</span>
                <button
                  type="button"
                  class="dest-explore-btn"
                  data-explore-dest="${escapeHtml(dest.id)}"
                >
                  Explore Stays <span aria-hidden="true">&rarr;</span>
                </button>
              </div>
            </div>
          </article>
        `;
      })
      .join("");
  }

  function renderHotels(hotels, context, isFirstLoad = false) {
    const grid = document.getElementById("hotels-grid");
    const empty = document.getElementById("hotels-empty");
    const countLabel = document.getElementById("hotels-result-count");
    if (!grid || !empty) return;

    if (countLabel) {
      countLabel.textContent = `Showing ${hotels.length} of ${window.MeridianData.hotels.length} stays`;
    }

    if (!hotels.length) {
      grid.innerHTML = "";
      empty.classList.remove("is-hidden");
      return;
    }

    empty.classList.add("is-hidden");
    const { nights, rooms, adults, children, activeCoupon, wishlist } = context;

    grid.innerHTML = hotels
      .map((hotel, idx) => {
        const isSaved = wishlist.includes(hotel.id);
        const estimate = window.MeridianBooking.calculateStayEstimate(hotel, {
          nights,
          rooms,
          adults,
          children,
          couponCode: activeCoupon
        });

        const aosAttr = isFirstLoad
          ? `data-aos="fade-up" data-aos-delay="${(idx % 3) * 60}"`
          : "";

        const discountMarkup = estimate.discountAmount > 0
          ? `<span class="hotel-estimate-strike">${window.MeridianBooking.formatCurrency(estimate.totalWithoutDiscount)}</span>`
          : "";

        return `
          <article class="hotel-card" ${aosAttr}>
            <div class="hotel-media">
              <img
                src="${escapeHtml(hotel.image)}"
                alt="${escapeHtml(hotel.alt)}"
                class="hotel-img"
                loading="lazy"
                width="800"
                height="600"
              />
              <div class="hotel-top-tags">
                <span class="hotel-type-pill">${escapeHtml(hotel.type)}</span>
                ${
                  hotel.freeCancellation
                    ? `<span class="hotel-perk-pill">Free Cancellation</span>`
                    : `<span class="hotel-perk-pill">${escapeHtml(hotel.highlightTag)}</span>`
                }
              </div>
              <button
                type="button"
                class="wishlist-heart-btn ${isSaved ? "is-saved" : ""}"
                data-wishlist-toggle="${escapeHtml(hotel.id)}"
                aria-label="${isSaved ? "Remove from wishlist" : "Save to wishlist"}: ${escapeHtml(hotel.name)}"
                aria-pressed="${isSaved}"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
              </button>
            </div>

            <div class="hotel-body">
              <div class="hotel-meta-top">
                <span class="hotel-location">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                  ${escapeHtml(hotel.destinationLabel)}
                </span>
                <span class="hotel-rating" title="${hotel.rating} out of 5">
                  <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                  </svg>
                  ${hotel.rating.toFixed(2)}
                  <span class="hotel-reviews-count">(${hotel.reviews})</span>
                </span>
              </div>

              <h3 class="hotel-title">${escapeHtml(hotel.name)}</h3>
              <p class="hotel-desc">${escapeHtml(hotel.description)}</p>

              <div class="hotel-amenities">
                ${hotel.amenities
                  .map((am) => `<span class="amenity-chip">${escapeHtml(am)}</span>`)
                  .join("")}
              </div>

              <div class="hotel-pricing-footer">
                <div class="hotel-price-block">
                  <span class="hotel-nightly">
                    <strong>${window.MeridianBooking.formatCurrency(hotel.pricePerNight)}</strong> / night
                  </span>
                  <span class="hotel-estimate-line">
                    ${discountMarkup}
                    Est. ${window.MeridianBooking.formatCurrency(estimate.grandTotal)} total (${nights}n · ${rooms}r incl. tax)
                  </span>
                </div>
                <button
                  type="button"
                  class="btn btn-primary btn-sm"
                  data-open-estimator="${escapeHtml(hotel.id)}"
                >
                  Estimate &amp; Book
                </button>
              </div>
            </div>
          </article>
        `;
      })
      .join("");
  }

  function renderOffers(offers, activeCoupon) {
    const grid = document.getElementById("offers-grid");
    if (!grid) return;

    grid.innerHTML = offers
      .map((offer, idx) => {
        const isApplied = activeCoupon === offer.code;
        return `
          <article
            class="offer-card ${offer.theme === "teal" ? "offer-teal" : ""}"
            data-aos="fade-up"
            data-aos-delay="${idx * 70}"
          >
            <div>
              <div class="offer-top">
                <span class="offer-badge">${escapeHtml(offer.badge)}</span>
                <span class="offer-expiry">${escapeHtml(offer.expiry)}</span>
              </div>
              <h3 class="offer-title" style="margin-top: 14px;">${escapeHtml(offer.title)}</h3>
              <p class="offer-desc">${escapeHtml(offer.description)}</p>
            </div>

            <div class="offer-coupon-bar">
              <div class="coupon-code-wrap">
                <span class="coupon-label">Promo Code</span>
                <code class="coupon-code">${escapeHtml(offer.code)}</code>
              </div>
              <div class="offer-actions">
                <button
                  type="button"
                  class="btn btn-outline btn-sm"
                  data-copy-coupon="${escapeHtml(offer.code)}"
                >
                  Copy Code
                </button>
                <button
                  type="button"
                  class="btn ${isApplied ? "btn-accent" : "btn-primary"} btn-sm"
                  data-apply-coupon="${escapeHtml(offer.code)}"
                >
                  ${isApplied ? "Applied ✓" : "Apply"}
                </button>
              </div>
            </div>
          </article>
        `;
      })
      .join("");
  }

  function renderWhyUs(pillars) {
    const container = document.getElementById("why-us-pillars");
    if (!container) return;

    container.innerHTML = pillars
      .map(
        (item, idx) => `
        <article class="pillar-card" data-aos="fade-up" data-aos-delay="${idx * 80}">
          <span class="pillar-icon" aria-hidden="true">${getWhyUsIconSvg(item.icon)}</span>
          <h3 class="pillar-title">${escapeHtml(item.title)}</h3>
          <p class="pillar-desc">${escapeHtml(item.description)}</p>
        </article>
      `
      )
      .join("");
  }

  function renderTestimonials(testimonials) {
    const track = document.getElementById("testimonial-track");
    if (!track) return;

    const starsSvg = Array.from({ length: 5 })
      .map(
        () =>
          `<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`
      )
      .join("");

    track.innerHTML = testimonials
      .map(
        (item) => `
        <article class="testimonial-card">
          <div class="testimonial-stars" aria-label="${item.rating} out of 5 stars">
            ${starsSvg}
          </div>
          <blockquote class="testimonial-quote" style="margin: 0;">
            &ldquo;${escapeHtml(item.quote)}&rdquo;
          </blockquote>
          <div class="testimonial-author">
            <img
              src="${escapeHtml(item.avatar)}"
              alt="${escapeHtml(item.name)}"
              class="testimonial-avatar"
              loading="lazy"
              width="96"
              height="96"
            />
            <div>
              <div class="testimonial-name">${escapeHtml(item.name)}</div>
              <div class="testimonial-meta">${escapeHtml(item.stayedAt)} &middot; ${escapeHtml(item.tripDate)}</div>
            </div>
          </div>
        </article>
      `
      )
      .join("");
  }

  function renderWishlistDrawer(wishlistIds, context) {
    const container = document.getElementById("wishlist-items-container");
    const badge = document.getElementById("wishlist-count");
    const mobileBadge = document.getElementById("mobile-wishlist-count");
    const clearBtn = document.getElementById("clear-wishlist-btn");

    if (badge) badge.textContent = String(wishlistIds.length);
    if (mobileBadge) mobileBadge.textContent = String(wishlistIds.length);
    if (clearBtn) clearBtn.disabled = wishlistIds.length === 0;
    if (!container) return;

    const savedHotels = window.MeridianData.hotels.filter((h) =>
      wishlistIds.includes(h.id)
    );

    if (!savedHotels.length) {
      container.innerHTML = `
        <div class="wishlist-empty">
          <p style="font-weight: 600; margin-bottom: 6px;">Your wishlist is empty</p>
          <p style="font-size: 0.88rem;">Tap the heart icon on any hotel card to save stays for comparison across sessions.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = savedHotels
      .map((hotel) => {
        const estimate = window.MeridianBooking.calculateStayEstimate(hotel, {
          nights: context.nights,
          rooms: context.rooms,
          adults: context.adults,
          children: context.children,
          couponCode: context.activeCoupon
        });
        return `
          <div class="wishlist-item">
            <img src="${escapeHtml(hotel.image)}" alt="${escapeHtml(hotel.name)}" class="wishlist-item-img" width="160" height="120" />
            <div class="wishlist-item-info">
              <div class="wishlist-item-title">${escapeHtml(hotel.name)}</div>
              <div class="wishlist-item-meta">${escapeHtml(hotel.destinationLabel)} &middot; ★ ${hotel.rating.toFixed(2)}</div>
              <div class="wishlist-item-meta">
                <strong>${window.MeridianBooking.formatCurrency(estimate.grandTotal)}</strong> est. (${context.nights}n)
              </div>
              <div class="wishlist-item-actions">
                <button
                  type="button"
                  class="wishlist-remove-btn"
                  data-drawer-remove="${escapeHtml(hotel.id)}"
                >
                  Remove
                </button>
                <button
                  type="button"
                  class="btn btn-primary btn-sm"
                  style="padding: 6px 12px; font-size: 0.78rem;"
                  data-drawer-estimate="${escapeHtml(hotel.id)}"
                >
                  Estimate
                </button>
              </div>
            </div>
          </div>
        `;
      })
      .join("");
  }

  function populateDestinationFilter(destinations) {
    const select = document.getElementById("filter-destination");
    if (!select) return;

    const options = destinations
      .map(
        (d) =>
          `<option value="${escapeHtml(d.id)}">${escapeHtml(d.name)}, ${escapeHtml(d.country)}</option>`
      )
      .join("");
    select.innerHTML = `<option value="all">All Destinations (${destinations.length})</option>${options}`;
  }

  function renderExperiences(experiences) {
    const grid = document.getElementById("experiences-grid");
    if (!grid || !Array.isArray(experiences)) return;

    grid.innerHTML = experiences
      .map(
        (exp, idx) => `
        <article
          class="experience-card"
          data-experience-tag="${escapeHtml(exp.filterTag)}"
          data-aos="fade-up"
          data-aos-delay="${idx * 60}"
        >
          <div class="exp-media">
            <img
              src="${escapeHtml(exp.image)}"
              alt="${escapeHtml(exp.alt)}"
              class="exp-img"
              loading="lazy"
              width="800"
              height="600"
            />
          </div>
          <div class="exp-overlay"></div>
          <div class="exp-content">
            <span class="exp-count">${escapeHtml(exp.staysCount)}</span>
            <h3 class="exp-title">${escapeHtml(exp.title)}</h3>
            <p class="exp-sub">${escapeHtml(exp.subtitle)}</p>
            <button
              type="button"
              class="exp-cta"
              data-experience-btn="${escapeHtml(exp.filterTag)}"
            >
              Explore Stays <span aria-hidden="true">&rarr;</span>
            </button>
          </div>
        </article>
      `
      )
      .join("");
  }

  function renderPackages(packages) {
    const grid = document.getElementById("packages-grid");
    if (!grid || !Array.isArray(packages)) return;

    const checkIcon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><polyline points="20 6 9 17 4 12"></polyline></svg>`;

    grid.innerHTML = packages
      .map(
        (pkg, idx) => `
        <article class="package-card" data-aos="fade-up" data-aos-delay="${idx * 70}">
          <div class="package-media">
            <img
              src="${escapeHtml(pkg.image)}"
              alt="${escapeHtml(pkg.alt)}"
              class="package-img"
              loading="lazy"
              width="800"
              height="500"
            />
            <div class="package-badges">
              <span class="package-badge">${escapeHtml(pkg.badge)}</span>
              <span class="package-duration">${escapeHtml(pkg.duration)}</span>
            </div>
          </div>
          <div class="package-body">
            <span class="package-route">${escapeHtml(pkg.route)}</span>
            <h3 class="package-title">${escapeHtml(pkg.title)}</h3>
            <ul class="package-inclusions">
              ${pkg.inclusions
                .map((item) => `<li>${checkIcon}<span>${escapeHtml(item)}</span></li>`)
                .join("")}
            </ul>
            <div class="package-footer">
              <div class="package-price">
                <span>Package rate from</span>
                <strong>${window.MeridianBooking.formatCurrency(pkg.pricePerGuest)} <small style="font-family: var(--font-sans); font-size: 0.78rem; font-weight: 500; color: var(--text-muted);">/ guest</small></strong>
              </div>
              <button
                type="button"
                class="btn btn-primary btn-sm"
                data-estimate-package="${escapeHtml(pkg.id)}"
              >
                Estimate Package
              </button>
            </div>
          </div>
        </article>
      `
      )
      .join("");
  }

  function renderJournal(articles) {
    const grid = document.getElementById("journal-grid");
    if (!grid || !Array.isArray(articles)) return;

    grid.innerHTML = articles
      .map(
        (art, idx) => `
        <article class="journal-card" data-aos="fade-up" data-aos-delay="${idx * 70}">
          <div class="journal-media">
            <img
              src="${escapeHtml(art.image)}"
              alt="${escapeHtml(art.alt)}"
              class="journal-img"
              loading="lazy"
              width="800"
              height="500"
            />
          </div>
          <div class="journal-body">
            <div class="journal-meta">
              <span>${escapeHtml(art.category)}</span>
              <span>&middot;</span>
              <span>${escapeHtml(art.readTime)}</span>
              <span>&middot;</span>
              <span>${escapeHtml(art.date)}</span>
            </div>
            <h3 class="journal-title">${escapeHtml(art.title)}</h3>
            <p class="journal-excerpt">${escapeHtml(art.excerpt)}</p>
            <div>
              <button
                type="button"
                class="dest-explore-btn"
                data-open-journal="${escapeHtml(art.id)}"
              >
                Read Field Notes <span aria-hidden="true">&rarr;</span>
              </button>
            </div>
          </div>
        </article>
      `
      )
      .join("");
  }

  function renderFaqs(faqs) {
    const list = document.getElementById("faq-list");
    if (!list || !Array.isArray(faqs)) return;

    list.innerHTML = faqs
      .map((faq, idx) => {
        const isFirst = idx === 0;
        const ansId = `faq-ans-${escapeHtml(faq.id)}`;
        return `
          <div class="faq-item ${isFirst ? "is-open" : ""}">
            <button
              type="button"
              class="faq-question"
              aria-expanded="${isFirst}"
              aria-controls="${ansId}"
            >
              <span>${escapeHtml(faq.question)}</span>
              <span class="faq-icon" aria-hidden="true">+</span>
            </button>
            <div class="faq-answer" id="${ansId}" ${isFirst ? "" : "hidden"}>
              <p>${escapeHtml(faq.answer)}</p>
            </div>
          </div>
        `;
      })
      .join("");
  }

  return {
    escapeHtml,
    showToast,
    renderDestinations,
    renderHotels,
    renderOffers,
    renderWhyUs,
    renderTestimonials,
    renderWishlistDrawer,
    populateDestinationFilter,
    renderExperiences,
    renderPackages,
    renderJournal,
    renderFaqs
  };
})();
