export const dynamic = 'force-dynamic'
import React from 'react'

const page = ({params}: {params:{agencyId: string}}) => {
  return (
    <div>
      {params.agencyId}
    </div>
  )
}

export default page
