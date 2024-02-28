
const inquirer = require('inquirer');
const mysql = require('mysql2');

const pool = mysql.createPool({
  host: 'localhost',
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});
 

// Connect to the database


// Function to start the application
function start() {
  inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: 'What would you like to do?',
      choices: [
        'View all departments',
        'View all roles',
        'View all employees',
        'Add a department',
        'Add a role',
        'Add an employee',
        'Update an employee role',
        'Exit'
      ]
    }
  ]).then((answers) => {
    switch (answers.action) {
      case 'View all departments':
        viewDepartments();
        break;
      case 'View all roles':
        viewRoles();
        break;
      case 'View all employees':
        viewEmployees();
        break;
      case 'Add a department':
        addDepartment();
        break;
      case 'Add a role':
        addRole();
        break;
      case 'Add an employee':
        addEmployee();
        break;
      case 'Update an employee role':
        updateEmployeeRole();
        break;
      case 'Exit':
        connection.end();
        console.log('Goodbye!');
        break;
    }
  });
}

// Function to view all departments
function viewDepartments() {
  pool.query('SELECT * FROM department', (err, res) => {
    if (err) throw err;
    console.table(res);
    start();
  });
}

// Function to view all roles
function viewRoles() {
  pool.query('SELECT role.id, role.title, role.salary, department.name AS department FROM role LEFT JOIN department ON role.department_id = department.id', (err, res) => {
    if (err) throw err;
    console.table(res);
    start();
  });
}

// Function to view all employees
function viewEmployees() {
  const query = 'SELECT employee.id, employee.first_name, employee.last_name, role.title, department.name AS department, role.salary, CONCAT(manager.first_name, " ", manager.last_name) AS manager FROM employee LEFT JOIN role ON employee.role_id = role.id LEFT JOIN department ON role.department_id = department.id LEFT JOIN employee manager ON employee.manager_id = manager.id';
  pool.query(query, (err, res) => {
    if (err) throw err;
    console.table(res);
    start();
  });
}

// Function to add a department
function addDepartment() {
  inquirer.prompt([
    {
      type: 'input',
      name: 'name',
      message: 'Enter the name of the department:'
    }
  ]).then((answers) => {
    pool.query('INSERT INTO department SET ?', { name: answers.name }, (err, res) => {
      if (err) throw err;
      console.log('Department added successfully!');
      start();
    });
  });
}

// Function to add a role
function addRole() {
  inquirer.prompt([
    {
      type: 'input',
      name: 'title',
      message: 'Enter the title of the role:'
    },
    {
      type: 'input',
      name: 'salary',
      message: 'Enter the salary for the role:'
    },
    {
      type: 'input',
      name: 'department_id',
      message: 'Enter the department id for the role:'
    }
  ]).then((answers) => {
    pool.query('INSERT INTO role SET ?', { title: answers.title, salary: answers.salary, department_id: answers.department_id }, (err, res) => {
      if (err) throw err;
      console.log('Role added successfully!');
      start();
    });
  });
}

// Function to add an employee
function addEmployee() {
  inquirer.prompt([
    {
      type: 'input',
      name: 'first_name',
      message: 'Enter the first name of the employee:'
    },
    {
      type: 'input',
      name: 'last_name',
      message: 'Enter the last name of the employee:'
    },
    {
      type: 'input',
      name: 'role_id',
      message: 'Enter the role id for the employee:'
    },
    {
      type: 'input',
      name: 'manager_id',
      message: 'Enter the manager id for the employee (leave empty if none):'
    }
  ]).then((answers) => {
    pool.query('INSERT INTO employee SET ?', { first_name: answers.first_name, last_name: answers.last_name, role_id: answers.role_id, manager_id: answers.manager_id || null }, (err, res) => {
      if (err) throw err;
      console.log('Employee added successfully!');
      start();
    });
  });
}

// Function to update an employee role
function updateEmployeeRole() {
  pool.query('SELECT * FROM employee', (err, employees) => {
    if (err) throw err;
    const employeeChoices = employees.map(employee => ({
      name: `${employee.first_name} ${employee.last_name}`,
      value: employee.id
    }));

    inquirer.prompt([
      {
        type: 'list',
        name: 'employeeId',
        message: 'Select the employee to update:',
        choices: employeeChoices
      },
      {
        type: 'input',
        name: 'newRoleId',
        message: 'Enter the new role id for the employee:'
      }
    ]).then((answers) => {
      pool.query('UPDATE employee SET ? WHERE ?', [{ role_id: answers.newRoleId }, { id: answers.employeeId }], (err, res) => {
        if (err) throw err;
        console.log('Employee role updated successfully!');
        start();
      });
    });
  });
}
pool.getConnection((err, connection) => {
  if (err) {
    console.error('Error connecting to MySQL database:', err);
  } else {
    console.log('Connected to MySQL database.');
    start(); // Start the application 
  }
});