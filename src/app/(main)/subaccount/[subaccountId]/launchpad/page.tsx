import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { db } from '@/lib/db'
import { getStripeOAuthLink } from '@/lib/utils'
import { CheckCircleIcon } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

export const dynamic = 'force-dynamic'

type Props = {
  params: Promise<{ subaccountId?: string }>
  searchParams: Promise<{
    error?: string
    details?: string
  }>
}

const page = async ({ params, searchParams }: Props) => {
  console.log("🚀 ===== LAUNCHPAD PAGE START =====")
  
  const awaitedParams = await params
  const awaitedSearchParams = await searchParams
  
  // Fixed: Changed subAccountId to subaccountId (lowercase 'a')
  const finalSubaccountId = awaitedParams.subaccountId

  if (!finalSubaccountId) {
    console.error("❌ No Subaccount ID found")
    return <div>No SubAccount Found</div>
  }

  // Fixed: Query the correct table - subAccount instead of agency
  const subaccountDetails = await db.subAccount.findUnique({
    where: { id: finalSubaccountId }
  })

  if (!subaccountDetails) {
    console.error("❌ No subaccount details found")
    return <div>Subaccount not found</div>
  }

  console.log("📊 Subaccount connectAccountId:", subaccountDetails.connectAccountId)

  // Check if Stripe Connect was just completed (connectAccountId exists)
  const justConnected = !!subaccountDetails.connectAccountId

  // Check all required business details
  const allDetailsExist =
    subaccountDetails.address &&
    subaccountDetails.subAccountLogo &&
    subaccountDetails.city &&
    subaccountDetails.companyEmail &&
    subaccountDetails.companyPhone &&
    subaccountDetails.country &&
    subaccountDetails.name &&
    subaccountDetails.state &&
    subaccountDetails.zipCode

  // FIXED: Updated to use the new state format: entityType___action___entityId
  const stripeOAuthLink = getStripeOAuthLink(
    'subaccount',
    `subaccount___launchpad___${subaccountDetails.id}`
  )

  return (
    <div className='flex flex-col justify-center items-center'>
      <div className='w-full h-full max-w-[800px]'>
        <Card className='border-none'>
          <CardHeader>
            <CardTitle>Let's get started</CardTitle>
            <CardDescription>
              Follow the steps below to get your account setup.
            </CardDescription>
          </CardHeader>

          <CardContent className='flex flex-col gap-4'>
            {/* Success Message - shown if connectAccountId exists */}
            {justConnected && (
              <div className="p-4 bg-green-100 border border-green-400 text-green-700 rounded">
                ✅ Stripe account connected successfully!
              </div>
            )}
            
            {/* Error Messages */}
            {awaitedSearchParams.error && (
              <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                ❌ Error connecting Stripe: {awaitedSearchParams.error}
                {awaitedSearchParams.details && (
                  <div className="mt-2 text-sm">
                    Details: {awaitedSearchParams.details}
                  </div>
                )}
              </div>
            )}

            {/* Debug Info */}
            <div className="p-4 bg-gray-100 border border-gray-300 rounded text-sm">
              <strong>Debug Info:</strong>
              <br />Subaccount ID: {finalSubaccountId}
              <br />ConnectAccountId: {subaccountDetails.connectAccountId || 'Not set'}
              <br />Stripe OAuth Link: {stripeOAuthLink}
            </div>

            {/* Step 1: Mobile App Shortcut */}
            <div className='flex justify-between items-center p-4 w-full border rounded-lg gap-2'>
              <div className='flex md:items-center gap-4 flex-col md:!flex-row'>
                <Image 
                  src="/appstore.png" 
                  alt="app logo" 
                  height={80} 
                  width={80} 
                  className='rounded-md object-contain' 
                />
                <p>Save the website as a shortcut on your mobile device</p>
              </div>
              <Button>Start</Button>
            </div>

            {/* Step 2: Stripe Connect */}
            <div className='flex justify-between items-center p-4 w-full border rounded-lg gap-2'>
              <div className='flex md:items-center gap-4 flex-col md:!flex-row'>
                <Image 
                  src="/stripelogo.png" 
                  alt="stripe logo" 
                  height={80} 
                  width={80} 
                  className='rounded-md object-contain' 
                />
                <p>Connect your stripe account to accept payments and see your dashboard</p>
              </div>
              {subaccountDetails.connectAccountId ? (
                <CheckCircleIcon size={50} className='text-primary p-2 flex-shrink-0' />
              ) : (
                <Link 
                  href={stripeOAuthLink} 
                  className='bg-primary py-2 px-4 rounded-md text-white hover:bg-primary/90 transition-colors'
                >
                  Start
                </Link>
              )}
            </div>

            {/* Step 3: Business Details */}
            <div className='flex justify-between items-center p-4 w-full border rounded-lg gap-2'>
              <div className='flex md:items-center gap-4 flex-col md:!flex-row'>
                {subaccountDetails.subAccountLogo ? (
                  <Image 
                    src={subaccountDetails.subAccountLogo} 
                    alt="subaccount logo" 
                    height={80} 
                    width={80} 
                    className='rounded-md object-contain' 
                  />
                ) : (
                  <div className='w-20 h-20 bg-gray-200 rounded-md flex items-center justify-center'>
                    <span className='text-gray-500 text-sm'>No Logo</span>
                  </div>
                )}
                <p>Fill in all your business details</p>
              </div>
              {allDetailsExist ? (
                <CheckCircleIcon size={50} className='text-primary p-2 flex-shrink-0' />
              ) : (
                <Link 
                  href={`/subaccount/${finalSubaccountId}/settings`} 
                  className='bg-primary py-2 px-4 rounded-md text-white hover:bg-primary/90 transition-colors'
                >
                  Start
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default page
