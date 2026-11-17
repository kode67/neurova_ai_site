
const express = require("express");
const path = require("path");

const app = express();

app.use(express.json({ limit: "30kb" }));
app.use(express.static(path.join(__dirname, "public")));

app.post("/api/generate", async (req, res) => {
  const { prompt, tool, tone, length } = req.body || {};

  if (!prompt || !prompt.trim()) {
    return res.status(400).json({ error: "Введите запрос." });
  }

  try {
    const response = await fetch(
      "http://127.0.0.1:11434/api/chat",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "llama3.2:3b",
          stream: false,
          messages: [
            {
              role: "system",
              content: "Ты умный русскоязычный помощник NEUROVA. Отвечай подробно, грамотно и понятно."
            },
            {
              role: "user",
              content: `${tool}\nСтиль: ${tone}\nОбъём: ${length}\nЗапрос: ${prompt}`
            }
          ]
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(500).json({
        error: data.error || "Ошибка Ollama"
      });
    }

    res.json({
      text: data.message?.content || "Нет ответа от модели."
    });

  } catch (error) {
    res.status(500).json({
      error: "Ollama не запущен. Проверь программу Ollama."
    });
  }
});

app.listen(3000, () => {
  console.log("NEUROVA запущен: http://localhost:3000");
});
