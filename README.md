# Automation Hub

## Features
- GitHub Activity Tracker
- Telegram Notifications
- Daily Streak Tracking
- Multi-user schedule reminders
- Daily job recommendation schedules

## Telegram Commands

```text
/jobs
/schedule_jobs daily 08:00
/schedules
/schedule_pause <id>
/schedule_resume <id>
/schedule_cancel <id>
```

You can also send a natural reminder message like:

```text
remind me daily at 8 am for jobs
```

## Setup

1. Install dependencies
2. Set `DATABASE_URL="file:./dev.db"` in `.env`
3. Run `npm run prisma:migrate -- --name init_schedules`
4. Run `npm run dev`