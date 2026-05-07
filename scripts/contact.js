document.addEventListener("luxestay:ready", () => {
  const contactForm = document.getElementById("contactForm");
  if (contactForm) {
    wireForm(contactForm, () => {
      document.getElementById("formSuccess")?.classList.add("show");
      contactForm.reset();
      setTimeout(
        () => document.getElementById("formSuccess")?.classList.remove("show"),
        6000,
      );
    });
  }

  document.querySelectorAll(".faq-item").forEach((item) => {
    item.querySelector(".faq-q")?.addEventListener("click", () => {
      const openedItem = item.classList.contains("open");
      document
        .querySelectorAll(".faq-item")
        .forEach((i) => i.classList.remove("open"));
      if (!openedItem) item.classList.add("open");
    });
  });
});
