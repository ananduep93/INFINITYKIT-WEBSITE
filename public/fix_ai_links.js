const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

html = html.replace(
    /onclick='openFolder\(\\"pdf-tools\\"\); document\.getElementById\(\\"allToolsSection\\"\)\.scrollIntoView\(\{behavior: \\"smooth\\"\}\);'/g, 
    "href='folder/pdf-tools.html'"
);

html = html.replace(
    /onclick='openFolder\(\\"expense-tracker\\"\); document\.getElementById\(\\"allToolsSection\\"\)\.scrollIntoView\(\{behavior: \\"smooth\\"\}\);'/g, 
    "href='folder/expense-tracker.html'"
);

html = html.replace(
    /onclick='openFolder\(\\"survey-hub\\"\); document\.getElementById\(\\"allToolsSection\\"\)\.scrollIntoView\(\{behavior: \\"smooth\\"\}\);'/g, 
    "href='folder/survey-hub.html'"
);

html = html.replace(
    /onclick='openFolder\(\\"math-tools\\"\); document\.getElementById\(\\"allToolsSection\\"\)\.scrollIntoView\(\{behavior: \\"smooth\\"\}\);'/g, 
    "href='folder/math-tools.html'"
);

html = html.replace(
    /onclick='openFolder\(\\"utilities\\"\); document\.getElementById\(\\"allToolsSection\\"\)\.scrollIntoView\(\{behavior: \\"smooth\\"\}\);'/g, 
    "href='folder/utilities.html'"
);

// Remove the obsolete href='#' from the AI links to avoid conflict with the new href
html = html.replace(/<a href='#' href='folder\//g, "<a href='folder/");

fs.writeFileSync('index.html', html);
