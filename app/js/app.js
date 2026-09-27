const MealMate = {
  meals: JSON.parse(localStorage.getItem("mealmate-meals")) || {},
  shopping: JSON.parse(localStorage.getItem("mealmate-shopping")) || [],

  saveMeals() {
    localStorage.setItem(
      "mealmate-meals",
      JSON.stringify(this.meals)
    );
  },

  saveShopping() {
    localStorage.setItem(
      "mealmate-shopping",
      JSON.stringify(this.shopping)
    );
  },

  addShoppingItem(name) {
    const cleanName = name.trim();

    if (!cleanName) return;

    this.shopping.push({
      id: Date.now(),
      name: cleanName,
      completed: false
    });

    this.saveShopping();
    this.renderShopping();
  },

  toggleShoppingItem(id) {
    const item = this.shopping.find(
      item => item.id === id
    );

    if (!item) return;

    item.completed = !item.completed;

    this.saveShopping();
    this.renderShopping();
  },

  removeShoppingItem(id) {
    this.shopping = this.shopping.filter(
      item => item.id !== id
    );

    this.saveShopping();
    this.renderShopping();
  },

  renderShopping() {
    const lists = [
      document.querySelector("#shopping-list"),
      document.querySelector("#shopping-list-full")
    ].filter(Boolean);

    lists.forEach(list => {
      list.innerHTML = "";

      if (this.shopping.length === 0) {
        list.innerHTML = `
          <p class="muted">
            Your shopping list is empty.
          </p>
        `;

        return;
      }

      this.shopping.forEach(item => {
        const row = document.createElement("div");

        row.className = "shopping-item";

        row.innerHTML = `
          <label>
            <input
              type="checkbox"
              ${item.completed ? "checked" : ""}
            >

            <span class="${item.completed ? "completed" : ""}">
              ${this.escapeHtml(item.name)}
            </span>
          </label>

          <button type="button" aria-label="Remove item">
            ×
          </button>
        `;

        const checkbox = row.querySelector("input");
        const removeButton = row.querySelector("button");

        checkbox.addEventListener("change", () => {
          this.toggleShoppingItem(item.id);
        });

        removeButton.addEventListener("click", () => {
          this.removeShoppingItem(item.id);
        });

        list.appendChild(row);
      });
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

    const bars = [
      document.querySelector("#shopping-progress"),
      document.querySelector("#shopping-progress-full")
    ].filter(Boolean);

    const texts = [
      document.querySelector("#shopping-progress-text"),
      document.querySelector("#shopping-progress-text-full")
    ].filter(Boolean);

    bars.forEach(bar => {
      bar.style.width = `${percentage}%`;
    });

    texts.forEach(text => {
      text.textContent =
        `${completed} of ${total} items completed`;
    });
  },

  escapeHtml(value) {
    const div = document.createElement("div");

    div.textContent = value;

    return div.innerHTML;
  }
};


/* ------------------------------
   NAVIGATION
------------------------------ */

function setupNavigation() {
  const buttons = document.querySelectorAll(
    ".nav-button"
  );

  const sections = document.querySelectorAll(
    ".page-section"
  );

  buttons.forEach(button => {
    button.addEventListener("click", () => {
      const target = button.dataset.section;

      buttons.forEach(item => {
        item.classList.remove("active");
      });

      button.classList.add("active");

      sections.forEach(section => {
        section.classList.toggle(
          "hidden",
          section.id !== target
        );
      });

      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    });
  });
}


/* ------------------------------
   DARK MODE
------------------------------ */

function setupTheme() {
  const savedTheme =
    localStorage.getItem("mealmate-theme");

  if (savedTheme === "dark") {
    document.body.classList.add("dark");
  }
}


function toggleTheme() {
  document.body.classList.toggle("dark");

  const theme =
    document.body.classList.contains("dark")
      ? "dark"
      : "light";

  localStorage.setItem(
    "mealmate-theme",
    theme
  );
}


/* ------------------------------
   SHOPPING
------------------------------ */

function addShoppingItemPrompt() {
  const name = prompt(
    "What do you need to buy?"
  );

  if (!name) return;

  MealMate.addShoppingItem(name);
}


/* ------------------------------
   START APPLICATION
------------------------------ */

document.addEventListener(
  "DOMContentLoaded",
  () => {
    setupNavigation();
    setupTheme();

    MealMate.renderShopping();

    /*
     * Add a few starter items the first
     * time the app is opened.
     */

    if (
      !localStorage.getItem(
        "mealmate-shopping-initialized"
      )
    ) {
      MealMate.addShoppingItem(
        "Chicken breast"
      );

      MealMate.addShoppingItem("Rice");
      MealMate.addShoppingItem("Peppers");
      MealMate.addShoppingItem("Onions");
      MealMate.addShoppingItem("Pasta");

      localStorage.setItem(
        "mealmate-shopping-initialized",
        "true"
      );
    }
  }
);
