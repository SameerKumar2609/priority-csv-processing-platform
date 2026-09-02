class JobQueue {
    constructor() {
        this.highPriorityJobs = [];
        this.lowPriorityJobs = [];
    }

    addJob(job) {
        if(job.priority === 'high'){
            this.highPriorityJobs.push(job);
        } else{
            this.lowPriorityJobs.push(job);
        }
    }

    getNextJob() {
        if(this.highPriorityJobs.length > 0){
            return this.highPriorityJobs.shift();
        }

        if(this.lowPriorityJobs.length > 0){
            return this.lowPriorityJobs.shift();
        }

        return null;
    }

    getAllJobs() {
        return [...this.highPriorityJobs, ...this.lowPriorityJobs];
    }
}

module.exports = JobQueue;