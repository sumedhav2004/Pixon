import Navigation from '@/components/site/navigation'
import { ClerkProvider } from '@clerk/nextjs'
import React from 'react'
import { dark } from '@clerk/themes'

const layout = ({children}:{children : React.ReactNode}) => {
  return (
    <ClerkProvider appearance={{baseTheme:dark}}>
      <main className='h-full flex flex-col'>
          <Navigation />
          {children}
        </main>
    </ClerkProvider>
  )
}

export default layout
