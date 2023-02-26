// HTML Elements I will need 
const listsContainer = document.querySelector('[data-lists]')
const newListForm = document.querySelector('[data-new-list-form]')
const newListInput = document.querySelector('[data-new-list-input]')
const deleteListButton = document.querySelector('[data-delete-list-button]')
const listDisplayContainer = document.querySelector('[data-list-display-container]')
const listTitleElement = document.querySelector('[data-list-title]')
const listCountElement = document.querySelector('[data-list-count]')
const tasksContainer = document.querySelector('[data-tasks]')
const otherTasks = document.getElementsByClassName('tasks')
const taskTemplate = document.getElementById('task-template')
const addNewTask = document.querySelector('[data-new-task-form]')
const newTaskInput = document.querySelector('[data-new-task-input]')
const clearCompleteTasksButton = document.querySelector('[data-clear-complete-tasks-button]')
const deleteTaskButton = document.querySelector('[data-delete-task-button]')
const deleteListButtonInline = document.querySelector('[data-delete-list-button-inline]')
const ListDueDate = document.querySelector('[data-list-due-date]')
const TaskDueDate = document.querySelector('[data-task-due-date]')
const importantFlag = document.querySelector('[data-list-important-flag]')

// Create local storage to save lists and tasks when page is refreshed
const LOCAL_STORAGE_LIST_KEY = 'task.lists'
const LOCAL_STORAGE_SELECTED_LIST_ID_KEY = 'task.selectedListId'
let lists = JSON.parse(localStorage.getItem(LOCAL_STORAGE_LIST_KEY)) || []
let selectedListId = localStorage.getItem(LOCAL_STORAGE_SELECTED_LIST_ID_KEY)



// when date field is clicked make its type = date
ListDueDate.addEventListener('click', e => {
    e.target.setAttribute("type", "date")
    e.target.showPicker();
})

// same for tasks when date field is clicked make its type = date
TaskDueDate.addEventListener('click', e => {
    e.target.setAttribute("type", "date")
    e.target.showPicker();
})


listsContainer.addEventListener('click', e => {
    // get the selected list
    let item = e.target
    if (item.tagName.toLowerCase() === 'li') {
        selectedListId = item.dataset.listId
        saveAndRender()
    }
    else if (item.tagName.toLowerCase() === 'div') {
        selectedListId = item.parentElement.dataset.listId
        saveAndRender()
    }
    // remove list 
    else if (item.classList[0] === 'remove-btn') {
        const removingListId = item.parentElement.dataset.listId

        if (removingListId == selectedListId) {
            lists = lists.filter(list => list.id !== selectedListId)
            selectedListId = null
        }
        else {
            lists = lists.filter(list => list.id !== removingListId)
        }
        saveAndRender()    
    }
    else if (item.classList[0] === 'important-btn') {
        const importantListId = item.parentElement.parentElement.dataset.listId
        let implist = lists.filter(list => list.id == importantListId)[0]
        if (implist.important == false) {
            implist.important = true
        } else {
            implist.important = false
        }
        saveAndRender()
        console.log(implist)
    }
})

// mark checked tasks completed
tasksContainer.addEventListener('click', e => {
    const selectedList = lists.find(list => list.id === selectedListId)
    const item = e.target
    // when checkbox is clicked check off task
    if (item.tagName.toLowerCase() === 'input') {
        const selectedTask = selectedList.tasks.find(task => task.id === item.id)
        selectedTask.complete = item.checked
        save()
        renderTaskCount(selectedList)
    }
    // when any elements of the task clicked check off task
    else if (item.tagName.toLowerCase() === 'span' || item.tagName.toLowerCase() === 'label' || item.tagName.toLowerCase() === 'div') {
        let parent = item
        if (item.tagName.toLowerCase() === 'span') {
                parent = item.parentElement.parentElement.firstChild
        } 
        else if (item.tagName.toLowerCase() === 'div') {
            parent = item.firstChild
        }
        else {
            parent = item.parentElement.firstChild
        }
        const completebtn = parent
        const selectedTask = selectedList.tasks.find(task => task.id === completebtn.id)
        if (completebtn.checked === true) {
            completebtn.checked = false
        }
        else {
            completebtn.checked = true
        }
    
        selectedTask.complete = completebtn.checked
        save()
        renderTaskCount(selectedList)
    }
    // remove task
    else if (item.classList[0] === 'remove-btn') {
        let selectedTask = selectedList.tasks.find(task => task.id === item.parentElement.id)
        selectedList.tasks = selectedList.tasks.filter(task => task.id !== selectedTask.id)
        saveAndRender()
    }

    // mark important
    else if (item.classList[0] === 'important-btn') {
        let selectedTask = selectedList.tasks.find(task => task.id === item.parentElement.id)
        if (selectedTask.important == true) {
            selectedTask.important = false
        } else {
            selectedTask.important = true
        }
        saveAndRender()
    }
})

