import express from "express";
import cors from "cors";

const app = express();
app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

import userRoutes from "./routes/user.route.js";
import productRoutes from "./routes/product.route.js";

app.use("/api/v1", userRoutes);
app.use("/api/v1", productRoutes);

export { app };