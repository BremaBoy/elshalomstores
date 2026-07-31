This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Checkout and payments

Checkout API routes are deployed with this Next.js application; a separate
`NEXT_PUBLIC_API_URL` is not required. Before deploying, copy the variables in
`.env.example` into the Vercel project settings. Keep the Supabase service-role
key and the Paystack secret key server-only.

Run `backend/payments_schema.sql` once in the Supabase SQL Editor before enabling
Paystack. Cash on delivery only requires the core orders schema.

After deploying, configure Paystack with:

- Callback URL: `https://elshalomstores.com.ng/checkout/verify?gateway=paystack`
- Webhook URL: `https://elshalomstores.com.ng/api/webhooks/paystack`

The Paystack webhook validates the `x-paystack-signature` header and verifies the
transaction with Paystack before marking an order as paid. The callback and
webhook share idempotent finalization so stock is only reduced once.
