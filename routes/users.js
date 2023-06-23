const express = require("express");
const router = express.Router();
const User = require("../schemas/user.js");

//회원 가입
router.post("/signup", async (req, res) => {
  const { nickname, password, confirm } = req.body;
  const searchStr = /[^a-zA-Z0-9]/;
  try {
    if (
      nickname.length < 2 ||
      nickname.length > 20 ||
      nickname.search(searchStr) != -1
    ) {
      res.status(400).json({
        errorMessage:
          "닉네임은 2글자 이상 20글자 이하이며 특수문자 사용은 불가능입니다.",
      });
      return;
    }
    if (password !== confirm) {
      res.status(400).json({
        errorMessage: "패스워드가 일치하지않습니다.",
      });
      return;
    }

    const existsUsers = await User.findOne({ nickname });
    if (existsUsers) {
      res.status(400).json({
        errorMessage: "중복된 닉네임입니다.",
      });
      return;
    }

    const user = new User({ nickname, password });
    await user.save();

    res.json({ message: "회원가입이 완료되었습니다." });
  } catch (error) {
    res.status(400).json({ errorMessage: "회원가입에 실패했습니다." });
  }
});

module.exports = router;