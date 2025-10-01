import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { EditorBtns } from '@/lib/constants'
import React from 'react'
import TextPlaceholder from './text-placeholder'
import ContainerPlaceholder from './container-placeholder'
import VideoPlaceholder from './video-placeholder'
import TwoColumnsPlaceholder from './two-columns-placeholder'
import LinkPlaceholder from './link-placeholder'
import ContactFormComponent from './contact-form-placeholder'
import ContactFormComponentPlaceholder from './contact-form-placeholder'
import CheckoutPlaceholder from './checkout-placeholder'

type Props = {}

const ComponentsTab = (props: Props) => {
  const elements: {
    component: React.ReactNode
    label: string
    id: EditorBtns
    group: 'layout' | 'elements'
  }[] = [
    {
      component: <TextPlaceholder />,
      label: 'Text',
      id: 'text',
      group: 'elements',
    },
    {
      component: <ContainerPlaceholder />,
      label: 'Container',
      id: 'container',
      group: 'layout'
    },
    {
      component: <VideoPlaceholder />,
      label: 'Video',
      id: 'video',
      group: 'elements',
    },
    {
      component: <TwoColumnsPlaceholder />,
      label: '2 Columns',
      id: '2Col',
      group: 'layout',
    },
    {
      component: <LinkPlaceholder />,
      label: 'Link',
      id: 'link',
      group: 'elements'
    },
    {
      component: <ContactFormComponentPlaceholder />,
      label: 'Contact',
      id: 'contactForm',
      group: 'elements',
    },
    {
      component: <CheckoutPlaceholder />,
      label: 'Checkout',
      id: 'paymentForm',
      group: 'elements',
    },
  ]


  return (
    <Accordion
      type="multiple"
      className='w-full'
      defaultValue={['Layout', 'Elements']}
    >
      <AccordionItem
        value="Layout"
        className='px-6 py-0 border-y-[1px]'
      >
        <AccordionTrigger className='!no-underline'>Layout</AccordionTrigger>
        <AccordionContent className='flex flex-wrap gap-2'>
          {elements.filter((element) => element.group === 'layout').map((element) => (
            <div key={`layout-${element.id}`} className='flex-col items-center justify-center flex'>
              {element.component}
              <span className='text-muted-foreground'>{element.label}</span>
            </div>
          ))}
        </AccordionContent>
      </AccordionItem>
      <AccordionItem
        value="Elements"
        className='px-6 py-0'
      >
        <AccordionTrigger className='!no-underline'>Elements</AccordionTrigger>
        <AccordionContent className='flex flex-wrap gap-2'>
          {
            elements.filter((element) => element.group === 'elements').map((element) => (
              <div key={element.id} className='flex-col items-center justify-center flex'>
                {element.component}
                <span className='text-muted-foreground'>{element.label}</span>
              </div>
            ))
          }
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}

export default ComponentsTab