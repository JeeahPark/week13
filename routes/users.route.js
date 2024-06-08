const express = require("express");
const jwt = require('jsonwebtoken');
const argon2 = require('argon2'); // password hashing
const {Users} = require("../models");
const { userRegisterationRules, validate} = require('../middlewares/validators-middleware');
const router = express.Router();

// join
router.post("/users",userRegisterationRules(),validate, async (req, res) =>{
    const { nickname, password, confirmPassword } = req.body; // confirmPassword from client no need to store it into DB

    const isExistUser = await Users.findOne({where: {nickname} });
    if (isExistUser){
        return res.status(409).json({message: "중복된 닉네임입니다."});
    }
    // Password hashing
    const hashedPassword = await argon2.hash(password);

    // Users 테이블에 사용자 추가
    const user = await Users.create({nickname, password: hashedPassword});

    return res.status(201).json({message: "회원가입이 완료되었습니다."});
});

// login
router.post("/login", async (req, res) => {
    const { nickname, password } = req.body;
    const user = await Users.findOne({ where: { nickname } });
    // check if user exists
    if (!user) {
      return res.status(401).json({ message: "닉네임 또는 패스워드를 확인해주세요." });
    } 
  
    // check password matching
    const passwordMatch = await argon2.verify(user.password, password);
    if (!passwordMatch){
      return res.status(401).json({message: "닉네임 또는 패스워드를 확인해주세요."});
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
});

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