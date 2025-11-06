// api/verify-session.js
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const FILES_BY_PRICE = {
  'price_1SPupSCipX1klfWPOuzr6NOg': 'https://example.com/obituary-basic.pdf',
  // ... add the rest later
};

module.exports = async (req, res) => {
  try {
    const { session_id } = req.query || {};
    if (!session_id) return res.status(400).json({ error: 'Missing session_id' });

    const session = await stripe.checkout.sessions.retrieve(session_id, { expand: ['line_items.data.price.product'] });
    if (session.payment_status !== 'paid') {
      return res.status(403).json({ error: 'Payment not verified' });
    }

    const items = (session.line_items?.data || []).map(li => li.price.id);
    const links = items.map(id => FILES_BY_PRICE[id]).filter(Boolean);

    res.status(200).json({ ok: true, downloads: links });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
