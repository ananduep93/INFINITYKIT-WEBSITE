const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// Replace dropdown links
html = html.replace(/<a href="#" onclick="openFolder\('quick-tools'\);[^>]*>Quick Tools &rarr;<\/a>/g, '<a href="folder/quick-tools.html">Quick Tools &rarr;</a>');
html = html.replace(/<a href="#" onclick="openFolder\('data-tools'\);[^>]*>Data Tools &rarr;<\/a>/g, '<a href="folder/data-tools.html">Data Tools &rarr;</a>');
html = html.replace(/<a href="#" onclick="openFolder\('text-tools'\);[^>]*>Text Tools &rarr;<\/a>/g, '<a href="folder/text-tools.html">Text Tools &rarr;</a>');
html = html.replace(/<a href="#" onclick="openFolder\('pdf-tools'\);[^>]*>PDF Toolkit &rarr;<\/a>/g, '<a href="folder/pdf-tools.html">PDF Toolkit &rarr;</a>');
html = html.replace(/<a href="#" onclick="openFolder\('expense-tracker'\);[^>]*>Finance &rarr;<\/a>/g, '<a href="folder/expense-tracker.html">Finance &rarr;</a>');
html = html.replace(/<a href="#" onclick="openFolder\('student-tools'\);[^>]*>Education &rarr;<\/a>/g, '<a href="folder/student-tools.html">Education &rarr;</a>');

// Replace AI chatbot response links
html = html.replace(/openFolder\("pdf-tools"\); document\.getElementById\("allToolsSection"\)\.scrollIntoView\(\{behavior: "smooth"\}\);/g, "location.href='folder/pdf-tools.html'");
html = html.replace(/openFolder\("expense-tracker"\); document\.getElementById\("allToolsSection"\)\.scrollIntoView\(\{behavior: "smooth"\}\);/g, "location.href='folder/expense-tracker.html'");
html = html.replace(/openFolder\("survey-hub"\); document\.getElementById\("allToolsSection"\)\.scrollIntoView\(\{behavior: "smooth"\}\);/g, "location.href='folder/survey-hub.html'");
html = html.replace(/openFolder\("math-tools"\); document\.getElementById\("allToolsSection"\)\.scrollIntoView\(\{behavior: "smooth"\}\);/g, "location.href='folder/math-tools.html'");
html = html.replace(/openFolder\("utilities"\); document\.getElementById\("allToolsSection"\)\.scrollIntoView\(\{behavior: "smooth"\}\);/g, "location.href='folder/utilities.html'");

fs.writeFileSync('index.html', html);
console.log('Replaced links in index.html');
