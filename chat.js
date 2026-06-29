const messagesDiv = document.getElementById('messages');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');
const navItems = document.querySelectorAll('.nav-item');
const splash = document.getElementById('splash');
const app = document.getElementById('app');
const startChatBtn = document.getElementById('startChatBtn');
const logoBtn = document.getElementById('logoBtn');

const views = {
  home: document.getElementById('view-home'),
  chat: document.getElementById('view-chat'),
  documents: document.getElementById('view-documents')
};

window.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    splash.style.display = 'none';
    app.style.display = 'flex';
    renderQRCode();
    openDonateModal();
    startDonateTimer();
  }, 1700);
});

function showView(name) {
  Object.keys(views).forEach((key) => {
    if (!views[key]) return;
    views[key].style.display = key === name ? 'flex' : 'none';
  });
  navItems.forEach((item) => {
    item.classList.toggle('active', item.dataset.section === name);
  });
}

navItems.forEach((item) => {
  item.addEventListener('click', () => {
    showView(item.dataset.section);
  });
});

const docDescription = document.getElementById('docDescription');
const generateDocBtn = document.getElementById('generateDocBtn');
const docPreviewWrap = document.getElementById('docPreviewWrap');
const docPreview = document.getElementById('docPreview');
const regenerateBtn = document.getElementById('regenerateBtn');
const downloadPdfBtn = document.getElementById('downloadPdfBtn');

async function generateDocument() {
  const description = docDescription.value.trim();
  if (!description) return;

  generateDocBtn.disabled = true;
  generateDocBtn.textContent = 'Drafting...';

  const result = await window.api.draftDocument(description);

  docPreview.textContent = result;
  docPreviewWrap.style.display = 'flex';
  generateDocBtn.disabled = false;
  generateDocBtn.textContent = 'Generate document';
}

generateDocBtn.addEventListener('click', generateDocument);
regenerateBtn.addEventListener('click', generateDocument);

downloadPdfBtn.addEventListener('click', async () => {
  const text = docPreview.textContent;
  const html = '<html><head><meta charset="UTF-8"><style>body{font-family:Georgia,serif;font-size:13px;line-height:1.7;padding:50px;white-space:pre-wrap;color:#1a1a1a;}</style></head><body>' + text.replace(/&/g, '&amp;').replace(/</g, '&lt;') + '</body></html>';

  downloadPdfBtn.disabled = true;
  downloadPdfBtn.textContent = 'Saving...';

  const result = await window.api.savePDF(html);

  downloadPdfBtn.disabled = false;
  downloadPdfBtn.textContent = 'Download as PDF';

  if (!result.success) return;
});

startChatBtn.addEventListener('click', () => showView('chat'));
logoBtn.addEventListener('click', () => showView('home'));

function addMessage(html, sender) {
  const div = document.createElement('div');
  div.className = 'msg ' + sender;
  div.innerHTML = html;
  messagesDiv.appendChild(div);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
  return div;
}

let isMidChat = false;
let lastResponseAt = 0;
let currentMode = 'general';

const modeBtns = document.querySelectorAll('.mode-btn');
const chatTitle = document.getElementById('chatTitle');
const chatSubtitle = document.getElementById('chatSubtitle');

const MODE_LABELS = {
  general: { title: 'Legal Q&A', subtitle: 'Ask a question in plain language. Answers are generated locally and are not legal advice.', placeholder: 'Ask a legal question...' },
  security: { title: 'Security Research Legal Q&A', subtitle: 'Ask about the legal side of authorized testing, bug bounty programs, and responsible disclosure. Not a substitute for a lawyer.', placeholder: 'Ask about bug bounty / authorized testing law...' }
};

modeBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    currentMode = btn.dataset.mode;
    modeBtns.forEach((b) => b.classList.toggle('active', b === btn));
    const labels = MODE_LABELS[currentMode];
    chatTitle.textContent = labels.title;
    chatSubtitle.textContent = labels.subtitle;
    userInput.placeholder = labels.placeholder;
    messagesDiv.innerHTML = '';
  });
});

async function sendMessage() {
  const text = userInput.value.trim();
  if (!text) return;

  isMidChat = true;
  addMessage(text, 'user');
  userInput.value = '';
  sendBtn.disabled = true;

  const thinkingDiv = addMessage('<div class="typing-dots"><span></span><span></span><span></span></div>', 'bot');

  const reply = await window.api.askOllama({ prompt: text, mode: currentMode });
  thinkingDiv.textContent = reply;

  sendBtn.disabled = false;
  userInput.focus();
  lastResponseAt = Date.now();
  isMidChat = false;
}

sendBtn.addEventListener('click', sendMessage);
userInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') sendMessage();
});
userInput.addEventListener('input', () => {
  isMidChat = userInput.value.trim().length > 0;
});

/* Donate modal */
const donateModalOverlay = document.getElementById('donateModalOverlay');
const donateModalClose = document.getElementById('donateModalClose');
const maybeLaterBtn = document.getElementById('maybeLaterBtn');
const sidebarDonateBtn = document.getElementById('sidebarDonateBtn');
const homeDonateBtn = document.getElementById('homeDonateBtn');
const copyAddressBtn = document.getElementById('copyAddressBtn');
const btcAddress = document.getElementById('btcAddress').textContent.trim();

function openDonateModal() {
  donateModalOverlay.style.display = 'flex';
}

function closeDonateModal() {
  donateModalOverlay.style.display = 'none';
}

donateModalClose.addEventListener('click', closeDonateModal);
maybeLaterBtn.addEventListener('click', closeDonateModal);
sidebarDonateBtn.addEventListener('click', openDonateModal);
homeDonateBtn.addEventListener('click', openDonateModal);

copyAddressBtn.addEventListener('click', () => {
  navigator.clipboard.writeText(btcAddress);
  copyAddressBtn.textContent = 'Copied!';
  setTimeout(() => { copyAddressBtn.textContent = 'Copy address'; }, 1500);
});

function renderQRCode() {
  new QRCode(document.getElementById('qrcode'), {
    text: 'bitcoin:' + btcAddress,
    width: 160,
    height: 160,
    colorDark: '#0f1f3d',
    colorLight: '#fffdf9'
  });
}

function startDonateTimer() {
  setInterval(() => {
    const recentlyResponded = Date.now() - lastResponseAt < 10000;
    if (donateModalOverlay.style.display === 'flex') return;
    if (isMidChat || recentlyResponded) return;
    openDonateModal();
  }, 6 * 60 * 1000);
}


