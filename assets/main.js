let todos = localStorage.getItem("user_todos");

if (todos) {
  todos = JSON.parse(todos);
} else {
  todos = [];
}
const addUserTask = document.querySelector("#addUserTask");
const todoText = document.querySelector("#todoText");
const todoFindedItems = document.querySelector(".todo-finded-items");

todoText.addEventListener("keypress", function (event) {
  if (event.key === "Enter") {
    event.preventDefault();
    addTodo();
    todoText.focus();
  }
});
addUserTask.addEventListener("click", addTodo);

let draggedItemIndex;
let droppedItemIndex;
let isDragging = false;
let initialTouchElement = null;

function addTodo() {
  todoText.focus();
  const todoItem = {
    id: new Date().getTime(),
    text: "",
    description: "",
    start: new Date(),
    end: false,
    finishingTime: false,
    complete: false,
  };
  todoItem.text = todoText.value;
  todos.push(todoItem);

  saveTodos();
  todoDomMaker(todoItem);
  todoText.value = "";
}

function todoDomMaker(todoItem) {
  const todoDiv = document.createElement("div");
  todoDiv.classList.add("todo");
  todoDiv.setAttribute("draggable", true);
  const {
    grip,
    checkbox,
    checkBoxDiv,
    textInput,
    infoBtn,
    removeButton,
  } = createTodoItemElement(todoItem, "item_");
  todoDiv.appendChild(grip);
  todoDiv.appendChild(checkBoxDiv);
  todoDiv.appendChild(textInput);
  todoDiv.appendChild(infoBtn);
  todoDiv.appendChild(removeButton);
  const todosContainer = document.querySelector(".todos");
  todosContainer.appendChild(todoDiv);

  // listeners
  checkbox.addEventListener("change", () => {
    todoCheck(todoItem, checkbox, textInput, (isRefresh = false));
  });

  textInput.addEventListener("input", () => {
    todoItem.text = textInput.value;
    saveTodos();
  });
  textInput.addEventListener("mousedown", (e) => {
    todoDiv.setAttribute("draggable", false);
  });

  infoBtn.addEventListener("click", () => {
    todoInfoDomMaker(todoItem, todoDiv);
  });

  removeButton.addEventListener("click", () => {
    todos = todos.filter((item) => item.id !== todoItem.id);
    todoDiv.remove();
    saveTodos();
    closeInfoModal.click();
    closeSearchModal.click();
  });

  grip.addEventListener("mousedown", (e) => {
    e.preventDefault();
    isDragging = true;
    todoDiv.classList.add("dragging");
    todos.forEach((item, index) => {
      if (item.id == todoItem.id) {
        draggedItemIndex = index;
      }
    });
  });

  grip.addEventListener("mousemove", (e) => {
    e.preventDefault();
    if (isDragging) {
      todoDiv.style.border = "2px solid var(--secondary-color)";
    }
  });

  grip.addEventListener("mouseleave", (e) => {
    e.preventDefault();
    if (isDragging) {
      todoDiv.style.border = "";
    }
  });

  grip.addEventListener("mouseup", (e) => {
    if (isDragging) {
      droppedItem = e.target;
      todos.forEach((item, index) => {
        if (item.id == todoItem.id) {
          droppedItemIndex = index;
        }
      });

      changeIndex(todos, draggedItemIndex, droppedItemIndex);
      saveTodos();
      refresher();
      isDragging = false;
    }
  });

  grip.addEventListener("touchstart", (e) => {
    e.preventDefault();

    todoDiv.classList.add("dragging");
    todos.forEach((item, index) => {
      if (item.id == todoItem.id) {
        draggedItemIndex = index;
      }
    });
  });

  let previousTargetElement = null;

  grip.addEventListener("touchmove", (e) => {
    e.preventDefault();

    if (e.changedTouches && e.changedTouches.length > 0) {
      const touch = e.changedTouches[0];
      const currentTargetElement = document.elementFromPoint(
        touch.clientX,
        touch.clientY
      );

      if (previousTargetElement !== currentTargetElement) {
        if (
          previousTargetElement &&
          previousTargetElement.classList.contains("todo-grip")
        ) {
          previousTargetElement.parentElement.style.border = "";
        }

        if (
          currentTargetElement &&
          currentTargetElement.classList.contains("todo-grip")
        ) {
          currentTargetElement.parentElement.style.border =
            "2px solid var(--secondary-color)";
        }
        previousTargetElement = currentTargetElement;
      }
    }
  });

  grip.addEventListener("touchend", (e) => {
    let todoId;
    if (e.changedTouches && e.changedTouches.length > 0) {
      const touch = e.changedTouches[0];
      const targetElement = document.elementFromPoint(
        touch.clientX,
        touch.clientY
      );
      droppedItem = targetElement;
      todoId = targetElement.id.split("_")[1];
    }

    todos.forEach((item, index) => {
      if (item.id == todoId) {
        droppedItemIndex = index;
      }
    });

    changeIndex(todos, draggedItemIndex, droppedItemIndex);
    saveTodos();
    refresher();
  });

  return { todoDiv };
}

