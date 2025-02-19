function main() {
    form = document.querySelector(".editor_form");
    editor_bg = document.querySelector(".editor_bg");
    console.info(editor_bg)

    // Take over form submission
    form.addEventListener("submit", (event) => {
        event.preventDefault();
        sendData();
        hide_editor();
    });
}

async function sendData() {
    // Associate the FormData object with the form element
    const formData = new FormData(form);

    try {
        const response = await fetch("http://127.0.0.1:2999/newtask", {
            method: "POST",
            // Set the FormData instance as the request body
            body: formData,
        });
        console.log(await response.json());
    } catch (e) {
        console.error(e);
    }
}

// 
function show_editor() {
    editor_bg.style.visibility = "visible"
}

function hide_editor() {
    editor_bg.style.visibility = "hidden"
}

addEventListener("DOMContentLoaded", main);