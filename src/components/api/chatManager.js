const getMessage = async (messages, response_format = {}) => {
    const body = {
        model: process.env.OPENROUTER_MODEL,
        messages: messages,
    };
    if (Object.keys(response_format).length > 0) {
        body.response_format = response_format;
    }

    const response = await fetch(`${process.env.OPENROUTER_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body)
    });

    return await response.json();
}

export { getMessage };



