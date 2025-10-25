import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();
app.use(cors(
    {
        origin: process.env.CORS_ORIGIN,
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
        allowedHeaders: ['Content-Type', 'Authorization']
    }
));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(cookieParser());

import userRoutes from "./routes/user.route.js";
import productRoutes from "./routes/product.route.js";
import orderRoutes from "./routes/sales.route.js";
import purchasesRoutes from "./routes/purchases.route.js";
import supplierRoutes from "./routes/supplier.route.js";
import purchaseDraftRoute from "./routes/purchaseDraft.route.js";
import companyRoutes from "./routes/company.route.js";
import dashboardRoutes from "./routes/dashboard.route.js";
import logsRoutes from "./routes/logs.route.js";

app.use("/api/v1", userRoutes);
app.use("/api/v1", productRoutes);
app.use("/api/v1", orderRoutes);
app.use("/api/v1", purchasesRoutes);
app.use("/api/v1", supplierRoutes);
app.use("/api/v1", purchaseDraftRoute);
app.use("/api/v1", companyRoutes);
app.use("/api/v1", dashboardRoutes);
app.use("/api/v1", logsRoutes);

export { app };