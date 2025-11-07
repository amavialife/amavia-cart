// api/health.js
module.exports = async (req, res) => {
  try {
    const hasKey = Boolean(process.env.STRIPE_SECRET_KEY);
    let stripeLoaded = false;
    try { require.resolve('stripe'); stripeLoaded = true; } catch (_) {}

    res.status(200).json({
      ok: true,
      hasKey,        // should be true
      stripeLoaded,  // should be true
      node: process.version
    });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
};
