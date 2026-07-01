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
  documents: document.getElementById('view-documents'),
  summarize: document.getElementById('view-summarize')
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

function pdfHtmlFromText(text) {
  const rendered = marked.parse(text);
  return '<html><head><meta charset="UTF-8"><style>body{font-family:Georgia,serif;font-size:13px;line-height:1.7;padding:50px;color:#1a1a1a;} h1,h2,h3{margin:16px 0 8px;} ul,ol{padding-left:22px;} li{margin-bottom:4px;} p{margin:0 0 10px;}</style></head><body>' + rendered + '</body></html>';
}

/* Documents sub-view routing */
const docSubViews = {
  docChoice: document.getElementById('docChoice'),
  docAi: document.getElementById('docAi'),
  docTemplatePicker: document.getElementById('docTemplatePicker'),
  docTemplateForm: document.getElementById('docTemplateForm')
};

function showDocSubView(name) {
  Object.keys(docSubViews).forEach((key) => {
    docSubViews[key].style.display = key === name ? 'flex' : 'none';
  });
}

document.getElementById('chooseAiBtn').addEventListener('click', () => showDocSubView('docAi'));
document.getElementById('chooseTemplateBtn').addEventListener('click', () => {
  renderTemplateCards();
  showDocSubView('docTemplatePicker');
});

document.querySelectorAll('.backBtn').forEach((btn) => {
  btn.addEventListener('click', () => showDocSubView(btn.dataset.target));
});

/* Reset to choice screen whenever Documents nav is clicked */
document.querySelector('.nav-item[data-section="documents"]').addEventListener('click', () => {
  showDocSubView('docChoice');
});

/* AI Draft path */
const docDescription = document.getElementById('docDescription');
const generateDocBtn = document.getElementById('generateDocBtn');
const aiDocPreviewWrap = document.getElementById('aiDocPreviewWrap');
const aiDocPreview = document.getElementById('aiDocPreview');
const regenerateBtn = document.getElementById('regenerateBtn');
const aiDownloadPdfBtn = document.getElementById('aiDownloadPdfBtn');

async function generateDocument() {
  const description = docDescription.value.trim();
  if (!description) return;

  generateDocBtn.disabled = true;
  generateDocBtn.textContent = 'Drafting...';

  const result = await window.api.draftDocument(description);

  aiDocPreview.innerHTML = marked.parse(result);
  aiDocPreviewWrap.style.display = 'flex';
  generateDocBtn.disabled = false;
  generateDocBtn.textContent = 'Generate document';
}

generateDocBtn.addEventListener('click', generateDocument);
regenerateBtn.addEventListener('click', generateDocument);

aiDownloadPdfBtn.addEventListener('click', async () => {
  aiDownloadPdfBtn.disabled = true;
  aiDownloadPdfBtn.textContent = 'Saving...';
  await window.api.savePDF(pdfHtmlFromText(aiDocPreview.textContent));
  aiDownloadPdfBtn.disabled = false;
  aiDownloadPdfBtn.textContent = 'Download as PDF';
});

