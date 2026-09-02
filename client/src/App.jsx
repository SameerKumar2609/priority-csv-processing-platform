import { API_URL } from './config';
import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import './App.css';

import JobList from './components/JobList';
import UploadForm from './components/UploadForm';

const socket = io(API_URL);

function App() {
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    fetchJobs();

    socket.on('allJobs', (jobs) => {
      setJobs(jobs);
    });

    socket.on('jobUpdate', (updatedJob) => {
      setJobs((currentJobs) => {
        const jobExists = currentJobs.some(
          (job) => job.id === updatedJob.id
        );

        if (jobExists) {
          return currentJobs.map((job) => {
            if (job.id === updatedJob.id) {
              return updatedJob;
            }

            return job;
          });
        }

        return [updatedJob, ...currentJobs];
      });
    });

    return () => {
      socket.off('allJobs');
      socket.off('jobUpdate');
    };
  }, []);

  async function fetchJobs() {
    try {
      const response = await fetch(`${API_URL}/jobs`);

      const data = await response.json();

      setJobs(data.jobs);
    } catch (error) {
      console.log('Error getting jobs:', error);
    }
  }

  function handleNewJob(newJob) {
      setJobs((currentJobs) => {
          const jobExists = currentJobs.some(
            (job) => job.id === newJob.id
          );

          if (jobExists) {
            return currentJobs;
          }

          return [newJob, ...currentJobs];
      });
  }

  return (
    <div className="app">
    <div className="container">

      <div className="header">
        <h1>Freznel Queue</h1>

        <p>
          Multi-user CSV processing system
        </p>

        <span className="online">
          ● Server Online
        </span>
      </div>

      <div className="upload-section">
        <UploadForm onUpload={handleNewJob} />
      </div>

      <JobList jobs={jobs} />

    </div>
  </div>
  );
}

export default App;