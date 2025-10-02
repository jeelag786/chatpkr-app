// File Path: netlify/functions/get-ai-response.js

// This is the main handler function that Netlify will run.
exports.handler = async function (event, context) {
  // Only allow POST requests.
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  try {
    // Get the user's message from the request body.
    const { message } = JSON.parse(event.body);

    // If the message is missing, send an error.
    if (!message) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Bad Request: Message is required.' }),
      };
    }

    // Call the OpenRouter AI API.
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`, // Securely fetch the API key.
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

    // If the AI API gives an error, pass that error back.
    if (!response.ok) {
      const errorBody = await response.text();
      console.error('OpenRouter API Error:', errorBody);
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: `API Error: ${errorBody}` }),
      };
    }

    // Get the AI's response data.
    const data = await response.json();

    // Send the AI's response back to our frontend app.
    return {
      statusCode: 200,
      body: JSON.stringify(data),
    };

  } catch (error) {
    // If our own function has an error, log it and send a generic error message.
    console.error('Serverless Function Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal Server Error' }),
    };
  }
};
