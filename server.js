
const express = require("express");
const path = require("path");

const app = express();

app.use(express.json({ limit: "30kb" }));
app.use(express.static(path.join(__dirname, "public")));

app.post("/api/generate", async (req, res) => {
  const { prompt, tool, tone, length } = req.body || {};

  if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
    return res.status(400).json({
      error: "Введите запрос."
    });
  }

  if (!process.env.GROQ_API_KEY) {
    return res.status(500).json({
      error: "Не добавлен GROQ_API_KEY в настройках Render."
    });
  }

  try {
    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: "openai/gpt-oss-20b",
          messages: [
            {
              role: "system",
              content: "Ты NEUROVA AI — умный русскоязычный помощник. Отвечай грамотно, понятно и полезно."
            },
            {
              role: "user",
              content: `Инструмент: ${tool || "AI-помощник"}
Стиль: ${tone || "Профессиональный"}
Объём: ${length || "Средний"}
Запрос: ${prompt.trim()}`
            }
          ],
          temperature: 0.7,
          max_completion_tokens: 1500
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Groq API error:", data);

      return res.status(response.status).json({
        error: data.error?.message || "Ошибка облачного AI. Попробуйте позже."
      });
    }

    const answer = data.choices?.[0]?.message?.content;

    if (!answer) {
      return res.status(500).json({
        error: "AI не вернул ответ. Попробуйте ещё раз."
      });
    }

    res.json({ text: answer });

  } catch (error) {
    console.error("Server error:", error);

    res.status(500).json({
      error: "Не удалось подключиться к облачному AI."
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`NEUROVA запущен на порту ${PORT}`);
});