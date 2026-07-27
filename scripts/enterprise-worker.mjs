const intervalMilliseconds = 30_000;

console.log(
  'Enterprise worker is running. Persistent document jobs remain manual until a queue adapter is configured.',
);

setInterval(() => {
  console.log('Enterprise worker heartbeat');
}, intervalMilliseconds);
