"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { v4 } from "uuid";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useRouter } from "next/navigation";

import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

import FileUpload from "../global/file-upload";
import { Agency, SubAccount } from "@prisma/client";

import { saveActivityLogsNotification, upsertSubAccount } from "@/lib/queries";
import { useEffect } from "react";
import { useModal } from "@/providers/modal-provider";
import Loading from "../global/loading";
import { toast } from "sonner";

const formSchema = z.object({
  name: z.string(),
  companyEmail: z.string(),
  companyPhone: z.string().min(1),
  address: z.string(),
  city: z.string(),
  subAccountLogo: z.string(),
  zipCode: z.string(),
  state: z.string(),
  country: z.string(),
});

interface SubAccountDetailsProps {
  agencyDetails: Agency;
  details?: Partial<SubAccount>;
  userId: string;
  userName: string;
}

const SubAccountDetails: React.FC<SubAccountDetailsProps> = ({
  details,
  agencyDetails,
  userId,
  userName,
}) => {
  const { setClose } = useModal();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: details?.name ?? '',
      companyEmail: details?.companyEmail ?? '',
      companyPhone: details?.companyPhone ?? '',
      address: details?.address ?? '',
      city: details?.city ?? '',
      zipCode: details?.zipCode ?? '',
      state: details?.state ?? '',
      country: details?.country ?? '',
      subAccountLogo: details?.subAccountLogo ?? '',
    },
  });

  // Log details to verify its value and check if it changes unexpectedly
  useEffect(() => {
    console.log("SubAccountDetails - details:", details);  // Log details to track its state
  }, [details]);

  useEffect(() => {
    if (details) {
      form.reset({
        name: details?.name ?? '',
        companyEmail: details?.companyEmail ?? '',
        companyPhone: details?.companyPhone ?? '',
        address: details?.address ?? '',
        city: details?.city ?? '',
        zipCode: details?.zipCode ?? '',
        state: details?.state ?? '',
        country: details?.country ?? '',
        subAccountLogo: details?.subAccountLogo ?? '',
      });
    }
  }, [details, form]);

  // Enhanced safeguard for details and id in onSubmit
  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const isEditing = !!details?.id;
      const subAccountId = isEditing ? details.id! : v4();
  
      const payload: any = {
        ...values,
        name: values.name,
        companyEmail: values.companyEmail,
        companyPhone: values.companyPhone,
        address: values.address,
        city: values.city,
        state: values.state,
        zipCode: values.zipCode,
        country: values.country,
        subAccountLogo: values.subAccountLogo,
        createdAt: new Date(),
        updatedAt: new Date(),
        agencyId: agencyDetails.id,
        connectAccountId: "",
        goal: 5000,
      };
  
      if (!isEditing) {
        payload.id = subAccountId;
      }
  
      const sub = await upsertSubAccount(payload);
  
      await saveActivityLogsNotification({
        agencyId: agencyDetails.id,
        subaccountId: sub?.id,
        description: `${userName} | ${isEditing ? 'updated' : 'created'} sub account | ${values.name}`,
      });
  
      toast("Subaccount details saved");
      setClose();
      router.refresh();
    } catch (error) {
      console.error("Error in onSubmit:", error);
    }
  }
  
   
   

  const isLoading = form.formState.isSubmitting;
  //CHALLENGE Create this form.
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Sub Account Information</CardTitle>
        <CardDescription>Please enter business details</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              disabled={isLoading}
              control={form.control}
              name="subAccountLogo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Account Logo</FormLabel>
                  <FormControl>
                    <FileUpload
                      apiEndpoint="subaccountLogo"
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex md:flex-row gap-4">
              <FormField
                disabled={isLoading}
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Account Name</FormLabel>
                    <FormControl>
                      <Input
                        required
                        placeholder="Your account name"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                disabled={isLoading}
                control={form.control}
                name="companyEmail"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Acount Email</FormLabel>
                    <FormControl>
                      <Input placeholder="Email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex md:flex-row gap-4">
              <FormField
                disabled={isLoading}
                control={form.control}
                name="companyPhone"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Acount Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="Phone" required {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              disabled={isLoading}
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Input required placeholder="123 st..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex md:flex-row gap-4">
              <FormField
                disabled={isLoading}
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input required placeholder="City" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                disabled={isLoading}
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>State</FormLabel>
                    <FormControl>
                      <Input required placeholder="State" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                disabled={isLoading}
                control={form.control}
                name="zipCode"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Zipcpde</FormLabel>
                    <FormControl>
                      <Input required placeholder="Zipcode" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              disabled={isLoading}
              control={form.control}
              name="country"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>Country</FormLabel>
                  <FormControl>
                    <Input required placeholder="Country" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isLoading}>
              {isLoading ? <Loading /> : "Save Account Information"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default SubAccountDetails;