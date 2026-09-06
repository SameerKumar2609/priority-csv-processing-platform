# Priority-Based CSV Processing Platform

An asynchronous, multi-user CSV processing platform built with React, Node.js, Express, Socket.IO, and Node.js Worker Threads. The system models a background job-processing workflow where uploaded workloads are queued, prioritized, processed independently, and monitored in real time.

## Live Demo

**Frontend:**  
https://binaire-freznel-assessment-j1o31hb3g-sameers-projects-a0b6ef52.vercel.app/

**Backend:**  
https://binaire-freznel-assessment-7p5b.onrender.com

## Overview

The platform is designed around a common background-processing pattern:

```text
User Upload
    ↓
REST API
    ↓
Job Creation
    ↓
Priority Queue
    ↓
Worker Thread
    ↓
CSV Processing
    ↓
Real-Time Progress Updates
    ↓
Client Dashboard
```

Instead of performing the CSV calculation directly inside the HTTP request, the server creates a job and processes the workload asynchronously. This keeps the main Node.js server responsible for API, queue, and real-time communication while CPU-intensive CSV processing runs in a Worker Thread.

## Features

- Upload CSV files containing integers and floating-point numbers
- Assign Low or High priority to each job
- Queue multiple files for background processing
- Process waiting High-priority jobs before waiting Low-priority jobs
- Use non-preemptive scheduling so an active job is allowed to finish
- Process CSV calculations using Node.js Worker Threads
- Provide real-time job and progress updates using Socket.IO
- Synchronize queue and job status across connected clients
- Track uploaded, waiting, processing, progress, completed, and error states
- Calculate the sum of numeric values in each CSV
- Download the processed result
- Responsive UI with status indicators and simple animations

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
priority-csv-processing-platform/
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

1. The client selects a CSV file and assigns a priority.
2. The file is uploaded to the Node.js server.
3. The server creates a job and adds it to the priority queue.
4. The new job is broadcast to connected clients through Socket.IO.
5. The queue selects the next available job according to priority.
6. A Worker Thread reads the CSV and calculates the sum of numeric values.
7. The worker sends progress updates to the server.
8. The server broadcasts those updates to connected clients.
9. When processing finishes, the job is marked as completed.
10. The result is displayed and can be downloaded.

## Priority-Based Job Scheduling

The queue uses **non-preemptive priority scheduling**.

For example:

```text
Low Job A  -> Processing
Low Job B  -> Waiting
High Job C -> Waiting
```

The active Low-priority job is allowed to finish.

After completion:

```text
High Job C -> Processing
Low Job B  -> Waiting
```

This approach gives higher priority to waiting urgent workloads without interrupting a job that is already being processed.

This pattern can be applied to systems that handle different classes of background work, such as data imports, report generation, document processing, analytics jobs, or other asynchronous workloads.

## Worker Threads

CSV calculations are performed using Node.js `worker_threads`.

The main server handles:

- HTTP requests
- File uploads
- Queue management
- Socket.IO communication

The Worker Thread handles CSV calculation separately from the main Node.js event loop.

```text
Main Node.js Process
├── HTTP Requests
├── File Uploads
├── Queue Management
└── Socket.IO Communication
        |
        v
   Worker Thread
        |
        └── CSV Calculation
```

The deployed version uses one worker to keep memory usage suitable for the hosting environment while demonstrating Worker Thread-based processing and queue scheduling.

## Real-Time Progress Updates

The worker reports progress while processing the CSV, and Socket.IO broadcasts those updates to connected clients.

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

Multiple browser clients can observe the same job state in real time.

## Concurrency and Deadlock Considerations

A background-processing system needs clear ownership of jobs and workers to avoid tasks becoming permanently blocked.

The implementation keeps the queue/worker flow simple by:

- Keeping job ownership explicit
- Removing a job from the queue before assigning it to a worker
- Avoiding workers waiting on one another while holding shared resources
- Making workers available again after completion or error
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

## Testing Priority Scheduling

1. Upload a large Low-priority CSV.
2. Upload another Low-priority CSV.
3. While the first job is processing, upload a High-priority CSV.
4. The first job continues processing.
5. After it finishes, the High-priority waiting job runs before the second Low-priority job.

## Testing Multi-Client Updates

1. Open the application in two browser tabs.
2. Upload a CSV from one tab.
3. Both tabs receive the job and status updates through Socket.IO.

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
CSV Processing
      |
      v
Result
```

## Current Deployment Limitations

The current deployment keeps job state in memory, so it is intended as a demonstration of the asynchronous processing architecture rather than a persistent production data-processing service.

Uploaded files should also be considered temporary deployment data.

A production-oriented version could extend this architecture with persistent job storage, a distributed queue, multiple workers, retry handling, authentication, and durable file storage.

## Author

Sameer Kumar

## License / Usage

Copyright © 2026 Sameer Kumar. All Rights Reserved.

The source code is provided for viewing and evaluation purposes. It may not be copied, reused, redistributed, submitted as another person's work, or incorporated into another project without prior written permission.
