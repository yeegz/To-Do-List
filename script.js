const inputBox = document.getElementById("input-box");
const inProgressList = document.getElementById("in-progress-list");
const completedList = document.getElementById("completed-list");

function addTodo() {
    if (inputBox.value === '') {
        alert("You must write something!");
    } else {
        const li = createTaskElement(inputBox.value);
        inProgressList.appendChild(li);
        inputBox.value = "";
        saveData();
    }
}

function createTaskElement(taskText) {
    const li = document.createElement("li");
    li.textContent = taskText;
    const span = document.createElement("span");
    span.textContent = "\u00d7";
    li.appendChild(span);
    
    li.addEventListener("click", function () {
        li.classList.toggle("checked");
        if (li.classList.contains("checked")) {
            completedList.appendChild(li);
        } else {
            inProgressList.appendChild(li);
        }
        saveData();
    });

    span.addEventListener("click", function (event) {
        event.stopPropagation();
        li.remove();
        saveData();
    });

    return li;
}

function saveData() {
    const inProgressTasks = Array.from(inProgressList.querySelectorAll("li")).map(li => li.textContent.replace("\u00d7", "").trim());
    const completedTasks = Array.from(completedList.querySelectorAll("li")).map(li => li.textContent.replace("\u00d7", "").trim());
    localStorage.setItem("inProgressData", JSON.stringify(inProgressTasks));
    localStorage.setItem("completedData", JSON.stringify(completedTasks));
}

function showTasks() {
    const inProgressTasks = JSON.parse(localStorage.getItem("inProgressData")) || [];
    const completedTasks = JSON.parse(localStorage.getItem("completedData")) || [];
    
    inProgressList.innerHTML = '';
    completedList.innerHTML = '';
    
    inProgressTasks.forEach(task => {
        const li = createTaskElement(task);
        inProgressList.appendChild(li);
    });
    
    completedTasks.forEach(task => {
        const li = createTaskElement(task);
        li.classList.add("checked");
        completedList.appendChild(li);
    });
}

showTasks();