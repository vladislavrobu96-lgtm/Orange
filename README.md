# Transport Messages / Orange

Standalone browser app with an iMessage-inspired interface, local message history, light/dark themes, neutral contact avatars and PWA offline support.

## Access

On first launch, the app picks and saves one random request number from 01 to 20. The owner enters the corresponding five-character key from their separate private table. Only the key for the selected number is accepted; letter case is ignored. Successful activation persists in this browser on this device. Updating the app keeps activation. Other browsers, private browsing sessions and clearing site data may require activation again.

The app contains SHA-256 key hashes. The plaintext owner table is delivered separately and must never be uploaded to the website. Keys can be reused for matching request numbers on different devices. There is no server, expiry, global revocation, one-device binding or usage tracking. Local activation can be bypassed by someone who edits the client or browser storage.

Existing browsers using an older release must activate once after this update. Their message histories are retained. Administrator PIN access does not activate normal use. The administrator view displays the activation status and retains PIN settings; it no longer offers unrelated key generation.

## Publish

Follow UPDATE.md. Upload the contents of this folder, including assets, to the root of the existing Orange repository. The owner-key file is not part of this folder or the website archive.

## Messages

Chats 7000 and 7001 accept four-digit codes and retain their local two-message response behavior. Generated nine-digit numbers begin with the four submitted digits, including leading zeroes. Messages are generated locally; there is no connection to a transport operator or live payment/ticket system, and these messages are not proof of fare payment.

## Files

- index.html — interface
- app.js — conversations, local activation and settings
- styles.css — responsive light/dark styling
- manifest.webmanifest and sw.js — PWA/offline support
- assets/ — icon sizes and SVG contact avatar
- UPDATE.md — Russian installation instructions
