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
  params: Promise<{ agencyId?: string }>
  searchParams: Promise<{
    error?: string
    details?: string
  }>
}

const page = async ({ params, searchParams }: Props) => {
  console.log("🚀 ===== LAUNCHPAD PAGE START =====")
  
  const awaitedParams = await params
  const awaitedSearchParams = await searchParams
  
  const finalAgencyId = awaitedParams.agencyId

  if (!finalAgencyId) {
    console.error("❌ No agency ID found")
    return <div>No Agency Found</div>
  }

  // Get agency details from DB
  const agencyDetails = await db.agency.findUnique({
    where: { id: finalAgencyId }
  })

  if (!agencyDetails) {
    console.error("❌ No agency details found")
    return <div>Agency not found</div>
  }

  console.log("📊 Agency connectAccountId:", agencyDetails.connectAccountId)

  // Check if Stripe Connect was just completed (connectAccountId exists)
  const justConnected = !!agencyDetails.connectAccountId

  // Check all required business details
  const allDetailsExist =
    agencyDetails.address &&
    agencyDetails.agencyLogo &&
    agencyDetails.city &&
    agencyDetails.companyEmail &&
    agencyDetails.companyPhone &&
    agencyDetails.country &&
    agencyDetails.name &&
    agencyDetails.state &&
    agencyDetails.zipCode

  const stripeOAuthLink = getStripeOAuthLink(
    'agency',
    `agency___launchpad___${agencyDetails.id}`
  )

  return (
    <div className='flex flex-col justify-center items-center'>
      <div className='w-full h-full max-w-[800px]'>
        <Card className='border-none'>
          <CardHeader>
            <CardTitle>Lets get started</CardTitle>
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
              </div>
            )}

            {/* Debug Info */}
            <div className="p-4 bg-gray-100 border border-gray-300 rounded text-sm">
              <strong>Debug Info:</strong>
              <br />Agency ID: {finalAgencyId}
              <br />ConnectAccountId: {agencyDetails.connectAccountId || 'Not set'}
            </div>

            <div className='flex justify-between items-center p-4 w-full border rounded-lg gap-2'>
              <div className='flex md:items-center gap-4 flex-col md:!flex-row'>
                <Image src="/appstore.png" alt="app logo" height={80} width={80} className='rounded-md object-contain' />
                <p>Save the website as a shortcut on your mobile device</p>
              </div>
              <Button>Start</Button>
            </div>

            <div className='flex justify-between items-center p-4 w-full border rounded-lg gap-2'>
              <div className='flex md:items-center gap-4 flex-col md:!flex-row'>
                <Image src="/stripelogo.png" alt="app logo" height={80} width={80} className='rounded-md object-contain' />
                <p>Connect your stripe account to accept payments and see your dashboard</p>
              </div>
              {agencyDetails.connectAccountId ? (
                <CheckCircleIcon size={50} className='text-primary p-2 flex-shrink-0' />
              ) : (
                <Link href={stripeOAuthLink} className='bg-primary py-2 px-4 rounded-md text-white'>
                  Start
                </Link>
              )}
            </div>

            <div className='flex justify-between items-center p-4 w-full border rounded-lg gap-2'>
              <div className='flex md:items-center gap-4 flex-col md:!flex-row'>
                <Image src={agencyDetails.agencyLogo} alt="app logo" height={80} width={80} className='rounded-md object-contain' />
                <p>Fill in all your business details</p>
              </div>
              {allDetailsExist ? (
                <CheckCircleIcon size={50} className='text-primary p-2 flex-shrink-0' />
              ) : (
                <Link href={`/agency/${finalAgencyId}/settings`}>Start</Link>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default page
