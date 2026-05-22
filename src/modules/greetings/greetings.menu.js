const CALLBACK_JOBS = 'greeting:jobs';
const CALLBACK_GITHUB_STATUS = 'greeting:github_status';

function formatOptionsMenu() {
  return `Hi! Here are the options available:

General
/start -> Show this options menu

GitHub Activity
/check-now -> Check activity now
/status -> View today's GitHub status and streak

Jobs
/jobs -> Find matching jobs now
/schedule_jobs daily 08:00 -> Schedule daily job recommendations

Schedules
/schedules -> View your schedules
/reminders -> View your reminders
/schedule_pause <id> -> Pause a schedule
/schedule_resume <id> -> Resume a schedule
/schedule_cancel <id> -> Cancel a schedule
remind me daily at 8 am for jobs -> Create a jobs reminder

Quick actions:`;
}

function buildOptionsKeyboard() {
  return {
    inline_keyboard: [
      [
        { text: 'Find jobs', callback_data: CALLBACK_JOBS },
        { text: 'GitHub status', callback_data: CALLBACK_GITHUB_STATUS },
      ],
    ],
  };
}

module.exports = {
  CALLBACK_GITHUB_STATUS,
  CALLBACK_JOBS,
  buildOptionsKeyboard,
  formatOptionsMenu,
};