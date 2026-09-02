const http = require('http');
const { Server } = require('socket.io');
const express = require('express');
const multer = require('multer');
const cors = require('cors');

const Job = require('./models/Job');
const JobQueue = require('./queue/jobQueue');
const WorkerManager = require('./workerManager/WorkerManager');
const JobManager = require('./managers/JobManager');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());

app.get('/jobs/:id/download', (req, res) => {
  const job = jobManager.getJobById(req.params.id);

  if (!job) {
    return res.status(404).json({
      error: 'Job not found'
    });
  }

  if (job.status !== 'completed') {
    return res.status(400).json({
      error: 'Job is not completed yet'
    });
  }

  const resultFile = path.join(
    'uploads',
    `${job.id}-result.txt`
  );

  fs.writeFileSync(
    resultFile,
    `File: ${job.filename}\nResult: ${job.result}\n`
  );

  res.download(
    resultFile,
    `${job.filename}-result.txt`
  );
});




const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*'
  }
});

const PORT = process.env.PORT || 5000;

const jobQueue = new JobQueue();
const jobManager = new JobManager();

io.on('connection', (socket) => { // Listen for client connections through Socket.IO
  console.log('Client connected:', socket.id);

  socket.emit('allJobs', jobManager.getAllJobs()); // Send all jobs to the connected client

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Process jobs from the queue
function processQueue() {
  let worker = workerManager.getAvailableWorker();

  while (worker) {
    const job = jobQueue.getNextJob();

    if (!job) {
      break;
    }

    workerManager.processJob(job);

    worker = workerManager.getAvailableWorker();
  }
}


// Create 3 workers
const workerManager = new WorkerManager(3, processQueue, sendJobUpdate);

workerManager.createWorkers();


function sendJobUpdate(job) {
  io.emit('jobUpdate', job);
}


// Where uploaded files will be stored
const upload = multer({
  dest: 'uploads/'
});


// Test route
app.get('/health', (req, res) => {
  res.json({
    status: 'Server is running'
  });
});


// File upload route
app.post('/upload', upload.single('file'), (req, res) => {

  if (!req.file) {
    return res.status(400).json({
      error: 'No file uploaded'
    });
  }

  const priority = req.body.priority || 'low';

  const job = new Job(
    req.file.originalname,
    req.file.path,
    priority
  );

  // Add job to queue
  jobQueue.addJob(job);

  jobManager.addJob(job);

  job.status = 'queued';

  sendJobUpdate(job); // Notify clients about the new job

  // Try to process the queue
  processQueue();

  console.log('New job:', job);

  res.json({
    message: 'File uploaded successfully',
    job: job
  });
});

app.get('/jobs', (req, res) => {
  const jobs = jobManager.getAllJobs();

  res.json({
    jobs: jobs
  });
});

app.get('/jobs/:id', (req, res) => {
  const job = jobManager.getJobById(req.params.id);

  if (!job) {
    return res.status(404).json({
      error: 'Job not found'
    });
  }

  res.json({
    job: job
  });
});


server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


module.exports = app;