import { getAuthUserDetails } from '@/lib/queries'
import React from 'react'
import MenuOptions from './menu-options'

type Props = {
  id: string
  type:"agency" | "subaccount"
}

const Sidebar = async ({id, type}: Props) => {
  const user = await getAuthUserDetails()
  if (!user?.Agency) {
    console.error("No agency data available for the user.");
    return null;  // Return null early to avoid further issues
  }
  
  if(!user) return null 
  if(!user.Agency) return

  let details = null;

if (type === "agency") {
  details = user?.Agency;
} else if (type === "subaccount" && user?.Agency?.SubAccount) {
  details = user?.Agency?.SubAccount.find((subaccount) => subaccount.id === id);
}
if (!details) {
  console.error("No details found for type:", type, "id:", id);
  return null;  // Return early to prevent rendering with undefined details
}



  const isWhiteLabeledAgency = user.Agency.whiteLabel;

  if(!details) return

  let sideBarLogo = user.Agency.agencyLogo || '/assets/plura-logo.svg'

  if(!isWhiteLabeledAgency){
    if(type==="subaccount"){
      sideBarLogo = user?.Agency.SubAccount.find((subaccount) => subaccount.id === id)?.subAccountLogo || user.Agency.agencyLogo
    }
  }

  const sidebarOpt = type === "agency"?user.Agency.SidebarOption || [] : user.Agency.SubAccount.find((subaccount) => subaccount.id === id)?.SidebarOption || []

  const subaccounts = user.Agency.SubAccount.filter((subaccount)=>user.Permissions.find(permission=>permission.subAccountId === subaccount.id && permission.access))
  return (
  <>
      <MenuOptions
        details={details}
        defaultOpen={true}
        id={id}
        sidebarLogo={sideBarLogo}
        sidebarOpt={sidebarOpt}
        subAccounts={subaccounts}
        user={user}
      />
      <MenuOptions
        details={details}
        id={id}
        sidebarLogo={sideBarLogo}
        sidebarOpt={sidebarOpt}
        subAccounts={subaccounts}
        user={user}
      />
    </>
  )
}

export default Sidebar