// clear all completed tasks from list
clearCompleteTasksButton.addEventListener('click', e => {
    const selectedList = lists.find(list => list.id === selectedListId)
    selectedList.tasks = selectedList.tasks.filter(task => !task.complete)
    saveAndRender()
})

// remove whole list with it's tasks
deleteListButton.addEventListener('click', e => {
    lists = lists.filter(list => list.id !== selectedListId)
    selectedListId = null
    saveAndRender()
})

// create new list
newListForm.addEventListener('submit', e => {
    e.preventDefault()
    const listName = newListInput.value
    const LdueDate = ListDueDate.value
    if (listName == null || listName === '') return
    const list = createList(listName, LdueDate)
    newListInput.value = null
    ListDueDate.value = null
    lists.push(list)
    selectedListId = list.id
    saveAndRender()
})

// create new task
addNewTask.addEventListener('submit', e => {
    e.preventDefault()
    const taskName = newTaskInput.value
    const TdueDate = TaskDueDate.value
    if (taskName == null || taskName === '') return
    const task = createTask(taskName, TdueDate)
    newTaskInput.value = null
    TaskDueDate.value = null
    const selectedList = lists.find(list => list.id === selectedListId)
    selectedList.tasks.push(task)
    saveAndRender()
})


function createList(name, dueDate) {
    return { id: Date.now().toString(), name: name, tasks: [], created: Date.now(), dueDate: dueDate, important: false}
}

function createTask(name, dueDate) {
    return { id: Date.now().toString(), name: name, complete: false, created: convertDate(Date.now()), dueDate: dueDate, important: false }
}

function saveAndRender() {
    save()
    render()
}

function save() {
    localStorage.setItem(LOCAL_STORAGE_LIST_KEY, JSON.stringify(lists))
    localStorage.setItem(LOCAL_STORAGE_SELECTED_LIST_ID_KEY, selectedListId)
}

function render() {
    clearElement(listsContainer)
    renderLists()

    const selectedList = lists.find(list => list.id === selectedListId)
    if (selectedListId == 'null' || selectedListId == undefined) {
        listDisplayContainer.style.display = 'none'
    } else {
        listDisplayContainer.style.display = ''
        listTitleElement.innerText = selectedList.name
        ListDueDate.setAttribute("type", "text")
        TaskDueDate.setAttribute("type", "text")
        renderTaskCount(selectedList)
        clearElement(tasksContainer)
        renderTasks(selectedList)
    }
}

function renderTasks(selectedList) {
    const maxDate = selectedList.dueDate
    if (maxDate !== '' || maxDate !== null) {
        const setMaxDate = document.querySelector("[data-task-due-date]")
        setMaxDate.setAttribute('max', maxDate)
    }
    selectedList.tasks.forEach(task => {

        const taskLi = document.createElement('li')
        taskLi.id = task.id
        taskLi.classList.add('task', "d-flex", "align-items-center", "justify-content-between")

        const importantButton = document.createElement('button')
        importantButton.innerHTML = '<i class="fas fa-flag"></i>'
        importantButton.classList.add("important-btn")
        if (selectedList.important == true) {
            importantButton.classList.add("important-active")
        } else {
            if (task.important == true) {
                importantButton.classList.add("important-active")
            } else {
                importantButton.classList.remove("important-active")
            }
        }

        importantButton.setAttribute("data-important-task-button", "")
        taskLi.appendChild(importantButton)

        const completeButton = document.createElement('input')
        completeButton.setAttribute("type", "checkbox");
        completeButton.id = task.id
        completeButton.checked = task.complete

        // custom checkbox
        const custCheckbox = document.createElement('span')
        custCheckbox.classList.add('complete-btn')
        const taskLabel = document.createElement('label')
        taskLabel.htmlFor = task.id
        taskLabel.appendChild(custCheckbox)
        const spanText = document.createElement('span')
        spanText.classList.add("span-text")
        spanText.innerText = `${task.name}`
        taskLabel.append(spanText)

        const div = document.createElement("div")
        div.classList.add("task-text", "d-flex", "align-items-center")
        div.appendChild(completeButton)
        div.appendChild(taskLabel)


        // create span to hold tas due date if given
        if (task.dueDate != '') {
            const taskDue = document.createElement('span')
            taskDue.classList.add("task-due")
            taskDue.innerHTML = `Due: ${convertDate(task.dueDate)}`
            taskLabel.appendChild(taskDue)
        }

        const taskCreated = document.createElement('span')
        taskCreated.classList.add("task-created")
        taskCreated.innerText = `Created: ${task.created}`
        
        taskLabel.appendChild(taskCreated)

        taskLi.appendChild(div)

        const removeButton = document.createElement('button')
        removeButton.innerHTML = '<i class="fas fa-trash"></i>'
        removeButton.classList.add("remove-btn")
        removeButton.setAttribute("data-delete-task-button", "")
        taskLi.appendChild(removeButton)
        tasksContainer.appendChild(taskLi)        
    })
}

