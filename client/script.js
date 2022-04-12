let socket = new WebSocket('ws://localhost:5000/')

socket.onopen = () => {
    id = Math.random();
}

socket.onmessage = (event) => {
    const data = JSON.parse(event.data);

    if(data.message) {
        if(data.type === 'error') {
            showAlert(data.message, 'red rounded');
        }
        else {
            showAlert(data.message);
        }
    }

    removePreloader();

    if(data.response) {
        switch (data.response) {
            case 'login':
                username = form.elements['username'].value;
                token = data.token;

                entranceService.alertUsers(`User ${username} connected`).catch(err => console.log(err));

                renderNavigation();
                loadTodos();
                break;

            case 'todos':
                renderTodos(JSON.parse(data.todos).todo);
                break;

            case 'token':
                console.log(data)
                if(data.value === null) {
                    entranceService.alertUsers(`User ${username} disconnected`).catch(err => console.log(err));
                    renderEntranceForm();
                }
                break;
        }
    }
}

function customHttp() {
    return {
        async postAuth(method) {
            socket.send(JSON.stringify({
                body: JSON.stringify({
                    username: form.elements['username'].value,
                    password: form.elements['password'].value
                }),
                method: method
            }));
        },
        async getCookie(method) {
            socket.send(JSON.stringify({
                id: id,
                username: username,
                method: method
            }));
        },
        async get() {
            socket.send(JSON.stringify({
                method: 'get-todo'
            }));
        },
        async post() {
            socket.send(JSON.stringify({
                body: JSON.stringify({
                    title: todoTitleInput.value,
                    date: makeDate(todoDateInput.value),
                    file: todoFileInput.files[0]
                }),
                token: token,
                method: 'add-todo'
            }));
        },
        async put(id) {
            socket.send(JSON.stringify({
                body: JSON.stringify({
                    id: id
                }),
                method: 'change-todo'
            }));
        },
        async alert(msg) {
            socket.send(JSON.stringify({
                id: id,
                username: username,
                method: 'alert',
                message : msg
            }));
        }
    };
}

const http = customHttp();
let username = '';
let id = '';
let token = '';

const entranceService = (function() {
    return {
        async login() {
            await http.postAuth('login');
        },
        async register() {
            await http.postAuth('register');
        },
        async hasCookie() {
            await http.getCookie('cookie');
        },
        async logOut() {
            await http.getCookie('logout');
        },
        async alertUsers(msg) {
            await http.alert(msg)
        }
    };
})();

const todoService = (function() {
    return {
        async allTodos() {
            await http.get();
        },
        async insertTodo() {
            await http.post();
        },
        async editTodo(id) {
            await http.put(id);
        }
    };
})();

let form = document.forms['entrance_form'];
let todoTitleInput = form.elements['title'];
let todoFileInput = form.elements['file'];
let todoDateInput = form.elements['date'];

function loadTodos() {
    showPreloader();

    todoService.allTodos().catch(error => showAlert(error));
}

function addTodo() {
    showPreloader();

    todoService.insertTodo().catch(error => showAlert(error));
}

function changeTodoStatus(id) {
    showPreloader();

    todoService.editTodo(id).catch(error => showAlert(error));
}

function makeDate(date) {
    return new Date(date).toLocaleString('en-US', {
        weekday: 'short',
        day: 'numeric',
        year: 'numeric',
        month: 'long',
        hour: 'numeric',
        minute: 'numeric'
    }).toString();
}

function renderEntranceForm() {
    const entranceForm = document.querySelector("main");
    if (entranceForm) {
        return;
    }

    const todosContainer = document.querySelector(".container ul");
    if (todosContainer.children.length) {
        clearContainer(todosContainer);
    }

    const navBar = document.querySelector("nav");
    if(navBar) {
        navBar.remove();
    }

    const body = document.body;

    let fragment =
        `<main>
        <div class="circle"></div>
        <div class="register-form-container">
            <form name="entrance_form" action="">
                <h1 class="form-title">
                    Welcome
                </h1>

                <div class="form-fields">
                    <div class="form-field">
                        <input class="entrance-input" type="text" placeholder="Username" name="username" required pattern="[а-яА-Яa-zA-Z]+"
                            title="Username consists of letters only">
                    </div>
                    <div class="form-field">
                        <input class="entrance-input" type="password" placeholder="Password" name="password" required minlength="8" maxlength="128">
                    </div>
                </div>

                <div class="form-buttons">
                    <button class="button button-google" id="id_login">Login</button>
                    <div class="divider">or</div>
                    <button class="button" id="id_register">Register</button>
                </div>

            </form>
        </div>
    </main>`

    body.insertAdjacentHTML('afterbegin', fragment);
}

function renderNavigation() {
    const entrance = document.querySelector("main");

    if (entrance) {
        entrance.remove();
    }

    const body = document.body;

    let fragment =
        `<nav class="teal">
            <div class="nav-wrapper">
                <a class="brand-logo">TODOS</a>
                <ul id="nav-mobile" class="right hide-on-med-and-down">
                    <li class="inactive"><a id="output">All</a></li>
                    <li class="active"><a id="input">New</a></li> 
                    <li><a href="/" id="log_out">Log Out</a></li>                  
                </ul>
            </div>
        </nav>`;

    body.insertAdjacentHTML('afterbegin', fragment);
}

