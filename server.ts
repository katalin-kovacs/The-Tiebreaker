import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '10mb' }));

// Helper to get Gemini client
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Helper to extract clean error message even if it's a JSON string
function formatErrorMessage(err: any): string {
  if (!err) return 'An unexpected error occurred.';
  const msg = err.message || `${err}`;
  try {
    // If msg is JSON like {"error":{"code":503,"message":"..."}}
    if (msg.trim().startsWith('{')) {
      const parsed = JSON.parse(msg);
      if (parsed.error?.message) {
        if (parsed.error.code === 503 || parsed.error.status === 'UNAVAILABLE') {
          return 'The AI service is experiencing a temporary spike in demand. Please try again in a few moments.';
        }
        return parsed.error.message;
      }
    }
  } catch {
    // ignore
  }

  if (msg.includes('503') || msg.includes('UNAVAILABLE') || msg.includes('high demand')) {
    return 'The AI model is experiencing a temporary spike in demand. Please try again in a few moments.';
  }

  return msg;
}

// Resilient Gemini generateContent with exponential backoff & model fallback
async function generateWithRetryAndFallback(ai: GoogleGenAI, configPayload: any) {
  // Try 3.8-flash first, then fallback to flash-latest or 3.1-flash-lite if experiencing 503
  const models = ['gemini-3.8-flash', 'gemini-flash-latest', 'gemini-3.1-flash-lite'];
  let lastError: any = null;

  for (const model of models) {
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        console.log(`[The Tiebreaker] Calling ${model} (attempt ${attempt}/3)...`);
        const response = await ai.models.generateContent({
          ...configPayload,
          model,
        });

        if (response && response.text) {
          return response;
        }
      } catch (err: any) {
        lastError = err;
        const errStr = `${err?.message || err}`;
        console.warn(`[The Tiebreaker] Attempt ${attempt} on ${model} failed:`, errStr);

        // Check if transient error (503, 429, UNAVAILABLE, or high demand)
        const isTransient =
          err?.status === 503 ||
          err?.code === 503 ||
          err?.status === 429 ||
          errStr.includes('503') ||
          errStr.includes('UNAVAILABLE') ||
          errStr.includes('high demand') ||
          errStr.includes('RESOURCE_EXHAUSTED');

        if (isTransient && attempt < 3) {
          // Exponential backoff wait: 1000ms, 2000ms
          await new Promise((resolve) => setTimeout(resolve, attempt * 1000));
          continue;
        }

        // If 3 attempts on this model failed or non-transient, try next fallback model
        break;
      }
    }
  }

  throw lastError || new Error('All model attempts failed.');
}

