var mysql = require("mysql");
var inquirer = require("inquirer");
var table = require('easy-table');
var chalk = require('chalk');

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
    //makeTable();
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

function readProducts() {
    console.log("Selecting all products...\n");
    connection.query("SELECT * FROM products", function (err, res) {
        if (err) throw err;
        console.log(res);
        makeProductTable(res);
        ask();
        //       connection.end();
    });
}

function validateProduct(id, quantity) {
    var pass = false;
    var query = connection.query("SELECT * FROM products WHERE item_id=?", [id], function (err, res) {
        var question = [{
            type: 'list',
            name: 'yes_no',      
            message: 'Select product and quantity to purchase?',             
            choices: ['Yes', 'No'],           
            filter: function(val) {  
              return val.toLowerCase();  
            },
            validate: function(val) {
                if (val === "yes" || val === "y" || val === "no" || val === "n" ) {
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
                console.log("quantity: " + quantity);
                var stock_quantity = parseInt(res[0].stock_quantity);
                var desired_quantity = parseInt(quantity);
                console.log("desired_quantity: " + quantity);
                console.log("stock_quantity: " + stock_quantity);
                if (stock_quantity > 0) {
                    if (desired_quantity <= stock_quantity && desired_quantity > 0) {
                        console.log("we are good");
                    } else {
                        console.log(chalk.yellow("quantity selected does not exist"));
                        inquirer.prompt(question).then(function(answer) {
                            if (answer.yes_no === "yes" || answer.yes_no === "y") {
                                readProducts();
                            } else {
                                console.log(chalk.blue("Thanks and visit us again"));
                                connection.end();
                            }
                        });
                    }
                } else {
                    console.log("here");
                }
            } else {
                console.log(chalk.red("Please enter a valid product id"));
                inquirer.prompt(question).then(function(answer) {
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