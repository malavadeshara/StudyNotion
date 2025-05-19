const express = require('express');
const app = express();

const userRoutes = require('./routes/User');
const profileRoutes = require('./routes/Profile');
const paymentRoutes = require('./routes/Payments');
const courseRoutes = require('./routes/Course');

const database = require('./Config/database');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const { coludinaryConnect } = require('./config/cloudinary');
const fileUpload = require('express-fileupload');
const dotenv = require('dotenv');
dotenv.config();
const PORT = process.env.PORT || 5000;

// database connect
database.connect();
    // .then(() => console.log("Database connected successfully"))
    // .catch((error) => console.error("Database connection failed", error));

// middlewares
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
}));
app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: '/tmp',
}));

// cloudinary connect
coludinaryConnect();

// routes
app.use('/api/v1/auth', userRoutes);
app.use('/api/v1/profile', profileRoutes);
// app.use('/api/v1/payment', paymentRoutes);
app.use('/api/v1/course', courseRoutes);

app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: "Server is running",
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});