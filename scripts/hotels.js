document.addEventListener("luxestay:ready", () => {
  const hotelsGrid = document.getElementById("hotelsGrid");
  const perPage = 6;
  let page = 1;
  let filters = {
    types: [],
    amenities: [],
    star: null,
    maxPrice: 1000,
    query: "",
    guests: 0,
  };

  function roomCapacity(bed) {
    const room = (bed || "").toLowerCase();
    if (room.includes("bedroom")) return 4;
    if (/sofa|pool|terrace|hammock|fireplace|\+/.test(room)) return 3;
    return 2;
  }
  const hotelMaxCapacity = (hotel) =>
    Math.max(...hotel.rooms.map((room) => roomCapacity(room.bed)));

  const urlQ = new URLSearchParams(location.search).get("q") || "";
  if (urlQ) {
    const el = document.getElementById("hotelSearch");
    if (el) el.value = urlQ;
    filters.query = urlQ.toLowerCase();
  }

  const filtered = () =>
    hotelList.filter((hotel) => {
      const q = filters.query;
      return (
        (!q ||
          hotel.name.toLowerCase().includes(q) ||
          hotel.locationSearch.includes(q)) &&
        hotel.price <= filters.maxPrice &&
        (!filters.star || hotel.stars === filters.star) &&
        (!filters.types.length ||
          filters.types.every((t) => hotel.types.includes(t))) &&
        (!filters.amenities.length ||
          filters.amenities.every((a) => hotel.amenities.includes(a))) &&
        (!filters.guests || hotelMaxCapacity(hotel) >= filters.guests)
      );
    });

  const sorted = (arr) => {
    const value = document.getElementById("sortSelect")?.value || "rating-desc";

    return [...arr].sort((a, b) => {
      switch (value) {
        case "price-asc":
          return a.price - b.price;

        case "price-desc":
          return b.price - a.price;

        case "name-asc":
          return a.name.localeCompare(b.name);

        case "rating-desc":
        default:
          return b.rating - a.rating;
      }
    });
  };

  function renderCards(hotels) {
    hotelsGrid.innerHTML = "";
    if (!hotels.length) {
      hotelsGrid.innerHTML =
        '<p class="no-results">No properties match your filters. <button class="btn-link" id="clearAll">Clear all</button></p>';
      document
        .getElementById("clearAll")
        ?.addEventListener("click", resetFilters);
      return;
    }
    hotels.forEach((hotel) => hotelsGrid.appendChild(buildCard(hotel)));
    observeReveals();
  }

  function renderPagination(total) {
    const wrap = document.getElementById("paginationWrap");
    if (!wrap) return;
    const pages = Math.ceil(total / perPage);
    wrap.innerHTML = "";
    if (pages <= 1) return;
    const mkBtn = (label, p, active = false, dots = false) => {
      const button = document.createElement("button");
      button.className =
        "page-btn" + (active ? " active" : "") + (dots ? " dots" : "");
      button.textContent = label;
      if (!dots)
        button.addEventListener("click", () => {
          page = p;
          update();
          wrap.scrollIntoView({ behavior: "smooth", block: "nearest" });
        });
      return button;
    };
    if (page > 1) wrap.appendChild(mkBtn("← Prev", page - 1));
    for (let i = 1; i <= pages; i++) {
      if (pages > 7 && i > 2 && i < pages - 1 && Math.abs(i - page) > 1) {
        if (i === 3 || i === pages - 2)
          wrap.appendChild(mkBtn("…", i, false, true));
        continue;
      }
      wrap.appendChild(mkBtn(i, i, i === page));
    }
    if (page < pages) wrap.appendChild(mkBtn("Next →", page + 1));
  }

  function updateCounts() {
    document.querySelectorAll("[data-filter-type]").forEach((inp) => {
      const el = inp.closest(".filter-check")?.querySelector(".count");
      if (el)
        el.textContent = hotelList.filter((hotel) =>
          hotel.types.includes(inp.dataset.filterType),
        ).length;
    });
    document.querySelectorAll("[data-filter-amenity]").forEach((inp) => {
      const el = inp.closest(".filter-check")?.querySelector(".count");
      if (el)
        el.textContent = hotelList.filter((hotel) =>
          hotel.amenities.includes(inp.dataset.filterAmenity),
        ).length;
    });
  }

  function update() {
    const all = filtered();
    const paged = sorted(all).slice((page - 1) * perPage, page * perPage);
    renderCards(paged);
    const rc = document.getElementById("resultCount");
    if (rc) rc.textContent = all.length;
    renderPagination(all.length);
  }

  document.getElementById("hotelSearch")?.addEventListener("input", (e) => {
    filters.query = e.target.value.toLowerCase().trim();
    page = 1;
    update();
  });

  const priceRange = document.getElementById("priceRange");
  priceRange?.addEventListener("input", () => {
    filters.maxPrice = parseInt(priceRange.value);
    const d = document.getElementById("priceDisplay");
    if (d) d.textContent = "$" + priceRange.value;
    page = 1;
    update();
  });

  document.querySelectorAll("[data-filter-type]").forEach((inp) =>
    inp.addEventListener("change", () => {
      filters.types = [
        ...document.querySelectorAll("[data-filter-type]:checked"),
      ].map((i) => i.dataset.filterType);
      page = 1;
      update();
    }),
  );
  document.querySelectorAll("[data-filter-amenity]").forEach((inp) =>
    inp.addEventListener("change", () => {
      filters.amenities = [
        ...document.querySelectorAll("[data-filter-amenity]:checked"),
      ].map((i) => i.dataset.filterAmenity);
      page = 1;
      update();
    }),
  );
  document.querySelectorAll(".star-btn").forEach((btn) =>
    btn.addEventListener("click", () => {
      const value = parseInt(btn.dataset.star);
      if (filters.star === value) {
        filters.star = null;
        btn.classList.remove("active");
      } else {
        document
          .querySelectorAll(".star-btn")
          .forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        filters.star = value;
      }
      page = 1;
      update();
    }),
  );
  document.getElementById("sortSelect")?.addEventListener("change", () => {
    page = 1;
    update();
  });
  document.getElementById("guestsSelect")?.addEventListener("change", (e) => {
    filters.guests = parseInt(e.target.value) || 0;
    page = 1;
    update();
  });

  function resetFilters() {
    filters = {
      types: [],
      amenities: [],
      star: null,
      maxPrice: 1000,
      query: "",
      guests: 0,
    };
    const s = document.getElementById("hotelSearch");
    if (s) s.value = "";
    const g = document.getElementById("guestsSelect");
    if (g) g.value = "0";
    if (priceRange) {
      priceRange.value = 1000;
      const d = document.getElementById("priceDisplay");
      if (d) d.textContent = "$1000";
    }
    document
      .querySelectorAll("[data-filter-type],[data-filter-amenity]")
      .forEach((i) => (i.checked = false));
    document
      .querySelectorAll(".star-btn")
      .forEach((b) => b.classList.remove("active"));
    page = 1;
    update();
  }
  document
    .getElementById("filterReset")
    ?.addEventListener("click", resetFilters);

  updateCounts();
  update();
});
