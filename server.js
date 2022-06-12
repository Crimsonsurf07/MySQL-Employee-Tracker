// Variables
require('dotenv').config();
const express = require('express');
const inquirer = require('inquirer');
const figlet = require('figlet');
const consoleTable = require('console.table')
const PORT = process.env.PORT || 3333;
const app = express();
const mysql = require("mysql2");
const morgan = require('morgan');

const db = require('./db/connection')




// Middleware

app.use(express.urlencoded({ extended: false }));
app.use(express.json());


if (app.get('env') !== 'test') {
  app.use(morgan('dev')); // Hook up the HTTP logger
}




// catch 404 and forward to error handler
if (app.get('env') !== 'development') {
  app.use((req, res, next) => {
    const err = new Error('Not Found: ' + req.url);
    err.status = 404;
    next(err);
  });
}

const syncOptions = {
  force: process.env.FORCE_SYNC === 'true'
};

if (app.get('env') === 'test') {
  syncOptions.force = true;
}

// db.sequelize.sync(syncOptions).then(() => {
//   if (app.get('env') !== 'test' && syncOptions.force) {
//     require('./db/seed')(db);
//   }

//code from figlet module to display a drawing of employee tracker before first prompt
figlet('EMPLOYEE TRACKER!!', function(err, data) {
  if (err) {
    console.log('Something went wrong...');
    console.dir(err);
    return;
}
console.log(data)
});


db.connect(function(err) {
    if (err) throw err;
    startApp();
  });
 
//Function that starts the app and prompt the questions
const startApp = () => {
  inquirer
    .prompt({
      name: "action",
      type: "rawlist",
      message: "What would you like to do?",
      choices: [
          "View departments",
          "Add department",
          "View roles",
          "Add role",
        "View All Employees",
        "View All Employees By Department",
        "Add Employee",
        "Remove Employee",
        "Update Employee Role",
        "Update Employee Manager",
        "EXIT"
      ]
    })
.then(function(answer) {
    switch (answer.action) {
    case "View All Current employees":
      viewEmployees();
      break;

    case "View All Current Employees By their departments":
      viewEmployeesByDept();
      break;

    case "View All departments":
      viewDept();
      break;
    
    case "View All Current roles":
      viewRoles();
      break;

    case "Add A NEW Employee":
      addEmployee();
      break;
  
    case "Add A NEW department":
      addDept();
      break;
    
    case "Add A NEW role":
      addRole();
      break;

    case "Remove A Current Employee":
      removeEmployee();
      break;
    
    case "Update A Current Employees Role":
      updateEmployeeRole();
      break;
    
    case "Update Employee Manager":
      updateEmployeeMng();
      break;
    
    case "EXIT":
      console.log("Thank You For Using This Employee Tracker Application, Where Adding, Updating, and Deleting Employee Information Is a Breeze!")
      process.exit();
    }
  });
}

//Function view all employees
const viewEmployees= () =>  {
    const query = `SELECT employees.id, employees.first_name, employees.last_name, role.title, departments.name AS department, role.salary, 
    CONCAT(manager.first_name, ' ', manager.last_name) AS Manager FROM employees LEFT JOIN role on employees.role_id = role.id 
    LEFT JOIN departments on role.department_id = departments.id LEFT JOIN employees manager on manager.id = employees.manager_id;`;
    connection.query(query, function(err, query){
        console.table(query);
        startApp();
    });
};

//Function view all employees by department
const viewEmployeesByDept = () => {
    const query =`SELECT departments.name AS department, employees.id, employees.first_name, employees.last_name, role.title FROM employees LEFT JOIN role on 
    employees.role_id = role.id LEFT JOIN departments departments on role.department_id = departments.id WHERE departments.id;`;
    connection.query(query, function(err, query){
      console.table(query);
      startApp();
  });
};

//Function to view all departments
const viewDept= () => {
  const query = `select id AS Dept_ID, name AS departments from departments;`;
  connection.query(query, function(err, query){
    console.table(query);
    startApp();
  });
};