// POST /api/analyze-decision
app.post('/api/analyze-decision', async (req, res) => {
  try {
    const { title, options, context, primaryGoal } = req.body;

    if (!title || typeof title !== 'string' || !title.trim()) {
      return res.status(400).json({
        error: 'Please provide a decision or dilemma you want to resolve.',
      });
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.status(500).json({
        error: 'Gemini API key is not configured. Please check your Settings > Secrets panel.',
      });
    }

    // Filter valid user-provided options if any
    const validUserOptions = Array.isArray(options)
      ? options.filter((o: any) => o && typeof o.label === 'string' && o.label.trim().length > 0)
      : [];

    let optionsPromptInstruction = '';
    if (validUserOptions.length >= 2) {
      optionsPromptInstruction = `The user has specified these options to compare:
${validUserOptions
  .map(
    (opt: { id: string; label: string; description?: string }, idx: number) =>
      `Option ${idx + 1} [ID: "${opt.id}"]: "${opt.label}"${opt.description ? ` (Specifics: ${opt.description})` : ''}`
  )
  .join('\n')}`;
    } else if (validUserOptions.length === 1) {
      optionsPromptInstruction = `The user proposed one primary path: "${validUserOptions[0].label}"${
        validUserOptions[0].description ? ` (${validUserOptions[0].description})` : ''
      }.
Generate the contrasting counterpart or status quo path (e.g. Option B: "Remain in current situation / Alternative path") so there are at least 2 distinct options to compare.`;
    } else {
      optionsPromptInstruction = `The user did NOT specify any options.
Analyze the dilemma and automatically identify the 2 to 3 most logical, realistic, and contrasting paths/options for the user (e.g. Option A: "Proceed with X", Option B: "Maintain status quo Y", Option C: "Hybrid / Compromise Z"). Use IDs like "opt_1", "opt_2", etc.`;
    }

    const prompt = `You are "The Tiebreaker", an expert decision-making analyst and executive advisor.
Analyze this high-stakes decision dilemma with intellectual honesty, realistic trade-offs, and deep analytical rigor.

Dilemma Title: "${title.trim()}"
${context ? `Context & Constraints: "${context.trim()}"` : ''}
${primaryGoal ? `Primary Goal / Value Priority: "${primaryGoal.trim()}"` : ''}

${optionsPromptInstruction}

Perform a comprehensive multi-lens evaluation:
1. Identify/confirm the 2 to 4 options being compared (include 'id', 'label', and a concise 'description' for each).
2. Pros and Cons list for EACH option (with impact weight 1 to 5, category, and actionable mitigation for each con).
3. A side-by-side Comparison Matrix with 4 to 6 relevant evaluation criteria (e.g., Financial Impact, Stress & Well-being, Career / Long-term Growth, Reversibility, Alignment with Priorities). Score each option from 1 to 10 on each criterion with a short commentary.
4. A SWOT analysis (Strengths, Weaknesses, Opportunities, Threats) for EACH option.
5. The 10-10-10 Rule forecast for each option: How will the user feel in 10 minutes, 10 months, and 10 years?
6. A Pre-Mortem for each option: If this choice turns out to be a failure in 2 years, what was the likely root cause, early warning signs, and prevention?
7. An authoritative Tiebreaker Verdict: Recommended option, confidence score (50-100), key decisive reason, and critical blindspots.
8. A visceral Gut-Check prompt tailored to this specific dilemma.`;

    const response = await generateWithRetryAndFallback(ai, {
      contents: prompt,
      config: {
        systemInstruction: 'You are The Tiebreaker, an elite decision strategist. Provide balanced, candid, actionable decision intelligence with sharp clarity. Do not use generic filler. Be specific to the context provided.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: {
              type: Type.STRING,
              description: 'Clear, concise synthesis of the dilemma and core dilemma trade-offs.',
            },
            options: {
              type: Type.ARRAY,
              description: 'The options being evaluated (user-provided or AI-synthesized).',
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  label: { type: Type.STRING },
                  description: { type: Type.STRING },
                },
                required: ['id', 'label', 'description'],
              },
            },
            verdict: {
              type: Type.OBJECT,
              properties: {
                recommendedOptionId: { type: Type.STRING },
                recommendedOptionLabel: { type: Type.STRING },
                confidenceScore: { type: Type.INTEGER, description: 'Between 50 and 99' },
                headline: { type: Type.STRING, description: 'Catchy, decisive verdict headline' },
                rationale: { type: Type.STRING, description: 'Detailed rationale explaining why this option breaks the tie' },
                keyDecisiveFactor: { type: Type.STRING, description: 'The single most critical pivot point or condition' },
                blindspots: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: '2 to 4 potential cognitive biases or overlooked pitfalls',
                },
              },
              required: ['recommendedOptionId', 'recommendedOptionLabel', 'confidenceScore', 'headline', 'rationale', 'keyDecisiveFactor', 'blindspots'],
            },
            optionsAnalysis: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  optionId: { type: Type.STRING },
                  optionLabel: { type: Type.STRING },
                  pros: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        id: { type: Type.STRING },
                        title: { type: Type.STRING },
                        explanation: { type: Type.STRING },
                        category: { type: Type.STRING },
                        weight: { type: Type.INTEGER, description: 'Impact score from 1 (minor upside) to 5 (game-changing)' },
                      },
                      required: ['id', 'title', 'explanation', 'category', 'weight'],
                    },
                  },
                  cons: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        id: { type: Type.STRING },
                        title: { type: Type.STRING },
                        explanation: { type: Type.STRING },
                        category: { type: Type.STRING },
                        weight: { type: Type.INTEGER, description: 'Downside severity from 1 (mild hassle) to 5 (severe risk)' },
                        mitigation: { type: Type.STRING, description: 'Concrete action to reduce or handle this downside' },
                      },
                      required: ['id', 'title', 'explanation', 'category', 'weight', 'mitigation'],
                    },
                  },
                  swot: {
                    type: Type.OBJECT,
                    properties: {
                      strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
                      weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
                      opportunities: { type: Type.ARRAY, items: { type: Type.STRING } },
                      threats: { type: Type.ARRAY, items: { type: Type.STRING } },
                    },
                    required: ['strengths', 'weaknesses', 'opportunities', 'threats'],
                  },
                  tenTenTen: {
                    type: Type.OBJECT,
                    properties: {
                      tenMinutes: { type: Type.STRING },
                      tenMonths: { type: Type.STRING },
                      tenYears: { type: Type.STRING },
                    },
                    required: ['tenMinutes', 'tenMonths', 'tenYears'],
                  },
                  preMortem: {
                    type: Type.OBJECT,
                    properties: {
                      worstCaseScenario: { type: Type.STRING },
                      warningSigns: { type: Type.ARRAY, items: { type: Type.STRING } },
                      preventativeAction: { type: Type.STRING },
                    },
                    required: ['worstCaseScenario', 'warningSigns', 'preventativeAction'],
                  },
                },
                required: ['optionId', 'optionLabel', 'pros', 'cons', 'swot', 'tenTenTen', 'preMortem'],
              },
            },
            comparisonMatrix: {
              type: Type.OBJECT,
              properties: {
                criteria: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      name: { type: Type.STRING },
                      description: { type: Type.STRING },
                      defaultWeight: { type: Type.INTEGER, description: 'Importance from 1 to 5' },
                      scores: {
                        type: Type.ARRAY,
                        items: {
                          type: Type.OBJECT,
                          properties: {
                            optionId: { type: Type.STRING },
                            score: { type: Type.INTEGER, description: 'Score out of 10' },
                            comment: { type: Type.STRING },
                          },
                          required: ['optionId', 'score', 'comment'],
                        },
                      },
                    },
                    required: ['id', 'name', 'description', 'defaultWeight', 'scores'],
                  },
                },
              },
              required: ['criteria'],
            },
            gutCheckPrompt: {
              type: Type.STRING,
              description: 'A provocative psychological prompt for testing emotional alignment.',
            },
          },
          required: ['summary', 'options', 'verdict', 'optionsAnalysis', 'comparisonMatrix', 'gutCheckPrompt'],
        },
      },
    });

    const rawText = response.text;
    if (!rawText) {
      throw new Error('Received empty response from Gemini model');
    }

    const parsedData = JSON.parse(rawText);
    return res.json(parsedData);
  } catch (error: any) {
    console.error('Error analyzing decision:', error);
    return res.status(500).json({
      error: formatErrorMessage(error),
    });
  }
});

