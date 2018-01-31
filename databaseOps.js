var mysql = require("mysql");
var inquirer = require("inquirer");
var table = require('easy-table');
var chalk = require('chalk');

var userRoles = ["Customer", "Manager", "Supervisor"];

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "root",
    database: "bamazon"
});

var userObject = undefined; // will store this

// constructor
var User = function (userRole) {
    this.role = userRole;
}

User.prototype.printUserRole = function () {
    console.log(chalk.magentaBright.bold(this.role));
}
User.prototype.run = function () {
    userObject = this;
    var role = userObject.role;
    connection.connect(function (err) {
        if (err) {
            console.log(err);
        } else {
            //console.log("connected as id " + connection.threadId + "\n");
            //console.log("role: " + role);
            if (role === userRoles[0]) { // customer
                viewInventory();
            } else if (role == userRoles[1]) { // manager
                askManager();
            } else { // supervisor
                askSuperVisor();
            }
        }
    });
}

// Customer and Manager function
viewInventory = function () {
    var queryStr = "SELECT * FROM products";
    connection.query(queryStr, function (err, res) {
        if (err) throw err;
        //console.log(res);
        if (userObject.role === userRoles[0]) { // customer
            makeTable(res, "Products Available to Purchase:");
            askCustomer();
        } else { // manager
            makeTable(res, "Available Inventory:")
            askManager();
        }
    });
}　

// Customer function
updateProductSales = function (id, sales) {
    var query = connection.query("UPDATE products SET ? WHERE ?", [{
        product_sales: sales
    }, {
        item_id: id
    }], function (err, res) {
        if (err) {
            console.log(err);
        } else {
            //console.log(res);
            console.log("\nProduct Sales Updated\n");
            connection.end();
        }
    });
}

// Customer and Manager function
updateQuantity = function (id, newQuantity, purchaseQuantity, price, sales) {
    var query = connection.query("UPDATE products SET ? WHERE ?", [{
        stock_quantity: newQuantity
    }, {
        item_id: id
    }], function (err, res) {
        if (err) {
            console.log(err);
        } else {
            if (userObject.role === userRoles[0]) { // customer
                //console.log(res);
                var totalPrice = purchaseQuantity * price;
                var totalSales = Number(sales) + Number(totalPrice);
                //console.log("3", newQuantity, purchaseQuantity, price, sales, totalPrice, totalSales);
                console.log(chalk.yellow("\nYour order has been placed!"));
                console.log(chalk.yellow("Total order price: " + totalPrice.toFixed(2)));
                console.log(chalk.yellow("Thanks for shopping with us today.  Please come again."));
                updateProductSales(id, totalSales);
            } else { // manager
                //console.log(res);
                console.log("\nQuantity Updated\n");
                askManager();
            }
        }
    });
}

// Customer function
validateQuantity = function (id, stockQuantity, desiredQuantity, price, sales) {
    //console.log("2",stockQuantity, desiredQuantity, price, sales);
    if (stockQuantity > 0) {
        if (desiredQuantity <= stockQuantity && desiredQuantity > 0) {
            var newQuantity = stockQuantity - desiredQuantity;
            updateQuantity(id, newQuantity, desiredQuantity, price, sales);
        } else {
            console.log(chalk.red("Quantity selected does not exist"));
            var question = [{
                type: 'list',
                name: 'yes_no',
                message: 'Continue?',
                choices: ['Yes', 'No'],
                filter: function (val) {
                    return val.toLowerCase();
                },
                validate: function (val) {
                    if (val === "yes" || val === "y" || val === "no" || val === "n") {
                        return true;
                    } else {
                        return "Enter yes (y) or no (n)";
                    }
                }
            }];
            inquirer.prompt(question).then(function (answer) {
                if (answer.yes_no === "yes" || answer.yes_no === "y") {
                    viewInventory();
                } else {
                    console.log(chalk.blue("Thanks and visit us again"));
                    connection.end();
                }
            });
        }
    } else {
        console.log(chalk.red("Sorry. This item is out-of-stock"));
        var question = [{
            type: 'list',
            name: 'yes_no',
            message: 'Continue?',
            choices: ['Yes', 'No'],
            filter: function (val) {
                return val.toLowerCase();
            },
            validate: function (val) {
                if (val === "yes" || val === "y" || val === "no" || val === "n") {
                    return true;
                } else {
                    return "Enter yes (y) or no (n)";
                }
            }
        }];
        inquirer.prompt(question).then(function (answer) {
            if (answer.yes_no === "yes" || answer.yes_no === "y") {
                viewInventory();
            } else {
                console.log(chalk.blue("Thanks and visit us again"));
                connection.end();
            }
        });
    }
}

