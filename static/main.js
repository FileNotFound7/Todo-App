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
        process_login()
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

async function process_login() {
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
        process_login(response)
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
        const login_response = await process_login(response)
    }
}

async function process_login(response) {
    if (response.status == 200) {
        data = await response.json();
        localStorage.setItem('token', data['token']);
        localStorage.setItem('expiry', data['expiry']);
        localStorage.setItem('refresh', data['refresh']);
        localStorage.setItem('username', data['username']);
        return {'username': data['username'], 'expiry': data['expiry'], 'refresh': data['refresh'], 'token': data['token']}
    }
    else{
        $("#login_error").show("blind");
    }
}

async function fetch_tasks() {
    var blank_form = new FormData()
    response = await api_call('tasks', "GET", blank_form)
    console.log(response);
}

async function api_call(endpoint, method, formData) {
    const expiry = parseInt(localStorage.getItem('expiry'));
    
    // auto refresh token
    if (expiry < Date.now()/1000) {
        const username = localStorage.getItem('username');
        const refresh = localStorage.getItem('refresh');

        var refresh_headers = new Headers()
        refresh_headers.append('username', username);
        refresh_headers.append('refresh', refresh);

        const response = await fetch(backend+"refresh", {method: 'GET', headers: refresh_headers,});

        const login_data = await process_login(response);
        formData.append("username", login_data['username']);
        formData.append("token", login_data['token']);
    }
    else {
        formData.append("username", localStorage.getItem('username'));
        formData.append("token", localStorage.getItem('token'));
    }
    const response = await fetch(backend+endpoint, {method: method, body: body, headers});
    return response;
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