const router = require("express").Router();

router.get("/", async (req, res) => {
	console.log('hhoohohoho');
  return res.status(200).json({ type: "admin", user: 'testing' });
});

module.exports = router;