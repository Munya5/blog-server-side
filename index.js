const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();
const upload = require('express-fileupload');

const app = express();
const port = process.env.PORT ; // Default to 5000 if PORT is not set

const userRoutes = require('./routes/userRoutes');
const postRoutes = require('./routes/postRoutes');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// CORS options
const corsOptions = {
  credentials: true,
  origin: [
    "https://main--resilient-cobbler-e673b6.netlify.app/"
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'], // Add any other methods you need
  allowedHeaders: ['Content-Type', 'Authorization'], // Add any custom headers you might use
  exposedHeaders: ['Content-Type', 'Authorization'], // Headers to expose
};

// Middleware
app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(upload());
app.use('/uploads', express.static(__dirname + '/uploads'));

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);

// Default Route
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

// MongoDB Connection
const mongoURI = process.env.MONGO_URI;

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('MongoDB connected');
  // Start the Express server
  app.listen(port, () => {
    console.log(`Server started on port ${port}`);
  });
})
.catch((error) => {
  console.error('Failed to connect to MongoDB:', error.message);
});
