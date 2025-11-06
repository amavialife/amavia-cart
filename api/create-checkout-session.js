// api/create-checkout-session.js
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

module.exports = async (req, res) => {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { lineItems } = req.body || {};
    if (!Array.isArray(lineItems) || !lineItems.length) {
      return res.status(400).json({ error: 'Missing line items' });
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: lineItems,
      automatic_tax: { enabled: true },
      allow_promotion_codes: true,
      success_url: `${req.headers['x-forwarded-proto'] || 'https'}://${req.headers.host}/success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers['x-forwarded-proto'] || 'https'}://${req.headers.host}/`,
    });

    res.status(200).json({ id: session.id });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
