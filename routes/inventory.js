const express = require("express");
const router = express.Router();

//Require controller modules.
const item_controller = require("../controllers/itemController");
const category_controller = require("../controllers/categoryController");
const order_controller = require("../controllers/orderController");
const supplier_controller = require("../controllers/supplierController")

// Inventory: Items
router.get('/', item_controller.index);

router.get("/items/create", item_controller.createItem_get)
router.post("/items/create", item_controller.createItem_post);

router.get("/item/:id/delete", item_controller.item_delete_get);
router.post("/item/:id/delete", item_controller.item_delete_post);

router.get("/item/:id/update", item_controller.item_update_get);
router.post("/item/:id/update", item_controller.item_update_post);

router.get("/item/:id", item_controller.item_detail);
router.get("/items", item_controller.getAllItems)

//Inventory: Order
router.get("/orders", order_controller.getAllOrders);
router.get("/order/:id", order_controller.getOrderById);

router.get("/orders/create", order_controller.createOrder_get);
router.post("/orders/create", order_controller.createOrder_post);

router.get("/order/:id/delete", order_controller.deleteOrder_get);
router.post("/order/:id/delete", order_controller.deleteOrder_post);

router.get("/order/:id/update", order_controller.updateOrder_get);
router.post("/order/:id/update", order_controller.updateOrder_post);
 
// Inventory: Category
router.get("/categories", category_controller.listCategories)

router.get("/category/create", category_controller.createCategory_get);
router.post("/category/create", category_controller.createCategory_post);

router.get("/category/:id/delete", category_controller.deleteCategory_get);
router.post("/category/:id/delete", category_controller.deleteCategory_post);

router.get("/category/:id/update", category_controller.updateCategory_get);
router.post("/category/:id/update", category_controller.updateCategory_post);

router.get("/category/:id", category_controller.getCategoryById);

//Inventory: Supplier
router.get("/suppliers", supplier_controller.getAllSuppliers);
router.get("/supplier/:id", supplier_controller.getSupplierById);

router.get("/suppliers/create", supplier_controller.createSupplier_get);
router.post("/suppliers/create", supplier_controller.createSupplier_post);

router.get("/supplier/:id/delete", supplier_controller.deleteSupplier_get);
router.post("/supplier/:id/delete", supplier_controller.deleteSupplier_post);

router.get("/supplier/:id/update", supplier_controller.updateSupplier_get);
router.post("/supplier/:id/update", supplier_controller.updateSupplier_post);

module.exports = router;