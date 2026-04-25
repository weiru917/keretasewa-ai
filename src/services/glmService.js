const GLM_CONFIG = {
  baseURL: 'http://localhost:3001',
  model: import.meta.env.VITE_OPENROUTER_MODEL || 'qwen/qwen3-32b',
}

function validateConfig() {
  if (!GLM_CONFIG.model) {
    throw new Error('Missing VITE_OPENROUTER_MODEL in .env file')
  }
}

async function callGLM(messages, systemPrompt = '') {
  validateConfig()

  const finalMessages = []

  if (systemPrompt) {
    finalMessages.push({
      role: 'system',
      content: systemPrompt,
    })
  }

  finalMessages.push(...messages)

  const response = await fetch(`${GLM_CONFIG.baseURL}/api/glm`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: GLM_CONFIG.model,
      messages: finalMessages,
      temperature: 0.4,
      max_tokens: 2048,
    }),
  })

  let data
  try {
    data = await response.json()
  } catch {
    const text = await response.text()
    throw new Error(text || 'AI provider returned an invalid response')
  }

  if (!response.ok) {
    if (response.status === 429) {
      throw new Error('AI provider rate limit reached. Please try again later.')
    }

    if (response.status === 401 || response.status === 403) {
      throw new Error('AI authentication failed. Please check your OpenRouter API key.')
    }

    if (response.status === 404) {
      throw new Error('AI model or endpoint unavailable. Please check the model name.')
    }

    if (response.status === 504) {
      throw new Error('AI provider is temporarily busy. Please try again shortly.')
    }

    throw new Error(data?.error?.message || `AI API Error: ${response.status}`)
  }

  if (data.choices?.[0]?.message?.content) {
    return data.choices[0].message.content
  }

  if (data.error) {
    throw new Error(data.error.message || JSON.stringify(data.error))
  }

  throw new Error('AI returned an empty response.')
}

