const { google } = require('googleapis');

module.exports = async (req, res) => {
  if (req.method === 'POST') {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    try {
      const auth = new google.auth.OAuth2(process.env.CLIENT_ID, process.env.CLIENT_SECRET);
      auth.setCredentials({
        refresh_token: process.env.REFRESH_TOKEN,
      });

      const sheets = google.sheets({ version: 'v4', auth });
      const spreadsheetId = process.env.SPREADSHEET_ID;

      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: 'Sheet1!A:A', // Adjust the range as per your sheet
        valueInputOption: 'RAW',
        requestBody: {
          values: [[email]],
        },
      });

      res.status(200).json({ message: 'Email added successfully!' });
    } catch (error) {
      console.error('Error adding email to Google Sheets:', error);
      res.status(500).json({ message: 'Failed to add email' });
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
};
