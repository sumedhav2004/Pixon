"use client"

import { Agency, Plan } from '@prisma/client'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { useForm } from 'react-hook-form'
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod'
import { Form,FormControl,FormField, FormItem, FormLabel } from '../ui/form'
import FileUpload from '../global/file-upload'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { deleteAgency, initUser, upsertAgency } from '@/lib/queries'
import { v4 } from 'uuid';


type Props = {
  data?: Partial<Agency>
}

const FormSchema = z.object({
  name:z.string().min(2,{message: 'Agency name must be atleast 2 chars.'}),
  companyEmail:z.string().min(1),
  companyPhone:z.string().min(1),
  whiteLabel: z.boolean(),
  address: z.string().min(1),
  city: z.string().min(1),
  zipCode: z.string().min(1),
  state: z.string().min(1),
  country: z.string().min(1),
  agencyLogo: z.string().min(1),
})

const AgencyDetails = ({data}: Props) => {
  const router = useRouter()
  const [deletingAgency,setDeletingAgency] = useState(false)
  const form = useForm<z.infer<typeof FormSchema>>({
    mode:"onChange",
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: data?.name,
      companyEmail: data?.companyEmail,
      companyPhone: data?.companyPhone,
      whiteLabel:data?.whiteLabel || false,
      address: data?.address,
      city: data?.city,
      zipCode: data?.zipCode,
      state: data?.state,
      country: data?.country,
      agencyLogo: data?.agencyLogo,
    }
  })
  const isloading = form.formState.isSubmitting;

  useEffect(() =>{
    if(data){
      form.reset(data);
    }
  },[data])

  const handleSubmit = async (values:z.infer<typeof FormSchema>) =>{
    try{
      let newUserData;
      let customerId;

      if(!data?.id){
        const bodyData = {
          email: values.companyEmail,
          name: values.name,
          shipping: {
            address: {
              city: values.city,
              country: values.country,
              line1: values.address,
              postal_code: values.zipCode,
              state: values.zipCode,
            },
            name: values.name,
          },
          address: {
            city: values.city,
            country: values.country,
            line1: values.address,
            postal_code: values.zipCode,
            state: values.zipCode,
          } ,
        }
      }
      //CustId
      newUserData = await initUser({
        role: 'AGENCY_OWNER'
      })
      if(!data?.id){
        await upsertAgency({
					id: data?.id ? data.id : v4(),
					address: values.address,
					agencyLogo: values.agencyLogo,
					city: values.city,
					companyPhone: values.companyPhone,
					country: values.country,
					name: values.name,
					state: values.state,
					whiteLabel: values.whiteLabel,
					zipCode: values.zipCode,
					createdAt: new Date(),
					updatedAt: new Date(),
					companyEmail: values.companyEmail,
					connectAccountId: "",
					goal: 5,
				},{Plan});
        toast("Created Agency")
        return router.refresh()
      }
    }catch(error){
      console.log(error);
      toast("Could not create your agency")
    }
  }

  const handleDeleteAgency = async () => {
    if(!data?.id) return
    setDeletingAgency(true);

    //WIP: discontinue the subscription for the user
    try{
      const response = await deleteAgency(data.id)
      toast(
        'Deleted Agency',
        
      )
      router.refresh();

    }catch(error){
      toast(
        'OOPS! Something went wrong.',
      )
    }
    setDeletingAgency(false);
  }

  return (
    <AlertDialog>
      <Card className='border-none'>
        <CardHeader>
          <CardTitle>Agency Information</CardTitle>
          <CardDescription>
            vhuihuwh hbciuhe8 biuccyeyrh khbiurhe hbigiueh bvcige
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-4'>
              <FormField disabled={isloading} control={form.control} name="agencyLogo" render={({field})=>(
                <FormItem className='flex-1'>
                  <FormLabel>Agency Logo</FormLabel>
                  <FormControl>
                    <FileUpload apiEndpoint='agencyLogo' onChange={field.onChange} value={field.value}
                    />
                      
        
                  </FormControl>
                </FormItem>
              )} />

              <div className='flex md:flex-row gap-4'>
                  {/* Agency Name */}
                  <FormField disabled={isloading}
                    name="name"
                    render={({field})=>(
                      <FormItem className='flex-1'>
                        <FormLabel>Agency Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Your Agency Name" {...field} />
                        </FormControl>
                      </FormItem>
                    )} 
                  />

                  {/* Agency Email */}
                  <FormField disabled={isloading}
                    name="companyEmail"
                    render={({field})=>(
                      <FormItem className='flex-1'>
                        <FormLabel>Agency Email</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter Agency Email" {...field} />
                        </FormControl>
                      </FormItem>
                    )} 
                  />
                </div>

                <div className='flex md:flex-row gap-4'>
                  {/* Agency Phone Number */}
                  <FormField disabled={isloading}
                    name="companyPhone"
                    render={({field})=>(
                      <FormItem className='flex-1'>
                        <FormLabel>Agency Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter Phone Number" {...field} />
                        </FormControl>
                      </FormItem>
                    )} 
                  />

                  {/* Agency Address */}
                  <FormField disabled={isloading}
                    name="address"
                    render={({field})=>(
                      <FormItem className='flex-1'>
                        <FormLabel>Agency Address</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter Address" {...field} />
                        </FormControl>
                      </FormItem>
                    )} 
                  />
                </div>

                <div className='flex md:flex-row gap-4'>
                  {/* City */}
                  <FormField disabled={isloading}
                    name="city"
                    render={({field})=>(
                      <FormItem className='flex-1'>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter City" {...field} />
                        </FormControl>
                      </FormItem>
                    )} 
                  />

                  {/* State */}
                  <FormField disabled={isloading}
                    name="state"
                    render={({field})=>(
                      <FormItem className='flex-1'>
                        <FormLabel>State</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter State" {...field} />
                        </FormControl>
                      </FormItem>
                    )} 
                  />

                  {/* Zipcode */}
                  <FormField disabled={isloading}
                    name="zipCode"
                    render={({field})=>(
                      <FormItem className='flex-1'>
                        <FormLabel>Zipcode</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter Zipcode" {...field} />
                        </FormControl>
                      </FormItem>
                    )} 
                  />
              </div>
              <Button
                type="submit"
                disabled={isloading}
              >
                Save Agency Information
              </Button>
            </form>
          </Form>

          { data?.id &&
            <div className='flex flex-row items-center justify-center border border-destructive rounded-lg gap-4 p-4 mt-4'>
              <div>
                <div>Danger Zone</div>
              </div>
              <div className='text-muted-foreground'>
                  Deleting your agency cannot be undone.This will also delete all sub accounts and all data related to your subaccounts.
                  Sub Accounts will no longer have access to funnels,contacts etc.
              </div>
              <AlertDialogTrigger
            disabled={isloading || deletingAgency}
            className='text-red-600 p-2 text-center mt-2 rounded-md hover:bg-red-600 hover:text-white  whitespace-nowrap'
          >
            {deletingAgency ? 'Deleting' : 'Delete Agency'}
          </AlertDialogTrigger>
            </div>  }

            <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="text-left">Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription className="text-left">
                This action cannot be undone. This will permanently delete the Agency account and
                all related sub accounts.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <AlertDialogFooter className="flex items-center">
              <AlertDialogCancel className="mb-2">Cancel</AlertDialogCancel>
              <AlertDialogAction
                disabled={deletingAgency}
                className="bg-destructive"
                onClick={handleDeleteAgency}
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </CardContent>
      </Card>
    </AlertDialog>

  )
}

export default AgencyDetails
