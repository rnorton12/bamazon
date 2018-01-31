var userRoles = require("./databaseOps.js").userRoles;
var User = require("./databaseOps.js").User;

customer = new User(userRoles[0]);
customer.printUserRole();
customer.run();

　
