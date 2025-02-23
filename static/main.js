const backend = 'http://localhost/api/'

function main() {
    form = document.querySelector(".editor_form");
    editor_bg = document.querySelector(".editor_bg");

    // Take over form submission
    form.addEventListener("submit", (event) => {
        event.preventDefault();
        sendData();
        close_modal("#editor");
    });

    $('.login_form')[0].addEventListener("submit", (event) => {
        event.preventDefault();
        login()
    });
    
    document.getElementById('new_task').addEventListener("click", (event) => {open_modal("#editor")});

    document.getElementById('login_btn').addEventListener("click", (event) => {open_modal("#login")});

    $('.dialog').dialog();
    $('.dialog').dialog('close');
    $('.dialog').on('dialogclose', function(){
        close_modal(this)
    });
}

async function login() {
    username = $('#login_username')[0].value
    password = $('#login_password')[0].value
    if (username == '' || password == '') {
        alert("Username and password must not be empty")
    }
    else{
        const salt_response = await fetch(backend+"login")
        salt = await salt_response.text()
    }
}

async function sendData() {
    // Associate the FormData object with the form element
    const formData = new FormData(form);

    try {
        const response = await fetch(backend+"newtask", {
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
function open_modal(id) {
    editor_bg.style.visibility = "visible"
    $(id).dialog("open")
}

function close_modal(id) {
    editor_bg.style.visibility = "hidden"
    $(id).dialog("close")
}

addEventListener("DOMContentLoaded", main);