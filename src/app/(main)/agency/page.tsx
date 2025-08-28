export const dynamic = 'force-dynamic'
import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import React from 'react'
import { getAuthUserDetails, verifyAndAcceptInvitation } from '@/lib/queries'
import { Plan } from '@prisma/client'
import AgencyDetails from '@/components/forms/agency-details'

const page = async ({ searchParams }: { searchParams: Promise<{ plan?: Plan; state?: string; code?: string }> }) => {
  const awaitedSearchParams = await searchParams
  const { plan, state, code } = awaitedSearchParams

  console.log('[agency/page] Received searchParams:', awaitedSearchParams)

  const agencyId = await verifyAndAcceptInvitation()
  const user = await getAuthUserDetails()

  if (agencyId) {
    if (user?.role === "SUBACCOUNT_GUEST" || user?.role === "SUBACCOUNT_USER") {
      return redirect('/subaccount')
    } else if (user?.role === "AGENCY_OWNER" || user?.role === "AGENCY_ADMIN") {
      if (plan) {
        return redirect(`/agency/${agencyId}/billing?plan=${plan}`)
      }
      if (state) {
        const [statePath, stateAgencyId] = state.split('___')
        if (!stateAgencyId) return <div>Not Authorized</div>

        console.log(`[agency/page] Redirecting to /agency/${stateAgencyId}/${statePath}?code=${code}&state=${state}`)
        // ✅ FIX: Include both code AND state
        return redirect(`/agency/${stateAgencyId}/${statePath}?code=${code}&state=${state}`)
      }
      return redirect(`/agency/${agencyId}`)
    } else {
      return <div>Not Authorized</div>
    }
  }

  const authUser = await currentUser()
  return (
    <div className='flex justify-center items-center mt-4'>
      <div className='md:w-[90%] border-[1px] p-4 rounded-xl'>
        <h1 className='text-4xl'>Create an agency</h1>
        <AgencyDetails data={{ companyEmail: authUser?.emailAddresses[0].emailAddress }} />
      </div>
    </div>
  )
}

export default page
