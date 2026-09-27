document.addEventListener("DOMContentLoaded", () => {
  initApp();
});


/* =========================
   CONSTANTS
   ========================= */

const days = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday"
];


const foodGroups = [
  {
    id: "protein",
    name: "Protein",
    emoji: "🥩"
  },
  {
    id: "carbs",
    name: "Carbs",
    emoji: "🍞"
  },
  {
    id: "dairy",
    name: "Dairy",
    emoji: "🥛"
  },
  {
    id: "fruit-veg",
    name: "Fruit & Veg",
    emoji: "🍎"
  },
  {
    id: "drinks",
    name: "Drinks",
    emoji: "🥤"
  },
  {
    id: "snacks",
    name: "Snacks",
    emoji: "🍿"
  }
];


/* =========================
   DEFAULT DATA
   ========================= */

const defaultMeals = [
  {
    id: "meal-chicken-curry",
    title: "Chicken Curry",
    emoji: "🍛",
    description: "A quick and comforting curry.",
    ingredients: [
      {
        name: "Chicken",
        quantity: 500,
        unit: "g",
        group: "protein"
      },
      {
        name: "Rice",
        quantity: 300,
        unit: "g",
        group: "carbs"
      },
      {
        name: "Onion",
        quantity: 1,
        unit: "each",
        group: "fruit-veg"
      },
      {
        name: "Milk",
        quantity: 200,
        unit: "ml",
        group: "dairy"
      }
    ]
  }
];


const defaultWeekPlan = {
  Monday: "meal-chicken-curry",
  Tuesday: null,
  Wednesday: null,
  Thursday: null,
  Friday: null,
  Saturday: null,
  Sunday: null
};


/* =========================
   STATE
   ========================= */

let meals = loadMeals();

let weekPlan = loadWeekPlan();

let shopping = loadShopping();


/* =========================
   INITIALISE
   ========================= */

function initApp() {

  setupNavigation();

  renderPlanner();

  renderMeals();

  generateShoppingList();

  setupTheme();

}


/* =========================
   STORAGE
   ========================= */

function loadMeals() {

  try {

    const saved = JSON.parse(
      localStorage.getItem("mealmate-meals")
    );

    if (!Array.isArray(saved)) {
      return structuredClone(defaultMeals);
    }

    return saved.map(meal => ({
      ...meal,

      ingredients: Array.isArray(meal.ingredients)
        ? meal.ingredients.map(ingredient => ({
            name: String(ingredient.name || ""),
            quantity: Number(ingredient.quantity) || 0,
            unit: String(ingredient.unit || "each"),
            group: String(
              ingredient.group || "fruit-veg"
            )
          }))
        : []
    }));

  } catch (error) {

    console.error(
      "Could not load meals:",
      error
    );

    return structuredClone(defaultMeals);
  }
}


function loadWeekPlan() {

  try {

    const saved = JSON.parse(
      localStorage.getItem("mealmate-week")
    );

    if (!saved || typeof saved !== "object") {
      return { ...defaultWeekPlan };
    }

    return {
      ...defaultWeekPlan,
      ...saved
    };

  } catch (error) {

    console.error(
      "Could not load week plan:",
      error
    );

    return { ...defaultWeekPlan };
  }
}


function loadShopping() {

  try {

    const saved = JSON.parse(
      localStorage.getItem("mealmate-shopping")
    );

    if (!Array.isArray(saved)) {
      return [];
    }

    return saved;

  } catch (error) {

    console.error(
      "Could not load shopping list:",
      error
    );

    return [];
  }
}


function saveMeals() {

  localStorage.setItem(
    "mealmate-meals",
    JSON.stringify(meals)
  );
}


