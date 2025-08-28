import { Contact, Lane, Notification, Prisma, Role, Tag, Ticket, User } from "@prisma/client";
import {
  _getTicketsWithAllRelations,
  getAuthUserDetails,
  getFunnels,
  getMedia,
  getPipelineDetails,
  getTicketsWithTags,
  getUserPermissions,
} from "./queries";
import { db } from "./db";
import { z } from "zod";
import Stripe from "stripe";

// ✅ Utility type to extract return type of async functions
type AwaitedReturnType<T extends (...args: any[]) => Promise<any>> =
  T extends (...args: any[]) => Promise<infer R> ? R : never;

// ✅ Type: Notification joined with User data
export type NotificationWithUser =
  | ({
      User: {
        id: string;
        name: string;
        avatarUrl: string;
        email: string;
        createdAt: Date;
        updatedAt: Date;
        role: Role;
        agencyId: string | null;
      };
    } & Notification)[]
  | undefined;

// ✅ Internal utility to fetch users with nested sub-account permissions
const __getUsersWithAgencySubAccountPermissionsSidebarOptions = async (
  agencyId: string
) => {
  return await db.user.findFirst({
    where: { Agency: { id: agencyId } },
    include: {
      Agency: { include: { SubAccount: true } },
      Permissions: { include: { SubAccount: true } },
    },
  });
};

// ✅ Typed aliases using our utility
export type UserWithPermissionsAndSubAccounts = AwaitedReturnType<typeof getUserPermissions>;
export type AuthUserWithAgencySidebarOptionsSubAccounts = AwaitedReturnType<typeof getAuthUserDetails>;
export type UsersWithAgencySubAccountPermissionsSidebarOptions = AwaitedReturnType<
  typeof __getUsersWithAgencySubAccountPermissionsSidebarOptions
>;
export type GetMediaFiles = AwaitedReturnType<typeof getMedia>;
export type TicketWithTags = AwaitedReturnType<typeof getTicketsWithTags>;

// ✅ Prisma Input type
export type CreateMediaType = Prisma.MediaCreateWithoutSubaccountInput;

// ✅ Ticket + related entities
export type TicketAndTags = Ticket & {
  Tags: Tag[];
  Assigned: User | null;
  Customer: Contact | null;
};

// ✅ Lane with nested tickets
export type LaneDetail = Lane & {
  Tickets: TicketAndTags[];
};

// ✅ zod form schemas
export const CreatePipelineFormSchema = z.object({
  name: z.string().min(1),
});

export const CreateFunnelFormSchema = z.object({
  name: z.string().min(1),
  description: z.string(),
  subDomainName: z.string().optional(),
  favicon: z.string().optional(),
});

export const LaneFormSchema = z.object({
  name: z.string().min(1),
});

// ✅ Pipeline details with nested structure
export type PipelineDetailsWithLanesCardsTagsTickets = AwaitedReturnType<typeof getPipelineDetails>;


export type TicketDetails = Prisma.PromiseReturnType<typeof _getTicketsWithAllRelations>

const currencyNumberRegex = /^\d+(\.\d{1,2})?$/

export const TicketFormSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  value: z.string().refine((value) => currencyNumberRegex.test(value), {
    message: 'Value must be a valid price.',
  }),
})

export const ContactUserFormSchema = z.object({
  name: z.string().min(1, 'Required'),
  email: z.string().email(),
})

export type Address = {
  city: string;
  country: string;
  line1: string;
  postal_code: string;
  state: string;
}

export type ShippingInfo = {
  address: Address
  name: string
}

export type StripeCustomerType ={
  email: string
  name: string
  shipping: ShippingInfo
  address: Address
}

export type PriceList = Stripe.ApiList<Stripe.Price>;

export type FunnelsForSubAccount = Prisma.PromiseReturnType<typeof getFunnels>[0]