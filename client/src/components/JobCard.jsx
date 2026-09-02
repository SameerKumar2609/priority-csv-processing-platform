import { API_URL } from '../config';


function JobCard({ job }) {
  function getStatusText() {
    if (job.status === 'queued') {
      return 'Waiting for processing';
    }

    if (job.status === 'processing') {
      return 'Processing';
    }

    if (job.status === 'completed') {
      return 'Completed';
    }

    if (job.status === 'error') {
      return 'Error';
    }

    return 'Uploaded';
  }

  return (
    <div className="job-card">

      <div className="job-header">

        <div>
          <h3>{job.filename}</h3>

          <div className="status">
            <span className={`status-dot ${job.status}`}></span>

            {getStatusText()}
          </div>
        </div>

        <span className={`priority ${job.priority}`}>
          {job.priority.toUpperCase()}
        </span>

      </div>

      <div className="job-info">

        <span>
          Worker: {job.processId || 'Waiting'}
        </span>

        <span>
          {job.progress}%
        </span>

      </div>

      <div className="progress-background">
        <div
          className="progress-bar"
          style={{
            width: `${job.progress}%`
          }}
        ></div>
      </div>

      {job.status === 'completed' && (
        <div className="completed-section">

          <p className="result">
            Result: {job.result}
          </p>

          <a
            className="download-button"
            href={`${API_URL}/jobs/${job.id}/download`}
          >
            Download Result
          </a>

        </div>
      )}

    </div>
  );
}

export default JobCard;