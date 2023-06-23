const express = require("express");
const router = express.Router();
const Comments = require("../schemas/comment.js");
const Posts = require("../schemas/post.js");
const authMiddleware = require("../middleware/auth-middleware.js");

//댓글 post
router.post("/posts/:postId/comments", authMiddleware, async (req, res) => {
  const user = res.locals.user;
  const { postId } = req.params;
  const { comment } = req.body;

  try {
    const existsPosts = await Posts.findOne({ _id: postId });
    if (!existsPosts) {
      res.status(400).json({
        errorMessage: "게시글이 존재하지 않습니다.",
      });
      return;
    }
    if (comment === "") {
      return res
        .status(400)
        .json({ errorMessage: "댓글을 작성해야합니다." });
    }
    await Comments.create({
      userId: user._id,
      postId: postId,
      nickname: user.nickname,
      comment: comment,
    });
  } catch (error) {
    res.status(400).json({ errorMessage: "댓글 작성에 실패했습니다." });
    return;
  }
  res.json({ message: "댓글을 작성했습니다." });
});

//댓글 get
router.get("/posts/:postId/comments", async (req, res) => {
  const { postId } = req.params;
  const comments = await Comments.find({ postId }).sort("-createdAt").exec();

  try {
    if (!comments) {
      res.status(400).json({
        message: "댓글이 존재하지 않습니다.",
      });
      return;
    }

    const priComments = comments.map((item) => {
      return {
        commentId: item._id,
        userId: item.userId,
        nickname: item.nickname,
        comment: item.comment,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      };
    });
    res.json({ comments: priComments });
  } catch (error) {
    res.status(400).json({ errorMessage: "댓글 조회에 실패하였습니다." });
    return;
  }
});

//댓글 update
router.put(
  "/posts/:postId/comments/:commentId",
  authMiddleware,
  async (req, res) => {
    const { userId } = res.locals.user;
    const { postId, commentId } = req.params;
    const { comment } = req.body;

    if (comment == "") {
      res.status(400).json({
        errorMessage: "데이터 형식이 올바르지 않습니다.",
      });
    }
    try {
      const existsComments = await Comments.findOne({ _id: commentId });
      const nowTime = Date.now();
      if (!existsComments) {
        res.status(400).json({
          errorMessage: "댓글이 존재하지 않습니다.",
        });
        return;
      }
      if (existsComments !== postId) {
        res.status(400).json({
          errorMessage: "잘못된 접근입니다.",
        });
        return;
      }
      if (existsComments.userId === userId) {
        await Comments.updateOne(
          { userId, postId, _id: commentId },
          { $set: { comment: comment, updatedAt: nowTime } }
        );
      } else {
        res.status(400).json({
          errorMessage: "수정 권한이 존재하지 않습니다.",
        });
        return;
      }
    } catch (error) {
      res.status(400).json({ errorMessage: "잘못된 접근입니다." });
      return;
    }
    res.json({ message: "댓글을 수정하였습니다." });
  }
);

//댓글 delete
router.delete(
  "/posts/:postId/comments/:commentId",
  authMiddleware,
  async (req, res) => {
    const { userId } = res.locals.user;
    const { postId, commentId } = req.params;

    try {
      const existsComments = await Comments.findOne({ _id: commentId });
      if (!existsComments) {
        res.status(400).json({
          errorMessage: "댓글이 존재하지 않습니다.",
        });
        return;
      }
      if (existsComments !== postId) {
        res.status(400).json({
          errorMessage: "다른 게시글의 댓글을 삭제 시도중입니다.",
        });
        return;
      }
      if (existsComments.userId === userId) {
        await Comments.deleteOne({ userId, postId, _id: commentId });
      } else {
        res.status(400).json({
          errorMessage: "삭제 권한이 없습니다.",
        });
        return;
      }
      res.json({ message: "삭제했습니다." });
    } catch (error) {
      res.status(400).json({ errorMessage: "잘못된 접근입니다." });
      return;
    }
  }
);

module.exports = router;