const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// 1. Scroll Reveal Script
if (!html.includes('IntersectionObserver')) {
    const revealScript = `
    <script>
        // Scroll Reveal Animations
        document.addEventListener('DOMContentLoaded', () => {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                    }
                });
            }, { threshold: 0.1 });

            document.querySelectorAll('.feature-card, .story-card, .folder-card, .blog-card, .section-heading').forEach(el => {
                el.classList.add('scroll-reveal');
                observer.observe(el);
            });
        });
    </script>
</body>`;
    html = html.replace('</body>', revealScript);
}

// 2. Chatbot replacement
const chatBotHTML = `
                            <div class="glass-card-mockup floating-tool t3" style="width: 280px; padding: 15px; display: flex; flex-direction: column; gap: 10px; cursor: default;" onclick="event.stopPropagation();">
                                <div style="display: flex; align-items: center; gap: 10px; border-bottom: 1px solid rgba(0,0,0,0.1); padding-bottom: 10px;">
                                    <span style="font-size: 24px; background: #e0e7ff; border-radius: 50%; padding: 5px;">🤖</span>
                                    <div>
                                        <h4 style="margin: 0; font-size: 0.9rem; color: #0145F2;">Infinity AI</h4>
                                        <span style="font-size: 0.7rem; color: #10b981;">● Online</span>
                                    </div>
                                </div>
                                <div id="miniChatHistory" style="height: 120px; overflow-y: auto; font-size: 0.8rem; display: flex; flex-direction: column; gap: 8px;">
                                    <div style="background: rgba(1, 69, 242, 0.1); padding: 8px; border-radius: 8px 8px 8px 0; color: #333; width: fit-content; max-width: 90%;">Hi! I can help you find tools in Infinity Kit. Try asking "Where is PDF merger?"</div>
                                </div>
                                <div style="display: flex; gap: 5px; margin-top: 5px;">
                                    <input type="text" id="miniChatInput" placeholder="Ask about tools..." style="width: 100%; padding: 8px; border-radius: 6px; border: 1px solid #ddd; font-size: 0.8rem;" onkeypress="if(event.key === 'Enter') sendMiniChat()">
                                    <button onclick="sendMiniChat()" style="background: #0145F2; color: white; border: none; border-radius: 6px; padding: 0 10px; cursor: pointer;">&rarr;</button>
                                </div>
                            </div>
`;

if(html.includes('floating-tool t3 d-none-mobile" onclick="document.getElementById(\'searchBar\').value=\'AI\'')) {
    html = html.replace(/<div class="glass-card-mockup floating-tool t3 d-none-mobile" onclick="document\.getElementById\('searchBar'\)\.value='AI'; document\.getElementById\('searchBar'\)\.dispatchEvent\(new Event\('input'\)\);">[\s\S]*?<\/div>/, chatBotHTML);
}

// 3. Mini Chatbot Logic
const chatBotLogic = `
    <script>
        function sendMiniChat() {
            const input = document.getElementById('miniChatInput');
            const history = document.getElementById('miniChatHistory');
            const text = input.value.trim().toLowerCase();
            if(!text) return;
            
            // Add user message
            history.innerHTML += \`<div style="background: #0145F2; color: white; padding: 8px; border-radius: 8px 8px 0 8px; align-self: flex-end; max-width: 90%;">\${input.value}</div>\`;
            input.value = '';
            
            // Process bot response
            setTimeout(() => {
                let response = "I'm not sure. Explore the tools below!";
                if(text.includes('pdf')) response = "PDF tools are in the 'PDF Toolkit' folder. I can open it for you! <a href='#' onclick='openFolder(\"pdf-tools\"); document.getElementById(\"allToolsSection\").scrollIntoView();' style='color:#0145F2; font-weight:bold;'>Click here</a>";
                else if(text.includes('expense') || text.includes('finance') || text.includes('money')) response = "Finance tools are in the 'Expense Tracker' folder! <a href='#' onclick='openFolder(\"expense-tracker\"); document.getElementById(\"allToolsSection\").scrollIntoView();' style='color:#0145F2; font-weight:bold;'>Open Finance</a>";
                else if(text.includes('survey') || text.includes('form')) response = "Check out the 'Survey Hub' for creating surveys! <a href='#' onclick='openFolder(\"survey-hub\"); document.getElementById(\"allToolsSection\").scrollIntoView();' style='color:#0145F2; font-weight:bold;'>Open Surveys</a>";
                else if(text.includes('ai') || text.includes('chatbot')) response = "We have many AI tools in the system, try searching 'AI' in the search bar below!";
                else if(text.includes('hello') || text.includes('hi')) response = "Hello! Ask me about any category like PDF, Finance, or Surveys.";
                
                history.innerHTML += \`<div style="background: rgba(1, 69, 242, 0.1); padding: 8px; border-radius: 8px 8px 8px 0; color: #333; max-width: 90%;">\${response}</div>\`;
                history.scrollTop = history.scrollHeight;
            }, 500);
        }
    </script>
</body>`;
if (!html.includes('sendMiniChat()')) {
    html = html.replace('</body>', chatBotLogic);
}

fs.writeFileSync('index.html', html);
