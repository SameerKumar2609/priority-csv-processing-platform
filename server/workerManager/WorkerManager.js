const { Worker } = require('worker_threads');

class WorkerManager {
  constructor(workerCount, onJobComplete, onJobUpdate) {
    this.workerCount = workerCount;
    this.workers = [];
    this.onJobComplete = onJobComplete; 
    this.onJobUpdate = onJobUpdate;
  }

  createWorkers() {
    for (let i = 0; i < this.workerCount; i++) {
      const worker = new Worker('./workers/csvWorker.js');

      const workerInfo = {
        id: i + 1,
        worker: worker,
        busy: false,
        job: null
      };

      worker.on('message', (message) => {
        this.handleMessage(workerInfo, message);
      });

      worker.on('error', (error) => {
        this.handleError(workerInfo, error);
      });

      this.workers.push(workerInfo);
    }
  }

  getAvailableWorker() {
    for (const workerInfo of this.workers) {
      if (!workerInfo.busy) {
        return workerInfo;
      }
    }

    return null;
  }

  processJob(job) {
    const workerInfo = this.getAvailableWorker();

    if (!workerInfo) {
      return false;
    }

    workerInfo.busy = true;
    workerInfo.job = job;

    job.status = 'processing';
    job.processId = `worker-${workerInfo.id}`;

    console.log(
      `Worker ${workerInfo.id} started job: ${job.filename}`
    );

    workerInfo.worker.postMessage({
      filePath: job.filePath
    });

    return true;
  }

  handleMessage(workerInfo, message) {
    const job = workerInfo.job;

    if (!job) {
      return;
    }

    if (message.type === 'progress') {
      job.progress = message.progress;

      console.log(
        `${job.filename} progress: ${job.progress}%`
      );

      if(this.onJobUpdate) {
        this.onJobUpdate(job);
      }

      return;
    }

    if (message.type === 'completed') {
      job.result = message.result;
      job.status = 'completed';
      job.progress = 100;

      console.log(
        `Worker ${workerInfo.id} completed: ${job.filename}`
      );

      console.log('Result:', job.result);

      if(this.onJobUpdate) {
        this.onJobUpdate(job);
      }

      workerInfo.busy = false;
      workerInfo.job = null;

        if (this.onJobComplete) {
            this.onJobComplete();
        }
    }
  }

  handleError(workerInfo, error) {
    console.log(
      `Worker ${workerInfo.id} error:`,
      error
    );

    if (workerInfo.job) {
      workerInfo.job.status = 'error';
    }

    if(this.onJobUpdate){
        this.onJobUpdate(workerInfo.job);
    }

    workerInfo.busy = false;
    workerInfo.job = null;

    if (this.onJobComplete) {
        this.onJobComplete();
    }

  }
}

module.exports = WorkerManager;