// POST /api/refine-decision - Ask follow-up questions or introduce hypothetical "What if..."
app.post('/api/refine-decision', async (req, res) => {
  try {
    const { decisionTitle, options, question, currentVerdict } = req.body;

    if (!question) {
      return res.status(400).json({ error: 'Question is required' });
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.status(500).json({
        error: 'Gemini API key is not configured. Please check your Settings > Secrets panel.',
      });
    }

    const prompt = `You are The Tiebreaker decision assistant.
The user is evaluating this decision: "${decisionTitle}".
Options: ${JSON.stringify(options)}
Current AI Verdict: ${JSON.stringify(currentVerdict)}

User asks this follow-up query / "What-if" scenario:
"${question}"

Provide a crisp, direct analysis in JSON:
1. Clear answer addressing the question directly.
2. How this alters the balance between the options.
3. Whether this changes the recommendation or raises new considerations.
4. 2 recommended next steps or negotiation angles.`;

    const response = await generateWithRetryAndFallback(ai, {
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            answer: { type: Type.STRING },
            verdictImpact: { type: Type.STRING, description: 'Does this shift the tiebreaker?' },
            optionImpacts: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  optionId: { type: Type.STRING },
                  impact: { type: Type.STRING },
                },
                required: ['optionId', 'impact'],
              },
            },
            actionSteps: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: ['answer', 'verdictImpact', 'optionImpacts', 'actionSteps'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (error: any) {
    console.error('Error in refine-decision:', error);
    return res.status(500).json({
      error: formatErrorMessage(error),
    });
  }
});

// Vite middleware in dev or static serving in production
async function setupServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`The Tiebreaker server running on http://0.0.0.0:${PORT}`);
  });
}

setupServer();
