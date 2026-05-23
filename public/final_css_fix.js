const fs = require('fs');
let css = fs.readFileSync('app.css', 'utf8');

css += `
/* Fix text color on hover for tools and folders */
.folder-card:hover .folder-name, .folder-card:hover .folder-count,
.tool-card:hover .tool-name, .tool-card:hover .tool-tag {
    color: white !important;
}

.folder-card:hover .folder-count, .tool-card:hover .tool-tag {
    background: rgba(255, 255, 255, 0.2) !important;
}

/* Make features into cards */
.feature-card {
    background: white;
    border: 1px solid rgba(0, 161, 155, 0.1);
    border-radius: 20px;
    padding: 30px 20px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.03);
    transition: transform 0.3s ease;
}

.feature-card:hover {
    transform: translateY(-5px);
    border-color: rgba(0, 161, 155, 0.3);
}

.feature-card p {
    font-size: 0.9rem;
    color: rgba(29, 29, 31, 0.7);
    margin-top: 15px;
    line-height: 1.5;
}
`;

fs.writeFileSync('app.css', css);
