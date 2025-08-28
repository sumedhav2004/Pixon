import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  console.log('🚀 ===== OAUTH API ROUTE START =====')
  
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')

  console.log('🔍 OAuth handler received:', { code, state, error })

  if (error) {
    console.error('❌ Stripe OAuth error:', error)
    return NextResponse.redirect(new URL('/agency?error=oauth_error', request.url))
  }

  if (!code || !state) {
    console.error('❌ Missing code or state')
    return NextResponse.redirect(new URL('/agency?error=missing_params', request.url))
  }

  try {
    console.log('🔍 Parsing state:', state)
    const [entityType, action, entityId] = state.split('___')
    console.log('🔍 Parsed - entityType:', entityType, 'action:', action, 'entityId:', entityId)
    
    if (!entityId || action !== 'launchpad' || !['agency', 'subaccount'].includes(entityType)) {
      console.error('❌ Invalid state parameter')
      throw new Error('Invalid state parameter')
    }

    console.log('🌐 Calling stripe.oauth.token...')
    const response = await stripe.oauth.token({
      grant_type: 'authorization_code',
      code: code,
    })

    console.log('✅ Stripe response received')
    console.log('✅ stripe_user_id:', response.stripe_user_id)

    if (!response.stripe_user_id) {
      console.error('❌ No stripe_user_id in response - user likely skipped form')
      return NextResponse.redirect(
        new URL(`/${entityType}/${entityId}/launchpad?error=no_account_created`, request.url)
      )
    }

    // Handle based on entity type from state parameter
    if (entityType === 'agency') {
      console.log('🔄 Updating agency...')
      await db.agency.update({
        where: { id: entityId },
        data: { connectAccountId: response.stripe_user_id },
      })

      console.log('✅ Agency updated successfully')
      return NextResponse.redirect(
        new URL(`/agency/${entityId}/launchpad`, request.url)
      )
    } else if (entityType === 'subaccount') {
      console.log('🔄 Updating subaccount...')
      await db.subAccount.update({
        where: { id: entityId },
        data: { connectAccountId: response.stripe_user_id },
      })

      console.log('✅ Subaccount updated successfully')
      return NextResponse.redirect(
        new URL(`/subaccount/${entityId}/launchpad`, request.url)
      )
    }
  } catch (error) {
    console.error('❌ OAuth processing error:', error)
    return NextResponse.redirect(
      new URL('/agency?error=processing_failed', request.url)
    )
  }
}