function createTodoItemElement(todoItem, checkId) {
  // The checkId, checkbox, and label are used with the same ID to ensure they are processed together and to avoid mixing with others.
  const grip = document.createElement("div");
  grip.classList.add("todo-grip");
  grip.id = "id_" + todoItem.id;
  const gripIcon = document.createElement("img");
  gripIcon.src = "assets/images/icons/grip-vertical-solid.svg";
  gripIcon.classList.add("todo-grip-icon");
  grip.appendChild(gripIcon);

  const checkBoxDiv = document.createElement("div");
  checkBoxDiv.classList.add("todo-checkbox");
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.classList.add("todo-check");
  checkbox.checked = todoItem.complete;
  checkbox.id = checkId + todoItem.id;
  const label = document.createElement("label");
  label.htmlFor = checkId + todoItem.id;
  checkBoxDiv.appendChild(checkbox);
  checkBoxDiv.appendChild(label);

  const textInput = document.createElement("input");
  textInput.type = "text";
  textInput.classList.add("todo-text");
  textInput.value = todoItem.text;
  textInput.style.textDecoration = todoItem.complete
    ? "line-through"
    : "none";

  const infoBtn = document.createElement("button");
  infoBtn.classList.add("todo-info");
  const infoIcon = document.createElement("img");
  infoIcon.src = "assets/images/icons/circle-info-solid.svg";
  infoIcon.classList.add("todo-info-img");
  infoBtn.appendChild(infoIcon);

  const removeButton = document.createElement("button");
  removeButton.classList.add("todo-remove");
  const removeIcon = document.createElement("img");
  removeIcon.src = "assets/images/icons/trash-solid.svg";
  removeIcon.classList.add("todo-remove-img");
  removeButton.appendChild(removeIcon);

  return {
    checkbox,
    label,
    checkBoxDiv,
    textInput,
    infoBtn,
    removeButton,
    grip,
  };
}

function saveTodos() {
  const save = JSON.stringify(todos);

  localStorage.setItem("user_todos", save);
}

function displayTodos() {
  if (todos) {
    todos.map((todo) => {
      todoDomMaker(todo);
    });
  }
}

displayTodos();

function finishingTimeCalculator(start, end) {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const diff = endDate - startDate;

  const day = Math.floor(diff / 1000 / 60 / 60 / 24);
  const hour = Math.floor(diff / 1000 / 60 / 60) % 24;
  const minute = Math.floor(diff / 1000 / 60) % 60;
  const second = Math.floor(diff / 1000) % 60;

  let parts = [];
  if (day > 0) parts.push(`${day} day${day > 1 ? "s" : ""}`);
  if (hour > 0) parts.push(`${hour} hour${hour > 1 ? "s" : ""}`);
  if (minute > 0) parts.push(`${minute} minute${minute > 1 ? "s" : ""}`);
  if (second > 0) parts.push(`${second} second${second > 1 ? "s" : ""}`);

  let finishingTime = parts.join(", ");
  return finishingTime;
}

// SEARCH MODAL
const todoSearch = document.querySelector("#todoSearch");
const todoSearchModal = document.querySelector(".todo-search-modal");
const userSearchInput = document.querySelector("#userSearchInput");

const closeSearchModal = document.querySelector("#closeSearchModal");
const closeInfoModal = document.querySelector("#closeInfoModal");

closeSearchModal.addEventListener("click", () => {
  // Ensure all elements are removed to prevent them from overlapping due to stacking.
  refresher()
  // To ensure the search modal is cleared when reopened, previously entered data were persisting.
  while (todoFindedItems.firstChild) {
    todoFindedItems.removeChild(todoFindedItems.firstChild);
  }
  userSearchInput.value = "";
  todoSearchModal.style.display = "none";
});

