document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("[data-bg]").forEach((el) => {
    el.style.backgroundImage = `url('${el.dataset.bg}')`;
  });

  const stars = (n) => "★".repeat(n) + "☆".repeat(5 - n);

  function validateField(input) {
    const err = input.parentElement.querySelector(".form-error");
    const value = input.value.trim();
    const show = (message) => {
      if (err) {
        err.textContent = message;
        err.classList.add("show");
      }
      input.classList.add("error");
      return false;
    };
    input.classList.remove("error");
    err?.classList.remove("show");
    if (input.type === "checkbox")
      return input.required && !input.checked
        ? show("You must accept to continue.")
        : true;
    if (input.required && !value) return show("This field is required.");
    if (
      input.type === "email" &&
      value &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
    )
      return show("Please enter a valid email.");
    if (input.type === "tel" && value && !/^\+?[\d\s\-()]{7,}$/.test(value))
      return show("Please enter a valid phone number.");
    if (input.minLength > 0 && value && value.length < input.minLength)
      return show(`Minimum ${input.minLength} characters.`);
    return true;
  }

  function wireForm(form, onSuccess) {
    form.querySelectorAll("input,select,textarea").forEach((field) => {
      field.addEventListener("blur", () => validateField(field));
      field.addEventListener("input", () => {
        if (field.classList.contains("error")) validateField(field);
      });
      field.addEventListener("change", () => {
        if (field.type === "checkbox") validateField(field);
      });
    });
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      let ok = true;
      form.querySelectorAll("input,select,textarea").forEach((field) => {
        if (field.required && !validateField(field)) ok = false;
      });
      if (ok) onSuccess();
    });
  }

  const nav = document.querySelector(".nav");
  const hasHero = document.querySelector(".hero, .page-hero");
  const logo = document.querySelector(".nav-logo-icon");
  function setNav() {
    if (!hasHero || window.scrollY > 60) {
      logo.src = "../assets/logo.svg";
      nav.classList.remove("transparent");
      nav.classList.add("scrolled", "dark-links");
    } else {
      logo.src = "../assets/logo-white.svg";
      nav.classList.add("transparent");
      nav.classList.remove("scrolled", "dark-links");
    }
  }
  setNav();
  window.addEventListener("scroll", setNav, { passive: true });

  const page = location.pathname.split("/").pop();
  nav
    .querySelectorAll(".nav-link")
    .forEach((l) =>
      l.classList.toggle("active", l.getAttribute("href") === page),
    );

  const burger = document.getElementById("navBurger");
  const links = document.getElementById("navLinks");
  const close = () => {
    burger.classList.remove("open");
    links.classList.remove("open");
    burger.setAttribute("aria-expanded", "false");
  };
  burger.addEventListener("click", () => {
    const open = !links.classList.contains("open");
    burger.classList.toggle("open", open);
    links.classList.toggle("open", open);
    burger.setAttribute("aria-expanded", open);
  });
  links
    .querySelectorAll(".nav-link")
    .forEach((l) => l.addEventListener("click", close));

  const revealObs = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("visible");
          revealObs.unobserve(e.target);
        }
      });
    },
    { threshold: 0.08 },
  );
  function observeReveals() {
    document
      .querySelectorAll(".reveal:not(.visible)")
      .forEach((el) => revealObs.observe(el));
  }
  observeReveals();

  const favoritesKey = "favorites";

  const getFavs = () => {
    return JSON.parse(localStorage.getItem(favoritesKey)) || [];
  };
  const saveFavs = (arr) => {
    return localStorage.setItem(favoritesKey, JSON.stringify(arr));
  };

  function toggleFav(id) {
    const favorites = getFavs();
    const index = favorites.indexOf(id);
    if (index === -1) favorites.push(id);
    else favorites.splice(index, 1);
    saveFavs(favorites);
    return index === -1;
  }

  document.addEventListener(
    "click",
    (e) => {
      const btn = e.target.closest(".hotel-card-wish");
      if (!btn) return;
      e.preventDefault();
      e.stopPropagation();
      const card = btn.closest("[data-hotel-id]");
      if (!card) return;
      const added = toggleFav(card.dataset.hotelId);
      btn.classList.toggle("active", added);
      btn.innerHTML = added
        ? "<img src='../assets/heart-filled.svg'>"
        : "<img src='../assets/heart-outline.svg'>";
    },
    true,
  );

  function buildCard(hotel) {
    const isFav = getFavs().includes(hotel.id);
    const div = document.createElement("div");
    div.className = "hotel-card reveal";
    div.dataset.hotelId = hotel.id;
    const linkHref =
      page === "" || page === "index.html"
        ? `pages/hotel-detail.html?id=${hotel.id}`
        : `hotel-detail.html?id=${hotel.id}`;

    div.innerHTML = `
      <a href="${linkHref}" class="hotel-card-link">
        <div class="hotel-card-img">
          <img src="${hotel.img}" alt="${hotel.name}" loading="lazy">
          ${hotel.badge ? `<span class="hotel-card-badge">${hotel.badge}</span>` : ""}
          <button class="hotel-card-wish${isFav ? " active" : ""}" aria-label="Save">${isFav ? "<img src='../assets/heart-filled.svg' width='20' height='20'>" : "<img src='../assets/heart-outline.svg' width='20' height='20'> "}</button>
        </div>
        <div class="hotel-card-body">
          <div class="hotel-card-location">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
            ${hotel.location}
          </div>
          <h3 class="hotel-card-name">${hotel.name}</h3>
          <div class="hotel-card-stars">${stars(hotel.stars)}</div>
          <div class="hotel-card-footer">
            <div class="hotel-card-price">
              <div class="amount">$${hotel.price}</div>
              <div class="night">per night</div>
            </div>
            <div class="hotel-card-rating">
              <span class="rating-badge">${hotel.rating}</span>
              <span class="rating-label">${hotel.ratingLabel}</span>
            </div>
          </div>
        </div>
      </a>`;
    return div;
  }

  const setText = (elementId, value) => {
    const el = document.getElementById(elementId);
    if (el) el.textContent = value;
  };

  Object.assign(window, {
    stars,
    validateField,
    wireForm,
    observeReveals,
    getFavs,
    toggleFav,
    buildCard,
    setText,
  });

  document.dispatchEvent(new CustomEvent("luxestay:ready"));
});
