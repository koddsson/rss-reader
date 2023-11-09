// There's probably a better caching strategy but this seemed the simplest to start with.
//
// From: https://web.dev/articles/offline-cookbook#on-network-response
//
// > If a request doesn't match anything in the cache, get it from the network, send it to the page,
// > and add it to the cache at the same time.
//
// > If you do this for a range of URLs, such as avatars, you'll need to be careful you don't bloat
// > the storage of your origin. If the user needs to reclaim disk space you don't want to be the
// > prime candidate. Make sure you get rid of items in the cache you don't need any more.

self.addEventListener('fetch', function (event) {
  event.respondWith(
    caches.open('rss-reader').then(function (cache) {
      return cache.match(event.request).then(function (response) {
        return (
          response ||
          fetch(event.request).then(function (response) {
            cache.put(event.request, response.clone());
            return response;
          })
        );
      });
    }),
  );
});
