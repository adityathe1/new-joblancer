# JobLancer

Freelance marketplace (client gives work, freelancer takes work) with real login, database, escrow flow, skill exams, memberships and an admin panel.

- Backend: Node.js 22, no npm packages needed (nothing to install).
- Database: SQLite file (daily backup copies are kept in `data/backups`).
- Frontend: plain HTML, CSS, JS in `public/`.

## 1. Run on your computer

1. Install Node.js 22 or newer from nodejs.org.
2. Open a terminal in this folder and run:

```
SEED_DEMO=1 node server.js
```

3. Open http://localhost:3000
4. Demo logins (password `Demo@1234`): `client@demo.test`, `freelancer@demo.test`.
   To create an admin, start with `ADMIN_EMAIL=me@x.com ADMIN_PASSWORD=Strong#123 node server.js`.

Run the automatic tests with `npm test`.

## 2. Put it live (Render, test deployment)

1. Create a free account on github.com and a new empty repository. Upload all files of this folder to it.
2. Create an account on render.com. Click New > Blueprint, pick your repository. Render reads `render.yaml`.
3. Enter `ADMIN_EMAIL` and `ADMIN_PASSWORD` when asked, then deploy.
4. When it is ready, open the link Render gives you. Log in with the admin email and password. You get the Admin tab.

Notes:
- The database lives on a disk, so a paid Render plan is needed. On the free plan the data is erased at every restart. Check the current price on Render's pricing page.
- This first deployment is a **test deployment**: payments are simulated and OTP codes are shown on screen. Do not collect real money or real users on it.

## 3. Before real users and real money

Do these in order. The site refuses to start in production with unsafe settings.

| Step | What to do | Settings |
|---|---|---|
| 1 | Razorpay account with business KYC. Copy live Key ID and Key Secret. | `PAYMENTS=razorpay`, `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` |
| 2 | Email OTP: Resend account, verify your domain. | `EMAIL_PROVIDER=resend`, `RESEND_API_KEY`, `MAIL_FROM` |
| 3 | SMS OTP: MSG91 account. Indian SMS needs DLT registration and an approved OTP template. | `SMS_PROVIDER=msg91`, `MSG91_AUTHKEY`, `MSG91_TEMPLATE_ID` |
| 4 | Remove the test settings. | delete `ALLOW_MOCK_PAYMENTS` and `DEV_OTP` |
| 5 | Custom domain in Render > Settings > Custom Domains. | |
| 6 | Add Terms, Privacy Policy and Refund Policy pages (Razorpay asks for them). | |
| 7 | Talk to a CA or lawyer about holding client money in escrow, GST on your commission and TDS rules for platforms. | |

Money flow in this version: the client pays into your Razorpay account. When the work is approved the admin panel shows a payout. You pay the freelancer's UPI yourself and enter the UTR in **Admin > Payouts**. Refunds after disputes work the same way. Automatic payouts need Razorpay Route or RazorpayX, which is the next upgrade.

## 4. Daily admin work (Admin tab)

- **PAN review:** check the PAN and name on the Income Tax e-filing portal (Verify your PAN), then Approve or Reject. Set `PAN_AUTO_APPROVE=1` only for testing.
- **Payouts:** pay the amount to the UPI shown, then enter the UTR and press Mark paid.
- **Disputes:** read the messages, then Pay freelancer or Refund client with a note.
- **Users:** suspend a user and they are logged out at once.
- **Activity:** log of logins, payments, approvals and admin actions.

## 5. What is protected

- Passwords hashed with scrypt. Login locks for 15 minutes after 8 wrong tries. Rate limits on login, OTP, bids and payments.
- OTP for mobile and email (10 minute expiry, 5 tries). PAN stored encrypted, one PAN per account.
- Skill exam is graded on the server. Answers never reach the browser. Time limit, tab-switch limit, 24 hour retake wait.
- Jobs, bids and messages are scanned for phone numbers, emails, chat apps, outside payments, fees and investment scams. Links open only after escrow is funded.
- New clients are capped at ₹25,000 per job and 5 jobs a day until the first project completes.
- Payment signatures are verified on the server. Security headers, strict content policy, cross-site request blocking.

## 6. Settings reference

See `.env.example`. Important ones: `APP_SECRET` (random, 32+ characters, never change it after launch or PAN data and sessions break), `DB_PATH`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `PAYMENTS`, `EMAIL_PROVIDER`, `SMS_PROVIDER`, `TRUSTED_PROXY_HOPS` (default 1).

## 7. Known limits

- The Razorpay, Resend and MSG91 connections follow their public API documents but were not tested against live accounts. Test each with small amounts first.
- One server with one SQLite database is fine for early traffic. Move to PostgreSQL when you grow.
- No file upload yet. Delivery notes can carry a link after escrow is funded.
- The exam has 8 questions per category in a bank of 8 plus 8 general ones. Add more questions in `lib/catalog.js` to make cheating harder.
- No reviews or ratings, no automatic membership renewal (a plan lasts 30 days from purchase).
