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

    $('.account_form')[0].addEventListener("submit", (event) => {
        event.preventDefault();
        new_account()
    });
    
    document.getElementById('new_task').addEventListener("click", (event) => {open_modal("#editor")});
    
    document.getElementById('login_btn').addEventListener("click", (event) => {open_modal("#login")});

    document.getElementById('account_btn').addEventListener("click", (event) => {open_modal("#new_account")});

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
        $("#login_error").html("Details must not be blank.")
        $("#login_error").show("blind");
    }
    else{
        const formData = new FormData();
        formData.append("username", username);
        formData.append("password", password);

        const response = await fetch(backend+"login", {method: "POST", body: formData,});
        login(response)
    }
}

async function new_account() {
    username = $('#account_username')[0].value
    password = $('#account_password')[0].value
    if (username == '' || password == '') {
        $("#login_error").html("Details must not be blank.")
        $("#login_error").show("blind");
    }
    else{
        const formData = new FormData();
        formData.append("username", username);
        formData.append("password", password);

        const response = await fetch(backend+"new_account", {method: "POST", body: formData,});
        login(response)
    }
}

async function login(response) {
    if (response.status == 200) {
        data = await response.json();
        localStorage.setItem('token', data['token']);
        localStorage.setItem('expiry', data['expiry']);
        localStorage.setItem('refresh', data['refresh']);
    }
    else{
        $("#login_error").show("blind");
    }
}

async function sendData() {
    // Associate the FormData object with the form element
    const formData = new FormData(form);

    try {
        const response = await fetch(backend+"newtask", {method: "POST", body: formData,});
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