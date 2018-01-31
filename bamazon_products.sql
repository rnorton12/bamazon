DROP DATABASE IF EXISTS bamazon;

CREATE DATABASE bamazon;

USE bamazon;

CREATE TABLE products (
  item_id  INT NOT NULL AUTO_INCREMENT,
  product_name  VARCHAR(45) NULL,
  department_name  VARCHAR(45) NULL,
  price DECIMAL(10,2) NULL,
  stock_quantity INT NULL,
  product_sales DECIMAL(10,2) NULL, 
  PRIMARY KEY (item_id)
);

INSERT INTO products (product_name, department_name, price, stock_quantity, product_sales)
VALUES ("Mens Pants", "Clothing", 25.50, 10, 0);

INSERT INTO products (product_name, department_name, price, stock_quantity, product_sales)
VALUES ("Mens Socks (pair)", "Clothing", 2.75, 30, 0);

INSERT INTO products (product_name, department_name, price, stock_quantity, product_sales)
VALUES ("Mens Shoes", "Foot Wear", 33.10, 6, 0);

INSERT INTO products (product_name, department_name, price, stock_quantity, product_sales)
VALUES ("Mens Boots", "Foot Wear", 55.75, 10, 0);

INSERT INTO products (product_name, department_name, price, stock_quantity, product_sales)
VALUES ("AA Batteries", "Electronics", 3.15, 25, 0);

INSERT INTO products (product_name, department_name, price, stock_quantity, product_sales)
VALUES ("AAA Batteries", "Electronics", 3.75, 20, 0);

INSERT INTO products (product_name, department_name, price, stock_quantity, product_sales)
VALUES ("Toothbrush", "Hygiene", 2.20, 6, 0);

INSERT INTO products (product_name, department_name, price, stock_quantity, product_sales)
VALUES ("Toothpaste", "Hygiene", 4.30, 15, 0);

INSERT INTO products (product_name, department_name, price, stock_quantity, product_sales)
VALUES ("Shampoo", "Bath", 4.50, 4, 0);

INSERT INTO products (product_name, department_name, price, stock_quantity, product_sales)
VALUES ("Conditioner", "Bath", 5.25, 5, 0);

SELECT * FROM products;

CREATE TABLE departments (
	department_id INT NOT NULL AUTO_INCREMENT,
	department_name  VARCHAR(45) NULL,
	over_head_costs DECIMAL(10,2) NULL,
	PRIMARY KEY (department_id)
);

INSERT INTO departments (department_name, over_head_costs)
VALUES ("Clothing", 2000.0);

INSERT INTO departments (department_name, over_head_costs)
VALUES ("Foot Wear", 1500.0);

INSERT INTO departments (department_name, over_head_costs)
VALUES ("Electronics", 900.0);

INSERT INTO departments (department_name, over_head_costs)
VALUES ("Hygiene", 1000.0);

INSERT INTO departments (department_name, over_head_costs)
VALUES ("Bath", 300.0);

SELECT * FROM departments;

-- ### Alternative way to insert more than one row
-- INSERT INTO products (flavor, price, quantity)
-- VALUES ("vanilla", 2.50, 100), ("chocolate", 3.10, 120), ("strawberry", 3.25, 75);
SELECT departments.department_id, departments.department_name, departments.over_head_costs, SUM(products.product_sales) AS product_sales, SUM(products.product_sales) - departments.over_head_costs AS total_profit FROM products INNER JOIN departments ON products.department_name = departments.department_name GROUP BY department_name ORDER BY department_id;

SELECT * FROM departments;