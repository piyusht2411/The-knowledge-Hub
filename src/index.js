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
app.use(cors());
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