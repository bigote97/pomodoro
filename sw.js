self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    
    // Postear mensaje al cliente
    clients.matchAll().then(clients => {
        clients.forEach(client => {
            client.postMessage({
                type: 'notificationClick',
                action: event.action
            });
        });
    });
}); 