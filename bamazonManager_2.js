var userRoles = require("./databaseOps.js").userRoles;
var User = require("./databaseOps.js").User;

manager = new User(userRoles[1]);
manager.printUserRole();
manager.run();