/* Template path */
const TEMPLATES = [
  {
    id: 'nda',
    title: 'NDA',
    description: 'Mutual non-disclosure agreement between two parties.',
    fields: [
      { id: 'party1', label: 'First Party Name', type: 'input' },
      { id: 'party2', label: 'Second Party Name', type: 'input' },
      { id: 'effectiveDate', label: 'Effective Date', type: 'input', placeholder: 'e.g. June 30, 2026' },
      { id: 'purpose', label: 'Purpose of Disclosure', type: 'textarea', placeholder: 'e.g. evaluating a potential business partnership' },
      { id: 'term', label: 'Confidentiality Term (years)', type: 'input', placeholder: 'e.g. 2' },
      { id: 'state', label: 'Governing State/Jurisdiction', type: 'input' }
    ],
    build: (d) => 'NON-DISCLOSURE AGREEMENT\n\nThis Non-Disclosure Agreement ("Agreement") is entered into as of ' + d.effectiveDate + ' by and between ' + d.party1 + ' ("Disclosing Party") and ' + d.party2 + ' ("Receiving Party"), collectively the "Parties."\n\n1. PURPOSE\nThe Parties wish to engage in discussions related to: ' + d.purpose + '. In connection with this purpose, one or both Parties may disclose confidential information to the other.\n\n2. CONFIDENTIAL INFORMATION\nEach Party agrees to hold all confidential information disclosed by the other Party in strict confidence and not to disclose it to any third party without prior written consent.\n\n3. TERM\nThis Agreement and the confidentiality obligations herein shall remain in effect for ' + d.term + ' year(s) from the Effective Date.\n\n4. GOVERNING LAW\nThis Agreement shall be governed by the laws of ' + d.state + '.\n\n5. SIGNATURES\n\n_____________________________\n' + d.party1 + '\n\n_____________________________\n' + d.party2
  },
  {
    id: 'lease',
    title: 'Lease Agreement',
    description: 'Simple residential lease between landlord and tenant.',
    fields: [
      { id: 'landlord', label: 'Landlord Name', type: 'input' },
      { id: 'tenant', label: 'Tenant Name', type: 'input' },
      { id: 'propertyAddress', label: 'Property Address', type: 'textarea' },
      { id: 'leaseStart', label: 'Lease Start Date', type: 'input' },
      { id: 'leaseEnd', label: 'Lease End Date', type: 'input' },
      { id: 'rent', label: 'Monthly Rent', type: 'input', placeholder: 'e.g. $1,500' },
      { id: 'deposit', label: 'Security Deposit', type: 'input', placeholder: 'e.g. $1,500' },
      { id: 'state', label: 'Governing State', type: 'input' }
    ],
    build: (d) => 'RESIDENTIAL LEASE AGREEMENT\n\nThis Lease Agreement is entered into between ' + d.landlord + ' ("Landlord") and ' + d.tenant + ' ("Tenant") for the property located at: ' + d.propertyAddress + '.\n\n1. TERM\nThe lease term begins on ' + d.leaseStart + ' and ends on ' + d.leaseEnd + '.\n\n2. RENT\nTenant agrees to pay Landlord monthly rent of ' + d.rent + ', due on the first day of each month.\n\n3. SECURITY DEPOSIT\nTenant shall pay a security deposit of ' + d.deposit + ' prior to occupancy, refundable subject to the condition of the property at lease end.\n\n4. GOVERNING LAW\nThis Agreement shall be governed by the laws of ' + d.state + '.\n\n5. SIGNATURES\n\n_____________________________\n' + d.landlord + ' (Landlord)\n\n_____________________________\n' + d.tenant + ' (Tenant)'
  },
  {
    id: 'contract',
    title: 'Simple Contract',
    description: 'General services agreement between two parties.',
    fields: [
      { id: 'party1', label: 'Service Provider Name', type: 'input' },
      { id: 'party2', label: 'Client Name', type: 'input' },
      { id: 'serviceDescription', label: 'Description of Services', type: 'textarea' },
      { id: 'payment', label: 'Payment Amount', type: 'input', placeholder: 'e.g. $5,000' },
      { id: 'paymentTerms', label: 'Payment Terms', type: 'textarea', placeholder: 'e.g. 50% upfront, 50% on completion' },
      { id: 'startDate', label: 'Start Date', type: 'input' },
      { id: 'endDate', label: 'End Date', type: 'input' },
      { id: 'state', label: 'Governing State', type: 'input' }
    ],
    build: (d) => 'SERVICES AGREEMENT\n\nThis Services Agreement is entered into between ' + d.party1 + ' ("Provider") and ' + d.party2 + ' ("Client").\n\n1. SERVICES\nProvider agrees to perform the following services: ' + d.serviceDescription + '.\n\n2. TERM\nThis Agreement begins on ' + d.startDate + ' and ends on ' + d.endDate + '.\n\n3. PAYMENT\nClient agrees to pay Provider ' + d.payment + '. Payment terms: ' + d.paymentTerms + '.\n\n4. GOVERNING LAW\nThis Agreement shall be governed by the laws of ' + d.state + '.\n\n5. SIGNATURES\n\n_____________________________\n' + d.party1 + ' (Provider)\n\n_____________________________\n' + d.party2 + ' (Client)'
  },
  {
    id: 'demand',
    title: 'Demand Letter',
    description: 'Formal letter demanding payment or action.',
    fields: [
      { id: 'senderName', label: 'Your Name', type: 'input' },
      { id: 'senderAddress', label: 'Your Address', type: 'textarea' },
      { id: 'recipientName', label: 'Recipient Name', type: 'input' },
      { id: 'recipientAddress', label: 'Recipient Address', type: 'textarea' },
      { id: 'issueDescription', label: 'Description of the Issue', type: 'textarea' },
      { id: 'amount', label: 'Amount Demanded', type: 'input', placeholder: 'e.g. $2,000' },
      { id: 'deadline', label: 'Deadline for Response', type: 'input', placeholder: 'e.g. 14 days from the date of this letter' }
    ],
    build: (d) => d.senderName + '\n' + d.senderAddress + '\n\n' + 'Date: [Insert Date]\n\n' + d.recipientName + '\n' + d.recipientAddress + '\n\nRE: FORMAL DEMAND FOR PAYMENT\n\nDear ' + d.recipientName + ',\n\nThis letter serves as a formal demand regarding the following matter: ' + d.issueDescription + '.\n\nAs a result, I am demanding payment of ' + d.amount + '. Please remit payment within ' + d.deadline + ' of the date of this letter.\n\nIf this matter is not resolved within the stated timeframe, I will consider further legal action to recover the amount owed.\n\nSincerely,\n\n_____________________________\n' + d.senderName
  }
];

