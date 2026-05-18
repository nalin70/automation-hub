# Automation Hub

## Features
- GitHub Activity Tracker
- Telegram Notifications
- Daily Streak Tracking
- Multi-user schedule reminders
- Daily job recommendation schedules
- Per-user job history and saved job search preferences

## Commands

### Telegram Bot Commands

```text
/start
```
Shows the available bot commands.

```text
/check-now
```
Runs the GitHub activity check immediately.

```text
/status
```
Shows today's GitHub activity status and current streak.

```text
/jobs
```
Shows quick choices for domain, city, and experience, saves those preferences for the current Telegram user, then fetches matching jobs.

```text
hello
hi
```
Shows all available options divided into General, GitHub Activity, Jobs, and Schedules categories, plus quick action buttons to find jobs or view GitHub status. The jobs action asks for domain, city, and experience before fetching results.

```text
/schedule_jobs daily 08:00
```
Creates a daily job recommendation schedule for the current Telegram user. If the user has completed `/jobs`, the schedule uses their saved job preferences.

```text
/schedules
/reminders
```
Lists schedules owned by the current Telegram user.

```text
/schedule_pause <id>
```
Pauses a schedule. You can use the short ID shown by `/schedules`.

```text
/schedule_resume <id>
```
Resumes a paused schedule.

```text
/schedule_cancel <id>
```
Deletes a schedule.

You can also create a jobs reminder with natural text:

```text
remind me daily at 8 am for jobs
```

### Local Development Commands

```powershell
npm install
```
Installs project dependencies.

```powershell
npm run dev
```
Starts the app with nodemon.

```powershell
npm start
```
Starts the app with Node.

```powershell
$env:TELEGRAM_POLLING='false'; npm run dev
```
Starts the app locally without Telegram polling. Useful when offline or when `api.telegram.org` is unreachable.

### Database Commands

```powershell
npm run prisma:generate
```
Generates the Prisma Client.

```powershell
npm run prisma:migrate -- --name init_schedules
```
Creates/applies a Prisma migration during development.

```powershell
npx prisma db push
```
Pushes the current Prisma schema to the local SQLite database without creating a migration.

```powershell
npx prisma studio
```
Opens Prisma Studio so you can view and edit data in the browser.

```powershell
npx prisma migrate status
```
Shows whether local migrations and the database are in sync.

## Setup

1. Install dependencies
2. Set `DATABASE_URL="file:./dev.db"` in `.env`
3. Run `npm run prisma:migrate -- --name init_schedules`
4. Run `npm run dev`