//Function to view all roles
const viewRoles = () => {
  const query = `select id AS Role_ID, title, salary AS Salaries from role;`;
  connection.query(query, function(err, query){
    console.table(query);
    startApp();
  });
};

//Function to add a new employee
const addEmployee = () => {
  //arrays to display prompt choices from database items 
  const roleChoice = [];
  connection.query("SELECT * FROM role", function(err, resRole) {
    if (err) throw err;
    for (const i = 0; i < resRole.length; i++) {
      const roleList = resRole[i].title;
      roleChoice.push(roleList);
    };

    const deptChoice = [];
    connection.query("SELECT * FROM departments", function(err, resDept) {
      if (err) throw err;
      for (const i = 0; i < resDept.length; i++) {
        const deptList = resDept[i].name;
        deptChoice.push(deptList);
    }
    
  inquirer
    .prompt([
    {
      name: "firstName",
      type: "input",
      message: "What is your employee's first name:"
    },
    {
      name: "lastName",
      type: "input",
      message: "What is your employee's last name:"
    },
    {
      name: "role_id",
      type: "rawlist",
      message: "Select your current employee's role:",
      choices: roleChoice
    },
    {
      name: "department_id",
      type: "rawlist",
      message: "Select your current employee's department:",
      choices: deptChoice
    },

  ])
    .then(function(answer) {
      //for loop to retun 
      let chosenRole;
        for (const i = 0; i < resRole.length; i++) {
          if (resRole[i].title === answer.role_id) {
            chosenRole = resRole[i];
          }
        };

        let chosenDept;
        for (const i = 0; i < resDept.length; i++) {
          if (resDept[i].name === answer.department_id) {
            chosenDept = resDept[i];
          }
        };
      //connection to insert response into database  
      connection.query(
        "INSERT INTO employees SET ?",
        {
          first_name: answer.firstName,
          last_name: answer.lastName,
          role_id: chosenRole.id,
          department_id: chosenDept.id
        },
        function(err) {
          if (err) throw err;
          console.log("Employee " + answer.firstName + " " + answer.lastName + " successfully added NEW employee to the database!");
          startApp();
        }
      );
    })
   });
  })
};

//Function to add department
const addDept = () => {
  inquirer
    .prompt([
    {
      name: "dept",
      type: "input",
      message: "What is the NEW department's name:"
    }
  ])
  .then(function(answer) {
    connection.query(
      "INSERT INTO departments SET ?",
      {
        name: answer.dept
      },
      function(err) {
        if (err) throw err;
        console.log("Department " + answer.dept + " successfully added a NEW department to the database!");
        startApp();
      }
    );
  });
};

//Function to new add role
const addRole = () => {
  const deptChoice = [];
    connection.query("SELECT * FROM departments", function(err, resDept) {
      if (err) throw err;
      for (const i = 0; i < resDept.length; i++) {
        const deptList = resDept[i].name;
        deptChoice.push(deptList);
    }

  inquirer
  .prompt([
  {
    name: "title",
    type: "input",
    message: "What is the new roles?:"
  },
  {
    name: "salary",
    type: "number",
    message: "What is the new roles income salary:"
  },
  {
    name: "department_id",
    type: "rawlist",
    message: "Which department is affected?:",
    choices: deptChoice
  }
])
.then(function(answer) {

  let chosenDept;
        for (const i = 0; i < resDept.length; i++) {
          if (resDept[i].name === answer.department_id) {
            chosenDept = resDept[i];
          }
        };

  connection.query(
    "INSERT INTO role SET ?",
    {
      title: answer.title,
      salary:answer.salary,
      department_id: chosenDept.id
    },
    function(err) {
      if (err) throw err;
      console.log("New role " + answer.title + " successfully added a NEW role to the database!");
      startApp();
    }
  );
});
})
};

