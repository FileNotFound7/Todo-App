const backend = 'http://localhost/api/'

function main() {
    form = document.querySelector(".editor_form");
    editor_bg = document.querySelector(".editor_bg");

    // New task submission
    form.addEventListener("submit", (event) => {
        event.preventDefault();

        const formData = new FormData(form);

        if (formData.get('from')) {
            formData.set('from', Date.parse(formData.get('from')))
        }

        if (formData.get('to')) {
            formData.set('to', Date.parse(formData.get('to')))
        }

        formData.set('timestamp', Date.now())

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

    fetch_tasks();
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
    
    console.log(response);
}

function render_tasks(tasks) {
    html = '<table>'
    for (var task in tasks) {
        if (!tasks.hasOwnProperty(task)) {
            //The current property is not a direct property of p
            continue;
        }
        console.log(task)
        html = html + `<tr><td class="name">${tasks[task][1]}</td><td class="description">${tasks[task][2]}</td><td>${tasks[task][3]}</td><td>${tasks[task][4]}</td><td>${tasks[task][5]}</td><td><button onclick=delete_task(this)>Delete</button></td></tr>`
    }
    html = html + "</table>"
    document.getElementById('tasks').innerHTML = html;
}

async function delete_task(task) {
    row = task.parentElement.parentElement
    var name = row.querySelector('.name').textContent;
    var description = row.querySelector('.description').textContent;
    
    var delete_headers = new Headers();
    delete_headers.append('taskname', name)
    delete_headers.append('taskdescription', description)
    const response = await api_call('deletetask', {method:"DELETE", headers:delete_headers})
    fetch_tasks()
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