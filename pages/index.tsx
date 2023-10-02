import { loadStripe } from "@stripe/stripe-js";
import { useEffect } from "react";
import { Inter } from "next/font/google";
import Head from "next/head";
import Image from "next/image";

import { useToast } from "@/components/ui/use-toast";
import { product } from "@/lib/data";
import { useSearchParams } from "next/navigation";

const inter = Inter({ subsets: ["latin"] });
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY as string
);

export default function Home() {
  const { toast } = useToast();
  const status = useSearchParams().get("status");

  useEffect(() => {
    if (status === "Success") {
      toast({
        title: "Success",
        description: "Your purchase was successful",
      });
    } else if (status === "Cancelled") {
      toast({
        title: "Error",
        description: "Some error occured during your checkout, try again.",
        variant: "destructive",
      });
    }
  }, [status, toast]);

  const handleCheckout = async () => {
    try {
      const stripe = await stripePromise;

      const body: RequestInit = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ item: product }),
      };
      const response = await fetch("/api/stripe_session", body);
      const { sessionId } = await response.json();
      await stripe!.redirectToCheckout({ sessionId });
    } catch (error) {
      toast({
        title: "Error",
        description: "Some error occured during your checkout, try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Head>
        <title>Product Stripe Checkout</title>
      </Head>
      <main className={`${inter.className} h-screen grid place-items-center`}>
        <section className="grid grid-cols-2 gap-2 max-w-2xl border border-gray-200">
          <div>
            <Image
              src={product.image}
              alt="Headset"
              width={350}
              height={0}
              className="h-full"
              priority={true}
            />
          </div>
          <div className="p-4 flex flex-col justify-between">
            <h1 className="text-xl font-bold">{product.name}</h1>
            <p className="text-gray-500">{product.description}</p>
            <p className="text-lg font-semibold">
              Price: {product.price} &#8377;
            </p>
            <button
              className="w-full bg-orange-500 hover:bg-orange-400 p-2 rounded-lg text-white"
              onClick={handleCheckout}
            >
              Buy Now
            </button>
          </div>
        </section>
      </main>
    </>
  );
}
