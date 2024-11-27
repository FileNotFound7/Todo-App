var input = new task(document.getElementById("task-input"))

class task {
    constructor(parent, id, name, description, priority, start, end){
        this.id = id;
        this.name = name;
        this.description = description;
        this.priority = priority;
        this.start = start;
        this.end = end;

        if (id == "new") {
            var button = "<button id='new-task'>Create!</button>"
        } else {
            var button = ""
        }
        
        input = `<tr>
            <th><input id="${id}-priority-1" type="radio" name="task-priority" class="priority1" value="1"></th>
            <th><input id="${id}-priority-2" type="radio" name="task-priority" class="priority2" value="2"></th>
            <th><input id="${id}-priority-3" type="radio" name="task-priority" class="priority3" value="3"></th>
            <th><input id="${id}-priority-4" type="radio" name="task-priority" class="priority4" value="4"></th>
            <th><input id="${id}-priority-5" type="radio" name="task-priority" class="priority5" value="5"></th>
            <th><input id="${id}-task-name" type="text"></th>
            <th><input id="${id}-task-description" type="text"></th>
            <th><input id="${id}-task-date-from" type="datetime-local"></th>
            <th><input id="${id}-task-date-to" type="datetime-local"></th>
            ${button}
        </tr>`

        parent.appendChild(input);

        document.getElementById(`${this.id}-priority-1`).addEventListener("change", (event) => edit(event));
        document.getElementById(`${this.id}-priority-2`).addEventListener("change", (event) => edit(event));
        document.getElementById(`${this.id}-priority-3`).addEventListener("change", (event) => edit(event));
        document.getElementById(`${this.id}-priority-4`).addEventListener("change", (event) => edit(event));
        document.getElementById(`${this.id}-priority-5`).addEventListener("change", (event) => edit(event));
        document.getElementById(`${this.id}-task-name`).addEventListener("change", (event) => edit(event));
        document.getElementById(`${this.id}-task-description`).addEventListener("change", (event) => edit(event));
        document.getElementById(`${this.id}-task-date-from`).addEventListener("change", (event) => edit(event));
        document.getElementById(`${this.id}-task-date-to`).addEventListener("change", (event) => edit(event));
    }
    edit(event) {
        console.log(event.target.value);
    }
}