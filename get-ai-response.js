// File Path: netlify/functions/get-ai-response.js

exports.handler = async function (event) {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { message } = JSON.parse(event.body);

    if (!message) {
      return { statusCode: 400, body: 'Bad Request: Message is required.' };
    }

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // IMPORTANT: The API key is now securely fetched from an environment variable
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'google/gemini-pro',
        messages: [
          {
            role: 'system',
            content: `You are ChatPKR, a state-of-the-art conversational AI. Your personality is helpful, knowledgeable, and engaging. You can discuss a vast array of topics, from complex technical subjects to creative writing and casual conversation. Adapt your responses to the user's language and tone, providing natural, human-like dialogue. Format your responses with markdown for readability (e.g., use **bold**, *italics*, and code blocks). You must strictly refuse to generate any illegal, harmful, or unsafe content under any circumstances.`
          },
          { role: 'user', content: message }
        ],
        max_tokens: 2048,
        temperature: 0.75
      })
    });

    if (!response.ok) {
        // Log the error from the API for debugging
        const errorBody = await response.text();
        console.error('OpenRouter API Error:', errorBody);
        return { statusCode: response.status, body: `API Error: ${errorBody}` };
    }

    const data = await response.json();

    return {
      statusCode: 200,
      body: JSON.stringify(data),
    };

  } catch (error) {
    console.error('Serverless Function Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal Server Error' }),
    };
  }
};