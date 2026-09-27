const days = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday"
];

const defaultMeals = [
  {
    id: "meal-pasta",
    title: "Tomato Pasta",
    emoji: "🍝",
    ingredients: [
      { name: "Pasta", quantity: 250, unit: "g" },
      { name: "Tomatoes", quantity: 400, unit: "g" },
      { name: "Onion", quantity: 1, unit: "" },
      { name: "Garlic", quantity: 2, unit: "cloves" },
      { name: "Fresh basil", quantity: 1, unit: "handful" }
    ]
  },

  {
    id: "meal-curry",
    title: "Chicken Curry",
    emoji: "🍛",
    ingredients: [
      { name: "Chicken breast", quantity: 500, unit: "g" },
      { name: "Rice", quantity: 250, unit: "g" },
      { name: "Onion", quantity: 1, unit: "" },
      { name: "Garlic", quantity: 2, unit: "cloves" },
      { name: "Curry powder", quantity: 2, unit: "tbsp" },
      { name: "Tomatoes", quantity: 400, unit: "g" }
    ]
  },

  {
    id: "meal-tacos",
    title: "Chicken Tacos",
    emoji: "🌮",
    ingredients: [
      { name: "Chicken breast", quantity: 400, unit: "g" },
      { name: "Tortillas", quantity: 6, unit: "" },
      { name: "Lettuce", quantity: 1, unit: "" },
      { name: "Tomatoes", quantity: 2, unit: "" },
      { name: "Cheddar cheese", quantity: 100, unit: "g" },
      { name: "Salsa", quantity: 1, unit: "jar" }
    ]
  }
];


let meals =
  JSON.parse(
    localStorage.getItem("mealmate-meals")
  ) || defaultMeals;


let weekPlan =
  JSON.parse(
    localStorage.getItem("mealmate-week")
  ) || {
    Monday: "meal-pasta",
    Tuesday: "meal-curry",
    Wednesday: "meal-tacos",
    Thursday: null,
    Friday: null,
    Saturday: null,
    Sunday: null
  };


let shopping =
  JSON.parse(
    localStorage.getItem("mealmate-shopping")
  ) || [];


let editingMealId = null;


/* =========================
   STORAGE
   ========================= */

function saveMeals() {
  localStorage.setItem(
    "mealmate-meals",
    JSON.stringify(meals)
  );
}


function saveWeek() {
  localStorage.setItem(
    "mealmate-week",
    JSON.stringify(weekPlan)
  );
}


function saveShopping() {
  localStorage.setItem(
    "mealmate-shopping",
    JSON.stringify(shopping)
  );
}


/* =========================
   MEAL MODAL
   ========================= */

function openMealModal(mealId = null) {

  editingMealId = mealId;

  const modal =
    document.querySelector("#meal-modal");

  const titleInput =
    document.querySelector("#meal-title");

  const daySelect =
    document.querySelector("#meal-day");

  const ingredientList =
    document.querySelector("#ingredient-list");

  ingredientList.innerHTML = "";


  if (mealId) {

    const meal =
      meals.find(
        item => item.id === mealId
      );

    if (!meal) return;

    titleInput.value =
      meal.title;

    daySelect.value =
      getMealDay(mealId) || "Monday";

    meal.ingredients.forEach(
      ingredient => {
        addIngredientRow(ingredient);
      }
    );

  } else {

    titleInput.value = "";

    daySelect.value = "Monday";

    addIngredientRow();

  }


  modal.classList.remove("hidden");

  modal.setAttribute(
    "aria-hidden",
    "false"
  );

  setTimeout(
    () => titleInput.focus(),
    50
  );
}


function closeMealModal() {

  const modal =
    document.querySelector("#meal-modal");

  modal.classList.add("hidden");

  modal.setAttribute(
    "aria-hidden",
    "true"
  );

  editingMealId = null;
}


function addIngredientRow(
  ingredient = null
) {

  const list =
    document.querySelector(
      "#ingredient-list"
    );

  const row =
    document.createElement("div");

  row.className =
    "ingredient-row";


  row.innerHTML = `
    <input
      type="text"
      class="ingredient-name"
      placeholder="Ingredient"
      value="${escapeAttribute(
        ingredient?.name || ""
      )}"
    >

    <input
      type="number"
      class="ingredient-quantity"
      placeholder="Qty"
      min="0"
      step="any"
      value="${ingredient?.quantity ?? ""}"
    >

    <input
      type="text"
      class="ingredient-unit"
      placeholder="Unit"
      value="${escapeAttribute(
        ingredient?.unit || ""
      )}"
    >

    <button
      type="button"
      class="remove-ingredient"
      aria-label="Remove ingredient"
    >
      ×
    </button>
  `;


  row
    .querySelector(
      ".remove-ingredient"
    )
    .addEventListener(
      "click",
      () => {
        row.remove();
      }
    );


  list.appendChild(row);
}


