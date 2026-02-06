const express = require('express');
const { google } = require('googleapis');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Parse the service account JSON from environment variable
const serviceAccountJson = JSON.parse(
  Buffer.from(process.env.GOOGLE_SHEETS_SERVICE_ACCOUNT_JSON, 'base64').toString('utf-8')
);

// Extract spreadsheet ID from URL or use directly
const SPREADSHEET_ID = process.env.SPREADSHEET_ID || '1fxMb3wvcJLLwHc4LL_jSnSq9lYNcdF9uEGo60zBed4U';

// Simple API key authentication for your GPT
const API_KEY = process.env.API_KEY;

// Middleware to check API key
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || authHeader !== `Bearer ${API_KEY}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};

// Initialize Google Sheets API
async function getGoogleSheetsClient() {
  const auth = new google.auth.GoogleAuth({
    credentials: serviceAccountJson,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const sheets = google.sheets({ version: 'v4', auth });
  return sheets;
}

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'GPT Sheets API is running' });
});

// Add a row to the Google Sheet
app.post('/add-participant', authenticate, async (req, res) => {
  try {
    const { participantName, childDob, parentGuardianName } = req.body;

    // Validate required fields
    if (!participantName || !childDob || !parentGuardianName) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['participantName', 'childDob', 'parentGuardianName']
      });
    }

    const sheets = await getGoogleSheetsClient();

    // Append the row to the sheet
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: 'upload!A:C',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[participantName, childDob, parentGuardianName]]
      }
    });

    res.json({
      success: true,
      message: `Successfully added participant: ${participantName}`,
      updatedRange: response.data.updates.updatedRange
    });
  } catch (error) {
    console.error('Error adding row:', error);
    res.status(500).json({
      error: 'Failed to add participant',
      details: error.message
    });
  }
});

// Get all participants (optional - for reading data)
app.get('/participants', authenticate, async (req, res) => {
  try {
    const sheets = await getGoogleSheetsClient();

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'upload!A:C',
    });

    const rows = response.data.values || [];

    // Skip header row if present
    const participants = rows.slice(1).map(row => ({
      participantName: row[0] || '',
      childDob: row[1] || '',
      parentGuardianName: row[2] || ''
    }));

    res.json({
      success: true,
      count: participants.length,
      participants
    });
  } catch (error) {
    console.error('Error fetching participants:', error);
    res.status(500).json({
      error: 'Failed to fetch participants',
      details: error.message
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
