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
  chat: document.getElementById('view-chat')
};

window.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    splash.style.display = 'none';
    app.style.display = 'flex';
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
    if (item.classList.contains('disabled')) {
      showView('home');
      return;
    }
    showView(item.dataset.section);
  });
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

async function sendMessage() {
  const text = userInput.value.trim();
  if (!text) return;

  addMessage(text, 'user');
  userInput.value = '';
  sendBtn.disabled = true;

  const thinkingDiv = addMessage('<div class="typing-dots"><span></span><span></span><span></span></div>', 'bot');

  const reply = await window.api.askOllama(text);
  thinkingDiv.textContent = reply;

  sendBtn.disabled = false;
  userInput.focus();
}

sendBtn.addEventListener('click', sendMessage);
userInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') sendMessage();
});
