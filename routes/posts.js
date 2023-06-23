const express = require("express");
const router = express.Router();
const Posts = require("../schemas/post.js");
const authMiddleware = require("../middleware/auth-middleware.js");

//전체 게시글 get
router.get("/posts", async (req, res) => {
  try {
    const posts = await Posts.find({}).sort("-createdAt").exec();
    if (!posts) {
      res.status(400).json({
        errorMessage: "게시글이 존재하지 않습니다.",
      });
    }
    const priPosts = posts.map((item) => {
      return {
        postId: item._id,
        userId: item.userId,
        nickname: item.nickname,
        title: item.title,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      };
    });
    res.json({ posts: priPosts });
  } catch (error) {
    res.status(400).json({ errorMessage: "게시글 조회에 실패했습니다." });
    return;
  }
});

//상세 게시글 get
router.get("/posts/:postId", async (req, res) => {
  const { postId } = req.params;
  try {
    const post = await Posts.findById(postId);
    if (!post) {
      res.status(400).json({
        errorMessage: "존재하지 않는 게시글입니다.",
      });
      return;
    }
    const priPost = [post].map((item) => {
      return {
        postId: item._id,
        userId: item.userId,
        nickname: item.nickname,
        title: item.title,
        content: item.content,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      };
    });

    res.json({ post: priPost });
  } catch (error) {
    res.status(400).json({ errorMessage: "게시글 조회에 실패했습니다." });
    return;
  }
});

//게시글 post
router.post("/posts", authMiddleware, async (req, res) => {
  const { title, content } = req.body;
  const user = res.locals.user;
  try {
    if (title === "" || content === "") {
      return res
        .status(400)
        .json({ errorMessage: "제목과 내용을 작성해주세요." });
    }

    await Posts.create({
      userId: user._id,
      nickname: user.nickname,
      title,
      content,
    });
    res.json({ message: "게시글을 작성하였습니다." });
  } catch (error) {
    res.status(400).json({ errorMessage: "게시글 작성에 실패했습니다." });
    return;
  }
});

//게시글 update
router.put("/posts/:postId", authMiddleware, async (req, res) => {
  const { userId } = res.locals.user;
  const { postId } = req.params;
  const { title, content } = req.body;

  if (title == "" || content == "") {
    res.status(400).json({
      errorMessage: "제목 또는 게시글의 형식이 올바르지 않습니다.",
    });
    return;
  }
  try {
    const existsPosts = await Posts.findOne({ _id: postId });
    const nowTime = Date.now();
    if (!existsPosts) {
      res.status(400).json({
        errorMessage: "게시글이 존재하지 않습니다.",
      });
      return;
    }
    if (existsPosts.userId === userId) {
      await Posts.updateOne(
        { userId, _id: postId },
        { $set: { title: title, content: content, updatedAt: nowTime } }
      );
    } else {
      res.status(400).json({
        errorMessage: "수정 권한이 존재하지 않습니다.",
      });
      return;
    }
    res.json({ message: "게시글을 수정하였습니다." });
  } catch (error) {
    res.status(400).json({ errorMessage: "비정상적인 접근입니다." });
    return;
  }
});

//게시글 delete
router.delete("/posts/:postId", authMiddleware, async (req, res) => {
  const { userId } = res.locals.user;
  const { postId } = req.params;

  try {
    const existsPosts = await Posts.findOne({ _id: postId });
    if (!existsPosts) {
      res.status(400).json({
        errorMessage: "게시글이 존재하지 않습니다.",
      });
      return;
    }
    if (existsPosts.userId === userId) {
      await Posts.deleteOne({ userId, _id: postId });
    } else {
      res.status(400).json({
        errorMessage: "삭제 권한이 존재하지 않습니다.",
      });
      return;
    }
    res.json({ message: "게시글을 삭제하였습니다." });
  } catch (error) {
    res.status(400).json({ errorMessage: "잘못된 접근입니다." });
    return;
  }
});

module.exports = router;