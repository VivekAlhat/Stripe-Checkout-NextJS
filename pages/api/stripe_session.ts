import { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2023-08-16",
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { item } = req.body;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: {
              name: item.name,
              images: [item.image],
              description: item.description,
            },
            unit_amount: item.price * 100,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `http://localhost:3000?status=Success`,
      cancel_url: `http://localhost:3000?status=Cancelled`,
    });

    res.status(200).json({ sessionId: session.id });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error occured while creating a checkout session" });
  }
}
