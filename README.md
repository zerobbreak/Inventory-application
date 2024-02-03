# Inventory Management Application

## Overview

The Inventory Management Application is a web-based system designed to help businesses manage their inventory efficiently. The application provides functionalities related to items, orders, suppliers, and categories, incorporating fundamental CRUD operations.

## Features

- **Item Management**: Add, view, update, and delete items in the inventory.
- **Order Tracking**: Create, monitor, and update orders for better control over the procurement process.
- **Supplier Information**: Manage details of suppliers, including contact information and associated items.
- **Category Organization**: Categorize items to streamline inventory organization.

## Technologies Used

- **Node.js**: Server-side JavaScript runtime.
- **Express.js**: Web application framework for Node.js.
- **MongoDB**: NoSQL database for storing application data.
- **Mongoose**: ODM (Object Data Modeling) library for MongoDB and Node.js.
- **Pug (formerly Jade)**: Template engine for rendering views.

## Setup

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/zerobbreak/inventory-application.git
   ```

2. **Install Dependencies:**
   ```bash
   cd inventory-application
   npm install
   ```

3. **Configure Database:**
   - Set up a MongoDB instance and update the connection details in the application.

4. **Run the Application:**
   ```bash
   npm start
   ```

   The application will be accessible at `http://localhost:3000`.

## Usage

- Visit the application in your web browser.
- Explore the various sections for managing items, orders, suppliers, and categories.
- Perform CRUD operations to interact with the inventory.

## Contributing

Contributions are welcome! If you find a bug or have a feature request, please open an issue or submit a pull request.

## License

This project is licensed under the [MIT License](LICENSE).