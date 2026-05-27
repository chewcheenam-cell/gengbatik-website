# GengBatik Vercel Internal Records Setup

This website can save enquiries to an internal records page after it is deployed on Vercel.

## What it does

- Customer fills the order form.
- Website saves the enquiry to the Vercel API.
- Website opens WhatsApp so the customer can still send the message.
- You open `/records.html` to view enquiries.

## Required Vercel environment variables

Set these in your Vercel project:

- `ADMIN_PASSWORD`: the password you want for `/records.html`
- `KV_REST_API_URL`: from Upstash Redis on the Vercel Marketplace
- `KV_REST_API_TOKEN`: from Upstash Redis on the Vercel Marketplace

Vercel functions cannot save records permanently without online storage, so Upstash Redis storage is required.

## Internal records page

After deployment, open:

`https://your-vercel-domain.vercel.app/records.html`

Enter your `ADMIN_PASSWORD` to see enquiries.
