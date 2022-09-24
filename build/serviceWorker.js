this.addEventListener('activate', event => {
  console.log('Service worker has been activated');
});

this.addEventListener('push', async event => {
  const message = await event.data.json();
  const { title, description, image } = message;
  console.log({ message });
  console.log({ event })
  await event.waitUntil(
    this.registration.showNotification(title, {
      body: description,
      icon: image,
    })
  );
});