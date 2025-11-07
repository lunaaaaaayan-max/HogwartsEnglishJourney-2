const { GoogleGenAI } = require('@google/genai');

// 在 translate.js 文件中
import { GoogleGenAI } from '@google/genai';

// 确保 API 密钥是从环境变量中读取的
const apiKey = process.env.GEMINI_API_KEY; 

if (!apiKey) {
    // 如果没有 API Key，返回错误
    return new Response(JSON.stringify({ error: "GEMINI_API_KEY not set" }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
    });
}

const ai = new GoogleGenAI({ apiKey });

module.exports = async (req, res) => {
    // 设置 CORS 头
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(204).end();
        return;
    }

    if (req.method !== 'POST' || !ai) {
        res.status(405).json({ success: false, error: 'Method Not Allowed or API Key Missing in Environment.' });
        return;
    }

    try {
        const { word } = req.body;
        if (!word) {
            return res.status(400).json({ success: false, error: 'Missing "word" parameter in request body.' });
        }

        const prompt = `Provide a detailed definition, part of speech (词性), Chinese translation (中文翻译), and a concise example sentence (例句) for the English word: "${word}". Format the response clearly using Markdown (like **bold** and *italics*), do not use any preamble or introduction.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [{ role: 'user', parts: [{ text: prompt }] }]
        });

        res.status(200).json({ success: true, translation: response.text });

    } catch (e) {
        console.error('Gemini Proxy Error:', e);
        res.status(500).json({ success: false, error: 'Internal Server Error during AI call.', details: e.message });
    }
};