// Customer and Manager function
validateProduct = function (id, quantity) {
    //console.log("id:" + id);
    var query = connection.query("SELECT * FROM products WHERE item_id=?", [id], function (err, res) {
        if (err) {
            console.log(err);
            pass = false;
        } else {
            //console.log(res);
            if (res.length) {
                var id = parseInt(res[0].item_id);
                var stockQuantity = parseInt(res[0].stock_quantity);
                if (userObject.role === userRoles[0]) { // customer
                    var desiredQuantity = quantity;
                    var price = parseFloat(res[0].price);
                    var sales = parseFloat(res[0].product_sales);
                    //console.log("1",stockQuantity, desiredQuantity, price, sales);
                    validateQuantity(id, stockQuantity, desiredQuantity, price, sales);
                } else { // manager
                    var newQuantity = Number(stockQuantity) + Number(quantity);
                    updateQuantity(id, newQuantity);
                }
            } else {
                console.log(chalk.red("Product Id is invalid."));
                var question = [{
                    type: 'list',
                    name: 'yes_no',
                    message: 'Continue?',
                    choices: ['Yes', 'No'],
                    filter: function (val) {
                        return val.toLowerCase();
                    },
                    validate: function (val) {
                        if (val === "yes" || val === "y" || val === "no" || val === "n") {
                            return true;
                        } else {
                            return "Enter yes (y) or no (n)";
                        }
                    }
                }];
                inquirer.prompt(question).then(function (answer) {
                    if (answer.yes_no === "yes" || answer.yes_no === "y") {
                        if (userObject.role === userRoles[0]) {
                            viewInventory();
                        } else {
                            addToInventory();
                        }
                    } else {
                        if (userObject.role === userRoles[0]) {
                            console.log(chalk.blue("Thanks and visit us again"));
                        }
                        connection.end();
                    }
                });
            }
        }
    });

    // logs the actual query being run
    //console.log(query.sql);
}

// Manager function
viewLowInventory = function () {
    connection.query("SELECT * FROM products WHERE stock_quantity < 5", function (err, res) {
        if (err) throw err;
        //console.log(res);
        makeTable(res, "Products with low inventory: ");
        askManager();
    });
}

// Manager function
addToInventory = function () {
    var questions = [{
            type: 'input',
            name: 'product_id',
            message: "Enter the product id: ",
            validate: function (value) {
                // verify a number greater than zero was entered
                if (value.match(/\d/g) && value > 0) {
                    return true;
                } else {
                    return chalk.red("Please enter a whole number greater than zero");
                }
            }
        },
        {
            type: 'input',
            name: 'quantity',
            message: "Enter the quantity to add: ",
            validate: function (value) {
                var pass = (value.match(/\d/g) && value > 0);
                if (pass) {
                    return true;
                }
                return chalk.red("Please enter a whole number greater than zero");
            }
        }
    ];
    inquirer.prompt(questions).then(function (answer) {
        //console.log(answer.product_id);
        //console.log(answer.quantity);
        validateProduct(parseInt(answer.product_id), parseInt(answer.quantity));
    });

}

// Manager function
addNewProduct = function () {
    inquirer.prompt([{
            name: "pname",
            message: "Product name?",
            validate: function (value) {
                return value !== '';
            }
        },
        {
            name: "dpname",
            message: "Department name?",
            validate: function (value) {
                return value !== '';
            }
        },
        {
            name: "price",
            message: "Price?",
            validate: function (value) {
                var isValid = !isNaN(parseFloat(value));
                return isValid || "Price should be a number!";
            }
        },
        {
            name: "quantity",
            message: "Stock quantity?",
            validate: function (value) {
                var reg = /^\d+$/;
                return reg.test(value) || "Quantity should be a number!";
            }
        }
    ]).then(function (answers) {
        var query = connection.query("INSERT INTO products SET ?", {
            product_name: answers.pname,
            department_name: answers.dpname,
            price: answers.price,
            stock_quantity: answers.quantity,
            product_sales: 0
        }, function (err, res) {
            if (err) {
                console.log(err);
            } else {
                console.log("\nNew product added\n");
                askManager();
            }
        });
    });
}

// Supervisor function
viewProductSalesByDepartment = function () {
    var queryStr = "SELECT departments.department_id, departments.department_name, departments.over_head_costs, ";
    queryStr += "SUM(products.product_sales) AS product_sales, SUM(products.product_sales) - departments.over_head_costs AS total_profit ";
    queryStr += "FROM products INNER JOIN departments ON products.department_name = departments.department_name ";
    queryStr += "GROUP BY department_name ";
    queryStr += "ORDER BY department_id;";
    
    connection.query(queryStr, function (err, res) {
        if (err) throw err;
        //console.log(res);
        makeTable(res, "Product Sales by Department:");
        askSuperVisor();
    });
}

