CREATE DATABASE IF NOT EXISTS Inventory_Management_System;
USE Inventory_Management_System;
CREATE TABLE IF NOT EXISTS Product(SKU INT NOT NULL AUTO_INCREMENT PRIMARY KEY, Category_ID INT NOT NULL, ABCXYZ VARCHAR(2), Product_Name VARCHAR(20) NOT NULL, Cost_Price DECIMAL(10,2) NOT NULL, Retail_Price DECIMAL(10,2) NOT NULL, Stock_Qty INT NOT NULL, MOQ INT, isObsolete TINYINT(1));
CREATE TABLE IF NOT EXISTS Product_Categories(Category_ID INT NOT NULL AUTO_INCREMENT PRIMARY KEY, Category_Name VARCHAR(20) NOT NULL, isObsolete TINYINT(1));
CREATE TABLE IF NOT EXISTS Written_Off(Written_Off_ID INT NOT NULL AUTO_INCREMENT PRIMARY KEY, SKU INT NOT NULL, Quantity INT NOT NULL, Reason VARCHAR(50));
CREATE TABLE IF NOT EXISTS Recommended(Recommended_ID INT NOT NULL AUTO_INCREMENT PRIMARY KEY, SKU INT NOT NULL, Qty INT NOT NULL);
CREATE TABLE IF NOT EXISTS Purchase_Transactions(PTID INT NOT NULL AUTO_INCREMENT PRIMARY KEY, Order_Date TIMESTAMP DEFAULT CURRENT_TIMESTAMP, Delivery_Date DATE NOT NULL, Staff_ID INT NOT NULL);
CREATE TABLE IF NOT EXISTS Purchase_Orders(POID INT NOT NULL AUTO_INCREMENT PRIMARY KEY, PTID INT NOT NULL, SKU INT NOT NULL, Qty INT NOT NULL);
CREATE TABLE IF NOT EXISTS Sales_Transactions(STID INT NOT NULL AUTO_INCREMENT PRIMARY KEY, Transaction_Date TIMESTAMP DEFAULT CURRENT_TIMESTAMP, Staff_ID INT NOT NULL);
CREATE TABLE IF NOT EXISTS Sales_Orders(SOID INT NOT NULL AUTO_INCREMENT PRIMARY KEY, STID INT NOT NULL, SKU INT NOT NULL, Qty INT NOT NULL, Discount INT);
CREATE TABLE IF NOT EXISTS Staff(Staff_ID INT NOT NULL AUTO_INCREMENT PRIMARY KEY, Username VARCHAR(64) NOT NULL, `Password` VARCHAR(128) NOT NULL, Salt VARCHAR(10) NOT NULL, User_Privileges TINYINT(1), Is_Active TINYINT(1));
ALTER TABLE Product ADD FOREIGN KEY (Category_ID) REFERENCES Product_Categories(Category_ID);
ALTER TABLE Written_Off ADD FOREIGN KEY (SKU) REFERENCES Product(SKU);
ALTER TABLE Recommended ADD FOREIGN KEY (SKU) REFERENCES Product (SKU);
ALTER TABLE Purchase_Transactions ADD FOREIGN KEY (Staff_ID) REFERENCES Staff(Staff_ID);
ALTER TABLE Purchase_Orders ADD FOREIGN KEY (SKU) REFERENCES Product(SKU);
ALTER TABLE Purchase_Orders ADD FOREIGN KEY (PTID) REFERENCES Purchase_Transactions(PTID);
ALTER TABLE Sales_Transactions ADD FOREIGN KEY (Staff_ID) REFERENCES Staff(Staff_ID);
ALTER TABLE Sales_Orders ADD FOREIGN KEY (SKU) REFERENCES Product(SKU);
ALTER TABLE Sales_Orders ADD FOREIGN KEY (STID) REFERENCES Sales_Transactions(STID);