import {pool} from "../db/index.js";
import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import {ApiError} from "../utils/ApiError.js";

export const createOrder = asyncHandler(async (req, res) => {
    const {customer, items} = req.body;
    const created_by = req.user.id;
    // customer = {name, phone, email, address}
    // items = [ {product_id, quantity}, ... ]

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // 1. check if customer exists (by phone or email)
        let [existingCustomer] = await connection.query(
            `SELECT id FROM customers WHERE phone = ? LIMIT 1`,
            [customer.phone]
        );

        let customerId;
        if (existingCustomer.length > 0) {
            customerId = existingCustomer[0].id;
        } else {
            // 2. create new customer
            const [newCustomer] = await connection.query(
                `Insert INTO customers (name, phone, address) VALUES (?, ?, ?)`,
                [customer.name, customer.phone, customer.address]
            );
            customerId = newCustomer.insertId;
        }

        // 3. Calculate total amount (get product prices from DB)
        let totalAmount = 0;
        for (let item of items) {
            const [product] = await connection.query(
                `SELECT price, stock FROM products WHERE id = ? LIMIT 1`,
                [item.product_id]
            );
            if (product.length === 0) {
                throw new ApiError(404, `product with this ID ${item.product_id} not found`);
            }

            const productPrice = parseFloat(product[0].price);
            const productStock = parseInt(product[0].stock);

            if (item.quantity > productStock) {
                throw new ApiError(404, `Not enough stock for product ID ${item.product_id}`);
            }

            totalAmount += productPrice * item.quantity;
        }

        // 4. create sale (order)
        const [sale] = await connection.query(
            `INSERT INTO sales (customer_id, total_amount, created_by) VALUES (?, ?, ?)`,
            [customerId, totalAmount, created_by]
        );
        const saleId = sale.insertId;

        // 5. Insert sale_items and update stock
        for (let item of items) {
            const [product] = await connection.query(
                `SELECT price FROM products WHERE id = ? LIMIT 1`,
                [item.product_id]
            );

            const productPrice = parseFloat(product[0].price);

            await connection.query(
                `INSERT INTO sale_items (sale_id, product_id, quantity, price) VALUES (?, ?, ?, ?)`,
                [saleId, item.product_id, item.quantity, productPrice]
            );

            // update stock
            await connection.query(
                `UPDATE products SET stock = stock - ? WHERE id = ?`,
                [item.quantity, item.product_id]
            );
        }
        await connection.commit();
        
        return res.status(201).json(new ApiResponse(201, {saleId, customerId, totalAmount}, "order created successfully."));

        
    } catch (error) {
        await connection.rollback();
        throw new ApiError(500, error.message || "failed to create order");
    } finally {
        connection.release();
    }
})

export const getOrders = asyncHandler(async (req, res) => {
    try {
        const [orders] = await pool.query(
            `SELECT s.id, S.total_amount, s.created_at,
                    c.name AS customer_name, c.phone, u.username AS created_by
            FROM sales s
            LEFT JOIN customers c ON s.customer_id = c.id
            LEFT JOIN users u ON s.created_by = u.id
            WHERE s.deleted_at IS NULL
            ORDER BY s.created_at DESC`
        );
        return res
            .status(200)
            .json(new ApiResponse(200, {orders}, "orders fetched successfully"))
    } catch (error) {
        throw new ApiError(401, "unable to fetch the orders");
    }
})

export const getOrderById = asyncHandler(async (req, res) => {
    const {id} = req.params;

    try {
        // get order header
        const [orders] = await pool.query(
            `SELECT s.id, s.total_amount, s.created_at,
                    c.name AS customer_name, c.phone, c.address,
                    u.username AS created_by
            FROM sales s
            LEFT JOIN customers c ON s.customer_id = c.id
            LEFT JOIN users u ON s.created_by = u.id
            WHERE s.id = ? AND s.deleted_at IS NULL`,
            [id]
        );
    
        if (orders.length === 0) {
            throw new ApiError(404, "order not found");
        }
    
        // get order items
        const [items] = await pool.query(
            `SELECT si.product_id, p.name AS product_name, si.quantity, si.price
            FROM sale_items si
            JOIN products p ON si.product_id = p.id
            WHERE si.sale_id = ? AND si.deleted_at IS NULL`,
            [id]
        );
        return res
            .status(200)
            .json(new ApiResponse(200, {...orders[0], items}, "orders fetched successfully"))
    } catch (error) {
        console.log("getorderbyid error: ", error);
        throw new ApiError(500, "Error while fetching the orders")
    }
})

