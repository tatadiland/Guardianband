import express from 'express';

const router = express.Router();

router.post('/ask', async (req, res) => {
    try {
        const { message } = req.body;

        if (!message || !message.trim()) {
            return res.status(400).json({ error: 'Message is required' });
        }

        const apiKey = process.env.OPENAI_API_KEY;

        if (!apiKey) {
            // Return a simulated response when no API key is configured
            const mockResponses = [
                "I can help with general child health guidance. However, please remember I'm not a substitute for a qualified medical professional. For this question, I'd recommend consulting your child's pediatrician for personalized advice.",
                "That's a great question about child well-being! General guidance suggests maintaining regular health check-ups, a balanced diet, adequate sleep (9-11 hours for school-age children), and daily physical activity. Always consult a healthcare provider for specific medical concerns.",
                "Child health is so important! For general wellness, the WHO recommends at least 60 minutes of moderate physical activity daily for children. For specific symptoms or medical conditions, please consult a licensed pediatrician.",
                "I understand your concern. While I can provide general information, every child is unique. Please consult your child's doctor for tailored medical advice. In the meantime, ensure your child stays hydrated, gets enough sleep, and eats nutritious meals.",
            ];
            const randomResponse = mockResponses[Math.floor(Math.random() * mockResponses.length)];
            return res.json({
                reply: randomResponse,
                simulated: true,
                disclaimer: "This is a general guidance message. GuardianBand AI is not a replacement for a qualified medical professional."
            });
        }

        // Real OpenAI API call
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [
                    {
                        role: 'system',
                        content: 'You are GuardianBand AI Health Assistant. You help parents with general child health and well-being guidance. Always be clear that your responses are general information and not a substitute for professional medical advice. Keep answers concise, warm and helpful.'
                    },
                    {
                        role: 'user',
                        content: message
                    }
                ],
                max_tokens: 500,
                temperature: 0.7,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('OpenAI API error:', errorData);
            return res.status(502).json({ error: 'AI service temporarily unavailable. Please try again later.' });
        }

        const data = await response.json();
        const reply = data.choices?.[0]?.message?.content || 'I could not generate a response. Please try again.';

        res.json({
            reply,
            simulated: false,
            disclaimer: "This is general guidance. GuardianBand AI is not a replacement for a qualified medical professional."
        });

    } catch (error) {
        console.error('AI route error:', error);
        res.status(500).json({ error: 'An error occurred while processing your request.' });
    }
});

export default router;
