const fs = require('fs');
let content = fs.readFileSync('c:\\Users\\anand\\OneDrive\\Documents\\INFINITY KIT\\index.html', 'utf8');

// Extract the search section
const searchSectionStart = '            <!-- Smart Search Section -->';
const searchSectionEnd = '            <!-- Featured Tools Showcase -->';

const searchStart = content.indexOf(searchSectionStart);
const featuredStart = content.indexOf(searchSectionEnd);

const searchSection = content.substring(searchStart, featuredStart);
const featuredSection = content.indexOf('            <!-- Categories section removed');
const featuredEnd = content.substring(featuredStart, featuredSection);

// Remove search section from its current position
// And insert it after the featured section end
const contentWithoutSearch = content.substring(0, searchStart) + searchSectionEnd + content.substring(featuredStart + searchSectionEnd.length);

// Now find where featured section ends in the new content
const newFeaturedEnd = contentWithoutSearch.indexOf('            <!-- Categories section removed');
const insertPoint = newFeaturedEnd;

// Insert the search section here (without the searchSectionEnd marker since it's already there)
const searchSectionContent = searchSection.substring(searchSectionStart.length - 0); // just the section HTML

const finalContent = 
    contentWithoutSearch.substring(0, insertPoint) +
    '            <!-- Smart Search Section -->\n' +
    searchSection.substring(searchSectionStart.length + 1, searchSection.length) +
    contentWithoutSearch.substring(insertPoint);

fs.writeFileSync('c:\\Users\\anand\\OneDrive\\Documents\\INFINITY KIT\\index.html', finalContent, 'utf8');
console.log('Done! Search bar moved after Featured Tools.');
console.log('Search section length:', searchSection.length);
