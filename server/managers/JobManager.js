class JobManager {
  constructor() {
    this.jobs = [];
  }

  addJob(job) {
    this.jobs.push(job);
  }

  getAllJobs() {
    return this.jobs;
  }

  getJobById(id) {
    return this.jobs.find((job) => job.id === id);
  }
}

module.exports = JobManager;