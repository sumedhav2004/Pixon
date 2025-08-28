import BlurPage from '@/components/global/blur-page'
import InfoBar from '@/components/global/infobar'
import Sidebar from '@/components/sidebar'
import Unauthorized from '@/components/unauthorized'
import { getNotificationAndUser, verifyAndAcceptInvitation } from '@/lib/queries'
import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import React from 'react'

type Props = {
  children: React.ReactNode
  params: Promise<{ agencyId: string }>  // Changed this line
}

const layout = async ({ children, params }: Props) => {
  const { agencyId: paramsAgencyId } = await params  // Added this line
  const agencyId = await verifyAndAcceptInvitation();
  const user = await currentUser();

  if (!user) {
    return redirect('/')
  }
  if (!agencyId) {
    return redirect('/agency')
  }

  if (user.privateMetadata.role !== "AGENCY_OWNER" && user.privateMetadata.role !== "AGENCY_ADMIN") return <Unauthorized />

  let allNoti: any = []
  const notifications = await getNotificationAndUser(agencyId)

  if (notifications) allNoti = notifications;

  return <div className='h-screen overflow-hidden border-none'>
    <Sidebar id={paramsAgencyId} type="agency" />  {/* Changed this line */}

    <div className='md:pl-[300px] border-none'>
      <InfoBar notifications={allNoti} className='border-none' />
      <div className='relative'>
        <BlurPage>{children}</BlurPage>
      </div>
    </div>
  </div>
}

export default layout