// Supervisor function
addNewDepartment = function () {
    inquirer.prompt([{
            name: "dpname",
            message: "Department name?",
            validate: function (value) {
                return value !== '';
            }
        },
        {
            name: "overhead_cost",
            message: "Overhead Cost?",
            validate: function (value) {
                var isValid = !isNaN(parseFloat(value));
                return isValid || "Overhead cost should be a number!";
            }
        }
    ]).then(function (answers) {
        var query = connection.query("INSERT INTO departments SET ?", {
            department_name: answers.dpname,
            over_head_costs: answers.overhead_cost
        }, function (err, res) {
            if (err) {
                console.log(err);
            } else {
                console.log("\nNew Department added\n");
                askSuperVisor();
            }
        });
    });
}
　　
makeTable = function (data, tableHeader) {
    var myTable = new table;
   
    console.log(chalk.blue(tableHeader));
    if (userObject.role === userRoles[0] || userObject.role === userRoles[1]) { // customer and manager
        data.forEach(function (product) {
            myTable.cell(chalk.green('Product Id'), product.item_id);
            myTable.cell(chalk.green('Product Name'), product.product_name);
            myTable.cell(chalk.green('Department Name'), product.department_name);
            myTable.cell(chalk.green('Price, USD'), product.price, table.number(2));
            myTable.cell(chalk.green('Quantity'), product.stock_quantity > 0 ? product.stock_quantity : chalk.red(product.stock_quantity));
            myTable.cell(chalk.green('Product Sales'), product.product_sales);
            myTable.newRow();
        });
    } else { // supervisor
        data.forEach(function (department) {
            myTable.cell(chalk.green('Department Id'), department.department_id);
            myTable.cell(chalk.green('Department Name'), department.department_name);
            myTable.cell(chalk.green('Over Head Costs'), department.over_head_costs);
            myTable.cell(chalk.green('Product Sales, USD'), department.product_sales, table.number(2));
            myTable.cell(chalk.green('Total Profit, USD'), department.total_profit);
            myTable.newRow();
        });
    }

    console.log(myTable.toString())
}

function askCustomer() {

    var questions = [{
            type: 'input',
            name: 'product_id',
            message: "Enter the product id of the item to purchase: ",
            validate: function (value) {
                // verify a number greater than zero was entered
                if (value.match(/\d/g) && value > 0) {
                    return true;
                } else {
                    return chalk.red("Please enter a whole number greater than zero");
                }
            }
        },
        {
            type: 'input',
            name: 'quantity',
            message: "Enter the quantity to purchase: ",
            validate: function (value) {
                var pass = (value.match(/\d/g) && value > 0);
                if (pass) {
                    return true;
                }
                return chalk.red("Please enter a whole number greater than zero");
            }
        }
    ];

    inquirer.prompt(questions).then(function (answer) {
        // verify product id is in database
        validateProduct(answer.product_id, parseInt(answer.quantity));
    });
}

function askManager() {
    inquirer
        .prompt([{
            type: 'rawlist',
            name: 'manager_menu',
            message: 'What do you want to do?',
            choices: [{
                    key: '1',
                    name: 'View Products for Sale',
                    value: '1'
                },
                {
                    key: '2',
                    name: 'View Low Inventory',
                    value: '2'
                },
                {
                    key: '3',
                    name: 'Add to Inventory',
                    value: '3'
                },
                {
                    key: '4',
                    name: 'Add New Product',
                    value: '4'
                },
                {
                    key: '5',
                    name: 'Quit',
                    value: '5'
                }
            ]
        }]).then(function (answer) {
            //console.log(JSON.stringify(answer, null, '  '));
            switch (answer.manager_menu) {
                case "1":
                    viewInventory();
                    break;
                case "2":
                    viewLowInventory();
                    break;
                case "3":
                    addToInventory();
                    break;
                case "4":
                    addNewProduct();
                    break;
                case "5":
                    connection.end();
                    break;
            };
        });
}

function askSuperVisor() {
    inquirer
        .prompt([{
            type: 'rawlist',
            name: 'supervisor_menu',
            message: 'What do you want to do?',
            choices: [{
                    key: '1',
                    name: 'View Product Sales by Department',
                    value: '1'
                },
                {
                    key: '2',
                    name: 'Create New Department',
                    value: '2'
                },
                {
                    key: '3',
                    name: 'Quit',
                    value: '3',
                }
            ]
        }]).then(function (answer) {
            //console.log(JSON.stringify(answer, null, '  '));
            switch (answer.supervisor_menu) {
                case "1":
                    viewProductSalesByDepartment();
                    break;
                case "2":
                    addNewDepartment();
                    break;
                case "3":
                    connection.end();
                    break;
            };
        });
}

module.exports = {
    User: User,
    userRoles: userRoles
};