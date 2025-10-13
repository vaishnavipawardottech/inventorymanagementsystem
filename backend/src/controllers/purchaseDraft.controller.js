import { pool } from "../db/index.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import nodemailer from "nodemailer";


export const createDraft = asyncHandler(async (req, res) => {
  const { supplier_id, items } = req.body;
  const created_by = req.user.id;

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [draftResult] = await connection.query(
      `INSERT INTO purchase_drafts (supplier_id, created_by, status) VALUES (?, ?, ?)`,
      [supplier_id, created_by, "draft"]
    );
    const draftId = draftResult.insertId;

    for (let item of items) {
      await connection.query(
        `INSERT INTO purchase_draft_items (draft_id, product_id, quantity) VALUES (?, ?, ?)`,
        [draftId, item.product_id, item.quantity]
      );
    }

    await connection.commit();
    res.status(201).json(new ApiResponse(201, { draftId }, "Draft created successfully"));
  } catch (error) {
    await connection.rollback();
    throw new ApiError(500, error.message || "Failed to create draft");
  } finally {
    connection.release();
  }
});

export const getDrafts = asyncHandler(async (req, res) => {
  try {
    //  Step 1: Fetch all purchase drafts with status = 'draft' only
    const [drafts] = await pool.query(`
      SELECT 
        pd.*, 
        s.name AS supplier_name, 
        s.email AS supplier_email,
        s.phone AS supplier_phone,
        u.username AS created_by_name
      FROM purchase_drafts pd
      LEFT JOIN suppliers s ON pd.supplier_id = s.id
      LEFT JOIN users u ON pd.created_by = u.id
      WHERE pd.deleted_at IS NULL 
        AND pd.status = 'draft'
      ORDER BY pd.created_at DESC;
    `);

    //  Step 2: Fetch items linked to those drafts
    const [items] = await pool.query(`
      SELECT 
        pdi.draft_id,
        p.name AS product_name,
        p.price AS price,
        pdi.quantity AS quantity
      FROM purchase_draft_items pdi
      JOIN products p ON p.id = pdi.product_id;
    `);

    //  Step 3: Group items by draft_id
    const draftMap = {};
    items.forEach((item) => {
      if (!draftMap[item.draft_id]) draftMap[item.draft_id] = [];
      draftMap[item.draft_id].push(item);
    });

    //  Step 4: Attach products to each draft
    const result = drafts.map((d) => ({
      ...d,
      products: draftMap[d.id] || [],
    }));

    res.status(200).json({
      statusCode: 200,
      data: result,
      message: "Drafts fetched successfully",
      success: true,
    });
  } catch (error) {
    console.error("Error fetching drafts:", error);
    res.status(500).json({
      statusCode: 500,
      message: "Server error",
      success: false,
    });
  }
});

export const getDraftById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const [draft] = await pool.query(
    `SELECT d.*, s.name as supplier_name, u.username as created_by_name
     FROM purchase_drafts d
     LEFT JOIN suppliers s ON d.supplier_id = s.id
     LEFT JOIN users u ON d.created_by = u.id
     WHERE d.id = ? AND d.deleted_at IS NULL`,
    [id]
  );

  if (draft.length === 0) throw new ApiError(404, "Draft not found");

  const [items] = await pool.query(
    `SELECT di.*, p.name as product_name 
     FROM purchase_draft_items di
     LEFT JOIN products p ON di.product_id = p.id
     WHERE di.draft_id = ?`,
    [id]
  );

  return res.status(200).json(new ApiResponse(200, { ...draft[0], items }, "Draft details"));
});