let activeTemplate = null;

function renderTemplateCards() {
  const container = document.getElementById('templateCards');
  container.innerHTML = '';
  TEMPLATES.forEach((tpl, i) => {
    const card = document.createElement('button');
    card.className = 'template-card';
    const num = String(i + 1).padStart(2, '0');
    card.innerHTML = '<span class="template-card-index">' + num + '</span><span class="template-card-title">' + tpl.title + '</span><span class="template-card-text">' + tpl.description + '</span>';
    card.addEventListener('click', () => openTemplateForm(tpl));
    container.appendChild(card);
  });
}

function openTemplateForm(tpl) {
  activeTemplate = tpl;
  document.getElementById('templateFormTitle').textContent = tpl.title;

  const fieldsContainer = document.getElementById('templateFields');
  fieldsContainer.innerHTML = '';
  tpl.fields.forEach((field) => {
    const group = document.createElement('div');
    group.className = 'field-group';
    const label = document.createElement('label');
    label.textContent = field.label;
    label.setAttribute('for', 'field-' + field.id);
    const input = document.createElement(field.type === 'textarea' ? 'textarea' : 'input');
    input.id = 'field-' + field.id;
    input.placeholder = field.placeholder || '';
    if (field.type !== 'textarea') input.type = 'text';
    group.appendChild(label);
    group.appendChild(input);
    fieldsContainer.appendChild(group);
  });

  document.getElementById('templateDocPreviewWrap').style.display = 'none';
  showDocSubView('docTemplateForm');
}

let selectedDocText = '';

const pickFileBtn = document.getElementById('pickFileBtn');
const selectedFileName = document.getElementById('selectedFileName');
const summarizeBtn = document.getElementById('summarizeBtn');
const summaryPreviewWrap = document.getElementById('summaryPreviewWrap');
const summaryPreview = document.getElementById('summaryPreview');

pickFileBtn.addEventListener('click', async () => {
  const result = await window.api.pickAndReadFile();
  if (!result.success) {
    if (result.error) selectedFileName.textContent = 'Error: ' + result.error;
    return;
  }
  selectedFileName.textContent = result.fileName;
  selectedDocText = result.text;
  summarizeBtn.disabled = false;
  summaryPreviewWrap.style.display = 'none';
});

summarizeBtn.addEventListener('click', async () => {
  if (!selectedDocText) return;
  summarizeBtn.disabled = true;
  summarizeBtn.textContent = 'Summarizing...';

  const summary = await window.api.summarizeDocument(selectedDocText);

  summaryPreview.innerHTML = marked.parse(summary);
  summaryPreviewWrap.style.display = 'flex';
  summarizeBtn.disabled = false;
  summarizeBtn.textContent = 'Summarize';
});

document.getElementById('generateTemplateBtn').addEventListener('click', () => {
  if (!activeTemplate) return;
  const data = {};
  activeTemplate.fields.forEach((field) => {
    data[field.id] = document.getElementById('field-' + field.id).value.trim() || '[' + field.label + ']';
  });
  const text = activeTemplate.build(data);
  document.getElementById('templateDocPreview').innerHTML = marked.parse(text);
  document.getElementById('templateDocPreviewWrap').style.display = 'flex';
});

document.getElementById('templateDownloadPdfBtn').addEventListener('click', async () => {
  const btn = document.getElementById('templateDownloadPdfBtn');
  const text = document.getElementById('templateDocPreview').textContent;
  btn.disabled = true;
  btn.textContent = 'Saving...';
  await window.api.savePDF(pdfHtmlFromText(text));
  btn.disabled = false;
  btn.textContent = 'Download as PDF';
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








