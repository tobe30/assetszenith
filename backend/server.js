
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import "dotenv/config";
import { connectDB } from "./lib/db.js";
import connectCloudinary from "./lib/cloudinary.js";
import authRoutes from "./routes/auth.route.js";
import userRoutes from "./routes/user.route.js";
import transactionRoutes from "./routes/transaction.route.js";
import investmentRoutes from "./routes/investment.route.js";
import walletRoutes from "./routes/wallet.route.js";
import adminRoutes from "./routes/admin.route.js";


const app = express();

app.use(cors({
    origin: [
      'http://localhost:5173',
      'https://assetszenith.vercel.app',
    ],
    credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("Welcome to the API");
});


app.use("/api/auth", authRoutes)
app.use("/api/users", userRoutes)
app.use("/api/transactions", transactionRoutes)
app.use("/api/investments", investmentRoutes)
app.use("/api/wallet", walletRoutes)
app.use("/api/admin", adminRoutes)


const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectCloudinary();
    await connectDB();
    console.log("DB connected");

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
  }
};

startServer();
