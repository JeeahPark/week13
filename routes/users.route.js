const express = require("express");
const jwt = require('jsonwebtoken');
const {Users} = require("../models");
const { userRegisterationRules, validate} = require('../middlewares/validators-middleware');
const router = express.Router();

// join
router.post("/users",userRegisterationRules(),validate, async (req, res) =>{
    const { nickname, password, confirmPassword } = req.body; 

    const isExistUser = await Users.findOne({where: {nickname} });
    if (isExistUser){
        return res.status(409).json({message: "중복된 닉네임입니다."});
    }

    // Users 테이블에 사용자 추가
    const user = await Users.create({nickname, password});

    return res.status(201).json({message: "회원가입이 완료되었습니다."});
});

// login
router.post("/login", async (req, res) => {
    const { nickname, password } = req.body;
    const user = await Users.findOne({ where: { nickname } });
    if (!user) {
      return res.status(401).json({ message: "닉네임 또는 패스워드를 확인해주세요." });
    } else if (user.password !== password) {
      return res.status(401).json({ message: "닉네임 또는 패스워드를 확인해주세요." });
    }
  
    const token = jwt.sign({
      userId: user.userId
    }, "customized_secret_key");
    res.cookie("authorization", `Bearer ${token}`);
    return res.status(200).json({ message: "로그인 성공" });
  });


// log out
router.post("/logout", (req, res)=>{
  res.clearCookie("authorization"); // clear the cookie
  return res.status(200).json({message: "로그아웃 성공"});
})


  // 사용자 조회
  router.get("/users/:userId", async (req, res) => {
    const { userId } = req.params;
  
    const user = await Users.findOne({
      attributes: ["userId", "nickname", "createdAt", "updatedAt"],
      where: { userId }
    });
  
    return res.status(200).json({ data: user });
  });


module.exports = router;