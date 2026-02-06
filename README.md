# GPT Sheets API

API bridge to connect a Custom GPT to Google Sheets for participant registration.

## Setup Instructions

### 1. Prerequisites
- Node.js 18+ installed locally (for testing)
- Railway account (https://railway.app)
- Google Cloud service account with Sheets API enabled
- ChatGPT Plus subscription (for custom GPTs)

### 2. Share Your Google Sheet
**Important:** Share your Google Sheet with the service account email:
```
sheets-service-account@robotic-facet-377920.iam.gserviceaccount.com
```
Give it **Editor** access.

### 3. Deploy to Railway

1. Create a new GitHub repository and push this code
2. Go to https://railway.app and sign in
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository
5. Add environment variables in Railway dashboard:
   - `GOOGLE_SHEETS_SERVICE_ACCOUNT_JSON` = your base64 encoded service account JSON
   - `SPREADSHEET_ID` = `1fxMb3wvcJLLwHc4LL_jSnSq9lYNcdF9uEGo60zBed4U`
   - `API_KEY` = generate a secure key (e.g., run `openssl rand -hex 32`)
6. Railway will auto-deploy and give you a URL like `https://your-app.up.railway.app`

### 4. Create the Custom GPT

1. Go to https://chat.openai.com/gpts/create
2. Name: "Participant Registration Assistant"
3. Description: "Helps register participants by adding them to a Google Sheet"
4. Instructions (paste this):
```
You are a helpful assistant that registers participants for a program.

When a user wants to register a participant, collect the following information:
1. Participant Name (the child's name)
2. Child's Date of Birth (in YYYY-MM-DD format)
3. Parent/Guardian Name

Once you have all the information, use the addParticipant action to add them to the registration sheet.

Always confirm the details with the user before submitting.
After successful registration, confirm that the participant has been added.
```

5. Click "Create new action"
6. Paste the contents of `openapi.yaml` (update the server URL to your Railway URL)
7. For Authentication:
   - Type: API Key
   - Auth Type: Bearer
   - Enter your API_KEY value

### 5. Test Your GPT

Try saying:
- "I want to register a participant"
- "Add John Smith, born 2018-05-15, parent is Jane Smith"

## Local Development

```bash
npm install
cp .env.example .env
# Edit .env with your values
npm start
```

Test with curl:
```bash
curl -X POST http://localhost:3000/add-participant \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{"participantName":"Test Child","childDob":"2020-01-15","parentGuardianName":"Test Parent"}'
```
