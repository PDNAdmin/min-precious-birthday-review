# Going live: precious.curo.events

## 1. Google Sheet (about 10 min)
1. Create a new Google Sheet called **Precious Reviews**.
2. **Extensions → Apps Script**. Delete what's there and paste in `apps-script/Code.gs`.
3. At the top, set `NOTIFY_EMAIL` (comma-separate several emails) and change `REVEAL_KEY` to a random word.
4. Pick `testSetup` in the function dropdown, click **Run**, and approve the permissions. A test row and an email should appear.
5. **Deploy → New deployment → Web app**. Execute as: *Me*. Who has access: *Anyone*. Click **Deploy** and copy the URL that ends in `/exec`.
6. Paste that URL into `config.js` → `endpoint: "..."`.

> If you edit Code.gs later: Deploy → Manage deployments → ✏️ → Version: *New version*. That keeps the same URL.

## 2. Vercel
1. `npx vercel` in this folder (or drag the folder into vercel.com → Add New → Project). No framework, no build command.
2. Project → Settings → Domains → add `precious.curo.events`.
3. At the curo.events DNS provider, add **CNAME** `precious` → `cname.vercel-dns.com`.

## 3. Check
- Open the live link, submit one test review, and check that the row appears in the **Responses** tab.
- Paste the link into WhatsApp to see the preview image.

## New client later
Copy the folder, edit `config.js` (name, pronouns, photos, questions), swap the images, deploy, and add the subdomain.
