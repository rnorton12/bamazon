var userRoles = ["Customer", "Manager", "Supervisor"];

var Shared = function (connection, role) {
    this.role = role;
    this.dbConnection = connection;
}

Shared.prototype.viewInventory = function () {
    if (this.role === userRoles[0]) {
        var queryStr = "SELECT * FROM products";
    } else {
        var queryStr = "SELECT item_id, product_name, price, stock_quantity FROM products";
    }
    this.dbConnection.connection.query(queryStr, function (err, res) {
        if (err) throw err;
        //console.log(res);
        makeTable(res);
        if (this.role === userRoles[0]) { // customer
            askCustomer();
        } else { // manager
            askManager();
        }
    });
}
