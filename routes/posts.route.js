
const express = require("express");
const { Op } = require('sequelize');
const { Users, Posts, Comments } = require("../models");
const authMiddleware = require("../middlewares/auth-middleware");
const { postingRules, postValidate} = require('../middlewares/post-middleware');
const router = express.Router();

// 게시글 생성
router.post("/posts", authMiddleware, postingRules(), postValidate, async (req, res) => {
  const { userId } = res.locals.user;
  const { title, content } = req.body;

  const post = await Posts.create({
    UserId: userId,
    title,
    content
  });

  return res.status(201).json({ data: post });
});

// 게시글 목록 조회
router.get("/posts", async (req, res) => {
    const posts = await Posts.findAll({
      attributes: ["postId", "title", "createdAt", "updatedAt"],
      include: [
        {
          model: Users,
          attributes: ["nickname"],
        }
      ],
      order: [['createdAt', 'DESC']],
    });
  
    return res.status(200).json({ data: posts });
  });

// 게시글 상세 조회 + comments
router.get("/posts/:postId", async (req, res) => {
    const { postId } = req.params;
    const post = await Posts.findOne({
      attributes: ["postId", "title", "content", "createdAt", "updatedAt"],
      include: [
        {
          model: Users,
          attributes: ["nickname"],
        },
        {
          model: Comments,
          attributes: ["comment", "createdAt", "updatedAt"],
          include: [
            {
              model: Users,
              attributes: ["nickname"],
            }
          ]
          
        }
      ],
      where: { postId }
    });
  
    return res.status(200).json({ data: post });
  });

 // 게시글 수정
 router.put("/posts/:postId", authMiddleware, postingRules(), postValidate, async (req, res) =>{
    const {postId} = req.params;
    const {userId} = res.locals.user;
    const {title, content} = req.body;

    // 게시글 조회
    const post = await Posts.findOne({where: {postId}});
    if (!post){
        return res.status(404).json({message: "게시글이 존재하지 않습니다."});
    } else if (post.UserId != userId){
        return res.status(401).json({message: "권한이 없습니다."});
    }

    //게시글의 권한을 확인하고, 게시글을 수정합니다.
    await Posts.update(
        { title, content }, //title & content 수정. createdAt & updatedAt은 별도 처리 안해도 잘 적용됨
        {
            where:{
                [Op.and]: [{postId},{UserId: userId}],
            }
        }
    );

    return res.status(200).json({data: "게시글이 수정되었습니다."});
 });

 // 게시글 삭제
 router.delete("/posts/:postId", authMiddleware, async (req, res) =>{
    const {postId} = req.params;
    const {userId} = res.locals.user;

    const post = await Posts.findOne({where: {postId}});
    if (!post){
        return res.status(404).json({message: "게시글이 존재하지 않습니다."});
    } else if (post.UserId != userId) {
        return res.status(401).json({message: "권한이 없습니다."});
    }
    
    //게시글의 권한을 확인하고, 게시글을 삭제합니다.
    await Posts.destroy({
        where:{
            [Op.and]:[{postId}, {UserId: userId}],
        }
    });
    return res.status(200).json({ message: "게시글이 삭제되었습니다."});
 });
 
module.exports = router;