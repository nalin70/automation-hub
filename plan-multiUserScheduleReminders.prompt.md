## Plan: Multi-User Schedule Reminders

Build this as a **generic schedule system**, not only a jobs reminder feature. That gives you `/schedules` now and leaves room for future things like GitHub reminders, custom reminders, digests, etc. I recommend **Prisma + SQLite locally**, designed so you can move to **PostgreSQL** later for real multi-user deployment.

**Steps**

1. Add Prisma database foundation.

   Add `Prisma`, `@prisma/client`, and a `DATABASE_URL`. Use SQLite for local development, but design the schema so PostgreSQL migration is simple later.

2. Create database models.

   Add models for:

   - `User`: Telegram user/chat identity
   - `Schedule`: generic schedule/reminder records
   - optionally `ScheduleRun`: history of executions, success/failure, errors

   Each schedule should store:

   - schedule type, e.g. `jobs`
   - title
   - frequency, e.g. `daily`
   - time, e.g. `08:00`
   - timezone, default `Asia/Kolkata`
   - enabled/disabled status
   - `nextRunAt`
   - `lastRunAt`
   - config JSON, e.g. job query/location/keywords

3. Add Telegram user handling.

   Create a user service that finds or creates a user from Telegram `msg.from` and `msg.chat`.

   This is important because `/schedules` must only show schedules for the current user, not everyone.

4. Add schedule commands.

   Start with explicit commands first:

   ```text
   /schedule_jobs daily 08:00
   /schedules
   /schedule_pause <id>
   /schedule_resume <id>
   /schedule_cancel <id>
   ```

   Later, add natural text like:

   ```text
   remind me daily at 8 am for jobs
   ```

5. Add schedule parser and validation.

   Validate:

   - invalid time like `25:99`
   - missing time
   - unsupported frequency
   - duplicate active job reminders
   - unknown schedule IDs
   - schedules belonging to another user

6. Adapt the jobs pipeline for schedule-specific preferences.

   Right now job settings come from `.env`:

   ```text
   JOBS_QUERY
   JOBS_LOCATION
   JOBS_KEYWORDS
   ```

   Keep these as defaults, but allow a schedule to override them through its `config`.

   Example schedule config:

   ```json
   {
     "query": "Node.js Developer",
     "location": "Bangalore",
     "keywords": ["node", "backend"]
   }
   ```

7. Add one due-schedule runner.

   Instead of creating one cron task per user schedule, run one cron every minute.

   It should:

   - find enabled schedules where `nextRunAt <= now`
   - run the correct handler based on schedule type
   - send the result to that schedule owner’s Telegram chat
   - update `lastRunAt`
   - calculate the next `nextRunAt`
   - record errors if something fails

   This is better for multiple users than keeping many in-memory cron jobs.

8. Wire the new modules into startup.

   Load the schedule controller from [src/index.js](src/index.js), and start the due-schedule runner from [src/scheduler/cron.js](src/scheduler/cron.js).

   Keep the existing GitHub and every-3-hour jobs cron for now. They can be migrated into the generic schedules system later.

**Relevant Files**

- [package.json](package.json) — add Prisma dependencies and scripts
- `.env` — add `DATABASE_URL`; keep secrets here, but not user schedules
- `prisma/schema.prisma` — new Prisma schema
- [src/index.js](src/index.js) — load schedules controller
- [src/scheduler/cron.js](src/scheduler/cron.js) — start the every-minute due schedule runner
- [src/notifier/telegram.service.js](src/notifier/telegram.service.js) — reuse `sendMessage(message, chatId)`
- [src/modules/jobs/jobs.scheduler.js](src/modules/jobs/jobs.scheduler.js) — accept schedule-specific job config
- [src/modules/jobs/jobs.service.js](src/modules/jobs/jobs.service.js) — accept query/location/keywords config
- `src/modules/users/users.service.js` — new Telegram user find-or-create logic
- `src/modules/schedules/schedules.controller.js` — new Telegram commands
- `src/modules/schedules/schedules.service.js` — schedule create/list/update logic
- `src/modules/schedules/schedules.parser.js` — parse commands and simple reminder text
- `src/modules/schedules/schedules.runner.js` — execute due schedules
- `src/modules/schedules/schedules.formatter.js` — format `/schedules` output

**Verification**

1. Run `npm install`.
2. Run `npx prisma generate`.
3. Run `npx prisma migrate dev --name init_schedules`.
4. Start the bot with `npm run dev`.
5. Send `/schedule_jobs daily 08:00` in Telegram.
6. Send `/schedules` and confirm only your schedules appear.
7. Test `/schedule_pause <id>`, `/schedule_resume <id>`, and `/schedule_cancel <id>`.
8. Temporarily set a schedule’s `nextRunAt` to the past and confirm the runner sends jobs to the correct Telegram chat.
9. Add tests later for parser, next-run calculation, and per-user schedule filtering.

**Database Recommendation**

For your current stage, the best path is:

- **Now:** Prisma + SQLite
- **Later production:** Prisma + PostgreSQL

Do not use JSON files for this feature if you already know multiple users and more schedule types are coming. JSON is okay for a prototype, but schedules, users, status, and history belong in a database.