function cleanJSONResponse(response) {
  let cleanResponse = response.trim()

  if (cleanResponse.startsWith('```json')) {
    cleanResponse = cleanResponse
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
  } else if (cleanResponse.startsWith('```')) {
    cleanResponse = cleanResponse.replace(/```\n?/g, '')
  }

  return cleanResponse.trim()
}

function parseRecommendationJSON(clean) {
  try {
    const parsed = JSON.parse(clean)
    return parsed.recommendations || []
  } catch {
    const extracted = clean.match(/\{[\s\S]*\}/)

    if (extracted) {
      const parsed = JSON.parse(extracted[0])
      return parsed.recommendations || []
    }

    throw new Error(
      'AI returned a response, but it was not in the required recommendation JSON format.'
    )
  }
}

export async function generateRecommendations(processedData) {
  if (!processedData) {
    throw new Error('No processed data provided')
  }

  const systemPrompt = `You are a fleet strategy AI for KeretaSewa AI.

Your job is to analyze the current fleet statistics and generate 2-3 business recommendations.

Base your recommendations ONLY on the fleet data provided by the user.
Do not invent vehicles, revenue, booking counts, or utilization numbers.

Focus on:
- improving utilization
- reducing idle days
- increasing revenue
- pricing optimization
- underperforming vehicles
- promotion strategy

You MUST respond with ONLY valid JSON.
No markdown.
No backticks.
No explanation outside JSON.

Use this exact structure:
{
  "recommendations": [
    {
      "title": "Brief action title",
      "category": "Utilization|Pricing|Protect",
      "action": "Specific action to take",
      "reasoning": "Why this action makes sense based on the provided fleet data",
      "impact": {
        "revenue": "+RM XXX/mo",
        "bookings": "+X bookings",
        "utilization": "+X%"
      },
      "confidence": "High|Medium|Low",
      "tradeoff": "Downside or risk"
    }
  ]
}`

  const dataContext = `
Current Fleet Performance:
- Total Revenue: RM${processedData.summary.revenue}
- Fleet Utilization: ${processedData.summary.utilization}%
- Total Idle Days: ${processedData.summary.idle_days}
- Total Bookings: ${processedData.summary.total_bookings}

Vehicle-by-Vehicle Breakdown:
${processedData.vehicles.map(v =>
  `- ${v.model}: ${v.utilization}% utilized, RM${v.revenue} revenue, ${v.idleDays} idle days, base price RM${v.basePrice}/day`
).join('\n')}

Demand Pattern:
- Weekday bookings: ${processedData.trend.weekday} (${processedData.trend.weekday_pct}%)
- Weekend bookings: ${processedData.trend.weekend} (${processedData.trend.weekend_pct}%)

Generate 2-3 overall strategic recommendations for this fleet.`

  try {
    const response = await callGLM(
      [{ role: 'user', content: dataContext }],
      systemPrompt
    )

    const clean = cleanJSONResponse(response)

    if (!clean) {
      throw new Error('AI returned empty response')
    }

    return parseRecommendationJSON(clean)
  } catch (error) {
    console.error('Failed to generate recommendations:', error)
    throw new Error(error.message || 'Failed to generate AI recommendations')
  }
}

export async function askAI(question, processedData, conversationHistory = []) {
  if (!processedData) {
    throw new Error('No processed data available yet')
  }

  const systemPrompt = `You are KeretaSewa AI, a smart assistant for a car rental business.

You must detect the user's intent.

RULES:

1. If the user asks about fleet/business topics such as:
- booking
- rent
- vehicle
- car
- pricing
- revenue
- utilization
- demand
- promotion
- profit
- operations

Then answer using the provided fleet data.

Use this format:

Verdict:
One clear sentence.

Key Reasoning:
• Point 1
• Point 2
• Point 3

Recommended Action:
1. Action 1
2. Action 2
3. Action 3

Key Takeaway:
One final summary sentence.

2. If the user asks casual/general questions such as:
- hello
- hi
- how are you
- thank you
- who are you
- what AI model are you

Reply naturally, friendly, and briefly.
Do NOT force fleet analysis.

3. If the user asks unrelated topics such as:
- homework
- politics
- celebrities
- games
- random facts
- coding unrelated to fleet

Politely reply:

I'm specialized in fleet and rental business decisions. Ask me about bookings, pricing, utilization, promotions, or profitability.

4. Rules:
- Use numbers from fleet data whenever relevant.
- Be concise and professional.
- Do not use markdown tables.
- Do not write very long paragraphs.`

  const dataContext = `
Current Fleet Data:
- Total Revenue: RM${processedData.summary.revenue}
- Fleet Utilization: ${processedData.summary.utilization}%
- Idle Days: ${processedData.summary.idle_days}
- Total Bookings: ${processedData.summary.total_bookings}

Vehicles:
${processedData.vehicles.map(v =>
  `- ${v.model}: ${v.utilization}% utilization, RM${v.basePrice}/day base price, RM${v.revenue} revenue, ${v.idleDays} idle days`
).join('\n')}

Demand:
- Weekday: ${processedData.trend.weekday_pct}%
- Weekend: ${processedData.trend.weekend_pct}%
`

  const messages = [
    ...conversationHistory,
    {
      role: 'user',
      content: `Fleet Context:\n${dataContext}\n\nQuestion: ${question}`,
    },
  ]

  return await callGLM(messages, systemPrompt)
}

export async function simulateScenario(scenario, processedData) {
  if (!processedData) {
    throw new Error('No processed data available yet')
  }

  const systemPrompt = `You are an AI assistant helping with scenario simulation for a car rental business.

Base your answer ONLY on the fleet data provided.

Respond with ONLY valid JSON:
{
  "scenario": "description of what changed",
  "predicted_impact": {
    "bookings_change": "+X or -X",
    "revenue_change": "+RM XXX or -RM XXX",
    "utilization_change": "+X% or -X%"
  },
  "reasoning": "Brief explanation based on the provided fleet data",
  "confidence": "High|Medium|Low"
}`

  const dataContext = `
Current State:
${processedData.vehicles.map(v =>
  `- ${v.model}: ${v.utilization}% utilized, RM${v.basePrice}/day, ${v.bookedDays} bookings/month`
).join('\n')}

Total Revenue: RM${processedData.summary.revenue}
Fleet Utilization: ${processedData.summary.utilization}%
`

  const response = await callGLM(
    [
      {
        role: 'user',
        content: `${dataContext}\n\nSimulate this scenario: ${scenario}`,
      },
    ],
    systemPrompt
  )

  return JSON.parse(cleanJSONResponse(response))
}