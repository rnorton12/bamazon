var mysql = require("mysql");
var inquirer = require("inquirer");
var table = require('easy-table');
var chalk = require('chalk');

customer = new User(User.userRoles[0]);
customer.connectToDatabase();
ask();

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "root",
    database: "bamazon"
});

connection.connect(function (err) {
    if (err) throw err;
    console.log("connected as id " + connection.threadId + "\n");
    readProducts();
});

function makeProductTable(data) {
    var myTable = new table;
    console.log(chalk.blue("Products Available to Purchase:"));

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

function viewInventory() {
    connection.query("SELECT * FROM products", function (err, res) {
        if (err) throw err;
        console.log(res);
        makeProductTable(res);
        ask();
    });
}

function updateQuantity(id, quantity, price) {
    var query = connection.query("UPDATE products SET ? WHERE ?", [{ stock_quantity: quantity }, { item_id: id}], function (err, res) {
        if (err) {
            console.log(err);
        } else {
            console.log(res);
            console.log("Your order has been placed");
            console.log("Total order price: " + (quantity * price));
            console.log("Thanks for shopping with us today.  Please come again.");
            connection.end();
        }
    });
}

function validateQuantity(id, stockQuantity, desiredQuantity, price) {
    if (stockQuantity > 0) {
        if (desiredQuantity <= stockQuantity && desiredQuantity > 0) {
            updateQuantity(id, (stockQuantity - desiredQuantity), price);
        } else {
            console.log(chalk.yellow("quantity selected does not exist"));
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
        console.log("This item is out-of-stock");
    }
}

function validateProduct(id, quantity) {
    var pass = false;
    var query = connection.query("SELECT * FROM products WHERE item_id=?", [id], function (err, res) {
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

        if (err) {
            console.log(err);
            pass = false;
        } else {
            console.log(res);
            if (res.length) {
                // validate quantity
                var id = parseInt(res[0].item_id);
                var stockQuantity = parseInt(res[0].stock_quantity);
                var desiredQuantity = parseInt(quantity);
                var price = parseFloat(res[0].price);
                validateQuantity(id, stockQuantity, desiredQuantity, price);
            } else {
                console.log(chalk.red("Please enter a valid product id"));
                inquirer.prompt(question).then(function (answer) {
                    if (answer.yes_no === "yes" || answer.yes_no === "y") {
                        readProducts();
                    } else {
                        console.log(chalk.blue("Thanks and visit us again"));
                        connection.end();
                    }
                });
            }
        }
    });

    // logs the actual query being run
    //console.log(query.sql);
}

　
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

function ask() {

    inquirer.prompt(questions).then(function(answer) {
        // verify product id is in database
        validateProduct(answer.product_id, answer.quantity);
    });
}
