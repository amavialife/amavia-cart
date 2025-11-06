// api/verify-session.js
module.exports = async (req, res) => {
  try {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) return res.status(500).json({ error: 'Missing STRIPE_SECRET_KEY env var' });
    const stripe = require('stripe')(key);

    const { session_id } = req.query || {};
    if (!session_id) return res.status(400).json({ error: 'Missing session_id' });

    const session = await stripe.checkout.sessions.retrieve(session_id, {
      expand: ['line_items.data.price.product'],
    });
    if (session.payment_status !== 'paid') {
      return res.status(403).json({ error: 'Payment not verified' });
    }

    const FILES_BY_PRICE = {
      'price_1SPupSCipX1klfWPOuzr6NOg': 'https://example.com/obituary-basic.pdf',
      'price_1SPuqTCipX1klfWPCK0R9qXL': 'https://example.com/obituary-premium.pdf',
      'price_1SPuvCCipX1klfWPddKUIzrl': 'https://example.com/obituary-legacy.pdf',
      'price_1SPuxHCipX1klfWPgAPF5OCO': 'https://example.com/death-announcement.pdf',
      'price_1SPuzJCipX1klfWPNp6aBnyp': 'https://example.com/eulogy-basic.pdf',
      'price_1SPv06CipX1klfWPzziESfSy': 'https://example.com/eulogy-premium.pdf',
      'price_1SPv0yCipX1klfWPM7HLQchm': 'https://example.com/service-program.pdf',
      'price_1SPv2cCipX1klfWPHnPLLMGQ': 'https://example.com/thankyou-10.pdf',
      'price_1SPv5SCipX1klfWPyjIuBASf': 'https://example.com/thankyou-25.pdf',
      'price_1SPv6YCipX1klfWPZ0CVyvMQ': 'https://example.com/thankyou-50.pdf',
      'price_1SPv8YCipX1klfWPicJd7gMC': 'https://example.com/legacy-letter.pdf',
      'price_1SPv9rCipX1klfWPxf7ZwTuX': 'https://example.com/package-essential.pdf',
      'price_1SPvAeCipX1klfWPE2yO6sy5': 'https://example.com/package-complete.pdf',
      'price_1SPvD1CipX1klfWPgsL6wunX': 'https://example.com/package-legacy.pdf',
      'price_1SPvHICipX1klfWP2mwzYcFj': 'https://example.com/rush-24h.pdf',
      'price_1SPvIdCipX1klfWPDQuRJENw': 'https://example.com/rush-sameday.pdf',
    };

    const items = (session.line_items?.data || []).map(li => li.price.id);
    const links = items.map(id => FILES_BY_PRICE[id]).filter(Boolean);

    return res.status(200).json({
      ok: true,
      downloads: links,
      currency: session.currency,
      amount_total: session.amount_total,
    });
  } catch (e) {
    return res.status(500).json({ error: e.message || 'Server error' });
  }
};
