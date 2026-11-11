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

## 3. Firebase: main database + Precious Wrapped login (about 10 min)
1. Go to [console.firebase.google.com](https://console.firebase.google.com), **Add project** (e.g. `curo-precious`), turn off Google Analytics, and click Create.
2. **Build → Firestore Database → Create database**: *Production mode*, pick a region (e.g. `eur3` or `nam5`), then Enable.
3. In Firestore, open the **Rules** tab, replace everything with the contents of `firestore.rules`, and click **Publish**.
4. **Build → Authentication → Get started → Email/Password → Enable → Save**.
5. Authentication → **Users → Add user**: email `precious@curo.events`, password = **her secret passcode** (at least 6 characters).
   If you use a different email, change it in both `config.js` (`ownerEmail`) and `firestore.rules`.
6. ⚙️ **Project settings → General → Your apps → Web (`</>`)**: register an app (no hosting), then copy `apiKey`, `authDomain`, `projectId` and `appId` into `config.js` → `firebase: { ... }`.
7. Set `giftFrom` in `config.js` to the name you want on her birthday slide.
8. Push to GitHub. Vercel redeploys on its own.

Precious opens **precious.curo.events/wrapped** and types the passcode.
- **Sync backup** on her board imports any answers that are only in the Sheet (for example, ones sent before Firebase was connected). It asks once for the Sheet's `REVEAL_KEY`.
- Before Firebase is set up, `/wrapped` runs in **demo mode** with sample answers (passcode `demo`).

## 4. Check
- Open the live link, submit one test review, and check that the row appears in the **Responses** tab.
- Paste the link into WhatsApp to see the preview image.

## New client later
Copy the folder, edit `config.js` (name, pronouns, photos, questions), swap the images, deploy, and add the subdomain.