closeInfoModal.addEventListener("click", () => {
  if(todoSearchModal.style.display=="block"){
    closeSearchModal.click()
  }
  /// To ensure the info modal is cleared when reopened, previously entered data were persisting.
  const todoInfoModal = document.querySelector(".todo-info-modal");
  const todoInfoDetails = document.querySelector(".todo-info-details");
  refresher()

  // To ensure the search modal is cleared when reopened, previously entered data were persisting.
  while (todoInfoDetails.firstChild) {
    todoInfoDetails.removeChild(todoInfoDetails.firstChild);
  }
  todoInfoModal.style.display = "none";

});

todoSearch.addEventListener("click", (e) => {
  todoSearchModal.style.display = "block";
  userSearchInput.focus();
});

function todoFinder(userInput) {
  let results = todos.filter((todo) =>
    todo.text.toLowerCase().includes(userInput.toLowerCase())
  );
  displaySearchedItems(results);
}

function displaySearchedItems(items) {
  items.map((todo) => {
    todoSearchDomMaker(todo);
  });
}

userSearchInput.addEventListener("input", (e) => {
  while (todoFindedItems.firstChild) {
    todoFindedItems.removeChild(todoFindedItems.firstChild);
  }

  if (userSearchInput.value) {
    todoFinder(userSearchInput.value);
  } else {
    return;
  }
});

function todoSearchDomMaker(todoItem) {
  const todoDiv = document.createElement("div");
  todoDiv.classList.add("todo");

  const {
    checkbox,
    checkBoxDiv,
    textInput,
    infoBtn,
    removeButton,
    grip,
  } = createTodoItemElement(todoItem, "search_");

  todoDiv.appendChild(checkBoxDiv);
  todoDiv.appendChild(textInput);
  todoDiv.appendChild(infoBtn);
  todoDiv.appendChild(removeButton);

  todoFindedItems.appendChild(todoDiv);

  checkbox.addEventListener("change", () => {
    todoCheck(todoItem, checkbox, textInput, (isRefresh = true));
  });

  textInput.addEventListener("input", () => {
    todoItem.text = textInput.value;
    saveTodos();
    refresher();
  });

  infoBtn.addEventListener("click", () => {
    todoInfoDomMaker(todoItem, todoDiv);
  });

  removeButton.addEventListener("click", () => {
    todos = todos.filter((item) => item.id !== todoItem.id);
    todoDiv.remove();
    saveTodos();
    refresher();
  });

  return { todoDiv };
}
// Ensure all elements are removed to prevent them from overlapping due to stacking.
function refresher() {
  const todosContainer = document.querySelector(".todos");
  while (todosContainer.firstChild) {
    todosContainer.removeChild(todosContainer.firstChild);
  }
  displayTodos();
}

function changeIndex(arr, currentIndex, targetIndex) {
  if (currentIndex !== -1 && currentIndex !== targetIndex) {
    let removed = arr.splice(currentIndex, 1);
    arr.splice(targetIndex, 0, removed[0]);
  }
}

// Like "April 15, 2024"
function formatDateString(dateTimeString) {
  const date = new Date(dateTimeString);
  const optionsDate = { day: "2-digit", month: "long", year: "numeric" };
  return date.toLocaleDateString("en-US", optionsDate);
}

// Like "11:48"
function formatTimeString(dateTimeString) {
  const date = new Date(dateTimeString);
  const optionsTime = {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  };
  return date.toLocaleTimeString("en-US", optionsTime);
}

