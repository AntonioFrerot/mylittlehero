import { normalizeEmail } from "@/lib/db/normalize-email";
import { getStripe } from "@/lib/stripe/client";

export async function findStripeCustomerIdByEmail(
  email: string
): Promise<string | null> {
  const stripe = getStripe();
  const customers = await stripe.customers.list({
    email: normalizeEmail(email),
    limit: 1,
  });

  return customers.data[0]?.id ?? null;
}