function saveWeekPlan() {

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
   NAVIGATION
   ========================= */

function setupNavigation() {

  const buttons =
    document.querySelectorAll(".nav-button");

  const sections =
    document.querySelectorAll(".page-section");


  buttons.forEach(button => {

    button.addEventListener("click", () => {

      const target =
        button.dataset.section;


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

    });

  });
}


/* =========================
   PLANNER
   ========================= */

function renderPlanner() {

  const weekGrid =
    document.querySelector(".week-grid");

  if (!weekGrid) return;


  weekGrid.innerHTML = "";


  days.forEach(day => {

    const mealId =
      weekPlan[day];

    const meal =
      meals.find(item => item.id === mealId);


    const card =
      document.createElement("article");

    card.className = "day-card";


    if (!meal) {

      card.classList.add("empty-day");

      card.innerHTML = `
        <div class="day-header">
          <strong>${day}</strong>
        </div>

        <div class="day-empty">
          <span>+</span>
          <p>No meal planned</p>
        </div>
      `;

    } else {

      card.innerHTML = `
        <div class="day-header">
          <strong>${day}</strong>
        </div>

        <div class="day-meal">

          <div class="meal-emoji">
            ${meal.emoji || "🍽️"}
          </div>

          <div>
            <h3>${escapeHtml(meal.title)}</h3>

            <p>
              ${meal.ingredients.length}
              ingredient${meal.ingredients.length === 1 ? "" : "s"}
            </p>
          </div>

        </div>
      `;

    }


    card.addEventListener(
      "click",
      () => openDayMeal(day)
    );


    weekGrid.appendChild(card);

  });


  updateTonightCard();
}


/* =========================
   DAY / MEAL ASSIGNMENT
   ========================= */

function openDayMeal(day) {

  const mealId =
    weekPlan[day];


  if (mealId) {

    const meal =
      meals.find(item => item.id === mealId);

    if (meal) {

      openEditMealModal(
        meal,
        day
      );

      return;
    }

  }


  openMealModal(day);
}


/* =========================
   TONIGHT CARD
   ========================= */

function updateTonightCard() {

  const today =
    new Date().toLocaleDateString(
      "en-GB",
      { weekday: "long" }
    );


  const mealId =
    weekPlan[today];


  const meal =
    meals.find(item => item.id === mealId);


  const tonightCard =
    document.querySelector(".tonight-card");


  if (!tonightCard) return;


  const title =
    tonightCard.querySelector("h2");

  const description =
    tonightCard.querySelector(".muted");

  const emoji =
    tonightCard.querySelector(".big-food");


  if (!meal) {

    if (title) {
      title.textContent = "Nothing planned";
    }

    if (description) {
      description.textContent =
        "You haven't planned a meal for tonight yet.";
    }

    if (emoji) {
      emoji.textContent = "🍽️";
    }

    return;
  }


  if (title) {
    title.textContent =
      meal.title;
  }

  if (description) {
    description.textContent =
      meal.description ||
      "A delicious meal planned for tonight.";
  }

  if (emoji) {
    emoji.textContent =
      meal.emoji || "🍽️";
  }

}


/* =========================
   MEAL LIBRARY
   ========================= */

function renderMeals() {

  const recipeGrid =
    document.querySelector(".recipe-grid");

  if (!recipeGrid) return;


  recipeGrid.innerHTML = "";


  if (meals.length === 0) {

    recipeGrid.innerHTML = `
      <div class="card">
        <h3>No meals yet</h3>
        <p class="muted">
          Create your first meal to get started.
        </p>
      </div>
    `;

    return;
  }


  meals.forEach(meal => {

    const card =
      document.createElement("article");

    card.className =
      "card recipe-card";


    const ingredientText =
      meal.ingredients
        .map(item =>
          `${item.name} (${item.quantity}${item.unit})`
        )
        .join(", ");


    card.innerHTML = `
      <div class="card-title">

        <div>
          <span class="eyebrow">
            MEAL
          </span>

          <h2>
            ${escapeHtml(meal.title)}
          </h2>
        </div>

        <span class="big-food">
          ${meal.emoji || "🍽️"}
        </span>

      </div>

      <p class="muted">
        ${escapeHtml(
          meal.description ||
          "Custom Meal"
        )}
      </p>

      <p class="muted">
        ${escapeHtml(ingredientText)}
      </p>

      <div class="meal-card-actions">

        <button
          class="secondary-button"
          type="button"
          data-action="edit"
        >
          Edit
        </button>

        <button
          class="delete-meal-button"
          type="button"
          data-action="delete"
        >
          Delete
        </button>

      </div>
    `;


    const editButton =
      card.querySelector(
        '[data-action="edit"]'
      );

    const deleteButton =
      card.querySelector(
        '[data-action="delete"]'
      );


    editButton.addEventListener(
      "click",
      () => openEditMealModal(meal)
    );


    deleteButton.addEventListener(
      "click",
      () => deleteMeal(meal.id)
    );


    recipeGrid.appendChild(card);

  });

}


/* =========================
   MEAL MODAL
   ========================= */

let editingMealId = null;

let editingMealDay = null;


function openMealModal(day = "Monday") {

  editingMealId = null;

  editingMealDay = null;


  const modal =
    document.getElementById(
      "meal-modal"
    );


  const titleInput =
    document.getElementById(
      "meal-title"
    );


  const daySelect =
    document.getElementById(
      "meal-day"
    );


  const ingredientList =
    document.getElementById(
      "ingredient-list"
    );


  if (!modal) return;


  modal.querySelector(
    ".eyebrow"
  ).textContent = "NEW MEAL";


  modal.querySelector(
    "h2"
  ).textContent = "Create a meal";


  titleInput.value = "";


  daySelect.value =
    days.includes(day)
      ? day
      : "Monday";


  ingredientList.innerHTML = "";


  addIngredientRow();


  modal.classList.remove("hidden");

  modal.setAttribute(
    "aria-hidden",
    "false"
  );


  setTimeout(() => {
    titleInput.focus();
  }, 50);

}


function openEditMealModal(
  meal,
  day = null
) {

  editingMealId =
    meal.id;

  editingMealDay =
    day;


  const modal =
    document.getElementById(
      "meal-modal"
    );


  const titleInput =
    document.getElementById(
      "meal-title"
    );


  const daySelect =
    document.getElementById(
      "meal-day"
    );


  const ingredientList =
    document.getElementById(
      "ingredient-list"
    );


  if (!modal) return;


  modal.querySelector(
    ".eyebrow"
  ).textContent = "EDIT MEAL";


  modal.querySelector(
    "h2"
  ).textContent = "Edit meal";


  titleInput.value =
    meal.title;


  const assignedDay =
    day ||
    days.find(
      item => weekPlan[item] === meal.id
    );


  daySelect.value =
    assignedDay || "Monday";


  ingredientList.innerHTML = "";


  if (
    Array.isArray(
      meal.ingredients
    ) &&
    meal.ingredients.length > 0
  ) {

    meal.ingredients.forEach(
      ingredient => {

        addIngredientRow(
          ingredient
        );

      }
    );

  } else {

    addIngredientRow();

  }


  modal.classList.remove(
    "hidden"
  );

  modal.setAttribute(
    "aria-hidden",
    "false"
  );


  setTimeout(() => {
    titleInput.focus();
  }, 50);

}


function closeMealModal() {

  const modal =
    document.getElementById(
      "meal-modal"
    );


  if (!modal) return;


  modal.classList.add(
    "hidden"
  );

  modal.setAttribute(
    "aria-hidden",
    "true"
  );


  editingMealId = null;

  editingMealDay = null;

}


/* =========================
   INGREDIENT ROWS
   ========================= */

function addIngredientRow(
  existing = null
) {

  const list =
    document.getElementById(
      "ingredient-list"
    );


  if (!list) return;


  const row =
    document.createElement("div");


  row.className =
    "ingredient-row";


  const group =
    existing?.group ||
    "fruit-veg";


  row.innerHTML = `

    <input
      type="text"
      class="ingredient-name"
      placeholder="Ingredient"
      value="${escapeAttribute(
        existing?.name || ""
      )}"
    >

    <input
      type="number"
      class="ingredient-quantity"
      min="0"
      step="any"
      placeholder="Qty"
      value="${existing?.quantity ?? ""}"
    >

    <select class="ingredient-unit">

      <option value="each">
        Each
      </option>

      <option value="g">
        g
      </option>

      <option value="kg">
        kg
      </option>

      <option value="ml">
        ml
      </option>

      <option value="l">
        l
      </option>

      <option value="pack">
        Pack
      </option>

      <option value="tin">
        Tin
      </option>

      <option value="bottle">
        Bottle
      </option>

    </select>

    <select class="ingredient-group">

      ${foodGroups.map(foodGroup => `
        <option
          value="${foodGroup.id}"
          ${group === foodGroup.id ? "selected" : ""}
        >
          ${foodGroup.emoji} ${foodGroup.name}
        </option>
      `).join("")}

    </select>

    <button
      type="button"
      class="remove-ingredient"
      aria-label="Remove ingredient"
    >
      ×
    </button>

  `;


  const unitSelect =
    row.querySelector(
      ".ingredient-unit"
    );


  if (existing?.unit) {
    unitSelect.value =
      existing.unit;
  }


  const groupSelect =
    row.querySelector(
      ".ingredient-group"
    );


  /*
   * Explicitly set the selected
   * group after creating the
   * select. This makes the
   * selected value display
   * correctly in the browser.
   */

  groupSelect.value =
    group;


  row.querySelector(
    ".remove-ingredient"
  ).addEventListener(
    "click",
    () => {

      row.remove();

    }
  );


  list.appendChild(row);

}


/* =========================
   SAVE MEAL
   ========================= */

function saveNewMeal() {

  const titleInput =
    document.getElementById(
      "meal-title"
    );


  const daySelect =
    document.getElementById(
      "meal-day"
    );


  const ingredientRows =
    document.querySelectorAll(
      "#ingredient-list .ingredient-row"
    );


  const title =
    titleInput.value.trim();


  if (!title) {

    alert(
      "Please enter a meal title."
    );

    titleInput.focus();

    return;
  }


  const ingredients = [];


  ingredientRows.forEach(row => {

    const name =
      row.querySelector(
        ".ingredient-name"
      ).value.trim();


    if (!name) return;


    const quantity =
      Number(
        row.querySelector(
          ".ingredient-quantity"
        ).value
      );


    const unit =
      row.querySelector(
        ".ingredient-unit"
      ).value;


    const group =
      row.querySelector(
        ".ingredient-group"
      ).value;


    ingredients.push({

      name,

      quantity:
        Number.isFinite(quantity)
          ? quantity
          : 0,

      unit,

      group

    });

  });


  if (ingredients.length === 0) {

    alert(
      "Please add at least one ingredient."
    );

    return;
  }


  const selectedDay =
    daySelect.value;


  if (editingMealId) {

    updateExistingMeal(
      title,
      ingredients,
      selectedDay
    );

  } else {

    const newMeal = {

      id:
        `meal-${Date.now()}`,

      title,

      emoji: "🍽️",

      description:
        "A custom meal added to MealMate.",

      ingredients

    };


    meals.push(
      newMeal
    );


    weekPlan[selectedDay] =
      newMeal.id;

  }


  saveMeals();

  saveWeekPlan();


  closeMealModal();


  renderPlanner();

  renderMeals();

  generateShoppingList();

}


/* =========================
   UPDATE MEAL
   ========================= */

function updateExistingMeal(
  title,
  ingredients,
  selectedDay
) {

  const meal =
    meals.find(
      item => item.id === editingMealId
    );


  if (!meal) return;


  meal.title =
    title;


  meal.ingredients =
    ingredients;


  days.forEach(day => {

    if (
      weekPlan[day] ===
      editingMealId
    ) {

      weekPlan[day] = null;

    }

  });


  weekPlan[selectedDay] =
    editingMealId;

}


/* =========================
   DELETE MEAL
   ========================= */

function deleteMeal(
  mealId
) {

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

  saveWeekPlan();


  renderPlanner();

  renderMeals();

  generateShoppingList();

}


/* =========================
   SHOPPING LIST GENERATION
   ========================= */

function generateShoppingList() {

  const aggregated = {};


  days.forEach(day => {

    const mealId =
      weekPlan[day];


    if (!mealId) return;


    const meal =
      meals.find(
        item => item.id === mealId
      );


    if (
      !meal ||
      !Array.isArray(meal.ingredients)
    ) {
      return;
    }


    meal.ingredients.forEach(
      ingredient => {

        const name =
          String(
            ingredient.name || ""
          ).trim();


        if (!name) return;


        const unit =
          String(
            ingredient.unit || ""
          ).trim();


        const group =
          String(
            ingredient.group ||
            "fruit-veg"
          );


        const key =
          `${name.toLowerCase()}|${unit.toLowerCase()}|${group}`;


        if (!aggregated[key]) {

          aggregated[key] = {

            id:
              `ingredient-${Object.keys(
                aggregated
              ).length}`,

            name,

            quantity: 0,

            unit,

            group,

            source: "meal"

          };

        }


        const quantity =
          Number(
            ingredient.quantity
          );


        if (
          Number.isFinite(quantity)
        ) {

          aggregated[key]
            .quantity += quantity;

        }

      }
    );

  });


  const manualItems =
    shopping.filter(
      item =>
        item.source === "manual"
    );


  const previous =
    new Map(
      shopping.map(item => [

        `${String(
          item.name || ""
        ).toLowerCase()}|${String(
          item.unit || ""
        ).toLowerCase()}|${String(
          item.group || ""
        )}`,

        item

      ])
    );


  const generatedItems =
    Object.values(
      aggregated
    ).map(item => {

      const key =
        `${item.name.toLowerCase()}|${item.unit.toLowerCase()}|${item.group}`;


      const oldItem =
        previous.get(key);


      return {

        ...item,

        completed:
          oldItem
            ? Boolean(
                oldItem.completed
              )
            : false

      };

    });


  shopping = [
    ...generatedItems,
    ...manualItems
  ];


  saveShopping();

  renderShopping();

}


/* =========================
   SHOPPING RENDERING
   ========================= */

function renderShopping() {

  renderShoppingList(
    document.getElementById(
      "shopping-list"
    )
  );


  renderShoppingList(
    document.getElementById(
      "shopping-list-full"
    )
  );


  updateShoppingProgress(
    "shopping-progress",
    "shopping-progress-text"
  );


  updateShoppingProgress(
    "shopping-progress-full",
    "shopping-progress-text-full"
  );

}


function renderShoppingList(
  container
) {

  if (!container) return;


  container.innerHTML = "";


  if (shopping.length === 0) {

    container.innerHTML = `
      <div class="empty-shopping">
        <p>No shopping items yet.</p>
      </div>
    `;

    return;
  }


  foodGroups.forEach(
    foodGroup => {

      const items =
        shopping.filter(
          item =>
            (
              item.group ||
              "fruit-veg"
            ) === foodGroup.id
        );


      if (items.length === 0) {
        return;
      }


      const group =
        document.createElement(
          "div"
        );


      group.className =
        "shopping-group";


      group.innerHTML = `

        <div class="shopping-group-header">

          <h3>
            ${foodGroup.emoji}
            ${foodGroup.name}
          </h3>

          <span>
            ${items.length}
          </span>

        </div>

        <div class="shopping-group-items"></div>

      `;


      const itemContainer =
        group.querySelector(
          ".shopping-group-items"
        );


      items.forEach(item => {

        const row =
          createShoppingItem(
            item
          );


        itemContainer.appendChild(
          row
        );

      });


      container.appendChild(
        group
      );

    }
  );

}


function createShoppingItem(
  item
) {

  const row =
    document.createElement(
      "div"
    );


  row.className =
    "shopping-item";


  if (item.completed) {

    row.classList.add(
      "completed"
    );

  }


  row.innerHTML = `

    <label class="shopping-checkbox">

      <input
        type="checkbox"
        ${item.completed ? "checked" : ""}
      >

      <span></span>

    </label>

    <div class="shopping-item-content">

      <strong>
        ${escapeHtml(item.name)}
      </strong>

      <span>
        ${formatQuantity(item.quantity)}
        ${escapeHtml(item.unit)}
      </span>

    </div>

    <button
      type="button"
      class="delete-shopping-item"
      aria-label="Delete item"
      title="Remove item"
    >
      ×
    </button>

  `;


  const checkbox =
    row.querySelector(
      'input[type="checkbox"]'
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


  /*
   * Every shopping item,
   * including meal-generated
   * items, can now be removed.
   */

  const deleteButton =
    row.querySelector(
      ".delete-shopping-item"
    );


  deleteButton.addEventListener(
    "click",
    () => {

      shopping =
        shopping.filter(
          shoppingItem =>
            shoppingItem !== item
        );


      saveShopping();

      renderShopping();

    }
  );


  return row;

}


/* =========================
   SHOPPING PROGRESS
   ========================= */

function updateShoppingProgress(
  progressId,
  textId
) {

  const progress =
    document.getElementById(
      progressId
    );


  const text =
    document.getElementById(
      textId
    );


  if (!progress || !text) {
    return;
  }


  const total =
    shopping.length;


  const completed =
    shopping.filter(
      item => item.completed
    ).length;


  const percentage =
    total === 0
      ? 0
      : Math.round(
          (completed / total) * 100
        );


  progress.style.width =
    `${percentage}%`;


  text.textContent =
    `${completed} of ${total} items completed`;

}


/* =========================
   MANUAL SHOPPING MODAL
   ========================= */

function addShoppingItemPrompt() {

  const modal =
    document.getElementById(
      "shopping-item-modal"
    );


  const nameInput =
    document.getElementById(
      "shopping-item-name"
    );


  const quantityInput =
    document.getElementById(
      "shopping-item-quantity"
    );


  const unitSelect =
    document.getElementById(
      "shopping-item-unit"
    );


  const groupSelect =
    document.getElementById(
      "shopping-item-group"
    );


  if (!modal) return;


  nameInput.value = "";

  quantityInput.value = "";

  unitSelect.value = "each";

  groupSelect.value =
    "fruit-veg";


  modal.classList.remove(
    "hidden"
  );


  modal.setAttribute(
    "aria-hidden",
    "false"
  );


  setTimeout(() => {
    nameInput.focus();
  }, 50);

}


function closeShoppingItemModal() {

  const modal =
    document.getElementById(
      "shopping-item-modal"
    );


  if (!modal) return;


  modal.classList.add(
    "hidden"
  );


  modal.setAttribute(
    "aria-hidden",
    "true"
  );

}


function saveShoppingItem() {

  const nameInput =
    document.getElementById(
      "shopping-item-name"
    );


  const quantityInput =
    document.getElementById(
      "shopping-item-quantity"
    );


  const unitSelect =
    document.getElementById(
      "shopping-item-unit"
    );


  const groupSelect =
    document.getElementById(
      "shopping-item-group"
    );


  const name =
    nameInput.value.trim();


  if (!name) {

    alert(
      "Please enter an item."
    );

    nameInput.focus();

    return;
  }


  const quantity =
    Number(
      quantityInput.value
    );


  shopping.push({

    id:
      `manual-${Date.now()}`,

    name,

    quantity:
      Number.isFinite(quantity)
        ? quantity
        : 1,

    unit:
      unitSelect.value,

    group:
      groupSelect.value,

    source:
      "manual",

    completed:
      false

  });


  saveShopping();

  closeShoppingItemModal();

  renderShopping();

}


/* =========================
   THEME
   ========================= */

function setupTheme() {

  const savedTheme =
    localStorage.getItem(
      "mealmate-theme"
    );


  if (savedTheme === "dark") {

    document.body.classList.add(
      "dark"
    );

  }

}


function toggleTheme() {

  document.body.classList.toggle(
    "dark"
  );


  const isDark =
    document.body.classList.contains(
      "dark"
    );


  localStorage.setItem(
    "mealmate-theme",
    isDark
      ? "dark"
      : "light"
  );

}


/* =========================
   HELPERS
   ========================= */

function formatQuantity(
  quantity
) {

  if (
    Number.isInteger(quantity)
  ) {

    return String(quantity);

  }


  return Number(
    quantity
  ).toFixed(2)
    .replace(/\.00$/, "")
    .replace(/(\.\d)0$/, "$1");

}


function escapeHtml(
  value
) {

  return String(value)
    .replace(
      /&/g,
      "&amp;"
    )
    .replace(
      /</g,
      "&lt;"
    )
    .replace(
      />/g,
      "&gt;"
    )
    .replace(
      /"/g,
      "&quot;"
    )
    .replace(
      /'/g,
      "&#039;"
    );

}


function escapeAttribute(
  value
) {

  return escapeHtml(
    value
  );

}


/* =========================
   KEYBOARD SUPPORT
   ========================= */

document.addEventListener(
  "keydown",
  event => {

    if (
      event.key !== "Escape"
    ) {
      return;
    }


    closeMealModal();

    closeShoppingItemModal();

  }
);
