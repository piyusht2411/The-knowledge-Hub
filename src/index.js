// import express from 'express';
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');
const blogRoutes = require('./routes/blogRoutes');
const imageRoutes = require('./routes/imageRoutes');
const cookieParser = require('cookie-parser');
// import bodyParser from 'body-parser';
// import cors from 'cors';

const app = express();
var corsOptions = {
  origin: ["https://p2p-client-blue.vercel.app", "http://localhost:3000", "https://piyusht2411.github.io", "http://127.0.0.1:5500"],
  credentials: true
};


app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(cookieParser());
app.use("/user", userRoutes);
app.use("/api", blogRoutes);
app.use("/api", imageRoutes);

require('dotenv').config();
require('./config/db');


app.get('/', (req, res) => {
  res.json({
    message:"Welcome to Api"
  });
});

app.listen(process.env.PORT, () => console.log(`App listening on port ${process.env.PORT}`));