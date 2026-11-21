# Putting Code Timer on the App Store from your Mac

About 2 hours the first time, mostly waiting on downloads. You need: your Mac, your iPhone and cable, and your Apple developer login.

## 1. One-time installs (about 1 hour)
1. **Xcode**: open the Mac App Store, search "Xcode", install. It's big (about 15 GB). Open it once and let it install its extra components.
2. **Node.js**: go to nodejs.org, download the **LTS** version, double-click to install.

## 2. Get the project (5 min)
Open **Terminal** (Spotlight: ⌘-Space, type "Terminal") and paste these lines one at a time:
```
cd ~/Desktop
git clone https://github.com/richx2b/Claude.git
cd Claude/native
npm install
npx cap sync ios
npx cap open ios
```
The last line opens the project in Xcode. If macOS asks to install "command line developer tools", click Install, then run the line again.

## 3. Sign it with your account (5 min)
1. In Xcode's left column, click the blue **App** icon at the very top.
2. In the middle, under **Targets**, click **App**, then the **Signing & Capabilities** tab.
3. Check **Automatically manage signing**.
4. **Team**: pick your name. If it isn't there: Xcode menu → Settings → Accounts → **+** → Apple ID, sign in, then come back.
5. **Bundle Identifier** is `com.richx2b.codetimer`. If Xcode shows a red error saying it's taken, change it to something like `com.yourlastname.codetimer`. Use the same one in step 5 below.

## 4. Try it on your iPhone first (10 min)
1. Plug in your iPhone. On the phone: Settings → Privacy & Security → **Developer Mode** → On (it restarts).
2. At the top of Xcode, click the device name and pick your iPhone.
3. Press the **▶** button. The app installs and opens.
4. Check these, because they only work in the real app:
   - [ ] Silent switch ON, start a code: the alarm still sounds at 1:45 and 2:00
   - [ ] The phone buzzes on alarms
   - [ ] The screen doesn't dim during a code
   - [ ] The disclaimer shows on first open
   Tell me anything that doesn't work before submitting.

## 5. Create the app listing (20 min)
1. Go to **appstoreconnect.apple.com** → Apps → **+** → New App.
2. Platform iOS · Name, SKU, Bundle ID from `listing.md` · User Access: Full Access.
3. Fill in everything using `docs/app-store/listing.md` (copy and paste).
4. **Screenshots**: drag the 7 images from `docs/app-store/screenshots/` into the **iPhone 6.9"** box.

## 6. Upload the app (15 min plus waiting)
1. In Xcode, set the device at the top to **Any iOS Device (arm64)**.
2. Menu **Product → Archive**. Wait for the Organizer window.
3. Click **Distribute App → App Store Connect → Distribute**.
4. Wait for Apple's "build has completed processing" email (15–60 min).

## 7. Use it right away with TestFlight (even if review says no)
In App Store Connect → your app → **TestFlight** → Internal Testing → add yourself (and up to 100 people on your team). Install the **TestFlight** app on your phone and the build shows up there. Internal testing doesn't need Apple's review. Builds expire after 90 days, so you upload a new one before then.

## 8. Submit for review
1. App Store Connect → your app → the **1.0** version page → **Build** → pick the one you uploaded.
2. Paste the reviewer notes from `listing.md`.
3. **Add for Review → Submit**.
Review usually takes 1–3 days. You'll get an email either way. If it's rejected, send me the message and we'll fix whatever they flag and resubmit.

## Updating later
After I change the app: in Terminal, `cd ~/Desktop/Claude && git pull && cd native && npx cap sync ios`, then in Xcode raise the **Build** number (Targets → App → General), Archive and upload again.