function saveNewMeal() {

  const titleInput =
    document.querySelector(
      "#meal-title"
    );

  const daySelect =
    document.querySelector(
      "#meal-day"
    );

  const title =
    titleInput.value.trim();

  if (!title) {

    alert(
      "Please give your meal a title."
    );

    titleInput.focus();

    return;
  }


  const ingredientRows =
    document.querySelectorAll(
      ".ingredient-row"
    );


  const ingredients = [];


  ingredientRows.forEach(row => {

    const name =
      row
        .querySelector(
          ".ingredient-name"
        )
        .value
        .trim();

    const quantity =
      Number(
        row
          .querySelector(
            ".ingredient-quantity"
          )
          .value
      );

    const unit =
      row
        .querySelector(
          ".ingredient-unit"
        )
        .value
        .trim();


    if (!name) return;


    ingredients.push({
      name,
      quantity:
        Number.isFinite(quantity)
          ? quantity
          : 0,
      unit
    });

  });


  if (ingredients.length === 0) {

    alert(
      "Add at least one ingredient."
    );

    return;
  }


  if (editingMealId) {

    const meal =
      meals.find(
        item =>
          item.id === editingMealId
      );

    if (!meal) return;

    meal.title = title;

    meal.ingredients =
      ingredients;

    moveMealToDay(
      editingMealId,
      daySelect.value
    );

  } else {

    const meal = {

      id:
        `meal-${Date.now()}`,

      title,

      emoji: "🍽️",

      ingredients

    };


    meals.push(meal);


    weekPlan[
      daySelect.value
    ] = meal.id;

  }


  saveMeals();

  saveWeek();

  closeMealModal();

  renderPlanner();

  renderMeals();

  generateShoppingList();

}


/* =========================
   PLANNER
   ========================= */

function renderPlanner() {

  const grid =
    document.querySelector(
      ".week-grid"
    );

  if (!grid) return;


  grid.innerHTML = "";


  days.forEach(day => {

    const mealId =
      weekPlan[day];

    const meal =
      meals.find(
        item => item.id === mealId
      );


    const card =
      document.createElement("article");

    card.className =
      "day-card";


    if (!meal) {

      card.innerHTML = `
        <span class="day-name">
          ${day.substring(0, 3).toUpperCase()}
        </span>

        <div class="meal-icon">
          ➕
        </div>

        <h3>
          Nothing planned
        </h3>

        <p>
          Add a meal
        </p>

        <button
          type="button"
          class="change-meal-button"
        >
          Add
        </button>
      `;


      card
        .querySelector(
          ".change-meal-button"
        )
        .addEventListener(
          "click",
          () => {
            openMealModal();
            document.querySelector(
              "#meal-day"
            ).value = day;
          }
        );


    } else {

      card.innerHTML = `
        <span class="day-name">
          ${day.substring(0, 3).toUpperCase()}
        </span>

        <div class="meal-icon">
          ${meal.emoji}
        </div>

        <h3>
          ${escapeHtml(meal.title)}
        </h3>

        <p>
          ${meal.ingredients.length}
          ingredients
        </p>

        <button
          type="button"
          class="change-meal-button"
        >
          Edit
        </button>
      `;


      card
        .querySelector(
          ".change-meal-button"
        )
        .addEventListener(
          "click",
          () => {
            openMealModal(meal.id);
          }
        );

    }


    grid.appendChild(card);

  });


  renderTonight();

}


/* =========================
   TONIGHT
   ========================= */

