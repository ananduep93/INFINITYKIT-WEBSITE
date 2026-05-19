const fs = require('fs');

const adminPath = 'c:\\Users\\anand\\OneDrive\\Documents\\INFINITY KIT\\admin.html';
if (fs.existsSync(adminPath)) {
    let content = fs.readFileSync(adminPath, 'utf8');

    const affiliateCardEnd = `            <button id="submitAffiliate" class="admin-btn">Add Product 🎁</button>
            <p id="affiliateSuccessMsg" class="success-msg">Product added successfully!</p>
        </div>`;

    const aiPromptCard = `            <button id="submitAffiliate" class="admin-btn">Add Product 🎁</button>
            <p id="affiliateSuccessMsg" class="success-msg">Product added successfully!</p>
        </div>

        <!-- AI Prompts Upload Card -->
        <div class="admin-card">
            <h2>AI Prompt Upload</h2>
            <p style="margin-bottom: 20px; opacity: 0.8;">Upload images and prompts</p>
            <div class="form-group">
                <label for="promptCategory">Category</label>
                <select id="promptCategory" style="width: 100%; padding: 12px 15px; border: 2px solid #eee; border-radius: 10px; font-size: 1rem; background: transparent; color: inherit; box-sizing: border-box;">
                    <option value="men" style="color: #000;">Men</option>
                    <option value="women" style="color: #000;">Women</option>
                </select>
            </div>
            <div class="form-group">
                <label for="promptImage">Upload Image (Max 5MB)</label>
                <input type="file" id="promptImage" accept="image/*">
            </div>
            <div class="form-group">
                <label for="promptText">Prompt Text</label>
                <textarea id="promptText" placeholder="Enter the AI prompt here..."></textarea>
            </div>
            <button id="submitPromptBtn" class="admin-btn">Upload Prompt 🎨</button>
            <p id="promptSuccessMsg" class="success-msg">Prompt uploaded successfully!</p>
        </div>`;

    if (content.includes(affiliateCardEnd)) {
        content = content.replace(affiliateCardEnd, aiPromptCard);
        
        // Add JS logic for the new card
        const jsEnd = `                setTimeout(() => {
                    affiliateSuccessMsg.style.display = 'none';
                }, 4000);
            } catch (error) {
                console.error("Error adding affiliate: ", error);
                alert("Failed to add product. Check console.");
            } finally {
                submitAffiliateBtn.disabled = false;
                submitAffiliateBtn.textContent = 'Add Product 🎁';
            }
        });`;

        const newJsLogic = `                setTimeout(() => {
                    affiliateSuccessMsg.style.display = 'none';
                }, 4000);
            } catch (error) {
                console.error("Error adding affiliate: ", error);
                alert("Failed to add product. Check console.");
            } finally {
                submitAffiliateBtn.disabled = false;
                submitAffiliateBtn.textContent = 'Add Product 🎁';
            }
        });

        // Submit AI Prompt Logic
        const submitPromptBtn = document.getElementById('submitPromptBtn');
        const promptCategory = document.getElementById('promptCategory');
        const promptImage = document.getElementById('promptImage');
        const promptText = document.getElementById('promptText');
        const promptSuccessMsg = document.getElementById('promptSuccessMsg');

        submitPromptBtn.addEventListener('click', async () => {
            const category = promptCategory.value;
            const text = promptText.value.trim();
            const file = promptImage.files[0];

            if (!text || !file) {
                alert("Please provide both an image and prompt text.");
                return;
            }

            submitPromptBtn.disabled = true;
            submitPromptBtn.textContent = 'Uploading...';
            promptSuccessMsg.style.display = 'none';

            try {
                // Dynamically import storage functions since they aren't imported in admin.html by default
                const { ref, uploadBytes, getDownloadURL } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js');
                const { storage } = await import('./firebase-config.js');

                // Upload Image
                const storageRef = ref(storage, \`aiPrompts/\${category}/\${Date.now()}_\${file.name}\`);
                const snapshot = await uploadBytes(storageRef, file);
                const downloadURL = await getDownloadURL(snapshot.ref);

                // Save to Firestore
                await addDoc(collection(db, 'aiPrompts'), {
                    category: category,
                    imageUrl: downloadURL,
                    prompt: text,
                    timestamp: serverTimestamp()
                });

                promptSuccessMsg.style.display = 'block';
                promptText.value = '';
                promptImage.value = '';
                
                setTimeout(() => {
                    promptSuccessMsg.style.display = 'none';
                }, 4000);
            } catch (error) {
                console.error("Error adding prompt: ", error);
                alert("Failed to upload prompt. Check console.");
            } finally {
                submitPromptBtn.disabled = false;
                submitPromptBtn.textContent = 'Upload Prompt 🎨';
            }
        });`;

        if (content.includes(jsEnd)) {
            content = content.replace(jsEnd, newJsLogic);
            fs.writeFileSync(adminPath, content, 'utf8');
            console.log('Successfully added AI Prompts to admin.html');
        } else {
            console.log('Could not find JS logic insertion point in admin.html');
        }
    } else {
        console.log('Could not find HTML insertion point in admin.html');
    }
}
