document.addEventListener("luxestay:ready", () => {
  const detailRoot = document.getElementById("hotelDetailRoot");
  if (detailRoot && typeof hotelList !== "undefined") {
    const id =
      new URLSearchParams(location.search).get("id") || hotelList[0].id;
    const hotel = hotelList.find((hotel) => hotel.id === id);
    document.title = `${hotel.name} - LuxeStay`;

    setText("detailName", hotel.name);
    setText("detailLocation", hotel.address);
    setText("detailRating", hotel.rating);
    setText("detailStars", stars(hotel.stars));
    setText("detailReviews", `${hotel.reviews} reviews`);
    setText("detailPrice", `$${hotel.price}`);
    setText("detailBreadcrumb", hotel.name);
    setText("bookingCardPrice", `$${hotel.price}`);
    setText("bookingCardStars", stars(hotel.stars));
    setText("bookingCardRating", hotel.rating);
    setText("bookingCardReviews", `${hotel.reviews} reviews`);

    const est = hotel.price * 3;
    setText("bcEstimate", `$${est.toFixed(2)}`);
    setText("bcTotal", `$${(est + 25 + Math.round(est * 0.12)).toFixed(2)}`);

    const bookBtn = document.getElementById("bookingCardBtn");
    if (bookBtn) bookBtn.href = `booking.html?id=${hotel.id}`;

    const favBtn = document.getElementById("detailFavBtn");
    if (favBtn) {
      const refresh = () => {
        const isLiked = getFavs().includes(hotel.id);
        favBtn.innerHTML = isLiked
          ? "<img src='../assets/heart-filled.svg' width='20' height='20'> <span>Saved</span>"
          : "<img src='../assets/heart-outline.svg' width='20' height='20'> <span>Save</span>";
        favBtn.classList.toggle("fav-active", isLiked);
      };
      refresh();
      favBtn.addEventListener("click", () => {
        toggleFav(hotel.id);
        refresh();
      });
    }

    const mainImg = document.getElementById("galleryMainImg");
    const thumbsCol = document.getElementById("galleryThumbs");
    if (mainImg && hotel.gallery.length) {
      mainImg.src = hotel.gallery[0];
      mainImg.alt = hotel.name;
    }
    if (thumbsCol) {
      thumbsCol.innerHTML = "";
      const show = hotel.gallery.slice(1, 4);
      show.forEach((src, i) => {
        const wrap = document.createElement("div");
        wrap.className = "gallery-thumb-wrap";
        const img = document.createElement("img");
        img.src = src;
        img.alt = hotel.name;
        img.loading = "lazy";
        img.dataset.galleryIndex = i + 1;
        wrap.appendChild(img);
        if (i === show.length - 1 && hotel.gallery.length > 4) {
          const btn = document.createElement("button");
          btn.id = "galleryMoreBtn";
          btn.className = "gallery-more-btn";
          btn.textContent = `+${hotel.gallery.length - 3} Photos`;
          wrap.appendChild(btn);
        }
        thumbsCol.appendChild(wrap);
      });
    }

    const hlRow = document.getElementById("highlightRow");
    if (hlRow) {
      const items = [
        `${hotel.rooms.length} Room Types`,
        `Up to ${hotel.rooms.length > 2 ? "4" : "2"} Guests`,
        "Free Cancellation",
        "Wi-Fi Included",
      ];
      hlRow.innerHTML = items
        .map((t) => `<div class="highlight-item">${t}</div>`)
        .join("");
    }

    function showTab(target) {
      document
        .querySelectorAll(".tab-btn")
        .forEach((b) => b.classList.toggle("active", b.dataset.tab === target));
      document
        .querySelectorAll(".tab-panel")
        .forEach((p) => (p.hidden = p.dataset.tabPanel !== target));
    }
    showTab("overview");
    document
      .querySelectorAll(".tab-btn")
      .forEach((btn) =>
        btn.addEventListener("click", () => showTab(btn.dataset.tab)),
      );

    const overviewElement = document.getElementById("tabOverviewContent");
    const roomAmenitiesList = document.getElementById("roomAmenitiesList");
    const hotelFacilitiesList = document.getElementById("hotelFacilitiesList");
    const roomsElement = document.getElementById("tabRoomsContent");

    if (overviewElement)
      overviewElement.innerHTML = hotel.description
        .map((p) => `<p class="detail-body-text">${p}</p>`)
        .join("");

    if (roomAmenitiesList)
      roomAmenitiesList.innerHTML = hotel.roomAmenities
        .map((a) => `<span class="amenity-chip">${a}</span>`)
        .join("");

    if (hotelFacilitiesList)
      hotelFacilitiesList.innerHTML = hotel.hotelFacilities
        .map((a) => `<span class="amenity-chip">${a}</span>`)
        .join("");

    if (roomsElement)
      roomsElement.innerHTML = hotel.rooms
        .map(
          (r) => `
      <div class="room-card">
        <img src="${r.img}" alt="${r.name}" loading="lazy">
        <div class="room-card-info">
          <h3 class="room-card-name">${r.name}</h3>
          <p class="room-card-meta">${r.size} · ${r.view} · ${r.bed}</p>
          <div class="room-card-tags">
            <span class="badge badge-green">Free Cancel</span>
            <span class="room-breakfast">${r.breakfast}</span>
            ${r.badge ? `<span class="badge badge-gold">★ ${r.badge}</span>` : ""}
          </div>
        </div>
        <div class="room-card-price-col">
          <div class="room-card-price">$${r.price}</div>
          <div class="room-card-per-night">per night</div>
          <a href="booking.html?id=${hotel.id}" class="btn btn-primary btn-sm">Select</a>
        </div>
      </div>`,
        )
        .join("");

    const reviewsElement = document.getElementById("tabReviewsContent");
    if (reviewsElement) {
      const sc = hotel.scores;
      const bar = (l, v) =>
        `<div class="score-bar-row"><span class="score-bar-label">${l}</span><div class="score-bar-track"><div class="score-bar-fill" style="width:${v * 10}%"></div></div><span>${v}</span></div>`;
      reviewsElement.innerHTML = `
        <div class="reviews-summary">
          <div class="reviews-big-num">
            <div class="reviews-score">${hotel.rating}</div>
            <div class="reviews-stars">${"★".repeat(hotel.stars)}</div>
            <div class="reviews-count">${hotel.reviews} reviews</div>
          </div>
          <div class="score-bars">
            ${bar("Cleanliness", sc.cleanliness)}${bar("Location", sc.location)}
            ${bar("Service", sc.service)}${bar("Value", sc.value)}
          </div>
        </div>
        ${
          hotel.reviewsList.length
            ? hotel.reviewsList
                .map(
                  (r) =>
                    `<div class="review-card"><div class="review-stars">${"★".repeat(r.stars)}</div><p class="review-text">"${r.text}"</p><div class="review-author"><img class="review-avatar" src="${r.avatar}" alt="${r.name}"><div><div class="review-name">${r.name}</div><div class="review-date">${r.date}</div></div></div></div>`,
                )
                .join("")
            : '<p class="detail-body-text">No reviews yet for this property.</p>'
        }`;
    }

    const locationElement = document.getElementById("tabLocationContent");
    if (locationElement)
      locationElement.innerHTML = `
      <h3 class="tab-section-title">Getting There</h3>
      <p class="detail-body-text">${hotel.address}</p>
      <div class="map-placeholder">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
        <span class="map-label">${hotel.location}</span>
        <span class="map-sub">Interactive map coming soon</span>
      </div>
      <div class="poi-grid">${hotel.nearbyPois.map((p) => `<div class="poi-card"><div class="poi-icon">${p.icon}</div><div class="poi-name">${p.name}</div><div class="poi-time">${p.time}</div></div>`).join("")}</div>`;

    const simGrid = document.getElementById("similarGrid");
    if (simGrid) {
      hotelList
        .filter((h) => h.id !== hotel.id)
        .slice(0, 3)
        .forEach((h) => simGrid.appendChild(buildCard(h)));
      observeReveals();
    }
  }

  const modalOverlay = document.getElementById("galleryModal");
  if (modalOverlay) {
    const mImg = document.getElementById("modalMainImg");
    const mThumbs = document.getElementById("modalThumbs");
    let imgs = [],
      idx = 0;

    function openModal(images, start = 0) {
      imgs = images;
      idx = start;
      render();
      modalOverlay.classList.add("open");
      document.body.classList.add("modal-open");
    }
    function closeModal() {
      modalOverlay.classList.remove("open");
      document.body.classList.remove("modal-open");
    }
    function render() {
      if (!imgs.length) return;
      mImg.src = "";
      requestAnimationFrame(() => {
        mImg.src = imgs[idx];
        mImg.alt = `Photo ${idx + 1}`;
      });
      mThumbs.innerHTML = "";
      imgs.forEach((src, i) => {
        const th = document.createElement("div");
        th.className = "modal-thumb" + (i === idx ? " active" : "");
        const ti = document.createElement("img");
        ti.src = src;
        ti.alt = `Thumb ${i + 1}`;
        th.appendChild(ti);
        th.addEventListener("click", () => {
          idx = i;
          render();
        });
        mThumbs.appendChild(th);
      });
      mThumbs
        .querySelector(".active")
        ?.scrollIntoView({ inline: "center", behavior: "smooth" });
    }
    const nav2 = (d) => {
      idx = (idx + d + imgs.length) % imgs.length;
      render();
    };

    document
      .getElementById("modalClose")
      ?.addEventListener("click", closeModal);
    modalOverlay.addEventListener("click", (e) => {
      if (e.target === modalOverlay) closeModal();
    });
    document
      .getElementById("modalPrev")
      ?.addEventListener("click", () => nav2(-1));
    document
      .getElementById("modalNext")
      ?.addEventListener("click", () => nav2(1));
    document.addEventListener("keydown", (e) => {
      if (!modalOverlay.classList.contains("open")) return;
      if (e.key === "Escape") closeModal();
      if (e.key === "ArrowLeft") nav2(-1);
      if (e.key === "ArrowRight") nav2(1);
    });

    function getGallery() {
      const id =
        new URLSearchParams(location.search).get("id") || hotelList[0].id;
      return hotelList.find((h) => h.id === id)?.gallery || [];
    }

    document.addEventListener("click", (e) => {
      if (e.target.closest("#galleryMainImg")) {
        openModal(getGallery(), 0);
        return;
      }
      if (e.target.closest("#galleryMoreBtn")) {
        openModal(getGallery(), 0);
        return;
      }
      const thumb = e.target.closest("#galleryThumbs img");
      if (thumb)
        openModal(getGallery(), parseInt(thumb.dataset.galleryIndex || "0"));
    });
  }
});