export const sendDraft = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Fetch draft
  const [draft] = await pool.query(`SELECT * FROM purchase_drafts WHERE id = ?`, [id]);
  if (draft.length === 0) throw new ApiError(404, "Draft not found");

  // Fetch supplier
  const [supplier] = await pool.query(`SELECT * FROM suppliers WHERE id = ?`, [draft[0].supplier_id]);

  // Fetch items
  const [items] = await pool.query(
    `SELECT di.*, p.name as product_name 
     FROM purchase_draft_items di
     LEFT JOIN products p ON di.product_id = p.id
     WHERE di.draft_id = ?`,
    [id]
  );


  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
  })
  

  const mailOptions = {
        from: process.env.EMAIL_USER,
        to: supplier[0].email,
        subject: `Order List from ${req.user?.username}`,
        text: `
        Hello ${supplier[0].name},

        You have received a purchase draft from ${req.user?.username}.

        Draft ID: ${draft[0].id}
        Created On: ${new Date(draft[0].created_at).toLocaleString()}

        Items:
        ${items.map(i => `- ${i.product_name}: ${i.quantity}`).join("\n")}

        Please review this draft at your earliest convenience.

        Thank you,
        ${req.user?.username}
        `,
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 8px; max-width: 600px;">
            <h2 style="color: #4F46E5; margin-bottom: 10px;">Order List</h2>
            
            <p>Hello <strong>${supplier[0].name}</strong>,</p>
            <p>You have received a Order List from <strong>${req.user?.username}</strong>.</p>

            <div style="background: #f9f9f9; padding: 10px; border-radius: 6px; margin: 15px 0;">
                <p><strong>Created On:</strong> ${new Date(draft[0].created_at).toLocaleString()}</p>
            </div>

            <h3 style="color: #333; margin-bottom: 8px;">Items:</h3>
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                <tr>
                    <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Product</th>
                    <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Quantity</th>
                </tr>
                </thead>
                <tbody>
                ${items.map(i => `
                    <tr>
                    <td style="border: 1px solid #ddd; padding: 8px;">${i.product_name}</td>
                    <td style="border: 1px solid #ddd; padding: 8px;">${i.quantity}</td>
                    </tr>
                `).join("")}
                </tbody>
            </table>

            <p style="margin-top: 20px;">This is list of products that I want to buy from you.</p>
            
            <p style="margin-top: 20px; font-size: 12px; color: #666;">Please consider the mail and deliver the product as fast you can.</p>
            </div>
        `
        };


    await transporter.sendMail(mailOptions);

    await pool.query(`UPDATE purchase_drafts SET status = 'ordered' WHERE id = ?`, [id]);

    return res.status(200).json(new ApiResponse(200, {}, "Draft sent to supplier successfully"));
});

export const getSuppliers = asyncHandler(async (req, res) => {
    const [suppliers] = await pool.query(
    `SELECT id, name, email, phone FROM suppliers WHERE deleted_at IS NULL ORDER BY name ASC`
  );

  res.status(200).json(new ApiResponse(200, suppliers, "Suppliers fetched successfully"));
})

// export const getOrderedPurchases = asyncHandler(async (req, res) => {
//   const [orders] = await pool.query(`
//     SELECT 
//       pd.*, 
//       s.name AS supplier_name, 
//       s.email AS supplier_email, 
//       u.username AS created_by_name
//     FROM purchase_drafts pd
//     LEFT JOIN suppliers s ON pd.supplier_id = s.id
//     LEFT JOIN users u ON pd.created_by = u.id
//     WHERE pd.status = 'ordered' AND pd.deleted_at IS NULL
//     ORDER BY pd.created_at DESC;
//   `);

//   const [items] = await pool.query(`
//     SELECT 
//       pdi.draft_id, 
//       p.name AS product_name, 
//       p.price, 
//       pdi.quantity
//     FROM purchase_draft_items pdi
//     JOIN products p ON p.id = pdi.product_id;
//   `);

//   const orderMap = {};
//   items.forEach((i) => {
//     if (!orderMap[i.draft_id]) orderMap[i.draft_id] = [];
//     orderMap[i.draft_id].push(i);
//   });

//   const result = orders.map((o) => ({
//     ...o,
//     products: orderMap[o.id] || [],
//   }));

//   res.status(200).json(new ApiResponse(200, result, "Ordered purchases fetched successfully"));
// });

// export const getOrderedPurchases = asyncHandler(async (req, res) => {
//   const [rows] = await pool.query(
//     `SELECT d.*, s.name AS supplier_name, s.email AS supplier_email, u.username AS created_by_name
//      FROM purchase_drafts d
//      LEFT JOIN suppliers s ON d.supplier_id = s.id
//      LEFT JOIN users u ON d.created_by = u.id
//      WHERE d.deleted_at IS NULL AND (d.status = 'ordered' OR d.status = 'delivered')
//      ORDER BY d.created_at DESC`
//   );

//   // Fetch products for each order
//   for (let row of rows) {
//     const [items] = await pool.query(
//       `SELECT i.product_id, p.name AS product_name, i.quantity
//        FROM purchase_draft_items i
//        LEFT JOIN products p ON i.product_id = p.id
//        WHERE i.draft_id = ?`,
//       [row.id]
//     );
//     row.products = items;
//   }

//   return res.status(200).json(new ApiResponse(200, rows, "Orders fetched successfully"));
// });

export const getOrderedPurchases = asyncHandler(async (req, res) => {
  // 1 Get all purchase drafts that are ordered or delivered
  const [orders] = await pool.query(`
    SELECT 
      pd.*, 
      s.name AS supplier_name, 
      s.email AS supplier_email, 
      u.username AS created_by_name
    FROM purchase_drafts pd
    LEFT JOIN suppliers s ON pd.supplier_id = s.id
    LEFT JOIN users u ON pd.created_by = u.id
    WHERE (pd.status = 'ordered' OR pd.status = 'delivered')
      AND pd.deleted_at IS NULL
    ORDER BY pd.created_at DESC;
  `);

  if (!orders.length) {
    return res
      .status(200)
      .json(new ApiResponse(200, [], "No ordered or delivered purchases found"));
  }

  // 2 Fetch all items in one go
  const [items] = await pool.query(`
    SELECT 
      pdi.draft_id, 
      p.name AS product_name, 
      p.price, 
      pdi.quantity
    FROM purchase_draft_items pdi
    JOIN products p ON p.id = pdi.product_id;
  `);

  // 3 Group items by their draft_id
  const orderMap = {};
  items.forEach((item) => {
    if (!orderMap[item.draft_id]) orderMap[item.draft_id] = [];
    orderMap[item.draft_id].push(item);
  });

  // 4 Attach product list to each order
  const result = orders.map((order) => ({
    ...order,
    products: orderMap[order.id] || [],
  }));

  // 5️⃣ Send response
  res
    .status(200)
    .json(new ApiResponse(200, result, "Ordered and delivered purchases fetched successfully"));
});


export const markAsDelivered = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Fetch all items for this order
    const [items] = await connection.query(`
      SELECT product_id, quantity
      FROM purchase_draft_items
      WHERE draft_id = ?
    `, [id]);

    if (!items.length) throw new ApiError(404, "No items found for this order");

    // Update stock for each product
    for (const item of items) {
      await connection.query(`
        UPDATE products 
        SET stock = stock + ? 
        WHERE id = ?
      `, [item.quantity, item.product_id]);
    }

    // Update order status
    await connection.query(`
      UPDATE purchase_drafts 
      SET status = 'delivered' 
      WHERE id = ?
    `, [id]);

    await connection.commit();
    res.status(200).json(new ApiResponse(200, {}, "Order marked as delivered and inventory updated"));
  } catch (err) {
    await connection.rollback();
    throw new ApiError(500, err.message || "Failed to mark as delivered");
  } finally {
    connection.release();
  }
});

