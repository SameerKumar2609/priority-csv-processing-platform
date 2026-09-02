const { parentPort } = require('worker_threads');
const fs = require('fs');

parentPort.on('message', (job) => {
  const filePath = job.filePath;

  const fileContent = fs.readFileSync(filePath, 'utf8');

  const rows = fileContent.split('\n');

  let total = 0;

  const totalRows = rows.length;

  let lastProgress = 0;

  for (let i = 0; i < totalRows; i++) {
    const row = rows[i];

    const values = row.split(',');

    for (const value of values) {
      const number = parseFloat(value);

      if (!isNaN(number)) {
        total += number;
      }
    }

    const progress = Math.round(
      ((i + 1) / totalRows) * 100
    );

    // Send progress only when it changes
    if (progress !== lastProgress) {
      lastProgress = progress;

      parentPort.postMessage({
        type: 'progress',
        progress: progress
      });
    }
  }

  parentPort.postMessage({
    type: 'completed',
    result: total
  });
});