// api/verify-session.js
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

module.exports = async (req, res) => {
  try {
    const { id, session_id } = req.query;
    const sessionId = id || session_id;
    if (!sessionId) return res.status(400).json({ error: 'Missing session id' });

    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items.data.price.product'],
    });

    const items = (session.line_items?.data || []).map(li => ({
      name: typeof li.price.product === 'string'
        ? li.description || ''
        : li.price.product.name || li.description || '',
      quantity: li.quantity || 1,
      priceId: li.price.id,
    }));

    return res.status(200).json({ items });
  } catch (err) {
    console.error('verify-session error', err);
    return res.status(500).json({ error: 'Unable to verify session' });
  }
};
