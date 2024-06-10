// middlewares/auth-middleware.js

const jwt = require("jsonwebtoken");
const { Users } = require("../models");

module.exports = async (req, res, next) => {
  try {
    const { authorization } = req.cookies;
    const [tokenType, token] = authorization.split(" ");
    if (tokenType !== "Bearer") {
      return res.status(401).json({ message: "토큰 타입이 일치하지 않습니다." });
    }
    console.log(token);

    const decodedToken = jwt.verify(token, "customized_secret_key");
    const userId = decodedToken.userId;

    // is this process neccessary? from here
    const user = await Users.findOne({ where: { userId } });
    if (!user) {
      res.clearCookie("authorization");
      return res.status(401).json({ message: "토큰 사용자가 존재하지 않습니다." });
    }

    res.locals.user = user;
    // to here

    next();
  } catch (error) {
    res.clearCookie("authorization");
    return res.status(401).json({
      message: "비정상적인 요청입니다."
    });
  }
}