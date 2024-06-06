const express = require("express");
const {Users, UserInfos} = require("../models");
const router = express.Router();

// join
router.post("/users", async (req, res) =>{
    const { nickname, password, name, profileImage } = req.body; //confirmPassword 어떻게 확인?

    // 회원가입시 확인 조건
    // 닉네임 최소 3자 이상, 알파벳 대소문자, 숫자로 구성
    
    // 비밀번호 최소 4자 이상, 닉네임과 같은 값이 포함된 경우 회원가입 실패

    // 비밀번호 확인은 비밀번호와 정확하게 일치하기 (넘길 필요는 없음)


    const isExistUser = await Users.findOne({where: {nickname} });
    if (isExistUser){
        return res.status(409).json({message: "중복된 닉네임입니다."});
    }

    // Users 테이블에 사용자 추가
    const user = await Users.create({nickname, password});
    // User Infos 테이블에 사용자 정보 추가
    const userInfo = await UserInfos.create({
        UserId: user.UserId, // 생성한 유저의 userId를 바탕으로 사용자 정보를 생성
        name,
        age,
        gender: gender.toUpperCase(),
        profileImage
    });

    return res.status(201).json({message: "회원가입이 완료되었습니다."});
});

// login
router.post("/login", async (req, res) => {
    const { nickname, password } = req.body;
    const user = await Users.findOne({ where: { nickname } });
    if (!user) {
      return res.status(401).json({ message: "존재하지 않는 이메일입니다." });
    } else if (user.password !== password) {
      return res.status(401).json({ message: "비밀번호가 일치하지 않습니다." });
    }
  
    const token = jwt.sign({
      userId: user.userId
    }, "customized_secret_key");
    res.cookie("authorization", `Bearer ${token}`);
    return res.status(200).json({ message: "로그인 성공" });
  });

  // 사용자 조회
  router.get("/users/:userId", async (req, res) => {
    const { userId } = req.params;
  
    const user = await Users.findOne({
      attributes: ["userId", "nickname", "createdAt", "updatedAt"],
      include: [
        {
          model: UserInfos,  // 1:1 관계를 맺고있는 UserInfos 테이블을 조회합니다.
          attributes: ["name", "age", "gender", "profileImage"],
        }
      ],
      where: { userId }
    });
  
    return res.status(200).json({ data: user });
  });



module.exports = router;