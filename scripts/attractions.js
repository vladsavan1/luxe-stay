document.addEventListener("luxestay:ready", () => {
  const tabs = document.querySelectorAll(".attr-tab");
  const cards = document.querySelectorAll(".attr-card");
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => t.classList.toggle("active", t === tab));
      const category = tab.dataset.category;
      cards.forEach((card) => {
        const categories = (card.dataset.category || "").split(" ");
        const show = category === "all" || categories.includes(category);
        card.style.display = show ? "" : "none";
      });
    });
  });
});
