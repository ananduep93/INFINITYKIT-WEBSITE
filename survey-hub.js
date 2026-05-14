import { 
    db, storage, auth, doc, setDoc, getDoc, collection, query, where, getDocs, addDoc, deleteDoc, serverTimestamp, orderBy, ref, uploadBytes, getDownloadURL 
} from './firebase-config.js';
import { imgbbConfig } from './firebase-api-keys.js';

const SURVEYS_COLLECTION = 'tools';
const SURVEY_HUB_DOC = 'surveyHub';
const RESPONSES_DOC = 'surveyResponses';

// Inject CSS for Survey Hub
(function injectStyles() {
    if (document.getElementById('survey-hub-styles')) return;
    const style = document.createElement('style');
    style.id = 'survey-hub-styles';
    style.textContent = `
        .response-viewer { max-width: 100%; margin-top: 20px; }
        .viewer-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; flex-wrap: wrap; gap: 15px; }
        .viewer-actions { display: flex; gap: 10px; }
        .viewer-actions button { padding: 10px 20px; border-radius: 8px; border: none; cursor: pointer; background: #eee; }
        .btn-pdf { background: var(--primary-color, #667eea) !important; color: white !important; }
        .individual-response { margin-bottom: 20px; padding: 20px; border-radius: 12px; border-left: 5px solid var(--primary-color, #667eea); background: rgba(255,255,255,0.05); }
        .ans-row { margin-top: 12px; display: flex; flex-direction: column; gap: 5px; }
        .ans-row strong { color: var(--primary-color, #667eea); font-size: 0.95rem; }
        .ans-value { font-size: 1rem; color: inherit; padding-left: 0; }
        .submitted-at { font-size: 0.85rem; color: #888; margin-bottom: 15px; display: block; }
        .preview-img { max-width: 100%; height: auto; max-height: 250px; object-fit: contain; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1); margin-top: 8px; display: block; }
        @media (min-width: 768px) {
            .preview-img { max-width: 400px; }
        }
    `;
    document.head.appendChild(style);
})();

// Helper to get survey subcollection path
function getSurveyPath(userId) {
    return collection(db, 'users', userId, 'tools', 'surveyHub', 'surveys');
}

// Helper to get responses subcollection path
function getResponsePath(surveyId) {
    return collection(db, SURVEYS_COLLECTION, RESPONSES_DOC, surveyId);
}

/**
 * IMGBB UPLOAD HELPER
 */
async function uploadToImgBB(file) {
    if (!imgbbConfig.apiKey) {
        throw new Error('ImgBB API key is missing. Please add it to firebase-api-keys.js');
    }

    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch(`https://api.imgbb.com/1/upload?key=${imgbbConfig.apiKey}`, {
        method: 'POST',
        body: formData
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error?.message || 'ImgBB upload failed');
    }
    return data.data.url;
}

/**
 * FIREBASE STORAGE UPLOAD HELPER
 */
async function uploadToFirebase(file, path) {
    const storageRef = ref(storage, path);
    const snapshot = await uploadBytes(storageRef, file);
    return await getDownloadURL(snapshot.ref);
}

/**
 * SURVEY BUILDER TOOL
 */
let currentSurvey = {
    title: '',
    description: '',
    questions: []
};

async function loadSurveyBuilder(surveyId = null) {
    const userId = localStorage.getItem('userId');
    if (!userId) {
        showToast('Please sign in to create surveys', 'error');
        window.dispatchEvent(new CustomEvent('showSignInPrompt'));
        return;
    }

    if (surveyId) {
        // Load existing survey for editing
        const surveyDoc = await getDoc(doc(getSurveyPath(userId), surveyId));
        if (surveyDoc.exists()) {
            currentSurvey = { id: surveyId, ...surveyDoc.data() };
        }
    } else {
        currentSurvey = {
            title: '',
            description: '',
            questions: []
        };
    }

    renderSurveyBuilder();
}

