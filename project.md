Scheduler → GitHub Module → Service Layer → Notifier → Telegram

automation-hub/
│
├── src/
│
│   ├── modules/
│   │   └── github/
│   │       ├── github.controller.js   # handles commands (later)
│   │       ├── github.service.js      # core logic (API + processing)
│   │       ├── github.scheduler.js    # scheduled jobs
│   │       └── github.types.js        # optional (interfaces/types)
│   │
│   ├── notifier/
│   │   └── telegram.service.js        # send messages
│   │
│   ├── scheduler/
│   │   └── cron.js                   # central scheduler
│   │
│   ├── config/
│   │   └── env.js                    # env loader
│   │
│   ├── utils/
│   │   ├── logger.js
│   │   └── date.js
│   │
│   └── index.js                      # entry point
│
├── data/
│   └── state.json                    # store last activity/streak
│
├── .env
├── package.json
└── README.md



cron schedule format 

|------------------------------- Minute (0-59)
|     |------------------------- Hour (0-23)
|     |     |------------------- Day of the month (1-31)
|     |     |     |------------- Month (1-12; or JAN to DEC)
|     |     |     |     |------- Day of the week (0-6; or SUN to SAT; or 7 for Sunday)
|     |     |     |     |
|     |     |     |     |
*     *     *     *     *