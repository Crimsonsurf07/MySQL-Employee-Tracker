// Employee Department
INSERT INTO departments (name) VALUES
("Management"),
("Development"),
("Technical Support"),
("Sales"),
("Human Resources")

// Roles Title, Salary, and ID
INSERT INTO role ( title, salary, department_id) VALUES
("CEO", 1000000, 1),
("COO", 850000, 1),
("VP of Operations", 700000, 1),
("Regional Manager", 500000, 1),
("Front End Developer", 90000, 2),
("DB Admin", 110000, 2),
("Help Desk 1", 55000, 3),
("Help Desk 2", 61000, 3),
("HR Rep", 50,000, 5);
("HR Manager", 67000, 3)

// Employee Info
INSERT INTO employees (first_name, last_name, role_id, manager_id, department_id) VALUES
("John", "Martin", 1, NULL, 1),
("Noah", "King", 2, 1, 2),
("Abi", "Ponz", 6, 4, 3),
("Tripp", "Daniels", 10, NULL, 5),
("Mohammad", "Muktar", 9, 10, 5),
("John", "Jackson", 3, 3, 2),
("Tony", "Taylor", 5, NULL, 2),
("Calvin", "Parker", 8, 5, 4),
("Luke", "Boyle", 4, 2, 2),
("Adam", "Bowers", 7, NULL, 4),