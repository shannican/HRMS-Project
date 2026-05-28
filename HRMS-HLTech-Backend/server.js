const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken'); // Added import
const authRoutes = require('./routes/authRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const payrollRoutes = require('./routes/payrollRoutes');
const jobRoutes = require('./routes/jobRoutes');
const userRoutes = require('./routes/userRoutes');
const fileUpload = require('express-fileupload');
const employeeRoutes = require('./routes/employeeRoutes');
const kycRoutes = require('./routes/kycRoutes');
const candidateRoutes = require('./routes/candidateRoutes');
const assessmentRoutes = require('./routes/assessmentRoutes');
const worksheetRoutes = require('./routes/worksheet');
const infoRoutes = require('./routes/infoRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

// Load environment variables first
dotenv.config({ path: path.resolve(__dirname, './.env') });

// Log environment variables for debugging
console.log('Environment variables loaded:');
console.log('MONGO_URI:', process.env.MONGO_URI ? 'Set' : 'Not set');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Set' : 'Not set');
console.log('SMTP_USER:', process.env.SMTP_USER ? process.env.SMTP_USER : 'Not set');
console.log('SMTP_PASS:', process.env.SMTP_PASS ? '[REDACTED]' : 'Not set');
console.log('SMTP_HOST:', process.env.SMTP_HOST ? process.env.SMTP_HOST : 'Not set');
console.log('SMTP_PORT:', process.env.SMTP_PORT ? process.env.SMTP_PORT : 'Not set');
console.log('EMAIL_FROM:', process.env.EMAIL_FROM ? process.env.EMAIL_FROM : 'Not set');

// Validate required environment variables
if (!process.env.MONGO_URI) {
  console.error('Error: MONGO_URI is not set in .env file');
  process.exit(1);
}
if (!process.env.JWT_SECRET) {
  console.error('Error: JWT_SECRET is not set in .env file');
  process.exit(1);
}
if (!process.env.IMAGEKIT_PUBLIC_KEY || !process.env.IMAGEKIT_PRIVATE_KEY || !process.env.IMAGEKIT_URL_ENDPOINT) {
  console.error('Error: ImageKit credentials are not set in .env file');
  process.exit(1);
}

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
});

// Middleware
app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload({
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  abortOnLimit: true,
  createParentPath: true,
}));

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, { 
  useNewUrlParser: true, 
  useUnifiedTopology: true 
})
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err, err.stack);
    process.exit(1);
  });

// Socket.io Connection
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);
  console.log('Query parameters:', socket.handshake.query);

  // Authenticate WebSocket connection
  const token = socket.handshake.auth.token;
  console.log('WebSocket auth token:', token ? token.slice(0, 10) + '...' : 'null');
  if (!token) {
    console.log('No token provided for WebSocket');
    socket.disconnect(true);
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('WebSocket token decoded:', decoded);
    socket.join(decoded.userId);
    console.log(`User ${decoded.userId} joined their notification room`);
  } catch (error) {
    console.error('WebSocket token verification error:', error.message, error.stack);
    socket.disconnect(true);
  }

  socket.on('join', (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined their notification room`);
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected:', socket.id);
  });
});

// Make io accessible to routes
app.set('socketio', io);

// Routes
console.log('Mounting routes...');
app.use('/api/auth', authRoutes);
app.use('/api', attendanceRoutes);
app.use('/api', payrollRoutes);
app.use('/api', jobRoutes);
app.use('/api', userRoutes);
app.use('/api', employeeRoutes);
app.use('/api/kyc', kycRoutes);
app.use('/api/candidate', candidateRoutes);
app.use('/api', assessmentRoutes);
app.use('/api/worksheet', worksheetRoutes);
app.use('/api', infoRoutes);
app.use('/api', notificationRoutes);
console.log('Routes mounted successfully');

// Health check endpoint
app.get('/api/health', (req, res) => {
  console.log('Health check endpoint accessed');
  res.json({ status: 'ok', message: 'Server is running', mongodb: mongoose.connection.readyState });
});

// Catch-all route for invalid endpoints
app.use((req, res) => {
  console.log(`Invalid endpoint accessed: ${req.method} ${req.url}`);
  res.status(404).json({ message: 'Endpoint not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err, err.stack);
  res.status(500).json({ message: 'Something broke!', error: err.message, stack: err.stack });
});

// Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});