// public/sw.js (Service Worker)

self.addEventListener('push', function(event) {
  if (event.data) {
    const data = event.data.json();
    
    // Default options
    const options = {
      body: data.body || 'New Notification',
      icon: '/icon.png', // We should ensure this file exists or use a default
      badge: '/badge.png', // Small monochrome icon for the status bar
      vibrate: [100, 50, 100],
      data: {
        url: data.url || '/'
      }
    };

    // Show the notification
    event.waitUntil(
      self.registration.showNotification(data.title || 'Akita Connect', options)
    );
  }
});

self.addEventListener('notificationclick', function(event) {
  // Close the notification
  event.notification.close();

  // Focus or Open the Window
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
        // If a window is already open, focus it
        for (var i = 0; i < clientList.length; i++) {
          var client = clientList[i];
          if (client.url === event.notification.data.url && 'focus' in client) {
            return client.focus();
          }
        }
        // Otherwise open a new one
        if (clients.openWindow) {
          return clients.openWindow(event.notification.data.url);
        }
    })
  );
});
