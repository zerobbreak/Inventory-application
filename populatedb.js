#! /usr/bin/env node

console.log('This script populates the database with sample data. Specify the database connection string as an argument.');

// Get the database connection string from command line arguments
const userArgs = process.argv.slice(2);
if (!userArgs[0]) {
    console.error('Please provide the MongoDB connection string as an argument.');
    process.exit();
}

const mongoose = require('mongoose');
const Order = require('./models/order');
const Supplier = require('./models/supplier');
const Item = require('./models/item');
const Category = require('./models/category');

const mongoDB = userArgs[0];

main().catch((err) => console.log(err));

async function main() {
    console.log('Debug: Connecting to the database');
    await mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Debug: Connected to the database');

    // Delete existing data before populating
    await clearData();

    await createSuppliers();
    await createCategories();
    await createItems();
    await createOrders();

    console.log('Debug: Closing mongoose connection');
    mongoose.connection.close();
}

async function clearData() {
    console.log('Debug: Clearing existing data');

    // Delete all documents from each collection
    await Promise.all([
        Supplier.deleteMany({}),
        Category.deleteMany({}),
        Item.deleteMany({}),
        Order.deleteMany({}),
    ]);

    console.log('Debug: Cleared existing data');
}

async function supplierCreate({ company_name, contact_person, email, phone, address }) {
    const supplier = new Supplier({ company_name, contact_person, email, phone, address });
    await supplier.save();
    console.log(`Added supplier: ${company_name}`);
    return supplier;
}

async function categoryCreate(name, description) {
    const category = new Category({ name, description });
    await category.save();
    console.log(`Added category: ${name}`);
    return category;
}

async function itemCreate(name, description, category, price) {
    const item = new Item({ name, description, category, price });
    await item.save();
    console.log(`Added item: ${name}`);
    return item;
}

async function orderCreate(items, totalAmount, status) {
    // Ensure items are Mongoose documents
    const itemDocuments = await Promise.all(items.map(item => Item.findById(item._id)));

    // Check if all items are found and are valid documents
    if (itemDocuments.some(item => !item || !item._id)) {
        console.error(`Error creating order: Some items not found or invalid.`);
        return null;
    }

    // Extract _id values from the documents
    const itemIds = itemDocuments.map(item => item._id);

    const order = new Order({ items: itemIds, totalAmount, status });

    try {
        await order.save();
        console.log(`Added order with status: ${status}`);
        return order;
    } catch (error) {
        console.error(`Error creating order: ${error.message}`);
        return null;
    }
}



async function createSuppliers() {
    const supplierData = [
        {
            company_name: 'ElectroTech',
            contact_person: 'John Doe',
            email: 'info@electrotech.com',
            phone: '123-456-7890',
            address: '123 Main St, City, Country'
        },
        {
            company_name: 'FashionHub',
            contact_person: 'Jane Smith',
            email: 'info@fashionhub.com',
            phone: '987-654-3210',
            address: '456 Oak St, Town, Country'
        },
        {
            company_name: 'HomeGoods Inc.',
            contact_person: 'Bob Johnson',
            email: 'info@homegoods.com',
            phone: '555-123-4567',
            address: '789 Pine St, Village, Country'
        }
    ];

    console.log('Adding suppliers');
    await Promise.all(supplierData.map(supplier => supplierCreate(supplier)));
}


async function createCategories() {
    console.log('Adding categories');
    await Promise.all([
        categoryCreate('Electronics', 'Electronic devices and accessories'),
        categoryCreate('Clothing', 'Fashionable apparel'),
        categoryCreate('Home Appliances', 'Appliances for the home'),
        categoryCreate('Books', 'Literary works'),
        categoryCreate('Toys', 'Playful items for all ages'),
    ]);
}

