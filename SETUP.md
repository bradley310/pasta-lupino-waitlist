# Pasta Lupino Waitlist — Setup Guide

## What you'll need
- A free Vercel account (vercel.com)
- A Twilio account (~$5-10/month)
- A GitHub account (free) — just to host the code

Total setup time: about 20 minutes.

---

## Step 1 — Get a Twilio number

1. Go to **twilio.com** → sign up
2. Go to **Phone Numbers → Manage → Buy a Number**
3. Search for a Canadian number (area code 604 or 778)
4. Make sure SMS is enabled → buy it (~$1.15/month)
5. From your Twilio dashboard, copy:
   - **Account SID** (starts with AC...)
   - **Auth Token**
   - **Your Twilio phone number** (in +16041234567 format)

---

## Step 2 — Put the code on GitHub

1. Go to **github.com** → sign up / log in
2. Click **New repository** → name it `pasta-lupino-waitlist` → Create
3. Upload all the files from this folder into the repo

---

## Step 3 — Deploy to Vercel

1. Go to **vercel.com** → sign up with GitHub
2. Click **Add New Project** → import your GitHub repo
3. Click **Deploy** (leave all settings as default)
4. Once deployed, copy your URL (e.g. `pasta-lupino-waitlist.vercel.app`)

---

## Step 4 — Add KV storage (the database)

1. In Vercel, go to your project → **Storage** tab
2. Click **Create Database** → select **KV**
3. Name it anything → Create
4. Click **Connect to Project** → it automatically adds the env vars

---

## Step 5 — Add your environment variables

In Vercel → your project → **Settings** → **Environment Variables**, add:

| Name | Value |
|------|-------|
| TWILIO_ACCOUNT_SID | (from Step 1) |
| TWILIO_AUTH_TOKEN | (from Step 1) |
| TWILIO_PHONE_NUMBER | (e.g. +16041234567) |
| NOTIFY_PHONE | Your phone number e.g. +17781234567 |
| NEXT_PUBLIC_BASE_URL | https://pasta-lupino-waitlist.vercel.app |

Then go to **Deployments** → click the three dots on your latest deploy → **Redeploy**.

---

## Step 6 — Connect Twilio to your app

This is what lets the app receive "C" replies.

1. In Twilio → **Phone Numbers → Manage → Active Numbers** → click your number
2. Under **Messaging** → **A Message Comes In**:
   - Set to **Webhook**
   - URL: `https://pasta-lupino-waitlist.vercel.app/api/twilio-webhook`
   - Method: **HTTP POST**
3. Save

---

## Done! Bookmark the URL on your host stand iPad.

The app works on any WiFi device. No cellular needed.

---

## How it works day-to-day

- **Add guest** → they get a text: *"You're on the waitlist. Reply C to cancel or tap [link]."*
- **Text Ready** → they get a text: *"Your table is ready!"*
- **Guest replies C** → they're removed and you get a text: *"❌ Sarah (party of 2) cancelled."*
- **Guest taps cancel link** → same as above, works for international numbers
- **Seat** → moves them to the seated log (table number stays staff-only)

---

## Questions?
Ask Claude — just paste any error message and it'll help you fix it.
