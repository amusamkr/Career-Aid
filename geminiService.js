// services/geminiService.js
async function generateExplanation(studentName, courseName, academicScore, aspirationScore, aptitudeScore, preferredField, aptitudeCategory) {
  const prompt = `You are a friendly career advisor for a Nigerian secondary school student.
Write a short, encouraging explanation (2-3 sentences, plain language, no jargon) for why "${courseName}" is being recommended to ${studentName}.

Context:
- Academic fit score: ${academicScore}/100 (based on their subject scores)
- Aspiration fit: ${aspirationScore}/100 (they said they're interested in "${preferredField}")
- Aptitude fit: ${aptitudeScore}/100 (their quiz result showed a "${aptitudeCategory}" inclination)

Write directly to the student ("you"), be specific about their strengths, and keep it warm but honest.`;

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${process.env.GEMINI_API_KEY}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Gemini API error:', data);
      return 'AI explanation unavailable at this time.';
    }

    return data.candidates[0].content.parts[0].text;
  } catch (err) {
    console.error('Gemini API error:', err);
    return 'AI explanation unavailable at this time.';
  }
}

module.exports = { generateExplanation };