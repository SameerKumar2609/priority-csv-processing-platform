import JobCard from './JobCard';

function JobList({ jobs }) {
  const totalJobs = jobs.length;

  const waitingJobs = jobs.filter(
    (job) => job.status === 'queued'
  ).length;

  const processingJobs = jobs.filter(
    (job) => job.status === 'processing'
  ).length;

  const completedJobs = jobs.filter(
    (job) => job.status === 'completed'
  ).length;

  return (
    <div>

      <div className="queue-header">

        <div>
          <h2 className="queue-title">
            Processing Queue
          </h2>

          <p className="queue-description">
            Live status of all submitted files
          </p>
        </div>

        <div className="statistics">

          <div className="stat">
            <span className="stat-number">
              {totalJobs}
            </span>

            <span className="stat-label">
              Total
            </span>
          </div>

          <div className="stat">
            <span className="stat-number">
              {waitingJobs}
            </span>

            <span className="stat-label">
              Waiting
            </span>
          </div>

          <div className="stat">
            <span className="stat-number">
              {processingJobs}
            </span>

            <span className="stat-label">
              Processing
            </span>
          </div>

          <div className="stat">
            <span className="stat-number">
              {completedJobs}
            </span>

            <span className="stat-label">
              Completed
            </span>
          </div>

        </div>

      </div>

      {jobs.length === 0 ? (
        <div className="empty-state">
          <p>No files in the queue yet.</p>
        </div>
      ) : (
        jobs.map((job) => (
          <JobCard
            key={job.id}
            job={job}
          />
        ))
      )}

    </div>
  );
}

export default JobList;