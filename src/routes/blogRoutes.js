const express = require('express');
const router = express.Router();
const { createBlog, editBlog, deleteBlog, getAllBlogs, getBlog } = require('../controllers/blogController');
const authUser = require('../middleware/authUser');

router.post('/create-blog',authUser, createBlog);
router.put('/update-blog/:blogId', authUser, editBlog);
router.delete('/delete-blog/:blogId',authUser, deleteBlog);
router.get('/getBlogs', authUser, getAllBlogs);
router.get('/getBlog', authUser, getBlog);


module.exports = router;