function renderTonight() {

  const today =
    new Date()
      .toLocaleDateString(
        "en-GB",
        { weekday: "long" }
      );


  const mealId =
    weekPlan[today];

  const meal =
    meals.find(
      item => item.id === mealId
    );


  const title =
    document.querySelector(
      ".tonight-card h2"
    );

  const description =
    document.querySelector(
      ".tonight-card .muted"
    );

  const food =
    document.querySelector(
      ".tonight-card .big-food"
    );


  if (!title) return;


  if (!meal) {

    title.textContent =
      "Nothing planned";

    description.textContent =
      `You haven't planned a meal for ${today} yet.`;

    food.textContent =
      "🍽️";

    return;
  }


  title.textContent =
    meal.title;

  description.textContent =
    `${meal.ingredients.length} ingredients planned for tonight.`;

  food.textContent =
    meal.emoji;

}


/* =========================
   MEAL LIBRARY
   ========================= */

function renderMeals() {

  const grid =
    document.querySelector(
      ".recipe-grid"
    );

  if (!grid) return;


  grid.innerHTML = "";


  if (meals.length === 0) {

    grid.innerHTML = `
      <p class="muted">
        You haven't created any meals yet.
      </p>
    `;

    return;
  }


  meals.forEach(meal => {

    const card =
      document.createElement("article");

    card.className =
      "recipe-card";


    card.innerHTML = `

      <div class="recipe-image">
        ${meal.emoji}
      </div>

      <div class="recipe-content">

        <h3>
          ${escapeHtml(meal.title)}
        </h3>

        <p>
          ${meal.ingredients.length}
          ingredients
        </p>

        <div class="recipe-meta">

          <span>
            ${meal.ingredients.length}
            items
          </span>

          <span>
            ${getMealDay(meal.id) || "Unplanned"}
          </span>

        </div>

        <div class="meal-card-actions">

          <button
            type="button"
            class="secondary-button"
            data-edit
          >
            Edit
          </button>

          <button
            type="button"
            class="delete-meal-button"
            data-delete
          >
            Delete
          </button>

        </div>

      </div>
    `;


    card
      .querySelector("[data-edit]")
      .addEventListener(
        "click",
        () => {
          openMealModal(meal.id);
        }
      );


    card
      .querySelector("[data-delete]")
      .addEventListener(
        "click",
        () => {
          deleteMeal(meal.id);
        }
      );


    grid.appendChild(card);

  });

}


/* =========================
   DELETE MEAL
   ========================= */

function deleteMeal(mealId) {

  const meal =
    meals.find(
      item => item.id === mealId
    );

  if (!meal) return;


  const confirmed =
    confirm(
      `Delete "${meal.title}"?`
    );

  if (!confirmed) return;


  meals =
    meals.filter(
      item => item.id !== mealId
    );


  days.forEach(day => {

    if (
      weekPlan[day] === mealId
    ) {
      weekPlan[day] = null;
    }

  });


  saveMeals();

  saveWeek();

  renderPlanner();

  renderMeals();

  generateShoppingList();

}


/* =========================
   DAY HELPERS
   ========================= */

function getMealDay(mealId) {

  return days.find(
    day =>
      weekPlan[day] === mealId
  ) || null;

}


function moveMealToDay(
  mealId,
  newDay
) {

  days.forEach(day => {

    if (
      weekPlan[day] === mealId
    ) {
      weekPlan[day] = null;
    }

  });


  weekPlan[newDay] =
    mealId;

}


/* =========================
   SHOPPING LIST
   ========================= */

function generateShoppingList() {

  const ingredients = {};


  days.forEach(day => {

    const mealId =
      weekPlan[day];

    const meal =
      meals.find(
        item => item.id === mealId
      );

    if (!meal) return;


    meal.ingredients.forEach(
      ingredient => {

        const name =
          ingredient.name.trim();

        const unit =
          ingredient.unit.trim();


        if (!name) return;


        const key =
          `${name.toLowerCase()}|${unit.toLowerCase()}`;


        if (!ingredients[key]) {

          ingredients[key] = {

            id:
              `ingredient-${key
                .replace(/[^a-z0-9]+/gi, "-")}`,

            name,

            quantity: 0,

            unit,

            completed: false

          };

        }


        ingredients[key].quantity +=
          Number(ingredient.quantity) || 0;

      }
    );

  });


  const previous =
    new Map(
      shopping.map(
        item => [
          `${item.name.toLowerCase()}|${item.unit.toLowerCase()}`,
          item
        ]
      )
    );


  shopping =
    Object.values(
      ingredients
    ).map(item => {

      const old =
        previous.get(
          `${item.name.toLowerCase()}|${item.unit.toLowerCase()}`
        );


      return {

        ...item,

        completed:
          old?.completed || false

      };

    });


  saveShopping();

  renderShopping();

}


