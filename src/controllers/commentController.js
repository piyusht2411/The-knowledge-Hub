const Blog = require('../models/Blog');
const Comment = require('../models/Comment');
const User = require('../models/User');

const addComment = async (req, res) => {
    try {
        const { comment, blogId } = req.body;
        const userId = req.userId;

        const blog = await Blog.findById(blogId);
        if (!blog) {
            return res.status(404).json({ message: 'Blog not found' });
        }

        const newComment = new Comment({
            content: comment,
            author: userId,
            blog: blogId,
        });

        const savedComment = await newComment.save();

        blog.comments.push(savedComment._id);
        await blog.save();

        const user = await User.findById(userId);
        user.comments.push(savedComment._id);
        await user.save();

        res.status(200).json({ message: 'Comment added successfully', comment: savedComment });
    } catch (err) {
        res.status(500).json({ message: 'Error adding comment', error: err.message });
    }
};

const editComment = async (req, res) => {
    try {
        const { commentId, comment } = req.body;
        const userId = req.userId;
        const editcomment = await Comment.findById(commentId);
        if (!editcomment) {
            return res.status(404).json({ message: 'Comment not found' });
        }
        if (editcomment.author.toString() !== userId.toString()) {
            return res.status(403).json({ message: 'You are not authorized to edit this comment' });
        }
        editcomment.content = comment;
        await editcomment.save();
        res.status(200).json({ message: 'Comment updated successfully', comment: editcomment });
    } catch (err) {
        res.status(500).json({ message: 'Error updating comment', error: err.message });
    }
}

const deleteComment = async (req, res) => {
    try {
        const { commentId } = req.params;
        const userId = req.userId;
        const comment = await Comment.findById(commentId);
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }
        if (comment.author.toString() !== userId.toString()) {
            return res.status(403).json({ message: 'You are not authorized to delete this comment' });
        }
        await Comment.findByIdAndDelete(commentId);
        const blog = await Blog.findByIdAndUpdate(comment.blog, { $pull: { comments: commentId } }, { new: true });
        const user = await User.findByIdAndUpdate(userId, { $pull: { comments: commentId } }, { new: true });
        res.status(200).json({ message: 'Comment deleted successfully!' });
    } catch (err) {
        res.status(500).json({ message: 'Error deleting comment', error: err.message });
    }
}

const getCommentsOfBlog = async (req, res) => {
    try {
        const { blogId } = req.params;
        const userId = req.userId;

        const blog = await Blog.findById(blogId).populate({
            path: 'comments',
            populate: {
                path: 'author',
                select: 'name color image'
            }
        });

        if (!blog) {
            return res.status(404).json({ message: 'Blog not found' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const comments = blog.comments.map(comment => {
            const isLiked = user.likedComments.includes(comment._id);
            const isDisliked = user.dislikedComments.includes(comment._id);

            return {
                ...comment._doc,
                isLiked,
                isDisliked
            };
        });

        res.status(200).json({ comments });
    } catch (err) {
        res.status(500).json({ message: 'Error getting comments', error: err.message });
    }
}


const likeOrDislikeComment = async (req, res) => {
    try {
        const { commentId, action } = req.params;
        const userId = req.userId;

        const comment = await Comment.findById(commentId);
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (action === 'like') {
            if (user.dislikedComments.includes(commentId)) {
                comment.dislikeCount--;
                user.dislikedComments.pull(commentId);
            }
            if (!user.likedComments.includes(commentId)) {
                comment.likeCount++;
                user.likedComments.push(commentId);
            }
        } else if (action === 'dislike') {
            if (user.likedComments.includes(commentId)) {
                comment.likeCount--;
                user.likedComments.pull(commentId);
            }
            if (!user.dislikedComments.includes(commentId)) {
                comment.dislikeCount++;
                user.dislikedComments.push(commentId);
            }
        } else {
            return res.status(400).json({ message: 'Invalid action' });
        }

        await comment.save();
        await user.save();

        res.status(200).json({ message: 'Action performed successfully', comment });
    } catch (err) {
        res.status(500).json({ message: 'Error performing action', error: err.message });
    }
};

module.exports = {
    addComment,
    editComment,
    deleteComment,
    getCommentsOfBlog,
    likeOrDislikeComment
};
