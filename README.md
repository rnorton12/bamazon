# BAMAZON - Assignment 10

## Overview

BAMAZON is a CLI app that represents an Amazon-like storefront utilizing Node.js and MySQL.  The app will take in orders from customers and deplete stock from the store's inventory.  In addition, the app has a manager utility allowing review of the store's inventory, view low inventory, increasing stock quantity, and adding new products to the store's iventory.

## Requirements to run the app

A MySQL database is needed.  The included *bamazon_products.sql* can be used to create the database containing a products table with items.

To install the required npm packages, enter `npm install` at the bash terminal.  This will install "*mysql*", "*inquirer*", "*easy-table*" and "*chalk*" packages.

To run the Customer part of the app, enter `node bamazonCustomer.js` at the bash terminal and follow the prompts.

To run the Manager part of the app, enter `node bamazonManager.js` at the bash terminal and follow the prompts.

### Customer Overview

   1. The app begins by displaying the store's inventory.

   <show screen shot>

   2. The customer is prompted to enter the ID of the product they would like to buy and how many units of the product they would like to buy.

   <show screen shot>

   3. Once the customer has placed the order the following verification occurs:
   * The product ID is verified to exist.  If not, the app informs the customer that the product ID selected does not exist in the store's inventory.
   * The stock quantity is verified to meet the customer's purchase quantity request. If not, the app informs the customer that the purchase quantity requested can't be fulfilled. 
   
   <show screen shot>

   4. After satisfying the above verifications, the purchase is fulfilled and the actions occur:
   * The stock quantity for the product purchased is reduced by the amount of the purchase quantity.
   * The customer is shown the total order price for their purchase. 

   ![Customer Demo](https://rnorton12.github.io/bamazon/images/test.gif)
 
### Manager Overview
   
   1. The app begins by displaying a menu with the following options:
   * View Products for Sale
   * View Low Inventory
   * Add to Inventory
   * Add New Product

   <show screen shot>

  2. If the Manager selects `View Products for Sale`, the app lists every available item:
  * product ID
  * product name
  * product price
  * product quantity

  < show screen shot>

  3. If the Manager selects `View Low Inventory`, then all products with an inventory count lower than five are listed.

  <show screen shot>
  
  4. If the Manager selects `Add to Inventory`, then they are prompted to enter the ID of the product for which they want to add additonal quantity.

  <show screen shot>

  5. If the Manager selects `Add New Product`, then they prompted to enter:
  * product name
  * department name
  * product price
  * product quantity

  <show screen shot>

　
Author: Roy Norton (C) 2017.

　
