module.exports = async (req, res) => {
    // CORS headers
    const allowedOrigins = ['https://infinitykit.online', 'http://localhost:3000'];
    const origin = req.headers.origin;
    const isLocal = origin && (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:'));
    if (allowedOrigins.includes(origin) || isLocal) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const templates = [
        {
            category: "Writing",
            prompts: [
                { title: "Cold Email Pitch", description: "Draft a high-converting cold email pitch for B2B prospects.", template: "Write a personalized, highly compelling B2B cold email to a [Target Job Title] at [Company Name]. The goal is to secure a 15-minute call to discuss how [Your Product/Service] solves [Prospect pain point]. Keep it conversational, crisp, and under 150 words." },
                { title: "Blog Outline Creator", description: "Structure a detailed and engaging blog post layout.", template: "Create a highly engaging, SEO-optimized blog post outline for the topic '[Blog Topic]'. Include suggested H2/H3 subheadings, a click-worthy title, and a brief description of what to cover under each section." }
            ]
        },
        {
            category: "Coding",
            prompts: [
                { title: "Bug Finder & Explainer", description: "Locate code bugs and get refactoring ideas.", template: "Analyze the following [Programming Language] code for potential bugs, security holes, and performance bottlenecks. Explain any found issues and provide the fully optimized, corrected code block:\n\n[Paste Code Here]" },
                { title: "Regex Generator", description: "Generate matching Regex patterns easily.", template: "Create a regular expression (regex) to match: [Describe pattern you want to match, e.g. Valid international phone numbers]. Explain the regex pattern in plain English." }
            ]
        },
        {
            category: "SEO",
            prompts: [
                { title: "High CTR Metatags", description: "Generate metatags that prompt higher clicks.", template: "Generate 5 click-worthy SEO Titles (under 60 chars) and 5 Meta Descriptions (under 155 chars) optimized for the keyword '[Target Keyword]' describing '[Page Topic]'." }
            ]
        }
    ];

    return res.status(200).json({ templates });
};
