document.addEventListener("luxestay:ready", () => {
  document.getElementById("heroSearchBtn")?.addEventListener("click", () => {
    const query = document.getElementById("heroDestination")?.value?.trim();
    location.href = query
      ? `hotels.html?q=${encodeURIComponent(query)}`
      : "hotels.html";
  });

  const featuredGrid = document.getElementById("featuredGrid");
  if (featuredGrid && typeof hotelList !== "undefined") {
    hotelList
      .filter((hotel) => hotel.badge)
      .slice(0, 3)
      .forEach((hotel) => featuredGrid.appendChild(buildCard(hotel)));
    syncWishBtns();
    observeReveals();
  }

  const reviewsGrid = document.getElementById("reviewsGrid");
  if (reviewsGrid && typeof hotelList !== "undefined") {
    hotelList
      .flatMap((hotel) => hotel.reviewsList)
      .slice(0, 3)
      .forEach((review, i) => {
        const d = document.createElement("div");
        d.className = `review-card reveal${i ? ` reveal-delay-${i}` : ""}`;
        d.innerHTML = `
        <div class="review-stars">${"★".repeat(review.stars)}</div>
        <p class="review-text">"${review.text}"</p>
        <div class="review-author">
          <img class="review-avatar" src="${review.avatar}" alt="${review.name}">
          <div><div class="review-name">${review.name}</div><div class="review-date">${review.date}</div></div>
        </div>`;
        reviewsGrid.appendChild(d);
      });
    observeReveals();
  }
});
