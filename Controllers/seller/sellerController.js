const router = require("express").Router();

router.get("/", async (req, res) => {
	console.log('seller');
  return res.status(200).json({ type: "seller", user: 'testing' });
});

module.exports = router;