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

var User = function (userRole) {
    this.role = userRole;
}

User.prototype.printUserRole = function () {
    console.log(this.role);
}
User.prototype.run = function () {
    var myObject = this;
    var role = myObject.role;
    connection.connect(function (err) {
        if (err) {
            console.log(err);
        } else {
            console.log("connected as id " + connection.threadId + "\n");
            console.log("role: " + role);
            if (role === userRoles[0]) { // customer
                viewInventory(myObject);
            } else if (role == userRoles[1]) {
                askManager(myObject);
            } else {
                console.log("Under Construction");
            }
        }
    });
}

viewInventory = function (myObject) {
    connection.query("SELECT * FROM products", function (err, res) {
        if (err) throw err;
        //console.log(res);
        makeTable(res);
        if (myObject.role === userRoles[0]) { // customer
            askCustomer(myObject);
        } else if (myObject.role === userRoles[1]) { // manager
            askManager(myObject);
        } else {
            console.log("Under Construction");
        }
    });
}　
updateQuantity = function (myObject, id, quantity, price) {
    var query = connection.query("UPDATE products SET ? WHERE ?", [{
        stock_quantity: quantity
    }, {
        item_id: id
    }], function (err, res) {
        if (err) {
            console.log(err);
        } else {
            if (myObject.role === userRoles[0]) {
                //console.log(res);
                console.log("Your order has been placed");
                console.log("Total order price: " + (quantity * price));
                console.log("Thanks for shopping with us today.  Please come again.");
                connection.end();
            } else {
                //console.log(res);
                console.log("Quantity Updated");
                askManager(myObject);
            }
        }
    });
}

　
validateQuantity = function (myObject, id, stockQuantity, desiredQuantity, price) {
    if (stockQuantity > 0) {
        if (desiredQuantity <= stockQuantity && desiredQuantity > 0) {
            updateQuantity(myObject, id, (stockQuantity - desiredQuantity), price);
        } else {
            console.log(chalk.yellow("quantity selected does not exist"));
            if (onError()) {
                viewInventory(myObject);
            } else {
                console.log(chalk.blue("Thanks and visit us again"));
                connection.end();
            }
        }
    } else {
        console.log("This item is out-of-stock");
    }
}

validateProduct = function (myObject, id, quantity) {
    console.log("id:" + id);
    var query = connection.query("SELECT * FROM products WHERE item_id=?", [id], function (err, res) {
        if (err) {
            console.log(err);
            pass = false;
        } else {
            //console.log(res);
            if (res.length) {
                var id = parseInt(res[0].item_id);
                var stockQuantity = parseInt(res[0].stock_quantity);

                if (myObject.role === userRoles[0]) {
                    var desiredQuantity = parseInt(quantity);
                    var price = parseFloat(res[0].price);
                    validateQuantity(myObject, id, stockQuantity, desiredQuantity, price);
                } else {
                    var newQuantity = stockQuantity + quantity;
                    updateQuantity(myObject, id, newQuantity);
                }
            } else {
                console.log(chalk.red("Product Id is invalid."));
                if (onError()) {
                    if (thimyObjects.role === userRoles[0]) {
                        viewInventory(myObject);
                    } else {
                        addToInventory(myObject);
                    }
                } else {
                    if (myObject.role === userRoles[0]) {
                        console.log(chalk.blue("Thanks and visit us again"));
                    }
                    connection.end();
                }
            }
        }
    });

    // logs the actual query being run
    //console.log(query.sql);
}

viewLowInventory = function (myObject) {
    connection.query("SELECT * FROM products WHERE stock_quantity < 5", function (err, res) {
        if (err) throw err;
        //console.log(res);
        makeTable(res);
        askManager(myObject);
    });
}

　
addToInventory = function (myObject) {
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
        validateProduct(myObject, answer.product_id, answer.quantity);
    });

}

addNewProduct = function (myObject) {
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
            stock_quantity: answers.quantity
        }, function (err, res) {
            if (err) {
                console.log(err);
            } else {
                console.log("New product added");
                askManager(myObject);
            }
        });
    });

}

function onError() {
    var question = [{
        type: 'list',
        name: 'yes_no',
        message: 'Select product and quantity to purchase?',
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
            return true;
            readProducts();
        } else {
            return false;
            console.log(chalk.blue("Thanks and visit us again"));
            connection.end();
        }
    });

}

　　
makeTable = function (data) {
    var myTable = new table;
    if (this.role === userRoles[0]) { // customer
        console.log(chalk.blue("Products Available to Purchase:"));
    } else {
        console.log(chalk.blue("Available Inventory"));
    }

    data.forEach(function (product) {
        myTable.cell(chalk.green('Product Id'), product.item_id);
        myTable.cell(chalk.green('Product Name'), product.product_name);
        myTable.cell(chalk.green('Department Name'), product.department_name);
        myTable.cell(chalk.green('Price, USD'), product.price, table.number(2));
        myTable.cell(chalk.green('Quantity'), product.stock_quantity > 0 ? product.stock_quantity : chalk.red(product.stock_quantity));
        myTable.newRow();
    })

    console.log(myTable.toString())
}

function askCustomer(myObject) {

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
        validateProduct(myObject, answer.product_id, answer.quantity);
    });
}

function askManager(myObject) {
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
                    value: '5',
                    filter: function (value) {
                        return value.toLowerCase();
                    }
                }
            ]
        }]).then(function (answer) {
            //console.log(JSON.stringify(answer, null, '  '));
            switch (answer.manager_menu) {
                case "1":
                    viewInventory(myObject);
                    break;
                case "2":
                    viewLowInventory(myObject);
                    break;
                case "3":
                    addToInventory(myObject);
                    break;
                case "4":
                    addNewProduct(myObject);
                    break;
                case "5":
                    connection.end();
                    break;
            };
        });
}

module.exports = {
    User: User,
    userRoles: userRoles
};