import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

dotenv.config()

const app = express()

app.use(cors())
app.use(express.json())

app.post('/api/glm', async (req, res) => {
  try {
    const response = await fetch('https://api.ilmu.ai/anthropic/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.VITE_ILMU_API_KEY}`,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(req.body),
    })

    const text = await response.text()

    if (response.status === 504) {
      return res.status(504).json({
        error: 'AI provider is temporarily busy. Please try again shortly.',
      })
    }

    try {
      const data = JSON.parse(text)
      return res.status(response.status).json(data)
    } catch {
      return res.status(response.status).json({ error: text })
    }
  } catch (error) {
    return res.status(500).json({
      error: error.message,
    })
  }
})

app.listen(3001, () => {
  console.log('Proxy server running at http://localhost:3001')
})