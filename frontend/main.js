class taskEditor {
    constructor(parent, id, name = null, description = null, priority = null, start = null, end = null) {
        this.id = id;

        var bg = document.createElement("div");
        bg.className = 'task-bg'

        var form = document.createElement("form");
        form.id = `task_${id}`;
        form.className = 'task-editor'
        this.formId = form.id

        bg.appendChild(form)

        document.body.appendChild(bg);

        // make radio buttons
        for (const level of ["1", "2", "3", "4", "5"]) {
            let radio = document.createElement("input");
            radio.type = "radio";
            radio.name = 'priority';
            radio.className = `priority${level}`;
            radio.value = level;
            if (priority == level) {
                radio.checked = true;
            }
            form.appendChild(radio);
        }

        // other elements
        var name = document.createElement("input");
        name.name = "name";
        name.type = "text";
        name.style = "textBox";
        name.value = name;
        form.appendChild(name);

        var description = document.createElement("input");
        description.name = "description"
        description.type = "text";
        description.style = "textBox";
        description.value = description;
        form.appendChild(description);

        var date_to = document.createElement("input");
        date_to.name = 'to'
        date_to.type = "datetime-local";
        name.style = "dateBox";
        form.appendChild(date_to);

        var date_from = document.createElement("input");
        date_from.name = 'from'
        date_from.type = "datetime-local";
        name.style = "dateBox";
        form.appendChild(date_from);

        const button = document.createElement("button")
        button.textContent = "Submit!";
        button.type = "submit"
        button.value = "submit"
        form.appendChild(button);

        form.addEventListener("submit", (event) => {
            event.preventDefault();
            this.submit();
        });
    }
    // edit(event) {
    //     console.log(`${event.target.id} - ${event.target.value}`);
    //     if (event.target.parentNode.parentNode.id != "new-row") {

    //     }
    // }
    // create(event) {
    //     // const radio = document.querySelector(`input[name="${this.id}-task-priority"]:checked`);
    //     // if (radio != null) {
    //     //     this.priority = radio.value;
    //     // } else {
    //     //     this.priority = null;
    //     // }
    //     // this.name = document.getElementById(`${this.id}-name`).value;
    //     // this.description = document.getElementById(`${this.id}-description`).value;
    //     // this.start = document.getElementById(`${this.id}-date-from`).value;
    //     // this.end = document.getElementById(`${this.id}-date-to`).value;



    //     console.log(`${this.priority}, ${this.name}, ${this.description}, ${this.start}, ${this.end}`)

    //     console.log("New task created.");
    // }
    async submit() {
    // Associate the FormData object with the form element
    const formData = new FormData(document.getElementById(this.formId));
    formData.append(this.id)

    const response = await fetch("http://127.0.0.1:2999/newtask", {
        method: "POST",
        // Set the FormData instance as the request body
        body: formData,
    });
    console.log(await response.textContent);
    }
    
}

function main() {
    let tasks = document.getElementById("tasks");

    console.log(tasks);
    let input = new taskEditor(tasks, "new");
}

document.addEventListener("DOMContentLoaded", main)