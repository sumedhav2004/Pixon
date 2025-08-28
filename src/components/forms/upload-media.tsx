'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import React from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Card, CardContent, CardDescription, CardTitle } from '../ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel } from '../ui/form'
import { createMedia, saveActivityLogsNotification } from '@/lib/queries'
import { toast } from 'sonner'
import { Input } from '../ui/input'
import FileUpload from '../global/file-upload'
import { Button } from '../ui/button'

type Props = {
  subaccountId: string
}

const formSchema = z.object({
  link: z.string().min(1, {message: 'Media File is required'}),
  name: z.string().min(1, {message: 'Name is required'})
})

const UploadMediaForm = ({subaccountId}:Props) => {
  const router = useRouter()
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: 'onSubmit',
    defaultValues: {
      link: '',
      name: '',
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>){
    try{
      const response  = await createMedia(subaccountId, values)
      await saveActivityLogsNotification({
        agencyId: undefined,
        description: `Uploaded a media file | ${response.name}`,
        subaccountId,
      })
      toast('Uploaded Media')
    }catch(error){}
  }

  return (
    <Card className='w-full border-none'>
      <CardTitle>Media Information</CardTitle>
      <CardDescription>
        Please enter the details for your file
      </CardDescription>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>File Name</FormLabel>
                <FormControl>
                  <Input placeholder="Your agency name" {...field} />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="link"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Media File</FormLabel>
                <FormControl>
                  <FileUpload
                    apiEndpoint='subaccountLogo'
                    value={field.value}
                    onChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className='mt-4'
          >
            Upload Media
          </Button>
          </form>

        </Form>
      </CardContent>
    </Card>
  )
}

export default UploadMediaForm
