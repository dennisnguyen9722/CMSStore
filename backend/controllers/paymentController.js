const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

class PaymentController {
  static async createCheckoutSession(req, res) {
    const { items, order_id } = req.body;
    try {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: items.map((item) => ({
          price_data: {
            currency: 'vnd',
            product_data: { name: item.name },
            unit_amount: item.price * 100,
          },
          quantity: item.quantity,
        })),
        mode: 'payment',
        success_url: `${process.env.FRONTEND_URL}/order/${order_id}?success=true`,
        cancel_url: `${process.env.FRONTEND_URL}/cart?cancel=true`,
      });
      res.json({ id: session.id });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
}

module.exports = PaymentController;