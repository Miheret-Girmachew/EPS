const axios = require('axios');

// Get Copyleaks Access Token
const getAccessToken = async () => {
  const response = await axios.post('https://id.copyleaks.com/v3/account/login/api', {
    email: process.env.COPYLEAKS_CLIENT_ID,
    key: process.env.COPYLEAKS_CLIENT_SECRET,
  });
  return response.data.access_token;
};

// Submit Project for Plagiarism Check
const submitProjectForPlagiarismCheck = async (studentId, projectContent) => {
  const token = await getAccessToken();

  try {
    const response = await axios.post(
      'https://api.copyleaks.com/v3/education/submit/text', // Use the correct endpoint for text content
      {
        content: projectContent, // Send the actual project content for plagiarism check
        properties: {
          sandbox: true, // Ensure this is appropriate for your needs
        },
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    console.log('Plagiarism check response:', response.data); // Log the full response
    return response.data;

  } catch (error) {
    // Log detailed error information
    console.error('Plagiarism check error:', error.response ? error.response.data : error.message);
    throw new Error('Plagiarism check failed'); // Throw a more descriptive error
  }
};

// Check Plagiarism Status
const checkPlagiarismStatus = async (scanId) => {
  const token = await getAccessToken();

  try {
    const response = await axios.get(
      `https://api.copyleaks.com/v3/education/${scanId}/status`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    console.log('Plagiarism status response:', response.data); // Log the status response
    return response.data;

  } catch (error) {
    console.error('Error checking plagiarism status:', error.response ? error.response.data : error.message);
    throw new Error('Error checking plagiarism status');
  }
};

module.exports = { submitProjectForPlagiarismCheck, checkPlagiarismStatus };
