const todoController = require('../controllers/todoController');
const roleValidation = require('../validation/roleValidation');

exports.getTodos = (ws, msg) => {
    todoController.getAllTodos(msg, ws);
}

exports.newTodo = (ws, msg) => {
    const result = roleValidation('ADMIN', msg)();
    if(result) {
        todoController.addNewTodo(msg, ws);
    }
    else {
        ws.send(JSON.stringify({message: 'Access denied', type: 'error'}));
    }
}

exports.changeTodo = (ws, msg) => {
    todoController.changeTodoStatus(msg, ws);
}