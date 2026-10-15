# Transport Messages

Transport Messages is a standalone web app with an iMessage-inspired interface.

## Publish on GitHub Pages
1. Create a GitHub repository named `transport-messages`.
2. Upload the files in this folder directly into the repository root.
3. Open **Settings → Pages**.
4. Select **Deploy from a branch**, branch `main`, folder `/(root)`, then save.
5. Open the URL shown in the Pages section.

## Included
- Responsive desktop and mobile layout.
- Chats: 7000, 7001, Mom, Dad, Nastya, Friends.
- Sending messages, chat search, clearing history, and new-chat shortcuts.
- Light/dark themes, message size, compact layout, timestamp visibility, and Enter-to-send settings.
- Editable profile display name.
- Local access-key manager and administrator panel.
- PWA manifest and service worker for app-shell caching and home-screen installation support.

## Important behavior
This version is intentionally standalone. It does not connect to an outside messaging service, transport provider, or remote account database. Messages, profile settings, access keys, and administrator settings are saved in the current browser on the current device. They do not automatically sync to other devices or users.

The 7000 and 7001 chats accept four-digit codes. For a four-digit code, each chat sends two separate Romanian-language messages: first `Solicitarea este in curs de procesare.`, then an electronic-ticket message with a random nine-digit ticket number, the local date and time when the code was sent, `Valabil 1 ora`, `Pret 7 MDL`, and the submitted code as `Numar de bord`. This is a locally generated in-app ticket and is not connected to a transport operator or a live ticketing system.

The access-key and administrator features are local app functionality, not server-enforced security. The default administrator PIN is `2468`; change it in the administrator settings. The starter access key is `TM-START-2026`. Since both are part of a standalone browser app, they are not suitable for protecting sensitive information or controlling access across multiple customers/devices.

## Files
- `index.html` — app structure
- `styles.css` — responsive styling and themes
- `app.js` — chat, settings, profile, and local access management
- `manifest.webmanifest` — PWA metadata
- `sw.js` — offline shell cache
- `icon.svg` — app icon