function renderInputForm() {
    const inputForm = document.querySelector(".new-todo");
    if (inputForm) {
        return;
    }

    const todosContainer = document.querySelector(".container ul");
    if (todosContainer.children.length) {
        clearContainer(todosContainer);
    }

    const currentPage = document.querySelector('.active');
    const nextPage = document.querySelector('.inactive');
    currentPage.classList.replace('active', 'inactive');
    nextPage.classList.replace('inactive', 'active');

    document.querySelector(".teal").insertAdjacentHTML(
        'afterend',
        `
                <form class="new-todo" enctype="multipart/form-data" name="new-todo">
        <div class="input-field">
            <input type="text" name="title" placeholder="Todo title" required>
        </div>
        <div class="input-field">
            <input type="datetime-local" name="date" placeholder="Todo date" required>
        </div>

        <label>
            <div class="example-1">
                <div class="form-group">
                    <label class="label">
                        <i class="material-icons">attach_file</i>
                        <span class="title" id="file">Load file</span>
                        <input name="file" type="file">
                    </label>
                </div>
            </div>

            <button class="btn">Add</button>
        </label>
    </form>`
    );

    initForm();
}

function renderTodos(todos) {
    const currentPage = document.querySelector('.active');
    const nextPage = document.querySelector('.inactive');
    currentPage.classList.replace('active', 'inactive');
    nextPage.classList.replace('inactive', 'active');

    const todosContainer = document.querySelector('.container ul');

    if (todosContainer.children.length) {
        clearContainer(todosContainer);
    }

    let fragment = ``;
    todos.forEach(todo => {
        const el = todosTemplate(todo);
        fragment += el;
    });

    todosContainer.insertAdjacentHTML('afterbegin', fragment);
}

function todosTemplate({ id, title, completed, date, hasFile, file }) {
    let html = '';

    if (completed === 'true') {
        html += `
            <li class="todo">
                <form method="post">
                    <label>
                        <div class="status">
                            <input type="checkbox" checked name="completed">
                            <span class="completed">${date}</span>
                        </div>
                        <div class="task-title">
                            <span class="completed">${title}</span>
                        </div>`;
    }
    else {
        html += `
            <li class="todo">
                <form name="todoForm">
                    <label>
                        <div class="status">
                            <input type="checkbox" name="completed">
                            <span>${date}</span>
                        </div>
                        <div class="task-title">
                            <span>${title}</span>
                        </div>`;
    }

    if(hasFile === 'true') {
        html += `
                            <div class="task-file">
                                <form method="get" action="${file}">
                                    <a href="${file}" download="${file}">Download</a>
                                </form>
                            </div>

                        <input type="hidden" value="${id}" name="id">
                        <div class="save">
                            <button class="btn btn-small" id="id_save_state_btn" type="submit">Save</button>
                        </div>
                    </label>
                </form>
            </li>`;
    }
    else {
        html += `
                        <div class="task-file"></div>
                        
                        <input type="hidden" value="${id}" name="id">
                        <div class="save">
                            <button class="btn btn-small" id="id_save_state_btn" type="submit">Save</button>
                        </div>
                    </label>
                </form>
            </li>`;
    }

    return html;
}

function clearContainer(container) {
    let child = container.lastElementChild;
    while (child) {
        container.removeChild(child);
        child = container.lastElementChild;
    }
}

function showAlert(msg, type = 'rounded') {
    M.toast({ html: msg, classes: type });
}

function showPreloader() {
    const preloader = document.querySelector('.progress');

    if (preloader) {
        return;
    }

    document.querySelector('.teal').insertAdjacentHTML(
        'afterend',
        `
        <div class="progress">
            <div class="indeterminate"></div>
        </div>`
    );
}

function removePreloader() {
    const preloader = document.querySelector('.progress');

    if (preloader) {
        preloader.remove();
    }
}

function initForm() {
    form = document.forms['new-todo'];
    todoTitleInput = form.elements['title'];
    todoFileInput = form.elements['file'];
    todoDateInput = form.elements['date'];

    form.addEventListener('submit', async e => {
        e.preventDefault();
        addTodo();
    });

    todoFileInput.addEventListener("change", function () {
        document.getElementById('file').innerHTML = todoFileInput.files[0].name;
    });
}

document.body.addEventListener( 'click', e => {
    switch (e.target.id) {
        case 'id_login':
            e.preventDefault();
            entranceService.login().catch(error => showAlert(error));
            break;

        case 'id_register':
            e.preventDefault();
            entranceService.register().catch(error => showAlert(error));
            break;

        case 'id_save_state_btn':
            e.preventDefault();
            const id = e.path[3].id.defaultValue;
            changeTodoStatus(id);
            break;

        case 'input':
            e.preventDefault();
            renderInputForm();
            break;

        case 'output':
            e.preventDefault();
            const inputForm = document.querySelector(".new-todo");
            if (inputForm) {
                inputForm.remove();
            }
            loadTodos();
            break;

        case 'log_out':
            e.preventDefault();
            if (confirm("Do you want to log out?")) {
                entranceService.logOut().catch(error => showAlert(error));
            }
            break;
    }
});