export const getDeliveredPurchases = asyncHandler(async (req, res) => {
  const [delivered] = await pool.query(`
    SELECT 
      pd.*, 
      s.name AS supplier_name, 
      s.email AS supplier_email,
      u.username AS created_by_name
    FROM purchase_drafts pd
    LEFT JOIN suppliers s ON pd.supplier_id = s.id
    LEFT JOIN users u ON pd.created_by = u.id
    WHERE pd.status = 'delivered' AND pd.deleted_at IS NULL
    ORDER BY pd.created_at DESC;
  `);

  const [items] = await pool.query(`
    SELECT 
      pdi.draft_id, 
      p.name AS product_name, 
      p.price, 
      pdi.quantity
    FROM purchase_draft_items pdi
    JOIN products p ON p.id = pdi.product_id;
  `);

  const itemMap = {};
  items.forEach((i) => {
    if (!itemMap[i.draft_id]) itemMap[i.draft_id] = [];
    itemMap[i.draft_id].push(i);
  });

  const result = delivered.map((d) => ({
    ...d,
    products: itemMap[d.id] || [],
  }));

  res.status(200).json(new ApiResponse(200, result, "Delivered purchases fetched successfully"));
});

export const updateDraft = asyncHandler(async (req, res) => {
  const { id } = req.params; // draft id
  const { items } = req.body; // array of { product_id, quantity }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // Check if draft exists and is still in 'draft' status
    const [existing] = await connection.query(
      `SELECT * FROM purchase_drafts WHERE id = ? AND status = 'draft' AND deleted_at IS NULL`,
      [id]
    );

    if (existing.length === 0) {
      throw new ApiError(404, "Draft not found or already sent");
    }

    // Remove old items (since we’ll reinsert updated list)
    await connection.query(`DELETE FROM purchase_draft_items WHERE draft_id = ?`, [id]);

    // Insert updated items
    for (const item of items) {
      await connection.query(
        `INSERT INTO purchase_draft_items (draft_id, product_id, quantity)
         VALUES (?, ?, ?)`,
        [id, item.product_id, item.quantity]
      );
    }

    await connection.commit();

    res.status(200).json(new ApiResponse(200, {}, "Draft updated successfully"));
  } catch (error) {
    await connection.rollback();
    throw new ApiError(500, error.message || "Failed to update draft");
  } finally {
    connection.release();
  }
});

