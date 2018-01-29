// Challenge #2: Manager View (Next Level)

// Create a new Node application called bamazonManager.js. Running this application will:
// List a set of menu options:
// View Products for Sale
// View Low Inventory
// Add to Inventory
// Add New Product
// If a manager selects View Products for Sale, the app should list every available item: the item IDs, names, prices, and quantities.
// If a manager selects View Low Inventory, then it should list all items with an inventory count lower than five.
// If a manager selects Add to Inventory, your app should display a prompt that will let the manager "add more" of any item currently in the store.
// If a manager selects Add New Product, it should allow the manager to add a completely new product to the store.

var mysql = require("mysql");
var inquirer = require("inquirer");
var table = require('easy-table');
var chalk = require('chalk');

var User = require("./databaseOps.js");

customer = new User(User.userRoles[1]);
customer.createConnection();
customer.database.connection.connect(function (err) {
    if (err) throw err;
    console.log("connected as id " + connection.threadId + "\n");
    ask();
}

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
    ask();
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
    console.log("Selecting all products...\n");
    connection.query("SELECT * FROM products", function (err, res) {
        if (err) throw err;
        console.log(res);
        makeProductTable(res);
        ask();
    });
}

function viewLowInventory() {
    connection.query("SELECT * FROM products WHERE stock_quantity < 5", function (err, res) {
        if (err) throw err;
        console.log(res);
        makeProductTable(res);
        ask();
    });
}

　
function addToInventory() {
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
    inquirer.prompt(question).then(function (answer) {
        validateProduct(answer.id, answer.quantity);
    });

}

function updateQuantity(id, quantity) {
    var query = connection.query("UPDATE products SET ? WHERE ?", [ { stock_quantity: quantity }, { item_id: id } ], function (err, res) {
        if (err) {
            console.log(err);
        } else {
            console.log(res);
            console.log("Quantity Updated");
            ask();
        }
    });
}

function validateProduct(id, quantity) {

    var query = connection.query("SELECT * FROM products WHERE item_id=?", [id], function (err, res) {
        var question = [
            { 
                 type: 'confirm', 
                 name: 'continue_on', 
                 message: 'Continue?', 
                 default: false 
            }
        ];

        if (err) {
            console.log(err);
            pass = false;
        } else {
            console.log(res);
            if (res.length) {
               // adjust the quantity
               var stock_quantity = parseInt(res[0].stock_quantity);
               var newQuantity = stock_quantity + quantity;
               updateQuantity(id, newQuantity);
            } else {
                console.log(chalk.red("Product Id is invalid."));
                inquirer.prompt(question).then(function (answer) {
                    if (answer.continue_on) {
                        addToInventory();
                    }
                });
            }
        }
    });

    // logs the actual query being run
    //console.log(query.sql);
}

function addNewProduct() {
    inquirer.prompt([
    { name: "pname",
      message: "Product name?",
      validate: function(value){
        return value !== '';
    }

    }, 
    { name: "dpname",
      message: "Department name?",
      validate: function(value){
        return value !== '';
    },
    { name: "price",
      message: "Price?",
      validate: function(value) {
       var isValid = !_.isNaN(parseFloat(value));
       return isValid || "Price should be a number!";
     }
    }, 
    { name: "quantity",
      message: "Stock quantity?",
      validate: function(value) {
       var reg = /^\d+$/;
        return reg.test(value) || "Quantity should be a number!";
     }
    }
    ]).then(function(answers) {
        var query = connection.query("INSERT INTO products SET ?", {product_name: answers.pname, department_name: answers.dpname, price: answers.price, stock_quantity: answers.quantity}, , function (err, res) {
            if (err) {
                console.log(err);
            } else {
                console.log("New product added");
            }
        });
    });
    
}

function ask() {
    inquirer
   .prompt([
     {
         type: 'rawlist',
         name: 'manager_menu',
         message: 'What do you want to do?',
         choices: [
         {
             key: 'a', 
             name: 'View Products for Sale', 
             value: 'a' 
         },
         {
             key: 'b', 
             name: 'View Low Inventory', 
             value: 'b' 
         },
         {
             key: 'c', 
             name: 'Add to Inventory', 
             value: 'c' 
         },
         {
             key: 'c', 
             name: 'Add New Product', 
             value: 'c' 
         }
     }
   ]);
   .then(function (answer) {
       console.log(JSON.stringify(answer, null, '  '));
       switch (answer.manager_menu) {
           case "a":
               viewInventory();
               break;
           case "b":
                viewLowInventory();
               break;
           case "c":
                addToInventory();
               break;
           case "d":
                addNewProduct()
               break;
       };
   });
}

　
　
