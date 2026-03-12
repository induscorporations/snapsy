import { cronJobs } from 'convex/server';
import { internal } from './_generated/api';

const crons = cronJobs();

crons.daily(
  'delete expired photos (retention)',
  { hourUTC: 3, minuteUTC: 0 },
  internal.retention.deleteExpiredPhotos,
  {}
);

crons.daily(
  'create expiration reminders (7 days before)',
  { hourUTC: 4, minuteUTC: 0 },
  internal.retention.createExpirationReminders,
  {}
);

export default crons;
