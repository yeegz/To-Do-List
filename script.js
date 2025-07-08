document.addEventListener('DOMContentLoaded', () => {
    const kanbanBoard = document.getElementById('kanban-board');
    const addListBtn = document.getElementById('add-list-btn');
    const fab = document.getElementById('fab');
    const inputModal = document.getElementById('input-modal');
    const modalOverlay = document.getElementById('modal-overlay');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const addTaskSubmitBtn = document.getElementById('add-task-submit-btn');
    const inputBox = document.getElementById('input-box');
    const dueDateInput = document.getElementById('due-date');
    const priorityInput = document.getElementById('priority-select');
    const categoryDropdown = document.getElementById('category-dropdown');
    const selectedCategory = document.getElementById('selected-category');
    const categoryOptions = document.getElementById('category-options');
    const selectedIconEl = document.getElementById('selected-icon');
    const selectedTextEl = document.getElementById('selected-text');
    const tagModal = document.getElementById('tag-modal');
    const closeTagModal = document.getElementById('close-tag-modal');
    const addTagBtn = document.getElementById('add-tag-btn');
    const newTagName = document.getElementById('new-tag-name');
    const newTagColor = document.getElementById('new-tag-color');
    const existingTags = document.getElementById('existing-tags');

    let state = loadState();
    let currentTaskForTags = null;

    renderBoard();

    fab.addEventListener('click', () => toggleInputModal(true));
    modalOverlay.addEventListener('click', () => {
        toggleInputModal(false);
        closeTagManagementModal();
    });
    closeModalBtn.addEventListener('click', () => toggleInputModal(false));
    addListBtn.addEventListener('click', addColumn);
    addTaskSubmitBtn.addEventListener('click', addTask);
    selectedCategory.addEventListener('click', toggleCategoryDropdown);
    categoryOptions.addEventListener('click', handleCategorySelection);
    closeTagModal.addEventListener('click', closeTagManagementModal);
    addTagBtn.addEventListener('click', addNewTag);
    existingTags.addEventListener('click', handleExistingTagClick);

    document.addEventListener('click', (e) => {
        if (!categoryDropdown.contains(e.target)) {
            closeCategoryDropdown();
        }
    });

    dueDateInput.addEventListener('change', (e) => handleInputChange(e.target));
    priorityInput.addEventListener('change', (e) => handleInputChange(e.target));
    document.querySelectorAll('.input-field input, .input-field select').forEach(handleInputChange);

    function toggleInputModal(forceOpen) {
        const isOpen = inputModal.classList.contains('visible');
        if (forceOpen === true || !isOpen) {
            modalOverlay.classList.add('visible');
            inputModal.classList.add('visible');
            fab.classList.add('open');
        } else {
            modalOverlay.classList.remove('visible');
            inputModal.classList.remove('visible');
            fab.classList.remove('open');
            resetInputModal();
        }
    }

    function handleInputChange(inputElement) {
        const parent = inputElement.parentElement;
        if (inputElement.value) {
            parent.classList.add('has-value');
        } else {
            parent.classList.remove('has-value');
        }
    }

    function toggleCategoryDropdown() {
        const isOpen = categoryOptions.classList.contains('open');
        if (isOpen) {
            closeCategoryDropdown();
        } else {
            categoryOptions.classList.add('open');
            selectedCategory.classList.add('open');
        }
    }

    function closeCategoryDropdown() {
        categoryOptions.classList.remove('open');
        selectedCategory.classList.remove('open');
    }

    function handleCategorySelection(e) {
        const option = e.target.closest('.category-option');
        if (option) {
            selectCategory(option);
            closeCategoryDropdown();
        }
    }

    function selectCategory(option) {
        const icon = option.dataset.icon;
        const name = option.dataset.name;
        const color = option.dataset.color;

        selectedIconEl.className = `fas ${icon}`;
        selectedTextEl.textContent = name;

        selectedCategory.dataset.icon = icon;
        selectedCategory.dataset.name = name;
        selectedCategory.dataset.color = color;
    }

    function addColumn() {
        const title = prompt("Enter new list title:");
        if (title) {
            const newColumn = {
                id: Date.now(),
                title: title,
                tasks: []
            };
            state.columns.push(newColumn);
            saveState();
            renderBoard();
        }
    }

    function addTask() {
        const taskText = inputBox.value.trim();
        if (!taskText) {
            alert("Please enter a task name.");
            return;
        }

        const newTask = {
            id: Date.now(),
            text: taskText,
            dueDate: dueDateInput.value,
            priority: priorityInput.value,
            category: {
                name: selectedCategory.dataset.name || 'General',
                icon: selectedCategory.dataset.icon || 'fa-tasks',
                color: selectedCategory.dataset.color || '#e5a767'
            },
            tags: []
        };

        if (state.columns.length > 0) {
            state.columns[0].tasks.push(newTask);
            saveState();
            renderBoard();
            toggleInputModal(false);
        } else {
            alert("Please add a list first!");
        }
    }

    function resetInputModal() {
        inputBox.value = '';
        dueDateInput.value = '';
        priorityInput.value = '';
        const defaultCategory = document.querySelector('.category-option[data-name="General"]');
        if (defaultCategory) selectCategory(defaultCategory);
        document.querySelectorAll('.input-field').forEach(field => field.classList.remove('has-value'));
    }

    function renderBoard() {
        kanbanBoard.innerHTML = '';
        state.columns.forEach((column, columnIndex) => {
            const columnEl = createColumnElement(column, columnIndex);
            kanbanBoard.appendChild(columnEl);
        });
        initializeDragAndDrop();
    }

    function createColumnElement(column, columnIndex) {
        const columnEl = document.createElement('div');
        columnEl.className = 'kanban-column';
        columnEl.dataset.columnId = column.id;

        columnEl.innerHTML = `
            <div class="kanban-column-header">
                <span class="column-title">${column.title}</span>
                <button class="delete-column-btn"><i class="fas fa-trash-alt"></i></button>
            </div>
            <ul class="task-list" data-column-index="${columnIndex}"></ul>
        `;

        columnEl.querySelector('.delete-column-btn').addEventListener('click', () => {
            if (confirm(`Are you sure you want to delete the "${column.title}" list?`)) {
                state.columns.splice(columnIndex, 1);
                saveState();
                renderBoard();
            }
        });

        const taskListEl = columnEl.querySelector('.task-list');
        column.tasks.forEach((task, taskIndex) => {
            const taskEl = createTaskElement(task, columnIndex, taskIndex);
            taskListEl.appendChild(taskEl);
        });

        return columnEl;
    }

    function createTaskElement(task, columnIndex, taskIndex) {
        const taskEl = document.createElement('li');
        const hasCategory = task.category && task.category.name !== 'No Category';

        taskEl.className = `task-card ${hasCategory ? 'has-category' : ''}`;
        taskEl.dataset.taskId = task.id;
        if (task.priority) taskEl.dataset.priority = task.priority;
        if (hasCategory) taskEl.style.borderLeftColor = task.category.color;

        taskEl.innerHTML = `
            <div class="task-header">
                ${hasCategory ? `<i class="task-icon fas ${task.category.icon}" style="color: ${task.category.color};"></i>` : ''}
                <span class="task-text">${task.text}</span>
                <button class="delete-btn"><i class="fas fa-times"></i></button>
            </div>
            <div class="task-footer">
                <span class="due-date">${task.dueDate ? `Due: ${task.dueDate}` : ''}</span>
                <button class="manage-tags-btn"><i class="fas fa-tags"></i> Tags</button>
            </div>
            <div class="task-tags"></div>
        `;

        taskEl.querySelector('.delete-btn').addEventListener('click', () => {
            state.columns[columnIndex].tasks.splice(taskIndex, 1);
            saveState();
            renderBoard();
        });

        taskEl.querySelector('.manage-tags-btn').addEventListener('click', () => {
            const currentTask = state.columns[columnIndex].tasks[taskIndex];
            openTagManagementModal(currentTask);
        });

        const tagsContainer = taskEl.querySelector('.task-tags');
        renderTaskTags(tagsContainer, task);

        return taskEl;
    }

    function initializeDragAndDrop() {
        new Sortable(kanbanBoard, {
            animation: 200,
            handle: '.kanban-column-header',
            ghostClass: 'ghost-column',
            onEnd: (evt) => {
                const [reorderedItem] = state.columns.splice(evt.oldIndex, 1);
                state.columns.splice(evt.newIndex, 0, reorderedItem);
                saveState();
                renderBoard();
            },
        });

        const taskLists = document.querySelectorAll('.task-list');
        taskLists.forEach(list => {
            new Sortable(list, {
                group: 'tasks',
                animation: 150,
                ghostClass: 'ghost-class',
                onEnd: (evt) => {
                    const fromColumnIndex = evt.from.dataset.columnIndex;
                    const toColumnIndex = evt.to.dataset.columnIndex;
                    const [movedTask] = state.columns[fromColumnIndex].tasks.splice(evt.oldIndex, 1);
                    state.columns[toColumnIndex].tasks.splice(evt.newIndex, 0, movedTask);
                    saveState();
                    renderBoard();
                }
            });
        });
    }

    function openTagManagementModal(task) {
        currentTaskForTags = task;
        renderTagsInModal();
        modalOverlay.classList.add('visible');
        tagModal.classList.add('visible');
    }

    function closeTagManagementModal() {
        currentTaskForTags = null;
        tagModal.classList.remove('visible');
        if (!inputModal.classList.contains('visible')) {
            modalOverlay.classList.remove('visible');
        }
    }

    function addNewTag() {
        const name = newTagName.value.trim();
        const color = newTagColor.value;
        if (name && !state.tags.find(tag => tag.name === name)) {
            state.tags.push({ name, color });
            saveState();
            renderTagsInModal();
            newTagName.value = '';
        } else {
            alert("Tag name cannot be empty or already exist.");
        }
    }

    function handleExistingTagClick(e) {
        if (e.target.classList.contains('remove-tag-btn')) {
            const tagName = e.target.dataset.tagName;
            if (confirm(`Are you sure you want to delete the "${tagName}" tag everywhere?`)) {
                state.tags = state.tags.filter(t => t.name !== tagName);
                state.columns.forEach(col => {
                    col.tasks.forEach(task => {
                        task.tags = task.tags.filter(tName => tName !== tagName);
                    });
                });
                saveState();
                renderTagsInModal();
                renderBoard();
            }
        } else if (e.target.closest('.existing-tag')) {
            if (!currentTaskForTags) return;
            const tagEl = e.target.closest('.existing-tag');
            const tagName = tagEl.dataset.tagName;
            const taskTagIndex = currentTaskForTags.tags.indexOf(tagName);

            if (taskTagIndex > -1) {
                currentTaskForTags.tags.splice(taskTagIndex, 1);
            } else {
                currentTaskForTags.tags.push(tagName);
            }
            saveState();
            renderTagsInModal();
            renderBoard();
        }
    }

    function renderTagsInModal() {
        existingTags.innerHTML = '';
        state.tags.forEach(tag => {
            const tagEl = document.createElement('div');
            tagEl.className = 'existing-tag';
            tagEl.style.borderLeftColor = tag.color;
            tagEl.dataset.tagName = tag.name;

            const isAssigned = currentTaskForTags && currentTaskForTags.tags.includes(tag.name);
            if (isAssigned) {
                tagEl.classList.add('assigned');
                tagEl.style.background = 'rgba(255, 255, 255, 0.1)';
            }

            tagEl.innerHTML = `
                <span>${tag.name}</span>
                <button class="remove-tag-btn" data-tag-name="${tag.name}"><i class="fas fa-times"></i></button>
            `;
            existingTags.appendChild(tagEl);
        });
    }

    function renderTaskTags(container, task) {
        container.innerHTML = '';
        task.tags.forEach(tagName => {
            const tagData = state.tags.find(t => t.name === tagName);
            if (tagData) {
                const tagEl = document.createElement('span');
                tagEl.className = 'task-tag';
                tagEl.textContent = tagName;
                tagEl.style.backgroundColor = tagData.color;
                container.appendChild(tagEl);
            }
        });
    }

    function saveState() {
        localStorage.setItem('kanbanState', JSON.stringify(state));
    }

    function loadState() {
        const savedState = localStorage.getItem('kanbanState');
        const initialData = {
            columns: [
                { id: 1, title: "To Do", tasks: [] },
                { id: 2, title: "In Progress", tasks: [] },
                { id: 3, title: "Done", tasks: [] }
            ],
            tags: [
                { name: 'Urgent', color: '#ef4444' },
                { name: 'Review', color: '#3b82f6' },
                { name: 'Bug', color: '#f59e0b' }
            ]
        };

        try {
            return savedState ? JSON.parse(savedState) : initialData;
        } catch (e) {
            console.error("Error parsing saved state, returning to default.", e);
            return initialData;
        }
    }
});