//Function to remove employee
const removeEmployee = () => {
  const empChoice = [];
    connection.query("SELECT id, CONCAT(first_name, ' ', last_name) AS name FROM employees", function(err, resEmp) {
      if (err) throw err;
      for (const i = 0; i < resEmp.length; i++) {
        const empList = resEmp[i].name;
        empChoice.push(empList);
    };

  inquirer
    .prompt([
      {
        name: "employee_id",
        type: "rawlist",
        message: "Which current employee would you like to delete?:",
        choices: empChoice
      },
  ])
  .then(function(answer) {

    let chosenEmp;
        for (const i = 0; i < resEmp.length; i++) {
          if (resEmp[i].name === answer.employee_id) {
            chosenEmp = resEmp[i];
        }
      };

    connection.query(
      "DELETE FROM employees WHERE id=?",
      [chosenEmp.id],

      function(err) {
        if (err) throw err;
        console.log("The employee has been successfully removed from the database!");
        startApp();
      }
    );
   });
  })
};

//Function to update employee role
const updateEmployeeRole = () => {
  const empChoice = [];
    connection.query("SELECT id, CONCAT(first_name, ' ', last_name) AS name FROM employees", function(err, resEmp) {
      if (err) throw err;
      for (const i = 0; i < resEmp.length; i++) {
        const empList = resEmp[i].name;
        empChoice.push(empList);
    };
    
    const roleChoice = [];
  connection.query("SELECT * FROM role", function(err, resRole) {
    if (err) throw err;
    for (const i = 0; i < resRole.length; i++) {
      const roleList = resRole[i].title;
      roleChoice.push(roleList);
    };

    inquirer
    .prompt([
    {
      name: "employee_id",
      type: "rawlist",
      message: "Select the employee you would like to update:",
      choices: empChoice
    },
    {
      name: "role_id",
      type: "rawlist",
      message: "Select the employee's new role:",
      choices: roleChoice
    }
  ])
  .then(function(answer) {

    let chosenEmp;
        for (const i = 0; i < resEmp.length; i++) {
          if (resEmp[i].name === answer.employee_id) {
            chosenEmp = resEmp[i];
        }
      };

    let chosenRole;
      for (const i = 0; i < resRole.length; i++) {
        if (resRole[i].title === answer.role_id) {
          chosenRole = resRole[i];
        }
      };
      connection.query(
        "UPDATE employees SET role_id = ? WHERE id = ?",
        [chosenRole.id, chosenEmp.id],
        function(err) {
          if (err) throw err;
          console.log("The employee's new role has been successfully updated in the database!");
          startApp();
        }
      );
    })
   })
  })
};

//Function to update employee manager
const updateEmployeeMng = () => {
  const empChoice = [];
    connection.query("SELECT id, CONCAT(first_name, ' ', last_name) AS name FROM employees", function(err, resEmp) {
      if (err) throw err;
      for (const i = 0; i < resEmp.length; i++) {
        const empList = resEmp[i].name;
        empChoice.push(empList);
    };

    inquirer
    .prompt([
    {
      name:"employees",
      type: "rawlist",
      message: "Choose the employee you would like to update the manager for:",
      choices: empChoice
    },
    {
      name: "Managerid",
      type: "rawlist",
      message: "Choose the correct manager for the employee:",
      choices: empChoice
    }
  ])
  .then(function(answer) {

    let chosenEmp;
        for (const i = 0; i < resEmp.length; i++) {
          if (resEmp[i].name === answer.employees) {
            chosenEmp = resEmp[i];
        }
      };
      let chosenManager;
        for (const i = 0; i < resEmp.length; i++) {
          if (resEmp[i].name === answer.Managerid) {
            chosenManager = resEmp[i];
        }
      };
      connection.query(
        "UPDATE employees SET manager_id = ? WHERE id = ?",

        [chosenManager.id, chosenEmp.id],
        function(err) {
          if (err) throw err;
          console.log("Employee Manager successfully updated!");
          startApp();
        }
      );
    })
   })
};

  app.listen(PORT, () => {
    console.log(`App listening on port: ${PORT}`);
  });
// });

