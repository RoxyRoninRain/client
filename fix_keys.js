
const webpush = require('web-push');
const fs = require('fs');
const path = require('path');

const vapidKeys = webpush.generateVAPIDKeys();
const publicKey = vapidKeys.publicKey;
const privateKey = vapidKeys.privateKey;

console.log("Generated Public Key length:", publicKey.length);

// Save Private Key to file for user instruction
fs.writeFileSync('private_key_to_upload.txt', privateKey);

// Update Hook File
const hookPath = path.join(__dirname, 'hooks', 'usePushSubscription.ts');
let content = fs.readFileSync(hookPath, 'utf8');

// Regex to replace the const definition
// Matches: const VAPID_PUBLIC_KEY = "stuff";
const regex = /const VAPID_PUBLIC_KEY = "[^"]+";/;
const newContent = content.replace(regex, `const VAPID_PUBLIC_KEY = "${publicKey}";`);

if (content === newContent) {
    console.error("Could not find VAPID_PUBLIC_KEY pattern to replace!");
} else {
    fs.writeFileSync(hookPath, newContent);
    console.log("Successfully updated usePushSubscription.ts with new Public Key.");
}
