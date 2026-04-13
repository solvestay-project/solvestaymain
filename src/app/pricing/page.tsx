'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useAuthStore } from '@/lib/store'
import type { Subscription } from '@/lib/types'
import { toast } from 'sonner'
import {
  Check,
  IndianRupee,
  Sparkles,
  MessageSquare,
  Search,
  Heart,
  TrendingUp,
  Zap,
  Shield,
} from 'lucide-react'

const plans = [
  {
    id: 'day',
    name: 'Lite Plan (2-Day)',
    price: 49,
    period: '2 days',
    description: 'Perfect for quick property searches',
    features: [
      { text: '5 property contacts', included: true },
      { text: 'Basic search filters', included: true },
      { text: 'Chat with owners', included: true },
      { text: '48 hours access', included: true },
      { text: 'Save favorites', included: false },
      { text: 'Price insights', included: false },
    ],
    popular: false,
    color: 'bg-card',
  },
  {
    id: 'weekly',
    name: 'Relax Plan (Weekly)',
    price: 150,
    period: 'week',
    description: 'Best for serious property hunters',
    features: [
      { text: '20 property contacts', included: true },
      { text: 'Advanced search filters', included: true },
      { text: 'Chat with owners', included: true },
      { text: '7 days access', included: true },
      { text: 'Save favorites', included: true },
      { text: 'Priority support', included: true },
    ],
    popular: true,
    color: 'bg-gradient-to-br from-primary to-accent',
  },
  {
    id: 'monthly',
    name: 'Freedom Plan (Monthly)',
    price: 499,
    period: 'month',
    description: 'Best value for a full month of searching',
    features: [
      { text: '20 property contacts', included: true },
      { text: 'Advanced search filters', included: true },
      { text: 'Priority support', included: true },
      { text: 'Save favorites', included: true },
      { text: 'Chat with owners', included: true },
      { text: '30 days access', included: true },
      { text: 'Price insights', included: true },
      { text: 'Get early listing', included: true },
    ],
    popular: false,
    color: 'bg-card',
  },
]

const faqs = [
  {
    question: 'What happens after my subscription expires?',
    answer: 'Your subscription will automatically deactivate. You can renew anytime to continue accessing contact details. Your saved favorites will remain in your account.',
  },
  {
    question: 'Can I upgrade my plan mid-subscription?',
    answer: 'Yes! You can upgrade at any time. The remaining days from your current plan will be adjusted proportionally to your new plan.',
  },
  {
    question: 'Is there a refund policy?',
    answer: 'We offer a full refund within 24 hours of purchase if you haven\'t used any contacts. After that, refunds are processed on a case-by-case basis.',
  },
  {
    question: 'What payment methods are accepted?',
    answer: 'We accept all major credit/debit cards, UPI, net banking, and popular wallets like Paytm, PhonePe, and Google Pay.',
  },
  {
    question: 'Are there any hidden charges?',
    answer: 'Absolutely not! The price you see is the price you pay. No brokerage, no hidden fees, no commissions.',
  },
]

const benefits = [
  {
    icon: MessageSquare,
    title: 'Direct Contact',
    description: 'Chat and call property owners directly without any middlemen',
  },
  {
    icon: Shield,
    title: 'Verified Listings',
    description: 'All properties are verified to ensure authenticity and trust',
  },
  {
    icon: TrendingUp,
    title: 'Market Insights',
    description: 'Get AI-powered price predictions and market trends',
  },
  {
    icon: Zap,
    title: 'Instant Access',
    description: 'Your subscription activates immediately after payment',
  },
]

type PricingPlan = (typeof plans)[number]

const PLAN_API_KEY: Record<
  string,
  'day' | 'weekly' | 'monthly'
> = {
  day: 'day',
  weekly: 'weekly',
  monthly: 'monthly',
}

