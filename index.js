const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const libre = require('libreoffice-convert');
const tmp = require('tmp');
const archiver = require('archiver');
const multer = require('multer');  // Add multer for file uploads

const app = express();
const PORT = 5000;

// Enable CORS for all origins
app.use(cors());

// Set up multer for file uploads
const storage = multer.memoryStorage();  // Store files in memory
const upload = multer({ storage: storage });

// POST endpoint for file conversion
app.post('/api/convert', upload.array('files'), async (req, res) => {
    try {
        // Validate the uploaded files
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error: 'No files uploaded' });
        }

        const convertedFiles = [];

        // Process each uploaded file
        for (const file of req.files) {
            const ext = '.pdf';
            const outputFile = tmp.fileSync({ postfix: ext });

            // Convert the file using LibreOffice
            await new Promise((resolve, reject) => {
                libre.convert(file.buffer, ext, undefined, (err, done) => {
                    if (err) {
                        reject(`Error converting file: ${file.originalname}`);
                    }
                    fs.writeFileSync(outputFile.name, done);
                    convertedFiles.push(outputFile.name);
                    resolve();
                });
            });
        }

        // Create a temporary ZIP file to hold the converted files
        const zipFile = tmp.fileSync({ postfix: '.zip' });
        const output = fs.createWriteStream(zipFile.name);
        const archive = archiver('zip', { zlib: { level: 9 } });

        // Pipe the archive output to the ZIP file stream
        archive.pipe(output);

        // Add each converted file to the ZIP archive
        convertedFiles.forEach((file) => {
            archive.file(file, { name: path.basename(file) });
        });

        // Finalize the archive and send the ZIP file as the response
        await archive.finalize();

        output.on('close', () => {
            // Send the ZIP file to the client as a download
            res.download(zipFile.name, 'converted-files.zip', (err) => {
                if (err) {
                    console.error('Error sending zip file:', err);
                }
            });
        });
    } catch (error) {
        console.error('Error during conversion:', error);
        // Return an error response if any exception occurs
        res.status(500).json({ error: 'Error during conversion. Check server logs for details.' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://127.0.0.1:${PORT}`);
});
