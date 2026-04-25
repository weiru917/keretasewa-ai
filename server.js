import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

dotenv.config()
console.log('ENV key loaded:', process.env.OPENROUTER_API_KEY?.slice(0, 12))
console.log('ENV model loaded:', process.env.OPENROUTER_MODEL)
const app = express()

app.use(cors())
app.use(express.json())

app.post('/api/glm', async (req, res) => {
  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`
      },
      body: JSON.stringify({
        model: process.env.OPENROUTER_MODEL,
        messages: req.body.messages
      })
    })

    const data = await response.json()

    return res.status(response.status).json(data)

  } catch (error) {
    return res.status(500).json({
      error: error.message
    })
  }
})

app.listen(3001, () => {
  console.log('Proxy server running at http://localhost:3001')
})