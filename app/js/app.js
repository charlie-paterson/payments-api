const MealMate = {
  meals: JSON.parse(localStorage.getItem("mealmate-meals")) || {},
  shopping: JSON.parse(localStorage.getItem("mealmate-shopping")) || [],

  saveMeals() {
    localStorage.setItem("mealmate-meals", JSON.stringify(this.meals));
  },

  saveShopping() {
    localStorage.setItem("mealmate-shopping", JSON.stringify(this.shopping));
  },

  addShoppingItem(name) {
    if (!name.trim()) return;

    this.shopping.push({
      id: Date.now(),
      name: name.trim(),
      completed: false
    });

    this.saveShopping();
    this.renderShopping();
  },

  toggleShoppingItem(id) {
    const item = this.shopping.find(item => item.id === id);

    if (item) {
      item.completed = !item.completed;
      this.saveShopping();
      this.renderShopping();
    }
  },

  removeShoppingItem(id) {
    this.shopping = this.shopping.filter(item => item.id !== id);

    this.saveShopping();
    this.renderShopping();
  },

  renderShopping() {
    const list = document.querySelector("#shopping-list");

    if (!list) return;

    list.innerHTML = "";

    this.shopping.forEach(item => {
      const row = document.createElement("div");

      row.className = "shopping-item";

      row.innerHTML = `
        <label>
          <input
            type="checkbox"
            ${item.completed ? "checked" : ""}
            onchange="MealMate.toggleShoppingItem(${item.id})"
          >

          <span class="${item.completed ? "completed" : ""}">
            ${item.name}
          </span>
        </label>

        <button
          type="button"
          onclick="MealMate.removeShoppingItem(${item.id})"
        >
          ×
        </button>
      `;

      list.appendChild(row);
    });

    this.updateShoppingProgress();
  },

  updateShoppingProgress() {
    const total = this.shopping.length;

    const completed = this.shopping.filter(
      item => item.completed
    ).length;

    const percentage = total
      ? Math.round((completed / total) * 100)
      : 0;

    const progress = document.querySelector("#shopping-progress");
    const progressText = document.querySelector("#shopping-progress-text");

    if (progress) {
      progress.style.width = `${percentage}%`;
    }

    if (progressText) {
      progressText.textContent =
        `${completed} of ${total} items completed`;
    }
  }
};

document.addEventListener("DOMContentLoaded", () => {
  MealMate.renderShopping();
});
