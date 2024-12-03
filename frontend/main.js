class task {
    constructor(parent, id, name = null, description = null, priority = null, start = null, end = null) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.priority = priority;
        this.start = start;
        this.end = end;



        const input = `<tr id=${id}-row>
            <th><input id="${id}-priority-1" type="radio" name="${id}-task-priority" class="priority1" value="1"></th>
            <th><input id="${id}-priority-2" type="radio" name="${id}-task-priority" class="priority2" value="2"></th>
            <th><input id="${id}-priority-3" type="radio" name="${id}-task-priority" class="priority3" value="3"></th>
            <th><input id="${id}-priority-4" type="radio" name="${id}-task-priority" class="priority4" value="4"></th>
            <th><input id="${id}-priority-5" type="radio" name="${id}-task-priority" class="priority5" value="5"></th>
            <th><input id="${id}-name" type="text"></th>
            <th width="99%"><input id="${id}-description" type="text" style="width:100%; overflow:hidden;margin-right:10px;"></th>
            <th><input id="${id}-date-from" type="datetime-local"></th>
            <th><input id="${id}-date-to" type="datetime-local"></th>
        </tr>`

        parent.insertAdjacentHTML("beforeend", input);

        if (id == "new") {
            const newrow = document.getElementById("new-row");
            const button = document.createElement("button")
            button.id = "new-task";
            button.textContent = "Create!";
            newrow.appendChild(button);
            document.getElementById('new-task').addEventListener("click", (event) => this.create(event));
        }

        document.getElementById(`${this.id}-priority-1`).addEventListener("change", (event) => this.edit(event));
        document.getElementById(`${this.id}-priority-2`).addEventListener("change", (event) => this.edit(event));
        document.getElementById(`${this.id}-priority-3`).addEventListener("change", (event) => this.edit(event));
        document.getElementById(`${this.id}-priority-4`).addEventListener("change", (event) => this.edit(event));
        document.getElementById(`${this.id}-priority-5`).addEventListener("change", (event) => this.edit(event));
        document.getElementById(`${this.id}-name`).addEventListener("change", (event) => this.edit(event));
        document.getElementById(`${this.id}-description`).addEventListener("change", (event) => this.edit(event));
        document.getElementById(`${this.id}-date-from`).addEventListener("change", (event) => this.edit(event));
        document.getElementById(`${this.id}-date-to`).addEventListener("change", (event) => this.edit(event));
    }
    edit(event) {
        console.log(`${event.target.id} - ${event.target.value}`);
        if (event.target.parentNode.parentNode.id != "new-row") {

        }
    }
    create(event) {
        const radio = document.querySelector(`input[name="${this.id}-task-priority"]:checked`);
        if (radio != null) {
            this.priority = radio.value;
        } else {
            this.priority = null;
        }
        this.name = document.getElementById(`${this.id}-name`).value;
        this.description = document.getElementById(`${this.id}-description`).value;
        this.start = document.getElementById(`${this.id}-date-from`).value;
        this.end = document.getElementById(`${this.id}-date-to`).value;

        console.log(`${this.priority}, ${this.name}, ${this.description}, ${this.start}, ${this.end}`)

        console.log("New task created.");
    }
}

function main() {
    let tasks = document.getElementById("tasks");

    console.log(tasks);
    let input = new task(tasks, "new");
}

document.addEventListener("DOMContentLoaded", main)