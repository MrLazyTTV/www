// Matrix Background Logic - Optimized for Brutalist Theme (Grayscale)
const canvas = document.getElementById('matrix-bg');
const ctx = canvas.getContext('2d');

let width, height, columns;
const fontSize = 16;
const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$#@%&*()_+-=[]{}|;:,.<>?/πΩΣΔ';
let drops = [];

function resizeCanvas() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
    columns = Math.floor(width / fontSize);
    drops = Array(columns).fill(1);
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function drawMatrix() {
    ctx.fillStyle = 'rgba(8, 8, 8, 0.1)';
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.font = fontSize + 'px "JetBrains Mono"';

    for (let i = 0; i < drops.length; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > height && Math.random() > 0.975) {
            drops[i] = 0;
        }
        drops[i]++;
    }
}

setInterval(drawMatrix, 50);

// Dashboard Logic with Backend Integration
const API_URL = 'http://localhost:3001/api';
const dashboardGrid = document.getElementById('dashboard-grid');
const terminalModal = document.getElementById('terminal-modal');
const openTerminalBtn = document.getElementById('open-terminal');
const closeTerminalBtn = document.getElementById('close-terminal');
const saveLinkBtn = document.getElementById('save-link');
const linkNameInput = document.getElementById('link-name');
const linkUrlInput = document.getElementById('link-url');
const terminalDate = document.getElementById('terminal-date');

let shortcuts = [];

function updateTerminalDate() {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().split(' ')[0];
    terminalDate.textContent = `[ TIMESTAMP: ${dateStr} // ${timeStr} ]`;
}

setInterval(updateTerminalDate, 1000);
updateTerminalDate();

// Fetch Shortcuts from MySQL
async function fetchShortcuts() {
    try {
        const response = await fetch(`${API_URL}/shortcuts`);
        shortcuts = await response.json();
        renderShortcuts();
    } catch (err) {
        console.error('FETCH_ERROR:', err);
        dashboardGrid.innerHTML = `
            <div style="grid-column: 1/-1; padding: 2rem; border: 2px solid var(--alert); color: var(--alert); background: rgba(255,0,60,0.1); font-weight: 900; text-align: center;">
                [ ERROR::DATABASE_OFFLINE ]<br>
                CHECK SERVER LOGS AND SQL CREDENTIALS
            </div>
        `;
    }
}

function renderShortcuts() {
    dashboardGrid.innerHTML = '';
    shortcuts.forEach((shortcut) => {
        const card = document.createElement('a');
        card.className = 'shortcut-card';
        
        let url = shortcut.link;
        if (!url.startsWith('http') && !url.startsWith('//')) {
            url = 'https://' + url;
        }
        
        card.href = url;
        card.target = '_blank';

        card.innerHTML = `
            <div class="card-content">
                <div class="card-title">${shortcut.nome.toUpperCase()}</div>
                <div class="card-url">${shortcut.link.toLowerCase()}</div>
            </div>
            <button class="delete-btn" data-id="${shortcut.id}" title="UNLINK NODE">[ REMOVE_NODE ]</button>
        `;

        const deleteBtn = card.querySelector('.delete-btn');
        deleteBtn.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            deleteShortcut(shortcut.id);
        };

        dashboardGrid.appendChild(card);
    });
}

async function deleteShortcut(id) {
    try {
        await fetch(`${API_URL}/shortcuts/${id}`, { method: 'DELETE' });
        fetchShortcuts();
    } catch (err) {
        console.error('DELETE_ERROR:', err);
    }
}

async function addShortcut() {
    const name = linkNameInput.value.trim();
    const url = linkUrlInput.value.trim();

    if (name && url) {
        try {
            await fetch(`${API_URL}/shortcuts`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nome: name.toUpperCase(), link: url })
            });
            fetchShortcuts();
            closeModal();
            linkNameInput.value = '';
            linkUrlInput.value = '';
        } catch (err) {
            console.error('SAVE_ERROR:', err);
            alert('CRITICAL_ERROR: FAILED_TO_SAVE_TO_DATABASE');
        }
    } else {
        linkNameInput.style.borderColor = 'var(--alert)';
        setTimeout(() => linkNameInput.style.borderColor = '', 2000);
    }
}

function openModal() {
    terminalModal.style.display = 'flex';
    linkNameInput.focus();
}

function closeModal() {
    terminalModal.style.display = 'none';
}

openTerminalBtn.onclick = openModal;
closeTerminalBtn.onclick = closeModal;
saveLinkBtn.onclick = addShortcut;

window.onclick = (event) => {
    if (event.target == terminalModal) {
        closeModal();
    }
};

// Initial Render
fetchShortcuts();
console.log('SYSTEM_BOOT_COMPLETE::DATABASE_READY');
