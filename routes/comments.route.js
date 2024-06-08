const express = require("express");
const {Posts, Comments} = require("../models");
const authMiddleware = require('../middlewares/auth-middleware');
const { commentingRules, commentValidate} = require('../middlewares/comment-middleware');
const {Op} = require('sequelize');
const router = express.Router();

// create a comment
router.post("/posts/:postId", authMiddleware, commentingRules(), commentValidate, async (req, res) => {
    const { postId } = req.params;
    const { userId } = res.locals.user;
    const { comment } = req.body;

    const post = await Posts.findByPk(postId);
    if (!post){
      return res.status(404).json({message: "존재하지 않는 게시물입니다."}); // middleware(입력내용) 먼저 확인  url확인은 뒷전
    }

    const comment_new = await Comments.create({PostId: postId, UserId: userId, comment});
    return res.status(201).json({message: "댓글이 등록되었습니다."});

});

// get comments for a post
router.get('/posts/:postId', async (req, res) => {
  const {postId} = req.params;

  const comments = await Comments.findAll({ where: {postId }});
  return res.status(200).json({data:comments});
});

// update a comment
router.put("/posts/:postId/:commentId", authMiddleware, commentingRules(), commentValidate, async (req, res) => {
    const {postId, commentId} = req.params;
    const {userId} = res.locals.user;
    const {comment} = req.body;

    const comment_update = await Comments.findOne({ where: { commentId, PostId: postId, UserId: userId } });
    if (!comment_update) {
      return res.status(404).json({ message: "잘못된 요청입니다." });
    }
  
    await Comments.update(
      { comment }, //comment 수정. createdAt & updatedAt은 별도 처리 안해도 잘 적용됨
      {
          where:{
              [Op.and]: [ {commentId}, {PostId: postId },{ UserId: userId }],
          }
      }
    );

    return res.status(200).json({ message: "댓글이 수정되었습니다." });
  });

// Delete a comment
router.delete('/posts/:postId/:commentId', authMiddleware, async (req, res) => {
  const {postId, commentId} = req.params;
  const {userId} = res.locals.user;

  const comment = await Comments.findOne({ where: { commentId, PostId: postId, UserId: userId } });
  if (!comment) {
    return res.status(404).json({ message: "잘못된 요청입니다." });
  }
  await comment.destroy();
  return res.status(200).json({message: "댓글이 삭제되었습니다."});

});


module.exports = router;