function renderTaskCount(selectedList) {
    const incompleteTaskCount = selectedList.tasks.filter(task => !task.complete).length
    const taskString = incompleteTaskCount === 1 ? "task" : "tasks"
    listCountElement.innerText = `${incompleteTaskCount} ${taskString} remaining`
}

function renderLists() {
    lists.forEach(list => {
        // create a li to hold list
        const listElement = document.createElement('li')
        listElement.dataset.listId = list.id
        listElement.classList.add("list-name", "d-flex", "align-items-center", "justify-content-between")

        const div = document.createElement("div")
        div.classList.add("list-text", "d-flex", "align-items-center")

        // important flag
        const importantButton = document.createElement('button')
        importantButton.innerHTML = '<i class="fas fa-flag"></i>'
        importantButton.classList.add("important-btn")

        if (list.important == true) {
            listElement.classList.add(".list-important")
            importantButton.classList.add("important-active")
        } else {
            importantButton.classList.remove("important-active")
            listElement.classList.remove(".list-important")
        }

        importantButton.setAttribute("data-important-task-button", "")
        div.appendChild(importantButton)

        // list text
        spanText = document.createElement('span')
        spanText.classList.add('span-text')
        spanText.innerText = list.name
        div.append(spanText)
        if (list.id === selectedListId) {
            listElement.classList.add('active-list')
        }

        // create span to hold due date if given
        if (list.dueDate != '') {
            const listDue = document.createElement('span')
            listDue.classList.add("list-due")
            listDue.innerText = `Due: ${convertDate(list.dueDate)}`
            div.appendChild(listDue)
        }

        // create span to hold created date 
        const listCreated = document.createElement('span')
        listCreated.classList.add("list-created")
        listCreated.innerText = `Created: ${convertDate(list.created)}`
        div.appendChild(listCreated)

        listElement.appendChild(div)

        // create remove button for each list
        const removeButton = document.createElement('button')
        removeButton.innerHTML = '<i class="fas fa-trash"></i>'
        removeButton.classList.add("remove-btn")
        removeButton.setAttribute("data-delete-list-button-inline", "")
        listElement.appendChild(removeButton)

        // add list to ul
        listsContainer.appendChild(listElement)
    })
}

function clearElement(element) {
    while (element.firstChild) {
        element.removeChild(element.firstChild)
    }
}

function convertDate(dateMilli) {
    let prepareD = null
    if (typeof dateMilli === 'string') {
        prepareD = new Date(dateMilli.replace(/-/g, '\/')).toLocaleDateString('en-us', { weekday: "short", year: "numeric", month: "short", day: "numeric" })
    } else {
        prepareD = new Date(dateMilli).toLocaleDateString('en-us', { weekday: "short", year: "numeric", month: "short", day: "numeric" })
    }
    return prepareD
}
function getMinDate() {
    let date = new Date()
    let day = date.getDate()
    let month = date.getMonth() + 1
    let year = date.getFullYear()
    if (day < 10) {
        day = '0' + day
    }
    if (month < 10) {
        month = "0" + month
    }
    minDate = year + "-" + month + "-" + day
    dateinputs = document.getElementsByClassName("datePicker")
    
    for (let item of dateinputs) {
        item.setAttribute("min", minDate)
    } 

}

getMinDate()

render()