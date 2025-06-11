
export function broadcastUpdate(clientsSet, documentType, operation) {
  if (!clientsSet || !(clientsSet instanceof Set)) {
    console.error('broadcastUpdate: clientsSet is not a valid Set.');
    return;
  }

  const message = JSON.stringify({
    type: 'sanity-update',
    documentType: documentType,
    operation: operation,
    timestamp: Date.now()
  });

  // Iterate over all connected client controllers and enqueue the message.
  clientsSet.forEach(controller => {
    try {
      // Each message must end with two newlines for SSE spec.
      controller.enqueue(new TextEncoder().encode(`data: ${message}\n\n`));
      console.log(`Broadcasted update for ${documentType} to a client.`);
    } catch (error) {
      console.error('Error broadcasting to client, removing from list:', error);
      clientsSet.delete(controller); // Remove client if there's an error sending data
    }
  });
}

// NOTE: For this `broadcastUpdate` function to work, you need to export the `clients`
// Set from `app/api/sanity-updates-stream/route.js` and import it here, or
// have a mechanism to pass the `clients` Set when calling `broadcastUpdate`.
// I will provide an example of how to modify `sanity-updates-stream/route.js`
// to export the `clients` Set and then how to use it in `sanity-webhook/route.js`.
