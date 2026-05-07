document.addEventListener("luxestay:ready", () => {
  const bookingForm = document.getElementById("bookingForm");

  const id = new URLSearchParams(location.search).get("id") || hotelList[0].id;
  const hotel = hotelList.find((h) => h.id === id);

  const summaryImage = document.getElementById("bookingSummaryImg");
  if (summaryImage) {
    summaryImage.src = hotel.img;
    summaryImage.alt = hotel.name;
  }

  setText("bookingSummaryName", hotel.name);
  setText("bookingSummaryLocation", hotel.location);
  setText("bookingSummaryStars", stars(hotel.stars) + " " + hotel.rating);
  setText("bookingBreadcrumb", hotel.name);
  setText("policyCheckin", hotel.checkin);
  setText("policyCheckout", hotel.checkout);

  const roomSel = document.getElementById("roomType");
  if (roomSel)
    hotel.rooms.forEach((r) => {
      const opt = document.createElement("option");
      opt.value = r.name;
      opt.textContent = `${r.name} - $${r.price}/night`;
      roomSel.appendChild(opt);
    });

  const checkIn = document.getElementById("checkIn");
  const checkOut = document.getElementById("checkOut");
  const today = new Date().toISOString().split("T")[0];
  if (checkIn) checkIn.min = today;
  if (checkOut) checkOut.min = today;
  checkIn?.addEventListener("change", () => {
    if (checkOut) checkOut.min = checkIn.value;
    calc();
  });
  checkOut?.addEventListener("change", calc);

  function calc() {
    if (!checkIn?.value || !checkOut?.value) return;
    const nights = Math.max(
      1,
      Math.round(
        (new Date(checkOut.value) - new Date(checkIn.value)) / 86400000,
      ),
    );
    const base = hotel.price * nights;
    const tax = Math.round(base * 0.12);
    setText("summaryNights", nights);
    setText("summarySubtotal", `$${base.toFixed(2)}`);
    setText("summaryTax", `$${tax.toFixed(2)}`);
    setText("summaryTotal", `$${(base + tax + 25).toFixed(2)}`);
  }
  calc();

  wireForm(bookingForm, () => {
    document.getElementById("bookingSuccess")?.classList.add("show");
    document
      .getElementById("bookingSuccess")
      ?.scrollIntoView({ behavior: "smooth" });
  });
});
