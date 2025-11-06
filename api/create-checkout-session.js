// api/create-checkout-session.js
module.exports = async (req, res) => {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      return res.status(500).json({ error: 'Missing STRIPE_SECRET_KEY env var' });
    }

    // Lazy-init Stripe after we know the key exists
    const stripe = require('stripe')(key);

    const { lineItems } = req.body || {};
    if (!Array.isArray(lineItems) || lineItems.length === 0) {
      return res.status(400).json({ error: 'Missing line items' });
    }

    const proto = req.headers['x-forwarded-proto'] || 'https';
    const host = req.headers.host;

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: lineItems,
      automatic_tax: { enabled: true },
      allow_promotion_codes: true,
      success_url: `${proto}://${host}/success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${proto}://${host}/`,
    });

    return res.status(200).json({ id: session.id });
  } catch (e) {
    return res.status(500).json({ error: e.message || 'Server error' });
  }
};