async function createItems() {
    console.log('Adding items');
    const electronicsCategory = await Category.findOne({ name: 'Electronics' });
    const clothingCategory = await Category.findOne({ name: 'Clothing' });
    const booksCategory = await Category.findOne({ name: 'Books' });
    const toyCategory = await Category.findOne({ name: 'Toys' });

    await Promise.all([
        itemCreate('Laptop Pro X', 'High-performance laptop with advanced features', electronicsCategory, 1200),
        itemCreate('Smartphone Galaxy S22', 'Latest smartphone model with cutting-edge technology', electronicsCategory, 800),
        itemCreate('Designer T-shirt', 'Premium quality cotton T-shirt from a renowned designer', clothingCategory, 50),
        itemCreate('Bestseller Novel', 'Acclaimed novel by a bestselling author', booksCategory, 30),
        itemCreate('Educational Toy Set', 'Fun and educational toy set for children', toyCategory, 35),
    ]);
}

async function createItems() {
    console.log('Adding items');
    const electronicsCategory = await Category.findOne({ name: 'Electronics' });
    const clothingCategory = await Category.findOne({ name: 'Clothing' });
    const booksCategory = await Category.findOne({ name: 'Books' });
    const toyCategory = await Category.findOne({ name: 'Toys' });

    const supplierElectroTech = await Supplier.findOne({ company_name: 'ElectroTech' });
    const supplierFashionHub = await Supplier.findOne({ company_name: 'FashionHub' });
    const supplierGoods = await Supplier.findOne({ company_name: "HomeGoods Inc." })

    const itemsData = [
        {
            name: 'Laptop Pro X',
            description: 'High-performance laptop with advanced features',
            category: electronicsCategory,
            price: 1200,
            supplier: supplierElectroTech,
        },
        {
            name: 'Smartphone Galaxy S22',
            description: 'Latest smartphone model with cutting-edge technology',
            category: electronicsCategory,
            price: 800,
            supplier: supplierElectroTech,
        },
        {
            name: 'Designer T-shirt',
            description: 'Premium quality cotton T-shirt from a renowned designer',
            category: clothingCategory,
            price: 50,
            supplier: supplierFashionHub,
        },
        {
            name: "Bestseller Novel",
            description: "Acclaimed novel by a bestselling author",
            category: booksCategory,
            price: 30,
            supplier: supplierGoods,
        },
        {
            name: "Educational Toy Set",
            description: "Fun and educational toy set for children",
            category: toyCategory,
            price: 35,
            supplier: supplierGoods,
        }
    ];

    await Promise.all(itemsData.map(async (itemData) => {
        const item = new Item(itemData);
        await item.save();
        console.log(`Added item: ${item.name}`);
    }));
}


async function createOrders() {
    console.log('Adding orders');
    const laptopProX = await Item.findOne({ name: 'Laptop Pro X' });
    const galaxyS22 = await Item.findOne({ name: 'Smartphone Galaxy S22' });
    const designerTshirt = await Item.findOne({ name: 'Designer T-shirt' });
    const bestsellerNovel = await Item.findOne({ name: 'Bestseller Novel' });
    const toySet = await Item.findOne({ name: 'Educational Toy Set' });

    // Pass the actual Mongoose documents to orderCreate
    const orders = [
        { items: [laptopProX, designerTshirt], totalAmount: laptopProX.price + designerTshirt.price, status: 'Shipped' },
        { items: [galaxyS22, bestsellerNovel], totalAmount: galaxyS22.price + bestsellerNovel.price, status: 'Pending' },
        { items: [toySet], totalAmount: toySet.price, status: 'Delivered' },
        { items: [bestsellerNovel], totalAmount: bestsellerNovel.price, status: 'Pending' },
        { items: [laptopProX, galaxyS22], totalAmount: laptopProX.price + galaxyS22.price, status: 'Shipped' },
    ];

    // Populate the order_date field with the current date
    const currentDate = new Date();

    await Promise.all(orders.map(async (order) => {
        const itemDocuments = await Promise.all(order.items.map(item => Item.findById(item._id)));
        const itemIds = itemDocuments.map(item => item._id);

        const orderWithDate = new Order({
            items: itemIds,
            totalAmount: order.totalAmount,
            status: order.status,
            order_date: currentDate, // Adding the order_date field with the current date
        });

        try {
            await orderWithDate.save();
            console.log(`Added order with status: ${order.status}`);
        } catch (error) {
            console.error(`Error creating order: ${error.message}`);
        }
    }));
}



