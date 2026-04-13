import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import Razorpay from 'razorpay'
import { SUBSCRIPTION_PLANS } from '@/lib/types'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

/**
 * Must create a real order via Razorpay Orders API.
 * Passing a fake `order_*` id causes Standard Checkout to GET
 * `/v2/standard_checkout/preferences` and return 400 — the order does not exist.
 */
export async function POST(request: NextRequest) {
  try {
    const { plan_type, user_id } = await request.json()

    if (!plan_type || !user_id) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const plan = SUBSCRIPTION_PLANS[plan_type as keyof typeof SUBSCRIPTION_PLANS]
    if (!plan) {
      return NextResponse.json({ error: 'Invalid plan type' }, { status: 400 })
    }

    const keyId =
      process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID
    const keySecret = process.env.RAZORPAY_KEY_SECRET

    if (!keyId || !keySecret) {
      console.error('Missing RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET')
      return NextResponse.json(
        { error: 'Payment gateway is not configured on the server' },
        { status: 500 },
      )
    }

    const { data: user, error: userError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user_id)
      .single()

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const amountPaise = plan.price * 100
    const receipt = `ss_${user_id.replace(/-/g, '').slice(0, 12)}_${Date.now()}`.slice(
      0,
      40,
    )

    const rzp = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    })

    let order: { id: string; amount: number; currency: string }
    try {
      order = (await rzp.orders.create({
        amount: amountPaise,
        currency: 'INR',
        receipt,
        notes: {
          plan_type,
          user_id,
          plan_name: plan.name,
        },
      })) as { id: string; amount: number; currency: string }
    } catch (rzpErr: unknown) {
      console.error('Razorpay orders.create failed:', rzpErr)
      const desc =
        rzpErr &&
        typeof rzpErr === 'object' &&
        'error' in rzpErr &&
        rzpErr.error &&
        typeof rzpErr.error === 'object' &&
        'description' in rzpErr.error
          ? String((rzpErr.error as { description?: string }).description)
          : 'Could not create payment order'
      return NextResponse.json({ error: desc }, { status: 502 })
    }

    const { data: transaction, error: txError } = await supabase
      .from('transactions')
      .insert({
        user_id,
        razorpay_order_id: order.id,
        amount: plan.price,
        currency: 'INR',
        status: 'pending',
        description: `${plan.name} Subscription`,
        metadata: { plan_type, plan_name: plan.name },
      })
      .select()
      .single()

    if (txError) {
      console.error('Transaction creation error:', txError)
      return NextResponse.json(
        { error: 'Failed to save transaction' },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      order_id: order.id,
      amount: order.amount,
      currency: order.currency ?? 'INR',
      transaction_id: transaction.id,
      key_id: keyId,
      prefill: {
        name: user.full_name || '',
        email: user.email,
        contact: user.phone || '',
      },
      notes: {
        plan_type,
        user_id,
        transaction_id: transaction.id,
      },
    })
  } catch (error) {
    console.error('Create order error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