/* =========================
   SHOPPING RENDER
   ========================= */

function renderShopping() {

  const lists = [

    document.querySelector(
      "#shopping-list"
    ),

    document.querySelector(
      "#shopping-list-full"
    )

  ].filter(Boolean);


  lists.forEach(list => {

    list.innerHTML = "";


    if (
      shopping.length === 0
    ) {

      list.innerHTML = `
        <p class="muted">
          Plan a meal and your shopping list will appear here.
        </p>
      `;

      return;
    }


    shopping.forEach(item => {

      const row =
        document.createElement(
          "div"
        );


      row.className =
        "shopping-item";


      const quantity =
        formatQuantity(item);


      row.innerHTML = `

        <label>

          <input
            type="checkbox"
            ${item.completed ? "checked" : ""}
          >

          <span
            class="${
              item.completed
                ? "completed"
                : ""
            }"
          >

            ${escapeHtml(item.name)}

            ${
              quantity
                ? `<small>
                    ${escapeHtml(quantity)}
                   </small>`
                : ""
            }

          </span>

        </label>

        <button
          type="button"
          aria-label="Remove item"
        >
          ×
        </button>
      `;


      const checkbox =
        row.querySelector(
          "input"
        );


      checkbox.addEventListener(
        "change",
        () => {

          item.completed =
            checkbox.checked;

          saveShopping();

          renderShopping();

        }
      );


      row
        .querySelector(
          "button"
        )
        .addEventListener(
          "click",
          () => {

            shopping =
              shopping.filter(
                current =>
                  current.id !== item.id
              );

            saveShopping();

            renderShopping();

          }
        );


      list.appendChild(row);

    });

  });


  updateProgress();

}


function formatQuantity(item) {

  if (
    item.quantity === 0
  ) {
    return item.unit || "";
  }


  return `${item.quantity}${
    item.unit
      ? " " + item.unit
      : ""
  }`;

}


function updateProgress() {

  const total =
    shopping.length;


  const completed =
    shopping.filter(
      item =>
        item.completed
    ).length;


  const percentage =
    total
      ? Math.round(
          (completed / total) * 100
        )
      : 0;


  document
    .querySelectorAll(
      "#shopping-progress, #shopping-progress-full"
    )
    .forEach(bar => {

      bar.style.width =
        `${percentage}%`;

    });


  document
    .querySelectorAll(
      "#shopping-progress-text, #shopping-progress-text-full"
    )
    .forEach(text => {

      text.textContent =
        `${completed} of ${total} items completed`;

    });

}


/* =========================
   NAVIGATION
   ========================= */

function setupNavigation() {

  const buttons =
    document.querySelectorAll(
      ".nav-button"
    );


  const sections =
    document.querySelectorAll(
      ".page-section"
    );


  buttons.forEach(button => {

    button.addEventListener(
      "click",
      () => {

        const target =
          button.dataset.section;


        buttons.forEach(item => {

          item.classList.remove(
            "active"
          );

        });


        button.classList.add(
          "active"
        );


        sections.forEach(section => {

          section.classList.toggle(
            "hidden",
            section.id !== target
          );

        });


        if (
          target === "recipes"
        ) {
          renderMeals();
        }


        window.scrollTo({
          top: 0,
          behavior: "smooth"
        });

      }
    );

  });

}


/* =========================
   THEME
   ========================= */

function setupTheme() {

  const savedTheme =
    localStorage.getItem(
      "mealmate-theme"
    );


  if (
    savedTheme === "dark"
  ) {

    document.body.classList.add(
      "dark"
    );

  }

}


function toggleTheme() {

  document.body.classList.toggle(
    "dark"
  );


  const theme =
    document.body.classList.contains(
      "dark"
    )
      ? "dark"
      : "light";


  localStorage.setItem(
    "mealmate-theme",
    theme
  );

}


/* =========================
   HELPERS
   ========================= */

function escapeHtml(value) {

  const div =
    document.createElement(
      "div"
    );

  div.textContent =
    value;

  return div.innerHTML;

}


function escapeAttribute(value) {

  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

}


/* =========================
   START APP
   ========================= */

document.addEventListener(
  "DOMContentLoaded",
  () => {

    setupNavigation();

    setupTheme();

    renderPlanner();

    renderMeals();

    generateShoppingList();

  }
);
