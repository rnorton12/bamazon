# BAMAZON - Assignment 10

## Overview

BAMAZON is a CLI app that represents an Amazon-like storefront utilizing Node.js and MySQL.  The app will take in orders from customers and deplete stock from the store's inventory.  The app also has a manager interface allowing review of the store's inventory, view low inventory, increasing stock quantity, and adding new products to the store's iventory.  Finally, the app has a supervisor interface that allows product sales by department to be reviewed and the ability to create new departments.

## Requirements to run the app

1. A MySQL database is needed.  The included *bamazon_products.sql* can be used to create the database containing a products table with pre-loaded items and departments table with pre-loaded overhead costs.

2. To install the required npm packages, enter `npm install` at the bash terminal.  This will install "*mysql*", "*inquirer*", "*easy-table*" and "*chalk*" packages.

3. To run the Customer interface to the app, enter `node bamazonCustomer.js` at the bash terminal and follow the prompts.

4. To run the Manager interface to of the app, enter `node bamazonManager.js` at the bash terminal and follow the prompts.

5. To run the Supervisor interface to of the app, enter `node bamazonSupervisor.js` at the bash terminal and follow the prompts.

### Customer Overview

1. The app begins by displaying the store's inventory.

2. The customer is then prompted to enter the ID of the product and quantity they would like to purchase.

3. Once the customer has placed the order the following verification occurs:

	* The product ID is verified to exist.  If not, the app informs the customer that the product ID selected does not exist in the store's inventory.

	* The stock quantity is verified to meet the customer's purchase quantity request. If not, the app informs the customer that the purchase quantity requested can't be fulfilled. 

4. After satisfying the above verifications, the purchase is fulfilled and the following actions occur:

	* The stock quantity for the product purchased is reduced by the amount of the purchase quantity.

	* The product sales of the purchased item is tallied and stored in the database.

	* The customer is shown the total order price for their purchase. 

![Customer Demo](https://rnorton12.github.io/bamazon/images/customer_demo.gif)
 
### Manager Overview

1. The app begins by displaying a menu with the following options:

	* View Products for Sale

	* View Low Inventory

	* Add to Inventory

	* Add New Product

2. When the Manager selects `View Products for Sale`, the app lists every available item:

	* product ID

	* product name

	* product price

	* product quantity

	* product sales

3. When the Manager selects `View Low Inventory`, then all products with an inventory count lower than five are listed.

4. When the Manager selects `Add to Inventory`, then they are prompted to enter the ID of the product for which they want to add additonal quantity.

5. When the Manager selects `Add New Product`, then they are prompted to enter:

	* product name

	* department name

	* product price

	* product quantity

![Manager Demo](https://rnorton12.github.io/bamazon/images/manager_demo.gif)

### Supervisor Overview

1. The app begins by displaying a menu with the following options:

	* View Product Sales by Department

	* Create New Department

2. When the Supervisor selects `View Product Sales by Department`, the app displays a summarized table containing the department name and it's overhead costs and the total profit for the dpartment.

3. When the Supervisor selects `Create New Department`, then they are prompted to enter the department name and overhead costs.

![Supervisor Demo](https://rnorton12.github.io/bamazon/images/supervisor_demo.gif)
　
*Author: Roy Norton (C) 2018.*

　
