import { getStripe } from './client'

export async function upgradeSubscription(tierId: string) {
  try {
    // Call checkout API
    const response = await fetch('/api/subscription/checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ tierId }),
    })

    if (!response.ok) {
      throw new Error('Failed to create checkout session')
    }

    const { sessionId } = await response.json()

    // Redirect to Stripe Checkout
    const stripe = await getStripe()
    const { error } = await stripe.redirectToCheckout({ sessionId })

    if (error) {
      throw error
    }
  } catch (error) {
    console.error('Upgrade error:', error)
    throw error
  }
}

export async function openCustomerPortal() {
  try {
    const response = await fetch('/api/subscription/portal', {
      method: 'POST',
    })

    if (!response.ok) {
      throw new Error('Failed to create portal session')
    }

    const { url } = await response.json()
    window.location.href = url
  } catch (error) {
    console.error('Portal error:', error)
    throw error
  }
}