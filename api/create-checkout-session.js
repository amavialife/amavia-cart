// api/create-checkout-session.js
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // The frontend sends { lineItems: [{ price: "price_...", quantity: n }, ...] }
    const { lineItems } = req.body || {};

    if (!Array.isArray(lineItems) || lineItems.length === 0) {
      return res.status(400).json({ error: "Cart is empty or invalid." });
    }

    // Basic validation
    for (const li of lineItems) {
      if (!li || typeof li !== "object" || typeof li.price !== "string" || !li.price.startsWith("price_")) {
        return res.status(400).json({ error: "Invalid line item format." });
      }
      if (!Number.isInteger(li.quantity) || li.quantity <= 0) {
        return res.status(400).json({ error: "Invalid line item quantity." });
      }
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,
      success_url: `${req.headers.origin}/success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin}/index.html`,
      billing_address_collection: "auto",
    });

    // Frontend expects an ID for redirectToCheckout
    res.status(200).json({ id: session.id });
  } catch (err) {
    console.error("Stripe checkout error:", err);
    res.status(400).json({ error: `Checkout error: ${err.message}` });
  }
};   