export const updateOrder = asyncHandler(async (req, res) => {
    const {id} = req.params;
    const {items} = req.body;

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // remove old items and restore stock
        const [oldItems] = await connection.query(
            `SELECT product_id, quantity FROM sale_items WHERE sale_id = ?`,
            [id]
        );

        for (let old of oldItems) {
            await connection.query(
                `UPDATE products SET stock = stock + ? WHERE id = ?`,
                [old.quantity, old.product_id]
            )
        }

        await connection.query(`UPDATE sale_items SET deleted_at = NOW() WHERE sale_id = ?`,
            [id]
        )

        // Insert new items and recalculate total
        let totalAmount = 0;
        for (let item of items) {
        const [product] = await connection.query(
            `SELECT price, stock FROM products WHERE id = ?`,
            [item.product_id]
        );
        if (product.length === 0)
            throw new ApiError(404, `Product ${item.product_id} not found`);
        if (item.quantity > product[0].stock)
            throw new ApiError(400, `Not enough stock for product ${item.product_id}`);

        totalAmount += product[0].price * item.quantity;

        await connection.query(
            `INSERT INTO sale_items (sale_id, product_id, quantity, price) VALUES (?, ?, ?, ?)`,
            [id, item.product_id, item.quantity, product[0].price]
        );

        await connection.query(
            `UPDATE products SET stock = stock - ? WHERE id = ?`,
            [item.quantity, item.product_id]
        );
        }

        await connection.query(`UPDATE sales SET total_amount = ? WHERE id = ?`, [
        totalAmount,
        id,
        ]);

        await connection.commit();
        return res
            .status(200)
            .json(new ApiResponse(200, {}, "order updated successfully"));
        
    } catch (error) {
        await connection.rollback();
        throw new ApiError(500, "failed to update order");
    } finally {
        connection.release();
    }
})

export const deleteOrder = asyncHandler(async (req, res) => {
    const {id} = req.params;
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // restore stock
        const [items] = await connection.query(
            `SELECT product_id, quantity FROM sale_items WHERE sale_id = ?`,
            [id]
        );
        for (let item of items) {
            await connection.query(
                `UPDATE products SET stock = stock + ? WHERE id = ?`,
                [item.quantity, item.product_id]
            );
        }

        // delete order and items
        await connection.query(`UPDATE sale_items SET deleted_at = NOW() WHERE sale_id = ?`, [id]);
        await connection.query(`UPDATE sales SET deleted_at = NOW() WHERE id = ?`, [id])

        await connection.commit();
        return res
            .status(200)
            .json(new ApiResponse(200, {}, "order deleted successfully"));
        
    } catch (error) {
        await connection.rollback();
        throw new ApiError(500, "failed to delete the order");
    } finally{
        connection.release();
    }
})

export const searchProducts = asyncHandler(async (req, res) => {
    const {query = ""} = req.query;
    try {
        // const [products] = await pool.query(
        //     `SELECT id, name, price FROM products
        //     WHERE name LIKE ? AND deleted_at IS NULL
        //     LIMIT 10`,
        //     [`%${query}%`]
        // )

        let sql = `SELECT id, name, price FROM products WHERE deleted_at IS NULL`;
        let params = [];

        if(query) {
            sql += ` AND name LIKE ?`;
            params.push(`%${query}%`);
        }

        sql += ` LIMIT 20`;

        const [products] = await pool.query(sql, params);

        return res
            .status(200)
            .json(new ApiResponse(200, {products}, "Products fetched for the autocomplete successfully"))
    } catch (error) {
        throw new ApiError(400, "failed to fetch products")
    }
})