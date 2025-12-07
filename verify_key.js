
const key = "BJWLhJtASm-DC2KaRE-riljlAT8_vRXVDMFSMkLOdK6vF-HodPId5nPM8UNWEgHwTb5ZZB3jqiUPn5XcFFrcxO-w";

function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    // In Node we use Buffer instead of window.atob
    return Buffer.from(base64, 'base64');
}

const decoded = urlBase64ToUint8Array(key);
console.log("Key Length:", decoded.length);
console.log("First Byte:", decoded[0]);
console.log("Second Byte:", decoded[1]);
console.log("Is 65 bytes?", decoded.length === 65);
