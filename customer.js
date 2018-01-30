
var Customer = function (connection) {
    this.dbConnection = connection;
}

Customer.prototype.updateProductSales = function (id, sales) {
    var query = this.dbConnection.query("UPDATE products SET ? WHERE ?", [{
        product_sales: sales
    }, {
        item_id: id
    }], function (err, res) {
        if (err) {
            console.log(err);
        } else {
            //console.log(res);
            console.log("Product Sales Updated");
            dbConnection.connection.end();
        }
    });
}

Customer.prototype.validateQuantity = function (id, stockQuantity, desiredQuantity, price, sales) {
    if (stockQuantity > 0) {
        if (desiredQuantity <= stockQuantity && desiredQuantity > 0) {
            updateQuantity(id, (stockQuantity - desiredQuantity), price, sales);
        } else {
            console.log(chalk.yellow("quantity selected does not exist"));
            if (onError()) {
                viewInventory();
            } else {
                console.log(chalk.blue("Thanks and visit us again"));
                connection.end();
            }
        }
    } else {
        console.log("This item is out-of-stock");
    }
}
