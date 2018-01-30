var userRoles = require("./databaseOps.js").userRoles;
var User = require("./databaseOps.js").User;

supervisor = new User(userRoles[2]);
supervisor.printUserRole();
supervisor.run();
