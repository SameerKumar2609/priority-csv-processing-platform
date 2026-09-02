import { useRef, useState } from 'react';

function UploadForm({ onUpload }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [priority, setPriority] = useState('low');
  const [uploading, setUploading] = useState(false);

  const fileInputRef = useRef(null);

  function handleFileChange(event) {
    const file = event.target.files[0];

    if (file) {
      setSelectedFile(file);
    }
  }

  async function uploadFile() {
    if (!selectedFile) {
      alert('Please select a CSV file');
      return;
    }

    const fileToUpload = selectedFile;

    const formData = new FormData();

    formData.append('file', fileToUpload);
    formData.append('priority', priority);

    try {
      setUploading(true);

      const response = await fetch(
        'http://localhost:5000/upload',
        {
          method: 'POST',
          body: formData
        }
      );

      const data = await response.json();

      console.log('Upload response:', data);

      onUpload(data.job);

      // Clear the selected file
      setSelectedFile(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

    } catch (error) {
      console.log('Upload error:', error);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <h2>Upload CSV</h2>

      <input
        ref={fileInputRef}
        className="file-input"
        type="file"
        accept=".csv"
        onChange={handleFileChange}
      />

      {selectedFile && (
        <p>
          Selected file: {selectedFile.name}
        </p>
      )}

      <div className="priority-section">

        <p>Priority</p>

        <label className="priority-label">
          <input
            type="radio"
            value="low"
            checked={priority === 'low'}
            onChange={(event) => {
              setPriority(event.target.value);
            }}
          />

          Low
        </label>

        <label className="priority-label">
          <input
            type="radio"
            value="high"
            checked={priority === 'high'}
            onChange={(event) => {
              setPriority(event.target.value);
            }}
          />

          High
        </label>

      </div>

      <button
        className="upload-button"
        onClick={uploadFile}
      >
        {uploading ? 'Uploading...' : 'Upload File'}
      </button>

    </div>
  );
}

export default UploadForm;