function renderSurveyBuilder() {
    const toolContent = document.getElementById('toolContent');
    if (!toolContent) return;

    toolContent.innerHTML = `
        <div class="survey-builder-container">
            <div class="survey-header-edit glass-panel">
                <input type="text" id="surveyTitle" placeholder="Survey Title" value="${currentSurvey.title || ''}" class="survey-input-title">
                <textarea id="surveyDescription" placeholder="Survey Description" class="survey-input-desc">${currentSurvey.description || ''}</textarea>
            </div>
            
            <div id="questionsList" class="questions-list">
                <!-- Questions will be rendered here -->
            </div>

            <div class="builder-actions">
                <button class="btn-add-question" onclick="addQuestionPrompt()">➕ Add Question</button>
                <button class="btn-save-survey" onclick="saveSurvey()">💾 Save Survey</button>
            </div>
        </div>
    `;

    renderQuestions();
}

function renderQuestions() {
    const list = document.getElementById('questionsList');
    if (!list) return;

    list.innerHTML = currentSurvey.questions.map((q, index) => `
        <div class="question-card glass-panel" data-id="${q.id}">
            <div class="question-header">
                <span class="question-number">Q${index + 1}</span>
                <div class="question-controls">
                    <button onclick="editQuestion(${index})">✏️</button>
                    <button onclick="deleteQuestion(${index})">🗑️</button>
                </div>
            </div>
            <div class="question-body">
                <p class="question-text">${q.text} ${q.required ? '<span class="required">*</span>' : ''}</p>
                <p class="question-type-label">Type: ${q.type}</p>
                ${renderQuestionPreview(q)}
            </div>
        </div>
    `).join('');
}

function renderQuestionPreview(q) {
    switch (q.type) {
        case 'short': return '<input type="text" disabled placeholder="Short answer text" class="preview-input">';
        case 'long': return '<textarea disabled placeholder="Long answer text" class="preview-input"></textarea>';
        case 'mcq': return q.options.map(opt => `<div class="preview-option"><input type="radio" disabled> ${opt}</div>`).join('');
        case 'checkbox': return q.options.map(opt => `<div class="preview-option"><input type="checkbox" disabled> ${opt}</div>`).join('');
        case 'dropdown': return `<select disabled class="preview-input"><option>${q.options[0] || 'Select option'}</option></select>`;
        case 'image-mcq': return `
            <div class="image-options-preview">${(q.imageOptions || []).map(url => `<img src="${url}" class="preview-img" loading="lazy">`).join('')}</div>
            <p class="preview-hint">(Respondent picks one image)</p>
        `;
        case 'file': return '<input type="file" disabled class="preview-input">';
        default: return '';
    }
}

let editingQuestionIndex = -1;

window.addQuestionPrompt = function() {
    editingQuestionIndex = -1;
    showQuestionModal();
};

window.editQuestion = function(index) {
    editingQuestionIndex = index;
    const q = currentSurvey.questions[index];
    showQuestionModal(q);
};

