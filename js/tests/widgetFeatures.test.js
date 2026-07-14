const assert = require('assert');
const { normalizeNotificationVolume, getTimerNotificationConfig } = require('../core/timers.js');
const { getSpotifyEmbedUrl } = require('../widgets/widget-content.js');

console.log('Running widget feature tests...');
assert.strictEqual(normalizeNotificationVolume('85', 0.7), 0.85);
assert.strictEqual(normalizeNotificationVolume('0', 0.7), 0);
assert.deepStrictEqual(getTimerNotificationConfig({ notificationSound: 'bell', notificationVolume: '0.4' }), {
  sound: 'bell',
  volume: 0.4
});
assert.strictEqual(getSpotifyEmbedUrl('https://open.spotify.com/playlist/abc123'), 'https://open.spotify.com/embed/playlist/abc123');
assert.strictEqual(getSpotifyEmbedUrl('https://open.spotify.com/track/xyz789'), 'https://open.spotify.com/embed/track/xyz789');
assert.strictEqual(getSpotifyEmbedUrl('https://example.com/not-a-spotify-link'), '');
console.log('All widget feature tests passed.');