function todoInfoDomMaker(todoItem, todoDiv) {
  const todoInfoModal = document.querySelector(".todo-info-modal");
  todoInfoModal.style.display = "block";

  const todoInfoDetails = document.querySelector(".todo-info-details");
  const todoInfoDiv = document.createElement("div");

  todoInfoDiv.classList.add("todo");

  const { checkbox, checkBoxDiv, textInput } = createTodoItemElement(
    todoItem,
    "info_"
  );

  todoInfoDiv.appendChild(checkBoxDiv);
  todoInfoDiv.appendChild(textInput);

  todoInfoDetails.append(todoInfoDiv);

  const todoInfoTime = document.createElement("div");
  todoInfoTime.classList.add("todo-info-time");

  const todoStartEnd = document.createElement("div");
  todoStartEnd.classList.add("todo-info-start-end");

  const todoStart = document.createElement("div");
  todoStart.classList.add("todo-info-start");

  const todoStartHead = document.createElement("h3");
  todoStartHead.textContent = "Start";

  const todoStartDate = document.createElement("span");
  todoStartDate.textContent = formatDateString(todoItem.start);

  const todoStartOptionsTime = document.createElement("span");
  todoStartOptionsTime.textContent = formatTimeString(todoItem.start);

  todoStart.append(todoStartHead);
  todoStart.append(todoStartDate);
  todoStart.append(todoStartOptionsTime);

  const todoEnd = document.createElement("div");
  todoEnd.classList.add("todo-info-start");

  const todoEndHead = document.createElement("h3");
  todoEndHead.textContent = "End";
  todoEnd.append(todoEndHead);

  const todoEndDate = document.createElement("span");
  const todoEndOptionsTime = document.createElement("span");

  if (todoItem.end) {
    todoEndDate.textContent = formatDateString(todoItem.end);
    todoEndOptionsTime.textContent = formatTimeString(todoItem.end);
  } else {
    todoEndDate.textContent = "Not yet finished";
    todoEndOptionsTime.textContent = "";
  }

  todoEnd.append(todoEndDate);
  todoEnd.append(todoEndOptionsTime);

  const todoDuration = document.createElement("div");
  todoDuration.classList.add("todo-info-duration");
  todoDuration.textContent = todoItem.end
    ? `It was finished in ${todoItem.finishingTime}.`
    : `It hasn't been finished for ${finishingTimeCalculator(
        todoItem.start,
        new Date()
      )}.`;

  todoStartEnd.append(todoStart);
  todoStartEnd.append(todoEnd);

  todoInfoTime.append(todoStartEnd);
  todoInfoTime.append(todoDuration);

  const todoDescription = document.createElement("div");
  todoDescription.classList.add("todo-description");
  const todoDescriptionHead = document.createElement("h3");
  todoDescriptionHead.textContent = "Description";

  const todoDescriptionText = document.createElement("textarea");
  todoDescriptionText.id = "todoDescription";
  todoDescriptionText.className = "todo-description-text";
  todoDescriptionText.cols = "30";
  todoDescriptionText.rows = "5";
  todoDescriptionText.placeholder = "Your Text";
  todoDescriptionText.setAttribute("autocomplete", "off");
  todoDescriptionText.value = todoItem.description
    ? todoItem.description
    : "";
  todoDescription.append(todoDescriptionHead);
  todoDescription.append(todoDescriptionText);

  const todoInfoRemoveButton = document.createElement("button");
  todoInfoRemoveButton.classList.add("todo-info-remove-button");

  const todoInfoRemoveIcon = document.createElement("img");
  todoInfoRemoveIcon.src = "assets/images/icons/trash-can-solid.svg";
  todoInfoRemoveIcon.classList.add("todo-info-remove-img");

  todoInfoRemoveButton.append(todoInfoRemoveIcon);

  todoInfoDetails.append(todoInfoTime);
  todoInfoDetails.append(todoDescription);
  todoInfoDetails.append(todoInfoRemoveButton);

  checkbox.addEventListener("change", () => {
    todoCheck(todoItem, checkbox, textInput, (isRefresh = true));
    if (todoItem.end) {
      todoEndDate.textContent = formatDateString(todoItem.end);
      todoEndOptionsTime.textContent = formatTimeString(todoItem.end);
    } else {
      todoEndDate.textContent = "Not yet finished";
      todoEndOptionsTime.textContent = "";
    }
    todoDuration.textContent = todoItem.end
      ? `It was finished in ${todoItem.finishingTime}.`
      : `It hasn't been finished for ${finishingTimeCalculator(
          todoItem.start,
          new Date()
        )}.`;
  });
  textInput.addEventListener("input", () => {
    todoItem.text = textInput.value;
    saveTodos();
    refresher();
  });
  todoDescriptionText.addEventListener("input", () => {
    todoItem.description = todoDescriptionText.value;
    saveTodos();
    refresher();
  });

  todoInfoRemoveButton.addEventListener("click", () => {
    todos = todos.filter((item) => item.id !== todoItem.id);
    todoDiv.remove();
    saveTodos();
    refresher();
    closeInfoModal.click();
  });

  saveTodos();
  refresher();
}

function todoCheck(todoItem, checkbox, textInput, isRefresh) {
  todoItem.complete = checkbox.checked;
  if (todoItem.complete) {
    textInput.style.textDecoration = "line-through";
    todoItem.end = new Date();

    todoItem.finishingTime = finishingTimeCalculator(
      todoItem.start,
      todoItem.end
    );
  } else {
    textInput.style.textDecoration = "none";
    todoItem.end = false;
    todoItem.finishingTime = false;
  }
  saveTodos();
  isRefresh ? refresher() : null;
}