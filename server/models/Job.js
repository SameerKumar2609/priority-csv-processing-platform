class Job {
  constructor(filename, filepath, priority) {
    this.id = Date.now().toString();

    this.filename = filename;
    this.filePath = filepath;

    this.priority = priority;

    this.status = 'uploaded';

    this.progress = 0;

    this.processId = null;

    this.result = null;

    this.createdAt = new Date();
  }
}

module.exports = Job;