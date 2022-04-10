const fs = require('fs');
const path = require('path');
const filePath = 'models/todo.json';

class todoController{
    async getAllTodos(req, res) {
        try {
            const content = fs.readFileSync(filePath,{encoding: 'utf-8', flag: 'r'});
            res.send(JSON.parse(content));
        }
        catch (e) {
            console.log(e);
            res.send(400).json({message: `Couldn't read database`});
        }
    }

    async addNewTodo(req, res) {
        if(!req.body) {
            return res.sendStatus(400);
        }

        let fileFlag = false;
        let file = '';

        if (req.file !== undefined) {
            fileFlag = true;
            file = path.join('./uploads/' + req.file.filename);
        }

        const todoTitle = req.body.title;
        const todoDate = req.body.date;

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

        res.send(todo);
    }

    async changeTodoStatus(req, res) {
        if(!req.body) {
            return res.sendStatus(400);
        }

        const id = req.body.id;
        const data = fs.readFileSync(filePath,{encoding: 'utf-8', flag: 'r'});
        const todos = JSON.parse(data);

        todos.todo.forEach(todo => {
            if(todo.id === id) {
                todo.completed = todo.completed === 'false' ? 'true' : 'false';
            }
        });

        const newData = JSON.stringify(todos);
        fs.writeFileSync(filePath, newData);

        res.send(todos);
    }
}

module.exports = new todoController;