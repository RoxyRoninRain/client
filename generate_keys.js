
const webpush = require('web-push');
const vapidKeys = webpush.generateVAPIDKeys();

console.log("MARKER_START");
console.log(vapidKeys.publicKey);
console.log(vapidKeys.privateKey);
console.log("MARKER_END");
