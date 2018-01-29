var mysql = require("mysql");
var inquirer = require("inquirer");
var table = require('easy-table');
var chalk = require('chalk');

var userRoles = ["Customer", "Manager", "Supervisor"];

var User = function (role) {
    this.role = role;
    this.database = {
        connection: "",
        parameters: {
            host: "localhost",
            port: 3306,
            user: "root",
            password: "root",
            database: "bamazon"
        }
    };
}

User.prototype.connectToDatabase = function () {
    this.database.connection = mysql.createConnection(this.database.parameters);
    this.database.connect(function (err) {
        if (err) {
            console.log(err);
            return false;
        } else {
            console.log("connected as id " + connection.threadId + "\n");
            return true;
        }
    });
}

User.prototype.run = function () {
    if (this.role === userRoles[0]) { // customer
        this.askCustomer();
    } else {
        this.askManager();
    }
}

User.prototype.viewInventory = function () {
    this.database.connection.query("SELECT * FROM products", function (err, res) {
        if (err) throw err;
        console.log(res);
        makeTable(res);
        if (this.role === userRoles[0]) { // customer
            askCustomer();
        }
    });
}

　
　
User.prototype.askCustomer = function () {

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
        this.validateProduct(answer.product_id, answer.quantity);
    });
}

User.prototype.askManager = function () {
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
   ]).then(function (answer) {
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

User.prototype.updateQuantity = function (id, quantity, price) {
    var query = this.database.connection.query("UPDATE products SET ? WHERE ?", [{ stock_quantity: quantity }, { item_id: id}], function (err, res) {
        if (err) {
            console.log(err);
        } else {
            if (this.role === userRoles[0]) {
                console.log(res);
                console.log("Your order has been placed");
                console.log("Total order price: " + (quantity * price));
                console.log("Thanks for shopping with us today.  Please come again.");
                connection.end();
            } else {
                console.log(res);
                console.log("Quantity Updated");
                this.askManager();
            }
        }
    });
}

　
User.prototype.validateQuantity = function(id, stockQuantity, desiredQuantity, price) {
    if (stockQuantity > 0) {
        if (desiredQuantity <= stockQuantity && desiredQuantity > 0) {
            this.updateQuantity(id, (stockQuantity - desiredQuantity), price);
        } else {
            console.log(chalk.yellow("quantity selected does not exist"));
            if (onError()) {
                this.viewInventory();
            } else {
                console.log(chalk.blue("Thanks and visit us again"));
                this.connection.end();
            }
        }
    } else {
        console.log("This item is out-of-stock");
    }
}

User.prototype.validateProduct = function(id, quantity) {

    var query = this.database.connection.query("SELECT * FROM products WHERE item_id=?", [id], function (err, res) {
        if (err) {
            console.log(err);
            pass = false;
        } else {
            console.log(res);
            if (res.length) {
                var id = parseInt(res[0].item_id);
                var stockQuantity = parseInt(res[0].stock_quantity);
                                
                if (this.role === userRoles[0]) {
                    var desiredQuantity = parseInt(quantity);
                    var price = parseFloat(res[0].price);
                    this.validateQuantity(id, stockQuantity, desiredQuantity, price);
                } else {
                    var newQuantity = stockQuantity + quantity;
                    this.updateQuantity(id, newQuantity);
                }               
            } else {
                console.log(chalk.red("Product Id is invalid."));
                if (onError()) {
                    if (this.role === userRoles[0]) {
                        this.viewInventory();
                    } else {
                        this.addToInventory();
                    }
                } else {
                    if (this.role === userRoles[0]) {
                        console.log(chalk.blue("Thanks and visit us again"));
                    }
                    this.database.connection.end();
                }
            }
        }
    });

    // logs the actual query being run
    //console.log(query.sql);
}

User.prototype.viewLowInventory = function () {
    this.database.connection.query("SELECT * FROM products WHERE stock_quantity < 5", function (err, res) {
        if (err) throw err;
        console.log(res);
        makeTable(res);
        askManager();
    });
}

　
User.prototype.addToInventory = function() {
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
        this.validateProduct(answer.id, answer.quantity);
    });

}

User.prototype.addNewProduct = function() {
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
        var query = this.database.connection.query("INSERT INTO products SET ?", {product_name: answers.pname, department_name: answers.dpname, price: answers.price, stock_quantity: answers.quantity}, , function (err, res) {
            if (err) {
                console.log(err);
            } else {
                console.log("New product added");
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
