const { google } = require('googleapis');

module.exports = async (req, res) => {
  // Only allow POST requests
  if (req.method === 'POST') {
    const { email } = req.body;

    // Validate email input
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    try {
      // Google OAuth2 authentication
      const auth = new google.auth.OAuth2(
        process.env.CLIENT_ID, 
        process.env.CLIENT_SECRET
      );
      auth.setCredentials({
        refresh_token: process.env.REFRESH_TOKEN, // Use refresh token for persistent auth
      });

      const sheets = google.sheets({ version: 'v4', auth });
      const spreadsheetId = process.env.SPREADSHEET_ID;

      // Append the email to the Google Sheet
      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: 'Sheet1!A:A', // Adjust this range according to where you want to store the emails
        valueInputOption: 'RAW',
        requestBody: {
          values: [[email]], // Add email to the sheet
        },
      });

      // Send success response
      res.status(200).json({ message: 'Email added successfully!' });
    } catch (error) {
      console.error('Error adding email to Google Sheets:', error); // Log the error to see the detailed message
      res.status(500).json({ message: 'Failed to add email', error: error.message }); // Send back the specific error message
    }
  } else {
    // Return 405 (Method Not Allowed) if the method is not POST
    res.status(405).json({ message: 'Method Not Allowed' });
  }
};
