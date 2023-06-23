const express = require("express");
const router = express.Router();
const User = require("../schemas/user.js");
const jwt = require("jsonwebtoken");

//로그인api
router.post("/login", async (req, res) => {
  const { nickname, password } = req.body;
  try {
    const user = await User.findOne({ $and: [{ nickname }, { password }] });

    if (!user || user.password !== password) {
      res.status(400).json({
        errorMessage: "닉네임 또는 패스워드가 일치하지 않습니다.",
      });
      return;
    }

    const token = jwt.sign({ userId: user.userId }, "skey");

    res.cookie("authorization", `Bearer ${token}`);
    res.status(200).json({ token });
  } catch (error) {
    res.status(400).json({ errorMessage: "로그인에 실패했습니다." });
  }
});

module.exports = router;