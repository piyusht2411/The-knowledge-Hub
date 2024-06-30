const express = require('express');
const router = express.Router();
const { createBlog, editBlog, deleteBlog, getAllBlogs, getBlog, likeOrDislikeBlog } = require('../controllers/blogController');
const authUser = require('../middleware/authUser');
const { addComment, editComment, deleteComment, getCommentsOfBlog, likeOrDislikeComment } = require('../controllers/commentController');

router.post('/create-blog',authUser, createBlog);
router.put('/update-blog/:blogId', authUser, editBlog);
router.delete('/delete-blog/:blogId',authUser, deleteBlog);
router.get('/getBlogs', authUser, getAllBlogs);
router.get('/getBlog/:blogId', authUser, getBlog);
router.put('/likeDislikeBlog/:blogId/:action', authUser, likeOrDislikeBlog)

router.post('/addComment', authUser, addComment);
router.put('/editComment', authUser, editComment);
router.delete('/deleteComment/:commentId', authUser, deleteComment);
router.get('/getComments/:blogId', authUser, getCommentsOfBlog);
router.put('/likeDislikeComment/:commentId/:action', authUser, likeOrDislikeComment);


module.exports = router;