// Matrix Background Logic
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
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = '#0F0';
    ctx.font = fontSize + 'px monospace';

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

// Dashboard Logic
const dashboardGrid = document.getElementById('dashboard-grid');
const terminalModal = document.getElementById('terminal-modal');
const openTerminalBtn = document.getElementById('open-terminal');
const closeTerminalBtn = document.getElementById('close-terminal');
const saveLinkBtn = document.getElementById('save-link');
const linkNameInput = document.getElementById('link-name');
const linkUrlInput = document.getElementById('link-url');
const terminalDate = document.getElementById('terminal-date');

let shortcuts = JSON.parse(localStorage.getItem('hacker_shortcuts')) || [
    { name: 'GOOGLE_SECURE', url: 'https://google.com' },
    { name: 'GITHUB_REPOS', url: 'https://github.com' },
    { name: 'LOCAL_PORT_8080', url: 'http://localhost:8080' }
];

function updateTerminalDate() {
    const now = new Date();
    const options = { 
        timeZone: 'Europe/Lisbon', 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit', 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit',
        hour12: false 
    };
    const formatter = new Intl.DateTimeFormat('pt-PT', options);
    const parts = formatter.formatToParts(now);
    const dateStr = `${parts.find(p => p.type === 'year').value}-${parts.find(p => p.type === 'month').value}-${parts.find(p => p.type === 'day').value}`;
    const timeStr = `${parts.find(p => p.type === 'hour').value}:${parts.find(p => p.type === 'minute').value}:${parts.find(p => p.type === 'second').value}`;
    
    terminalDate.textContent = `TIMESTAMP: ${dateStr} ${timeStr}`;
}

setInterval(updateTerminalDate, 1000);
updateTerminalDate();

function renderShortcuts() {
    dashboardGrid.innerHTML = '';
    shortcuts.forEach((shortcut, index) => {
        const card = document.createElement('div');
        card.className = 'shortcut-card';
        
        // Ensure URL has protocol
        let url = shortcut.url;
        if (!url.startsWith('http')) {
            url = 'https://' + url;
        }

        card.innerHTML = `
            <button class="delete-btn" data-index="${index}">[UNLINK]</button>
            <div class="card-content" onclick="window.open('${url}', '_blank')">
                <div class="card-title">${shortcut.name}</div>
                <div class="card-url">${shortcut.url}</div>
            </div>
        `;
        dashboardGrid.appendChild(card);
    });

    // Add event listeners to delete buttons
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.onclick = (e) => {
            e.stopPropagation();
            const index = e.target.getAttribute('data-index');
            deleteShortcut(index);
        };
    });
}

function saveToStorage() {
    localStorage.setItem('hacker_shortcuts', JSON.stringify(shortcuts));
}

function deleteShortcut(index) {
    shortcuts.splice(index, 1);
    saveToStorage();
    renderShortcuts();
}

function addShortcut() {
    const name = linkNameInput.value.trim();
    const url = linkUrlInput.value.trim();

    if (name && url) {
        shortcuts.push({ name: name.toUpperCase(), url: url });
        saveToStorage();
        renderShortcuts();
        closeModal();
        linkNameInput.value = '';
        linkUrlInput.value = '';
    } else {
        alert('ERROR: INPUT_REQUIRED');
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
renderShortcuts();
console.log('SYSTEM INITIALIZED...');
