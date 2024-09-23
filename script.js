const inputBox = document.getElementById("input-box");
const dueDateInput = document.getElementById("due-date");
const inProgressList = document.getElementById("in-progress-list");
const completedList = document.getElementById("completed-list");
const selectedIcon = document.getElementById("selected-icon");
let currentIcon = "fa-tasks";

document.querySelector(".dropdown-menu").addEventListener("click", function(e) {
    if (e.target.tagName === "I") {
        currentIcon = e.target.getAttribute("data-icon");
        selectedIcon.className = `fas ${currentIcon}`;
    }
});

function addTodo() {
    if (inputBox.value === '') {
        alert("You must write something!");
    } else {
        const li = createTaskElement(inputBox.value, currentIcon, dueDateInput.value);
        inProgressList.appendChild(li);
        inputBox.value = "";
        dueDateInput.value = "";
        saveData();
    }
}

function createTaskElement(taskText, iconClass, dueDate) {
    const li = document.createElement("li");
    
    const iconSpan = document.createElement("span");
    iconSpan.className = "task-icon";
    iconSpan.innerHTML = `<i class="fas ${iconClass}"></i>`;
    li.appendChild(iconSpan);
    
    const textSpan = document.createElement("span");
    textSpan.className = "task-text";
    textSpan.textContent = taskText;
    li.appendChild(textSpan);
    
    if (dueDate) {
        const dateSpan = document.createElement("span");
        dateSpan.className = "due-date";
        dateSpan.textContent = `Due: ${formatDate(dueDate)}`;
        li.appendChild(dateSpan);
    }
    
    const deleteSpan = document.createElement("span");
    deleteSpan.className = "delete-btn";
    deleteSpan.textContent = "\u00d7";
    li.appendChild(deleteSpan);

    li.addEventListener("click", function () {
        li.classList.toggle("checked");
        if (li.classList.contains("checked")) {
            completedList.appendChild(li);
        } else {
            inProgressList.appendChild(li);
        }
        saveData();
    });

    deleteSpan.addEventListener("click", function (event) {
        event.stopPropagation();
        li.remove();
        saveData();
    });

    return li;
}

function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

function saveData() {
    const inProgressTasks = Array.from(inProgressList.querySelectorAll("li")).map(li => ({
        text: li.querySelector(".task-text").textContent,
        icon: li.querySelector(".task-icon i").className.split(" ")[1],
        dueDate: li.querySelector(".due-date") ? li.querySelector(".due-date").textContent.replace("Due: ", "") : ""
    }));
    const completedTasks = Array.from(completedList.querySelectorAll("li")).map(li => ({
        text: li.querySelector(".task-text").textContent,
        icon: li.querySelector(".task-icon i").className.split(" ")[1],
        dueDate: li.querySelector(".due-date") ? li.querySelector(".due-date").textContent.replace("Due: ", "") : ""
    }));
    localStorage.setItem("inProgressData", JSON.stringify(inProgressTasks));
    localStorage.setItem("completedData", JSON.stringify(completedTasks));
}

function showTasks() {
    const inProgressTasks = JSON.parse(localStorage.getItem("inProgressData")) || [];
    const completedTasks = JSON.parse(localStorage.getItem("completedData")) || [];
    inProgressList.innerHTML = '';
    completedList.innerHTML = '';
    inProgressTasks.forEach(task => {
        const li = createTaskElement(task.text, task.icon, task.dueDate);
        inProgressList.appendChild(li);
    });
    completedTasks.forEach(task => {
        const li = createTaskElement(task.text, task.icon, task.dueDate);
        li.classList.add("checked");
        completedList.appendChild(li);
    });
}

showTasks();