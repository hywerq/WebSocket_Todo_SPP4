const fs = require('fs');
const path = require('path');
const filePath = '../server/data/todo.json';

class todoController{
    async getAllTodos(msg, ws) {
        try {
            const content = fs.readFileSync(filePath,{encoding: 'utf-8', flag: 'r'});
            ws.send(JSON.stringify({response: 'todos', todos: content}));
        }
        catch (e) {
            console.log(e);
            ws.send(JSON.stringify({message: `Couldn't read file`, type: 'error'}));
        }
    }

    async addNewTodo(msg, ws) {
        const req = JSON.parse(msg.body);

        if(!req) {
            ws.send(JSON.stringify({message: 'Error', type: 'error'}));
        }

        let fileFlag = false;
        let file = '';

        if (req.file !== undefined) {
            fileFlag = true;
            file = path.join('./uploads/' + req.file.filename);
        }

        const todoTitle = req.title;
        const todoDate = req.date;

        const data = fs.readFileSync(filePath,{encoding: 'utf-8', flag: 'r'});
        const todos = JSON.parse(data);
        const id = Math.max.apply(Math, todos.todo.map(function(o){ return o.id; }));

        let todo = {
            id: (id + 1).toString(),
            title: todoTitle,
            date: todoDate,
            hasFile: fileFlag.toString(),
            file: file,
            completed: 'false'
        };

        todos.todo.push(todo);

        const newData = JSON.stringify(todos);
        fs.writeFileSync(filePath, newData);

        ws.send(JSON.stringify({message: 'Successfully added!'}));
    }

    async changeTodoStatus(msg, ws) {
        const req = JSON.parse(msg.body);
        if(!req) {
            ws.send(JSON.stringify({message: 'Error', type: 'error'}));
        }

        const id = req.id;
        const data = fs.readFileSync(filePath,{encoding: 'utf-8', flag: 'r'});
        const todos = JSON.parse(data);

        todos.todo.forEach(todo => {
            if(todo.id === id) {
                todo.completed = todo.completed === 'false' ? 'true' : 'false';
            }
        });

        const newData = JSON.stringify(todos);
        fs.writeFileSync(filePath, newData);

        ws.send(JSON.stringify({response: 'todos', todos: newData }));
    }
}

module.exports = new todoController;