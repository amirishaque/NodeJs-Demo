const router = require("express").Router();

router.get("/", async (req, res) => {
	console.log('customer');
  return res.status(200).json({ type: "Customer", user: 'testing' });
});

module.exports = router;