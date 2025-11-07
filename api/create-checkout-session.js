// api/create-checkout-session.js

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // 🧩 1️⃣  Define all your products here with their Stripe TEST MODE price IDs
    const PRODUCTS = {
      essential: "price_1SPv9rCipX1klfWPxf7ZwTuX",        // Essential Package
      complete: "price_1SPvAeCipX1klfWPE2yO6sy5",         // Complete Memorial Package
      legacy: "price_1SPvD1CipX1klfWPgsL6wunX",           // Legacy Package
      basicObit: "price_1SPupSCipX1klfWPOuzr6NOg",        // Basic Obituary
      premiumObit: "price_1SPuqTCipX1klfWPCK0R9qXL",      // Premium Obituary
      legacyObit: "price_1SPuvCCipX1klfWPddKUIzrl",       // Legacy Obituary
      deathNotice: "price_1SPuxHCipX1klfWPgAPF5OCO",      // Death Announcement
      premiumEulogy: "price_1SPv06CipX1klfWPzziESfSy",    // Premium Eulogy
      basicEulogy: "price_1SPuzJCipX1klfWPNp6aBnyp",      // Basic Eulogy
      serviceProgram: "price_1SPv0yCipX1klfWPM7HLQchm",   // Service Program
      cards10: "price_1SPv2cCipX1klfWPHnPLLMGQ",          // Cards (10)
      cards25: "price_1SPv5SCipX1klfWPyjIuBASf",          // Cards (25)
      cards50: "price_1SPv6YCipX1klfWPZ0CVyvMQ",          // Cards (50)
      legacyLetter: "price_1SPv8YCipX1klfWPicJd7gMC",     // Legacy Letter
      rush24: "price_1SPvHICipX1klfWP2mwzYcFj",           // 24-hour Rush
      rushSameDay: "price_1SPvIdCipX1klfWPDQuRJENw"       // Same-Day Rush
    };

    // 🧩 2️⃣  Parse what the user added to the cart
    const items = req.body.items || [];

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Cart is empty or invalid." });
    }

    // 🧩 3️⃣  Build line items for Stripe Checkout
    const line_items = items.map((item) => ({
      price: PRODUCTS[item.id],
      quantity: item.quantity,
    }));

    // 🧩 4️⃣  Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items,
      success_url: `${req.headers.origin}/success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin}/index.html`,
      billing_address_collection: "auto",
    });

    // 🧩 5️⃣  Return the session URL to redirect the user
    res.status(200).json({ url: session.url });
  } catch (err) {
    console.error("Stripe checkout error:", err.message);
    res.status(400).json({ error: `Checkout error: ${err.message}` });
  }
};
