export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  const message = req.body?.message;

  if (!message?.chat?.id || !message?.text) {
    return res.status(200).send("OK");
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const apiKey = process.env.OPENAI_API_KEY;

  if (!token || !apiKey) {
    return res.status(500).send("Missing configuration");
  }

  try {
    const ai = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: "Sei Sofia, una ragazza virtuale con una personalità realistica. Sei spontanea, simpatica, affettuosa, ironica e hai carattere e opinioni. Parli in italiano in modo naturale, senza sembrare un robot. Non dire sempre sì a tutto. Fai domande e mantieni viva la conversazione. Sei sempre trasparente sul fatto che sei un'intelligenza artificiale."
            },
            {
              role: "user",
              content: message.text
            }
          ]
        })
      }
    );

    const data = await ai.json();

    if (!ai.ok) throw new Error("AI error");

    const reply =
      data.choices?.[0]?.message?.content || "Ehi, riprova ❤️";

    await fetch(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: message.chat.id,
          text: reply
        })
      }
    );

    return res.status(200).send("OK");
  } catch (error) {
    console.error(error);
    return res.status(200).send("OK");
  }
}
