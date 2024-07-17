const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();
const upload = require('express-fileupload');

const app = express();
const port = process.env.PORT || 5006;

const userRoutes = require('./routes/userRoutes')
const postRoutes = require('./routes/postRoutes')
const {notFound, errorHandler}= require('./middleware/errorMiddleware')

// Middleware
app.use(cors({credentials: true, origin: "http://localhost:3002"}));
app.use(express.json({extended:true}));
app.use(express.urlencoded({extended: true}))
app.use(upload())
app.use('/uploads', express.static(__dirname + '/uploads'))


app.use('/api/users', userRoutes)
app.use('/api/posts', postRoutes)

app.use(notFound)
app.use(errorHandler)

// MongoDB Connection
const mongoURI = process.env.MONGO_URI;

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('MongoDB connected');
  // Start the Express server
  app.listen(5006, () => {
    console.log(`Server started on port ${port}`);
  });
})
.catch((error) => {
  console.error('Failed to connect to MongoDB:', error.message);
});


