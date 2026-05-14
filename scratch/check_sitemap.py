
import os
import re

sitemap_path = r'c:\Users\anand\OneDrive\Documents\INFINITY KIT\sitemap.xml'
tools_dir = r'c:\Users\anand\OneDrive\Documents\INFINITY KIT\tools'

with open(sitemap_path, 'r') as f:
    sitemap_content = f.read()

existing_locs = re.findall(r'<loc>https://infinitykit.online/tools/(.*?)</loc>', sitemap_content)
existing_tools = [loc.replace('.html', '') for loc in existing_locs]

files = os.listdir(tools_dir)
current_tools = [f.replace('.html', '') for f in files if f.endswith('.html')]

missing_tools = [t for t in current_tools if t not in existing_tools]

print("Missing tools in sitemap:")
for t in missing_tools:
    print(t)
