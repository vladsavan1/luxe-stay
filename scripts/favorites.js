document.addEventListener("luxestay:ready", () => {
  const favoritesGrid = document.getElementById("favoritesGrid");

  function renderFavs() {
    const favorites = getFavs();
    const list = hotelList.filter((hotel) => favorites.includes(hotel.id));
    const count = document.getElementById("favCount");
    if (count) count.textContent = list.length;
    favoritesGrid.innerHTML = "";
    const empty = document.getElementById("favoritesEmpty");
    if (!list.length) {
      favoritesGrid.hidden = true;
      if (empty) empty.hidden = false;
      return;
    }
    favoritesGrid.hidden = false;
    if (empty) empty.hidden = true;
    list.forEach((hotel) => favoritesGrid.appendChild(buildCard(hotel)));
    observeReveals();
  }
  renderFavs();
});