function showQuestionModal(q = null) {
    const modal = document.createElement('div');
    modal.className = 'survey-modal';
    modal.innerHTML = `
        <div class="survey-modal-content glass-panel">
            <h3>${q ? 'Edit Question' : 'Add Question'}</h3>
            <select id="qType" onchange="toggleOptionInput(this.value)">
                <option value="short" ${q?.type === 'short' ? 'selected' : ''}>Short Answer</option>
                <option value="long" ${q?.type === 'long' ? 'selected' : ''}>Long Answer (Paragraph)</option>
                <option value="mcq" ${q?.type === 'mcq' ? 'selected' : ''}>Multiple Choice</option>
                <option value="checkbox" ${q?.type === 'checkbox' ? 'selected' : ''}>Checkbox</option>
                <option value="dropdown" ${q?.type === 'dropdown' ? 'selected' : ''}>Dropdown</option>
                <option value="image-mcq" ${q?.type === 'image-mcq' ? 'selected' : ''}>Image-based Options</option>
                <option value="file" ${q?.type === 'file' ? 'selected' : ''}>File Upload</option>
            </select>
            <input type="text" id="qText" placeholder="Question Text" value="${q?.text || ''}">
            <div id="optionsContainer" style="display:${['mcq', 'checkbox', 'dropdown'].includes(q?.type) ? 'block' : 'none'};">
                <textarea id="qOptions" placeholder="Options (one per line)">${q?.options?.join('\n') || ''}</textarea>
            </div>
            <div id="imageOptionsContainer" style="display:${q?.type === 'image-mcq' ? 'block' : 'none'};">
                <p id="imageUploadLabel">Upload images for options:</p>
                <input type="file" id="qImageFiles" multiple accept="image/*">
                ${q?.imageOptions ? `<div class="image-options-preview">${q.imageOptions.map(url => `<img src="${url}" class="preview-img" loading="lazy">`).join('')}</div>` : ''}
            </div>
            <label><input type="checkbox" id="qRequired" ${q?.required ? 'checked' : ''}> Required</label>
            <div class="modal-buttons">
                <button id="btnConfirmQuestion" onclick="confirmAddQuestion()">${q ? 'Update' : 'Add'}</button>
                <button onclick="this.closest('.survey-modal').remove()">Cancel</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

window.toggleOptionInput = function(type) {
    const optCont = document.getElementById('optionsContainer');
    const imgCont = document.getElementById('imageOptionsContainer');
    optCont.style.display = ['mcq', 'checkbox', 'dropdown'].includes(type) ? 'block' : 'none';
    imgCont.style.display = type === 'image-mcq' ? 'block' : 'none';
};

window.confirmAddQuestion = async function() {
    const btn = document.getElementById('btnConfirmQuestion');
    const type = document.getElementById('qType').value;
    const text = document.getElementById('qText').value.trim();
    const required = document.getElementById('qRequired').checked;
    
    if (!text) {
        showToast('Question text is required', 'error');
        return;
    }

    btn.disabled = true;
    btn.textContent = 'Processing...';

    let options = [];
    let imageOptions = editingQuestionIndex >= 0 ? [...currentSurvey.questions[editingQuestionIndex].imageOptions] : [];

    if (['mcq', 'checkbox', 'dropdown'].includes(type)) {
        options = document.getElementById('qOptions').value.split('\n').filter(o => o.trim());
        if (options.length === 0) {
            showToast('Please add at least one option', 'error');
            btn.disabled = false;
            btn.textContent = editingQuestionIndex >= 0 ? 'Update' : 'Add';
            return;
        }
    }

    if (type === 'image-mcq') {
        const files = document.getElementById('qImageFiles').files;
        if (files.length > 0) {
            showToast('Uploading images...', 'info');
            try {
                for (let i = 0; i < files.length; i++) {
                    const url = await uploadToImgBB(files[i]);
                    imageOptions.push(url);
                }
            } catch (e) {
                console.error(e);
                showToast('Image upload failed. Check ImgBB settings.', 'error');
                btn.disabled = false;
                btn.textContent = editingQuestionIndex >= 0 ? 'Update' : 'Add';
                return;
            }
        } else if (imageOptions.length === 0) {
            showToast('Please select at least one image', 'error');
            btn.disabled = false;
            btn.textContent = editingQuestionIndex >= 0 ? 'Update' : 'Add';
            return;
        }
    }

    const questionData = {
        id: editingQuestionIndex >= 0 ? currentSurvey.questions[editingQuestionIndex].id : Date.now().toString(),
        type,
        text,
        required,
        options,
        imageOptions
    };

    if (editingQuestionIndex >= 0) {
        currentSurvey.questions[editingQuestionIndex] = questionData;
    } else {
        currentSurvey.questions.push(questionData);
    }

    const modal = document.querySelector('.survey-modal');
    if (modal) modal.remove();
    renderQuestions();
};

window.deleteQuestion = function(index) {
    currentSurvey.questions.splice(index, 1);
    renderQuestions();
};

window.saveSurvey = async function() {
    const btn = document.querySelector('.btn-save-survey');
    const userId = localStorage.getItem('userId');
    const title = document.getElementById('surveyTitle').value.trim();
    const description = document.getElementById('surveyDescription').value.trim();

    if (!title) {
        showToast('Survey title is required', 'error');
        return;
    }

    if (currentSurvey.questions.length === 0) {
        showToast('Add at least one question', 'error');
        return;
    }

    btn.disabled = true;
    btn.textContent = '💾 Saving...';
    showToast('Saving survey...', 'info');

    try {
        const surveyData = {
            title,
            description,
            questions: currentSurvey.questions,
            createdAt: currentSurvey.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            userId
        };

        if (currentSurvey.id) {
            await setDoc(doc(getSurveyPath(userId), currentSurvey.id), surveyData);
        } else {
            const docRef = await addDoc(getSurveyPath(userId), surveyData);
            currentSurvey.id = docRef.id;
        }

        showToast('Survey saved successfully!', 'success');
        setTimeout(() => loadMySurveys(), 1000);
    } catch (e) {
        console.error('Save error:', e);
        showToast('Failed to save survey. Check database permissions.', 'error');
        btn.disabled = false;
        btn.textContent = '💾 Save Survey';
    }
};

/**
 * MY SURVEYS DASHBOARD
 */
async function loadMySurveys() {
    const userId = localStorage.getItem('userId');
    if (!userId) {
        showToast('Please sign in to view your surveys', 'error');
        window.dispatchEvent(new CustomEvent('showSignInPrompt'));
        return;
    }

    const toolContent = document.getElementById('toolContent');
    toolContent.innerHTML = '<div class="loading">Loading your surveys...</div>';

    try {
        const q = query(getSurveyPath(userId), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        const surveys = [];
        querySnapshot.forEach((doc) => {
            surveys.push({ id: doc.id, ...doc.data() });
        });

        renderMySurveys(surveys);
    } catch (e) {
        console.error(e);
        toolContent.innerHTML = '<div class="error">Failed to load surveys.</div>';
    }
}

async function renderMySurveys(surveys) {
    const toolContent = document.getElementById('toolContent');
    
    if (surveys.length === 0) {
        toolContent.innerHTML = `
            <div class="empty-state glass-panel">
                <p>You haven't created any surveys yet.</p>
                <button onclick="loadSurveyBuilder()">Create Your First Survey</button>
            </div>
        `;
        return;
    }

    // Fetch response counts for each survey
    const surveysWithCounts = await Promise.all(surveys.map(async (s) => {
        const respSnap = await getDocs(getResponsePath(s.id));
        return { ...s, responseCount: respSnap.size };
    }));

    toolContent.innerHTML = `
        <div class="surveys-dashboard">
            <div class="dashboard-header">
                <h2>My Surveys</h2>
                <button onclick="loadSurveyBuilder()">+ New Survey</button>
            </div>
            <div class="surveys-grid">
                ${surveysWithCounts.map(s => `
                    <div class="survey-card glass-panel">
                        <h3>${s.title}</h3>
                        <p class="survey-date">Created: ${new Date(s.createdAt).toLocaleDateString()}</p>
                        <div class="survey-stats">
                            <span>📊 ${s.responseCount} Responses</span>
                        </div>
                        <div class="survey-actions">
                            <button onclick="copySurveyLink('${s.id}')" title="Copy Link">🔗</button>
                            <button onclick="loadResponseViewer('${s.id}')" title="View Responses">👁️</button>
                            <button onclick="loadSurveyBuilder('${s.id}')" title="Edit">✏️</button>
                            <button onclick="deleteSurveyPrompt('${s.id}')" title="Delete">🗑️</button>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

window.copySurveyLink = function(surveyId) {
    const url = `${window.location.origin}/survey/?id=${surveyId}`;
    navigator.clipboard.writeText(url).then(() => {
        showToast('Survey link copied!', 'success');
    });
};

window.deleteSurveyPrompt = async function(surveyId) {
    if (confirm('Are you sure you want to delete this survey and all its responses?')) {
        const userId = localStorage.getItem('userId');
        try {
            await deleteDoc(doc(getSurveyPath(userId), surveyId));
            showToast('Survey deleted', 'success');
            loadMySurveys();
        } catch (e) {
            showToast('Delete failed', 'error');
        }
    }
};

/**
 * PUBLIC SURVEY PAGE
 */
async function loadPublicSurvey(surveyId = null) {
    const id = surveyId || new URLSearchParams(window.location.search).get('id');
    if (!id) {
        document.getElementById('toolContent').innerHTML = '<div class="error">Survey not found.</div>';
        return;
    }

    // Since we don't know the userId of the owner, we have to find the survey.
    // However, our structure is tools/surveyHub/{userId}/{surveyId}.
    // This makes it hard to find a survey by ID only without the userId.
    // SOLUTION: We should have used a flatter structure or a collectionGroup query.
    // Or, we can use a collectionGroup query to find the survey by its document ID.
    // But for simplicity, I'll assume the link includes the userId if needed, 
    // or I'll use a collectionGroup query if possible.
    // Let's use a collectionGroup query for 'surveyHub' documents.
    // Actually, I'll use a search across all users if I can't find it.
    // But wait, Firebase rules might block collectionGroup.
    // Better: Link should be /survey/?id={surveyId}&u={userId}
    const userId = new URLSearchParams(window.location.search).get('u');
    
    let surveyData = null;
    if (userId) {
        const surveyDoc = await getDoc(doc(getSurveyPath(userId), id));
        if (surveyDoc.exists()) surveyData = surveyDoc.data();
    } else {
        // Fallback: This is expensive/impossible in rules. 
        // I'll make sure copyLink includes 'u'.
        // For now, I'll try to find it via a hypothetical collectionGroup if I had it.
        // But I'll just show an error and ask for the full link.
        document.getElementById('toolContent').innerHTML = '<div class="error">Invalid survey link. Please use the full link.</div>';
        return;
    }

    if (!surveyData) {
        document.getElementById('toolContent').innerHTML = '<div class="error">Survey not found.</div>';
        return;
    }

    renderPublicSurvey(id, surveyData);
}

function renderPublicSurvey(id, survey) {
    const toolContent = document.getElementById('toolContent');
    toolContent.innerHTML = `
        <div class="public-survey-container glass-panel">
            <h1>${survey.title}</h1>
            <p class="survey-description">${survey.description}</p>
            <form id="publicSurveyForm" onsubmit="submitSurveyResponse(event, '${id}')">
                ${survey.questions.map((q, i) => `
                    <div class="form-question" data-type="${q.type}" data-required="${q.required}" data-id="${q.id}">
                        <label>${i + 1}. ${q.text} ${q.required ? '<span class="required">*</span>' : ''}</label>
                        ${renderPublicQuestionInput(q)}
                    </div>
                `).join('')}
                <button type="submit" class="btn-submit">Submit Response</button>
            </form>
        </div>
    `;
}

function renderPublicQuestionInput(q) {
    switch (q.type) {
        case 'short': return `<input type="text" name="${q.id}" ${q.required ? 'required' : ''}>`;
        case 'long': return `<textarea name="${q.id}" ${q.required ? 'required' : ''}></textarea>`;
        case 'mcq': return q.options.map(opt => `<div><label><input type="radio" name="${q.id}" value="${opt}" ${q.required ? 'required' : ''}> ${opt}</label></div>`).join('');
        case 'checkbox': return q.options.map(opt => `<div><label><input type="checkbox" name="${q.id}" value="${opt}"> ${opt}</label></div>`).join('');
        case 'dropdown': return `<select name="${q.id}" ${q.required ? 'required' : ''}><option value="">Select...</option>${q.options.map(opt => `<option value="${opt}">${opt}</option>`).join('')}</select>`;
        case 'image-mcq': return `<div class="image-options-grid">${q.imageOptions.map((url, idx) => `
            <label class="image-option">
                <input type="radio" name="${q.id}" value="${url}" ${q.required ? 'required' : ''}>
                <div class="radio-indicator"></div>
                <img src="${url}" loading="lazy">
            </label>
        `).join('')}</div>`;
        case 'file': return `<input type="file" name="${q.id}" ${q.required ? 'required' : ''}>`;
        default: return '';
    }
}

window.submitSurveyResponse = async function(event, surveyId) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    const answers = [];

    showToast('Submitting...', 'info');

    try {
        // Handle files and other inputs
        const questions = Array.from(form.querySelectorAll('.form-question'));
        for (const qEl of questions) {
            const qId = qEl.dataset.id;
            const type = qEl.dataset.type;
            let value = '';

            if (type === 'checkbox') {
                value = Array.from(form.querySelectorAll(`input[name="${qId}"]:checked`)).map(i => i.value);
            } else if (type === 'file') {
                const fileInput = form.querySelector(`input[name="${qId}"]`);
                if (fileInput.files.length > 0) {
                    const file = fileInput.files[0];
                    const fileName = `${Date.now()}_${file.name}`;
                    try {
                        // Use ImgBB for images to avoid CORS issues on localhost
                        if (file.type.startsWith('image/')) {
                            value = await uploadToImgBB(file);
                        } else {
                            value = await uploadToFirebase(file, `responses/${surveyId}/${fileName}`);
                        }
                    } catch (uploadError) {
                        console.error('Upload failed:', uploadError);
                        showToast(`File upload failed, but data will be saved.`, 'warning');
                        value = `[Upload Failed: ${file.name}]`;
                    }
                }
            } else {
                value = formData.get(qId);
            }

            answers.push({ questionId: qId, value });
        }

        await addDoc(getResponsePath(surveyId), {
            surveyId,
            answers,
            submittedAt: new Date().toISOString(),
            userId: localStorage.getItem('userId') || 'anonymous'
        });

        form.innerHTML = `
            <div class="success-message">
                <h2>Thank You!</h2>
                <p>Your response has been submitted successfully.</p>
                <button onclick="location.reload()">Submit Another</button>
            </div>
        `;
        showToast('Response submitted!', 'success');
    } catch (e) {
        console.error(e);
        showToast('Failed to submit response', 'error');
    }
};

/**
 * RESPONSE VIEWER TOOL
 */
async function loadResponseViewer(surveyId = null) {
    const userId = localStorage.getItem('userId');
    if (!surveyId) {
        showToast('Survey ID missing', 'error');
        return;
    }

    const toolContent = document.getElementById('toolContent');
    toolContent.innerHTML = '<div class="loading">Loading responses...</div>';

    try {
        const surveyDoc = await getDoc(doc(getSurveyPath(userId), surveyId));
        if (!surveyDoc.exists()) {
            toolContent.innerHTML = '<div class="error">Survey not found.</div>';
            return;
        }
        const survey = surveyDoc.data();

        const q = query(getResponsePath(surveyId), orderBy('submittedAt', 'desc'));
        const querySnapshot = await getDocs(q);
        const responses = [];
        querySnapshot.forEach((doc) => {
            responses.push({ id: doc.id, ...doc.data() });
        });

        renderResponseViewer(survey, responses);
    } catch (e) {
        console.error(e);
        toolContent.innerHTML = '<div class="error">Failed to load responses.</div>';
    }
}

function renderResponseViewer(survey, responses) {
    const toolContent = document.getElementById('toolContent');
    
    if (responses.length === 0) {
        toolContent.innerHTML = `
            <div class="empty-state glass-panel">
                <h3>${survey.title}</h3>
                <p>No responses yet.</p>
                <button onclick="loadMySurveys()">Back to Dashboard</button>
            </div>
        `;
        return;
    }

    toolContent.innerHTML = `
        <div class="response-viewer">
            <div class="viewer-header glass-panel">
                <div class="header-info">
                    <h2>Responses: ${survey.title}</h2>
                    <p>${responses.length} total responses</p>
                </div>
                <div class="viewer-actions">
                    <button class="btn-pdf" onclick="downloadResponsesPDF()">📥 Download PDF</button>
                    <button class="btn-back-dashboard" onclick="loadMySurveys()">⬅️ Back</button>
                </div>
            </div>

            <div class="responses-container">
                <h3>Individual Responses</h3>
                ${renderIndividual(survey, responses)}
            </div>
        </div>
    `;
}

function renderSummary(survey, responses) {
    return survey.questions.map(q => {
        let content = '';
        if (['mcq', 'checkbox', 'dropdown', 'image-mcq'].includes(q.type)) {
            const counts = {};
            responses.forEach(r => {
                const ans = r.answers.find(a => a.questionId === q.id)?.value;
                if (Array.isArray(ans)) {
                    ans.forEach(val => counts[val] = (counts[val] || 0) + 1);
                } else if (ans) {
                    counts[ans] = (counts[ans] || 0) + 1;
                }
            });
            content = `
                <div class="summary-chart-placeholder">
                    ${Object.entries(counts).map(([label, count]) => `
                        <div class="chart-row">
                            <span class="label">${label}</span>
                            <div class="bar-cont"><div class="bar" style="width: ${(count/responses.length)*100}%"></div></div>
                            <span class="count">${count}</span>
                        </div>
                    `).join('')}
                </div>
            `;
        } else {
            content = `<p>${responses.length} responses received.</p>`;
        }

        return `
            <div class="summary-card glass-panel">
                <h4>${q.text}</h4>
                ${content}
            </div>
        `;
    }).join('');
}

function renderIndividual(survey, responses) {
    return responses.map((r, i) => `
        <div class="individual-response glass-panel">
            <h4>Response #${responses.length - i}</h4>
            <p class="submitted-at">Submitted: ${new Date(r.submittedAt).toLocaleString()}</p>
            ${survey.questions.map(q => {
                const ans = r.answers.find(a => a.questionId === q.id)?.value;
                let display = ans || '<i>No answer</i>';
                if (q.type === 'file' && ans) {
                    const isImg = ans.match(/\.(jpeg|jpg|gif|png|webp)/i) || ans.includes('imgbb.com');
                    display = isImg ? `<img src="${ans}" class="preview-img" loading="lazy">` : `<a href="${ans}" target="_blank">View File</a>`;
                }
                if (q.type === 'image-mcq' && ans) display = `<img src="${ans}" class="preview-img" loading="lazy">`;
                return `<div class="ans-row"><strong>${q.text}</strong> <span class="ans-value">${display}</span></div>`;
            }).join('')}
        </div>
    `).join('');
}

window.showTab = function(tab) {
    document.querySelectorAll('.tab-content').forEach(c => c.style.display = 'none');
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(tab + 'Tab').style.display = 'block';
    event.target.classList.add('active');
};

window.downloadResponsesPDF = async function() {
    const { jsPDF } = window.jspdf;
    const title = document.querySelector('.header-info h2')?.innerText || 'Survey Responses';
    const responsesContainer = document.querySelector('.responses-container');
    
    if (!responsesContainer) {
        showToast('No responses found to download', 'error');
        return;
    }

    showToast('Generating high-quality PDF...', 'info');

    // Create a temporary hidden container for PDF generation
    const printContainer = document.createElement('div');
    printContainer.className = 'pdf-print-container';
    printContainer.style.position = 'absolute';
    printContainer.style.left = '-9999px';
    printContainer.style.top = '0';
    printContainer.style.width = '800px'; // Fixed width for consistent scaling
    printContainer.style.background = '#ffffff';
    printContainer.style.padding = '40px';
    printContainer.style.color = '#000000';

    // Add Logo or Brand name if needed
    printContainer.innerHTML = `
        <div style="margin-bottom: 30px; border-bottom: 2px solid #667eea; padding-bottom: 20px;">
            <h1 style="color: #667eea; margin: 0; font-size: 24px;">Infinity Kit Survey Report</h1>
            <h2 style="margin: 10px 0 0 0; font-size: 18px;">${title}</h2>
            <p style="margin: 5px 0 0 0; color: #666; font-size: 12px;">Exported on: ${new Date().toLocaleString()}</p>
        </div>
        <div class="print-body">
            ${responsesContainer.innerHTML}
        </div>
        <div style="margin-top: 30px; text-align: center; font-size: 10px; color: #999;">
            Generated by Infinity Kit Survey Hub
        </div>
    `;

    // Clean up UI elements in the clone (like links or buttons if any)
    printContainer.querySelectorAll('a, button').forEach(el => el.remove());
    // Ensure all images are loaded
    const images = printContainer.querySelectorAll('img');
    await Promise.all(Array.from(images).map(img => {
        if (img.complete) return Promise.resolve();
        return new Promise(resolve => { img.onload = resolve; img.onerror = resolve; });
    }));

    document.body.appendChild(printContainer);

    try {
        const canvas = await html2canvas(printContainer, {
            scale: 2,
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff'
        });
        
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        
        const imgProps = pdf.getImageProperties(imgData);
        const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;
        
        let heightLeft = imgHeight;
        let position = 0;

        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
        heightLeft -= pdfHeight;

        while (heightLeft > 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
            heightLeft -= pdfHeight;
        }

        pdf.save(`Survey_Report_${Date.now()}.pdf`);
        showToast('Impressive PDF Ready!', 'success');
    } catch (e) {
        console.error('PDF Error:', e);
        showToast('Failed to generate PDF', 'error');
    } finally {
        document.body.removeChild(printContainer);
    }
};

// Global exports
window.loadSurveyBuilder = loadSurveyBuilder;
window.loadMySurveys = loadMySurveys;
window.loadPublicSurvey = loadPublicSurvey;
window.loadResponseViewer = loadResponseViewer;
window.copySurveyLink = function(surveyId) {
    const userId = localStorage.getItem('userId');
    const url = `${window.location.origin}/survey/?id=${surveyId}&u=${userId}`;
    navigator.clipboard.writeText(url).then(() => {
        showToast('Survey link copied!', 'success');
    });
};
