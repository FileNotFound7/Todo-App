const backend = 'http://localhost/api/';
var tasks;

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
        fetch_tasks()
        return {'username': data['username'], 'expiry': data['expiry'], 'refresh': data['refresh'], 'token': data['token']}
    }
    else{
        $("#login_error").show("blind");
    }
}

async function fetch_tasks() {
    const response = await api_call('tasks', {method:"GET"});
    tasks = await response.json();
    
    render_tasks(tasks);
}

function render_tasks(list) {
    html = '<table>'
    html = html + '<tr><th>Name</th><th>Description</th><th>Priority</th><th>Start</th><th>End</th></tr>'
    for (var task in list) {
        if (!list.hasOwnProperty(task)) {
            continue;
        }
        if (list[task][4] == null) {
            list[task][4] = "-"
        }
        else {
            var date = new Date(Number(list[task][4]));
            list[task][4] = date.toLocaleString();
        }
        if (list[task][5] == null) {
            list[task][5] = "-";
        }
        else {
            var date = new Date(Number(list[task][5]/1000));
            list[task][5] = date.toString();
        }

        html = html +  `<tr id="${list[task][7]}">
                        <td class="name">${list[task][1]}</td>
                        <td class="description">${list[task][2]}</td>
                        <td class="priority">${list[task][3]}</td>
                        <td class="start">${list[task][4]}</td>
                        <td class="end">${list[task][5]}</td>
                        <td><button onclick=delete_task(this)>Delete</button></td>
                        </tr>`
    }
    html = html + "</table>"
    document.getElementById('tasks').innerHTML = html;
}

async function delete_task(task) {
    row = task.parentElement.parentElement
    var rowid = row.id;
    
    var delete_headers = new Headers();
    delete_headers.append('rowid', rowid)
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