import { loadStripe } from '@stripe/stripe-js'

const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY

if (!publishableKey) {
  console.warn(
    '[OpsThreads] Missing VITE_STRIPE_PUBLISHABLE_KEY. Stripe.js will not ' +
      'initialize until it is set in your .env file (see .env.example).',
  )
}

// loadStripe returns a promise that resolves to the Stripe instance.
// It is null when no key is configured so callers can guard on it.
export const stripePromise = publishableKey ? loadStripe(publishableKey) : null
