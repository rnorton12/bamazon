DROP DATABASE IF EXISTS bamazon;

CREATE DATABASE bamazon;

USE bamazon;

CREATE TABLE products (
  item_id  INT NOT NULL AUTO_INCREMENT,
  product_name  VARCHAR(45) NULL,
  department_name  VARCHAR(45) NULL,
  price DECIMAL(10,2) NULL,
  stock_quantity INT NULL,
  PRIMARY KEY (item_id)
);

INSERT INTO products (product_name, department_name, price, stock_quantity)
VALUES ("item1", "department1", 2.50, 100);

INSERT INTO products (product_name, department_name, price, stock_quantity)
VALUES ("item2", "department1", 3.10, 120);

INSERT INTO products (product_name, department_name, price, stock_quantity)
VALUES ("item3", "department1", 3.15, 25);

INSERT INTO products (product_name, department_name, price, stock_quantity)
VALUES ("item4", "department1", 3.55, 30);

INSERT INTO products (product_name, department_name, price, stock_quantity)
VALUES ("item5", "department1", 3.75, 50);

INSERT INTO products (product_name, department_name, price, stock_quantity)
VALUES ("item6", "department1", 3.85, 10);

INSERT INTO products (product_name, department_name, price, stock_quantity)
VALUES ("item7", "department1", 3.25, 75);

INSERT INTO products (product_name, department_name, price, stock_quantity)
VALUES ("item8", "department1", 3.25, 75);

INSERT INTO products (product_name, department_name, price, stock_quantity)
VALUES ("item9","department1", 3.25, 75);

INSERT INTO products (product_name, department_name, price, stock_quantity)
VALUES ("item10", "department1", 3.25, 75);

SELECT * FROM products;

-- ### Alternative way to insert more than one row
-- INSERT INTO products (flavor, price, quantity)
-- VALUES ("vanilla", 2.50, 100), ("chocolate", 3.10, 120), ("strawberry", 3.25, 75);
