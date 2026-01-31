import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { text, domain } = body;

    if (!text) {
      return new Response(JSON.stringify({ error: 'Text prompt is required' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const apiKey = import.meta.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'OpenRouter API Key is missing. Please set OPENROUTER_API_KEY in .env' }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const prompt = `
      Generuj fiszki edukacyjne na podstawie poniższego tekstu (oraz dziedziny: ${domain || 'Ogólna'}).
      Zwróć TYLKO czysty JSON w następującym formacie:
      {
        "flashcards": [
          { "question": "Pytanie...", "answer": "Odpowiedź..." }
        ]
      }
      Tekst źródłowy:
      ${text}
    `;

    const payload = {
      model: "anthropic/claude-3.5-sonnet",
      messages: [
        {
          role: "system",
          content: "Jesteś asystentem edukacyjnym. Twórz precyzyjne pytania i odpowiedzi do fiszek. Odpowiadaj zawsze poprawnym formatem JSON."
        },
        {
          role: "user",
          content: prompt
        }
      ]
    };

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "HTTP-Referer": "http://localhost:4321", // Optional but good practice for OpenRouter
        "X-Title": "10xCards",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenRouter API Error:", errorText);
      throw new Error(`OpenRouter API responded with status: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content received from OpenRouter");
    }

    // Attempt to parse JSON to validation
    let jsonResponse;
    try {
      jsonResponse = JSON.parse(content);
    } catch (e) {
      console.error("Failed to parse JSON from AI response:", content);
      throw new Error("Invalid JSON received from AI");
    }

    return new Response(JSON.stringify(jsonResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json"
      }
    });

  } catch (error: any) {
    console.error("Handler Error:", error);
    return new Response(JSON.stringify({ error: error.message || "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};
