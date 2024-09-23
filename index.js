const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();
const upload = require('express-fileupload');

const app = express();
const port = process.env.PORT ;

const userRoutes = require('./routes/userRoutes');
const postRoutes = require('./routes/postRoutes');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// Middleware
app.use(cors({
  credentials: true,
  origin: [
      "https://main--resilient-cobbler-e673b6.netlify.app", // your main site
      "https://66f196dcc6af494d59fd9b47--resilient-cobbler-e673b6.netlify.app" // your other site
  ]
}));

app.use(express.json({ extended: true }));
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
