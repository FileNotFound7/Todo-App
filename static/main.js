const backend = 'http://localhost/api/'

function main() {
    form = document.querySelector(".editor_form");
    editor_bg = document.querySelector(".editor_bg");

    // Take over form submission
    form.addEventListener("submit", (event) => {
        event.preventDefault();

        const formData = new FormData(form);

        api_call('newtask', {method: 'POST', body: formData});

        
        close_modal("#editor");
    });

    $('.account_form')[0].addEventListener("submit", (event) => {
        event.preventDefault();
        new_account()
    });
    
    document.getElementById('new_task').addEventListener("click", (event) => {open_modal("#editor")});

    document.getElementById('account_btn').addEventListener("click", (event) => {open_modal("#new_account")});

    $('.dialog').dialog();
    $('.dialog').dialog('close');
    $('.dialog').on('dialogclose', function(){
        close_modal(this)
    });

    if (localStorage.getItem('username') != null) {
        signinstatus = "Logged in as " + localStorage.getItem('username')
    }
    else {
        signinstatus = 'Not logged in'
    }
    document.getElementById('user_indicator').textContent = signinstatus;
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
    const response = await api_call('tasks', {method:"GET"})
    tasks = await response.json()
    console.log(tasks)

    html = '<div>'

    for (var task in tasks) {
        if (!tasks.hasOwnProperty(task)) {
            //The current property is not a direct property of p
            continue;
        }
        console.log(task)
        html = html + `<div><div>${tasks[task][1]}</div><div>${tasks[task][2]}</div><div>${tasks[task][3]}</div><div>${tasks[task][4]}</div><div>${tasks[task][5]}</div></div>`
    }
    html = html + "</div>"
    document.getElementById('tasks').innerHTML = html;

    console.log(response);
}

async function api_call(endpoint, request_init = {}) {
    if (!request_init.headers) {
        request_init.headers = new Headers()
    }
    const expiry = parseInt(localStorage.getItem('expiry'));
    
    // auto refresh token
    if (expiry < Date.now()/1000) {
        const username = localStorage.getItem('username');
        const refresh = localStorage.getItem('refresh');

        var refresh_headers = new Headers()
        refresh_headers.append('username', username);
        refresh_headers.append('refresh', refresh);

        const refresh_response = await fetch(backend+"refresh", {method: 'GET', headers: refresh_headers,});

        const login_data = await process_login(refresh_response);
        request_init.headers.append("username", login_data['username']);
        request_init.headers.append("token", login_data['token']);
    }
    else {
        request_init.headers.append("username", localStorage.getItem('username'));
        request_init.headers.append("token", localStorage.getItem('token'));
    }
    const response = await fetch(backend+endpoint, request_init);
    return response;
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