export default function PricingPage() {
  const { user, setSubscription } = useAuthStore()
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan | null>(null)
  const [payLoading, setPayLoading] = useState(false)

  const handleSubscribe = (plan: PricingPlan) => {
    setSelectedPlan(plan)
    setCheckoutOpen(true)
  }

  const startRazorpayCheckout = async () => {
    if (!user || !selectedPlan) return
    const planType = PLAN_API_KEY[selectedPlan.id]
    if (!planType) {
      toast.error('Invalid plan')
      return
    }
    type RazorpayCtor = new (options: Record<string, unknown>) => { open: () => void }
    const Razorpay: RazorpayCtor | undefined =
      typeof window !== 'undefined'
        ? (window as unknown as { Razorpay?: RazorpayCtor }).Razorpay
        : undefined
    if (!Razorpay || typeof Razorpay !== 'function') {
      toast.error('Payment is still loading. Please wait a moment and try again.')
      return
    }

    setPayLoading(true)
    try {
      const orderRes = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan_type: planType, user_id: user.id }),
      })
      const orderData = (await orderRes.json()) as {
        error?: string
        key_id?: string
        order_id?: string
        amount?: number
        currency?: string
        transaction_id?: string
        prefill?: { name?: string; email?: string; contact?: string }
      }
      if (!orderRes.ok) {
        toast.error(orderData.error || 'Could not start checkout')
        return
      }
      if (
        !orderData.key_id ||
        !orderData.order_id ||
        orderData.amount == null ||
        !orderData.transaction_id
      ) {
        toast.error('Invalid response from payment server')
        return
      }

      const rzp = new Razorpay({
        key: orderData.key_id,
        amount: orderData.amount,
        currency: orderData.currency ?? 'INR',
        order_id: orderData.order_id,
        name: 'Solvestay',
        description: selectedPlan.name,
        prefill: orderData.prefill,
        theme: { color: '#6366f1' },
        handler: async (response: {
          razorpay_payment_id: string
          razorpay_order_id: string
          razorpay_signature: string
        }) => {
          try {
            const verifyRes = await fetch('/api/payments/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                transaction_id: orderData.transaction_id,
                plan_type: planType,
                user_id: user.id,
              }),
            })
            const verifyData = (await verifyRes.json()) as {
              error?: string
              subscription?: Subscription
            }
            if (!verifyRes.ok) {
              toast.error(verifyData.error || 'Payment verification failed')
              return
            }
            if (verifyData.subscription) {
              setSubscription(verifyData.subscription)
            }
            toast.success('Payment successful! Your plan is active.')
            setCheckoutOpen(false)
            setSelectedPlan(null)
          } catch {
            toast.error('Verification failed. Contact support if you were charged.')
          }
        },
      })
      rzp.open()
    } catch {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setPayLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <div className="pt-20 bg-white">
        <section className="py-16 sm:py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Badge variant="secondary" className="mb-6 px-4 py-2">
                <Sparkles className="w-4 h-4 mr-2 text-primary" />
                Simple, Transparent Pricing
              </Badge>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 text-foreground">
                Choose Your
                <br />
                <span className="text-primary font-serif italic">Perfect Plan</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Unlock direct access to property owners and find your dream home faster.
                No brokerage fees, no hidden charges.
              </p>
            </motion.div>
          </div>
        </section>

        <section className="py-20 -mt-20 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-3 gap-6">
              {plans.map((plan, index) => (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`relative rounded-2xl p-8 ${
                    plan.popular
                      ? `${plan.color} text-primary-foreground scale-105 shadow-2xl z-10`
                      : `${plan.color} border`
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <Badge className="bg-background text-foreground shadow-lg">
                        Most Popular
                      </Badge>
                    </div>
                  )}

                  <div className="mb-6">
                    <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
                    <p
                      className={
                        plan.popular
                          ? 'text-primary-foreground/80'
                          : 'text-muted-foreground'
                      }
                    >
                      {plan.description}
                    </p>
                  </div>

                  <div className="flex items-baseline gap-1 mb-8">
                    <IndianRupee className="w-8 h-8" />
                    <span className="text-5xl font-bold">{plan.price}</span>
                    <span
                      className={
                        plan.popular
                          ? 'text-primary-foreground/80'
                          : 'text-muted-foreground'
                      }
                    >
                      /{plan.period}
                    </span>
                  </div>

                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feature) => (
                      <li key={feature.text} className="flex items-center gap-3">
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center ${
                            feature.included
                              ? plan.popular
                                ? 'bg-primary-foreground/20'
                                : 'bg-primary/10'
                              : 'bg-muted'
                          }`}
                        >
                          {feature.included ? (
                            <Check
                              className={`w-3 h-3 ${plan.popular ? 'text-primary-foreground' : 'text-primary'}`}
                            />
                          ) : (
                            <span className="w-1.5 h-0.5 bg-muted-foreground rounded" />
                          )}
                        </div>
                        <span
                          className={
                            feature.included
                              ? ''
                              : plan.popular
                                ? 'text-primary-foreground/50 line-through'
                                : 'text-muted-foreground line-through'
                          }
                        >
                          {feature.text}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    className={`w-full h-12 ${
                      plan.popular
                        ? 'bg-background text-foreground hover:bg-background/90'
                        : ''
                    }`}
                    variant={plan.popular ? 'secondary' : 'default'}
                    onClick={() => handleSubscribe(plan)}
                  >
                    {user ? 'Get Started' : 'Sign Up & Subscribe'}
                  </Button>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 bg-white border-t border-border/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">Why Subscribe?</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Get the most out of your property search with our premium features
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={benefit.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <benefit.icon className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">{benefit.title}</h3>
                  <p className="text-sm text-muted-foreground">{benefit.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Frequently Asked Questions
              </h2>
            </div>

            <div className="space-y-6">
              {faqs.map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  className="p-6 rounded-2xl border bg-card"
                >
                  <h3 className="font-semibold mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 bg-white border-t border-border/60">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-foreground">
              Ready to Find Your Dream Home?
            </h2>
            <p className="text-xl text-muted-foreground mb-10">
              Join thousands of happy customers who found their perfect property on Solvestay.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" variant="default" className="text-lg px-8">
                <Link href="/properties">Browse Properties</Link>
              </Button>
              {!user && (
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="text-lg px-8"
                >
                  <Link href="/auth/register">Create Free Account</Link>
                </Button>
              )}
            </div>
          </div>
        </section>
      </div>

      <Dialog
        open={checkoutOpen}
        onOpenChange={(open) => {
          setCheckoutOpen(open)
          if (!open) setSelectedPlan(null)
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedPlan ? selectedPlan.name : 'Choose a plan'}
            </DialogTitle>
            <DialogDescription>
              {selectedPlan
                ? `₹${selectedPlan.price} / ${selectedPlan.period} — ${selectedPlan.description}`
                : ''}
            </DialogDescription>
          </DialogHeader>

          {!user ? (
            <div className="space-y-4 py-2">
              <p className="text-sm text-muted-foreground">
                Create an account or sign in to complete your subscription on this page.
              </p>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button asChild className="flex-1">
                  <Link href="/auth/register" onClick={() => setCheckoutOpen(false)}>
                    Create account
                  </Link>
                </Button>
                <Button asChild variant="outline" className="flex-1">
                  <Link href="/auth/login" onClick={() => setCheckoutOpen(false)}>
                    Sign in
                  </Link>
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4 py-2">
              <p className="text-sm text-muted-foreground">
                You will complete payment securely with Razorpay in a popup. You can stay on this page.
              </p>
              <DialogFooter className="gap-2 sm:gap-0">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCheckoutOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={startRazorpayCheckout}
                  disabled={payLoading || !selectedPlan}
                >
                  {payLoading ? 'Opening checkout…' : 'Pay now'}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  )
}
