# Binaire Freznel Assessment

A multi-user CSV processing system built with React, Node.js, Express, Socket.IO, and Node.js Worker Threads.

## Live Demo

Frontend:
https://binaire-freznel-assessment-j1o31hb3g-sameers-projects-a0b6ef52.vercel.app/

Backend:
https://binaire-freznel-assessment-7p5b.onrender.com

## Features

- Upload CSV files containing integers and floating-point numbers
- Select Low or High priority
- Queue multiple files for processing
- High-priority waiting jobs are processed before low-priority waiting jobs
- A job already being processed is not interrupted by a newly uploaded high-priority job
- CSV processing uses Node.js Worker Threads
- Real-time updates using Socket.IO
- All connected clients can see queue and file status changes
- Shows uploaded, waiting, processing, progress, completed, and error states
- Displays the calculated sum of all numeric values in the CSV
- Provides a result download after processing
- Responsive UI with simple animations and status indicators

## Tech Stack

### Frontend

- React
- Vite
- Socket.IO Client
- CSS

### Backend

- Node.js
- Express
- Multer
- Socket.IO
- Worker Threads

## Project Structure

```text
Binaire_Freznel_Assessment/
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── JobCard.jsx
│   │   │   ├── JobList.jsx
│   │   │   └── UploadForm.jsx
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── config.js
│   └── package.json
│
├── server/
│   ├── managers/
│   │   └── JobManager.js
│   ├── models/
│   │   └── Job.js
│   ├── queue/
│   │   └── jobQueue.js
│   ├── workerManager/
│   │   └── WorkerManager.js
│   ├── workers/
│   │   └── csvWorker.js
│   ├── uploads/
│   ├── server.js
│   └── package.json
│
└── README.md
```

## How It Works

1. The client selects a CSV file and priority.
2. The file is uploaded to the Node.js server.
3. The server creates a job and adds it to the priority queue.
4. The new job is broadcast to connected clients through Socket.IO.
5. The queue selects the next available job.
6. A Worker Thread reads the CSV and calculates the sum of numeric values.
7. The worker sends progress updates to the server.
8. The server broadcasts those updates to all connected clients.
9. When processing finishes, the job is marked as completed.
10. The result is displayed and can be downloaded.

## Queue and Priority

The queue uses non-preemptive priority scheduling.

Example:

```text
Low Job A  -> Processing
Low Job B  -> Waiting
High Job C -> Waiting
```

The current Low Job A is allowed to finish.

After it finishes:

```text
High Job C -> Processing
Low Job B  -> Waiting
```

This gives higher priority to waiting high-priority jobs without interrupting an active job.

## Worker Threads

CSV calculations are performed using Node.js `worker_threads`.

The main server handles:

- HTTP requests
- File uploads
- Queue management
- Socket.IO communication

The Worker Thread handles the CSV calculation separately from the main Node.js event loop.

The deployed version uses one worker to keep memory usage suitable for the hosting environment while still demonstrating Worker Thread based processing and queue scheduling.

## Progress Updates

The worker reports progress while processing the CSV.

Socket.IO sends these updates to connected clients.

```text
Waiting
   ↓
Processing 20%
   ↓
Processing 40%
   ↓
Processing 60%
   ↓
Processing 80%
   ↓
Completed 100%
```

## Deadlock Considerations

A classic deadlock can occur when tasks permanently wait for resources held by each other.

The four common conditions are:

1. Mutual exclusion
2. Hold and wait
3. No preemption
4. Circular wait

A deadlock in this system could leave jobs stuck, workers unavailable, and the queue unable to progress.

The implementation is designed to avoid classic resource deadlocks by:

- Keeping job ownership simple
- Not making workers wait for other workers while holding a shared resource
- Removing a job from the queue before assigning it to a worker
- Making the worker available again after completion or error
- Continuing queue processing after a worker finishes

There are no nested locks or circular resource dependencies in the queue/worker flow.

## API Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/health` | Check server status |
| POST | `/upload` | Upload a CSV and create a job |
| GET | `/jobs` | Get all jobs |
| GET | `/jobs/:id` | Get one job |
| GET | `/jobs/:id/download` | Download a completed result |

The upload request uses:

```text
file
priority
```

Priority values:

```text
low
high
```

## Running Locally

### Backend

```bash
cd server
npm install
node server.js
```

Backend:

```text
http://localhost:5000
```

### Frontend

Open another terminal:

```bash
cd client
npm install
npm run dev
```

Frontend:

```text
http://localhost:5173
```

## Testing Priority

1. Upload a large Low-priority CSV.
2. Upload another Low-priority CSV.
3. While the first job is processing, upload a High-priority CSV.
4. The first job continues processing.
5. After it finishes, the High-priority waiting job runs before the second Low-priority job.

## Testing Multi-Client Updates

1. Open the application in two browser tabs.
2. Upload a CSV from one tab.
3. Both tabs should receive the job and status updates through Socket.IO.

## Deployment

The frontend is deployed on Vercel and the Node.js backend is deployed on Render.

```text
React / Vite
      |
      | HTTP + Socket.IO
      v
Node.js / Express
      |
      v
Priority Queue
      |
      v
Worker Thread
      |
      v
CSV Sum Result
```

## Notes

Job state is kept in memory, so the deployed application is intended for demonstration and assessment use rather than permanent data storage.

Uploaded files should also be considered temporary deployment data.

## Author

Sameer Kumar

## Assessment Use Notice

> **Copyright © 2026 Sameer Kumar. All Rights Reserved.**
>
> This repository is provided solely for technical assessment and evaluation.
> The source code may be viewed and run for evaluation purposes, but may not
> be copied, reused, redistributed, submitted as another person's work, or
> incorporated into another project without prior written permission.