import express from 'express';
import OpenAI from 'openai';
import process from 'node:process';

const router = express.Router();

const MODEL = 'gpt-4.1';
const SAFETY_QNA_AUTH_TOKEN = 'skn_7f2c91b4d8a34e6f9b12c5d0a8e3f741';

const SAFETY_INSTRUCTION =
  'You must answer only using the provided safety documents. Keep the answer crisp, direct, and ideally under 100 to 150 words. If the answer is not present, say the information is not found in the approved safety sources.';

const SAFETY_DOMAINS = Object.freeze({
  CHEMICAL_HANDLING_SAFETY: 'chemical-handling-safety',
  MATERIAL_HANDLING_SAFETY: 'material-handling-safety',
  PPE_USAGE: 'ppe-usage',
  SAFETY_BASICS: 'safety-basics',
  HEIGHT_SAFETY: 'height-safety'
});

const VECTOR_STORE_CONFIG_BY_NAME = Object.freeze({
  'chemical-safety-docs': {
    vectorStoreId: 'vs_69b3d7ea47688191a771da00d4a0464d',
    name: 'chemical-safety-docs',
    uploadedAt: '2026-03-13T09:25:34.955Z'
  },
  'material-handling-safety-docs': {
    vectorStoreId: 'vs_69ba557e0b7c819197869afad2089a7e',
    name: 'material-handling-safety-docs',
    uploadedAt: '2026-03-13T09:25:34.955Z'
  },
  'height-safety-docs': {
    vectorStoreId: 'vs_69ba559cfbcc8191900e71318e5b2042',
    name: 'height-safety-docs',
    uploadedAt: '2026-03-13T09:25:34.955Z'
  },
  'ppe-usage-docs': {
    vectorStoreId: 'vs_69ba558ab1b081918c65764b6ba4fa8e',
    name: 'ppe-usage-docs',
    uploadedAt: '2026-03-13T09:25:34.955Z'
  },
  'safety-basics-docs': {
    vectorStoreId: 'vs_69ba5594136c8191a1518bffb2e1c7bc',
    name: 'safety-basics-docs',
    uploadedAt: '2026-03-13T09:25:34.955Z'
  }
});

const DOMAIN_TO_VECTOR_STORE_NAME = Object.freeze({
  [SAFETY_DOMAINS.CHEMICAL_HANDLING_SAFETY]: 'chemical-safety-docs',
  [SAFETY_DOMAINS.MATERIAL_HANDLING_SAFETY]: 'material-handling-safety-docs',
  [SAFETY_DOMAINS.PPE_USAGE]: 'ppe-usage-docs',
  [SAFETY_DOMAINS.SAFETY_BASICS]: 'safety-basics-docs',
  [SAFETY_DOMAINS.HEIGHT_SAFETY]: 'height-safety-docs'
});

function collectSources(response) {
  const output = Array.isArray(response.output) ? response.output : [];
  const sources = new Map();

  for (const item of output) {
    if (item.type !== 'message' || !Array.isArray(item.content)) {
      continue;
    }

    for (const contentItem of item.content) {
      if (contentItem.type !== 'output_text' || !Array.isArray(contentItem.annotations)) {
        continue;
      }

      for (const annotation of contentItem.annotations) {
        if (annotation.type !== 'file_citation') {
          continue;
        }

        const key = `${annotation.file_id}:${annotation.filename}`;
        if (!sources.has(key)) {
          sources.set(key, {
            file_id: annotation.file_id,
            filename: annotation.filename
          });
        }
      }
    }
  }

  return Array.from(sources.values());
}

router.post('/', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const bearerToken = typeof authHeader === 'string' ? authHeader.replace(/^Bearer\s+/i, '').trim() : '';

    if (bearerToken !== SAFETY_QNA_AUTH_TOKEN) {
      return res.status(401).json({
        error: 'Unauthorized.'
      });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({
        error: 'OPENAI_API_KEY is not configured.'
      });
    }

    // `domain` can be chemical safety, industrial safety, PPE, etc.
    const domain = typeof req.body?.domain === 'string' ? req.body.domain.trim() : '';
    // `question` is the full question being sent by the caller.
    const question = typeof req.body?.question === 'string' ? req.body.question.trim() : '';

    if (!domain) {
      return res.status(400).json({ error: 'A domain is required.' });
    }

    if (!Object.values(SAFETY_DOMAINS).includes(domain)) {
      return res.status(400).json({
        error: 'Invalid domain.',
        allowedDomains: Object.values(SAFETY_DOMAINS)
      });
    }

    if (!question) {
      return res.status(400).json({ error: 'A question is required.' });
    }

    const vectorStoreName = DOMAIN_TO_VECTOR_STORE_NAME[domain];
    const vectorStoreConfig = vectorStoreName
      ? VECTOR_STORE_CONFIG_BY_NAME[vectorStoreName]
      : null;
    const vectorStoreId = vectorStoreConfig?.vectorStoreId || null;

    if (!vectorStoreId) {
      return res.status(400).json({
        error: 'This domain does not exist yet.',
        domain
      });
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const response = await openai.responses.create({
      model: MODEL,
      instructions: SAFETY_INSTRUCTION,
      input: question,
      tools: [
        {
          type: 'file_search',
          vector_store_ids: [vectorStoreId],
          max_num_results: 6
        }
      ],
      include: ['file_search_call.results']
    });

    return res.json({
      answer: response.output_text || 'The information is not found in the approved safety sources.',
      sources: collectSources(response)
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected server error.';
    return res.status(500).json({ error: message });
  }
});

export default router;
