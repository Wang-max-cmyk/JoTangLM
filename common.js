let currentChatId = null;
let chats = JSON.parse(localStorage.getItem('chats')) || [];

const chatList = document.getElementById('chat-list');
const chatMessages = document.getElementById('chat-messages');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const newChatBtn = document.getElementById('new-chat');
const themeSelect = document.getElementById('theme');
const maxLength = document.getElementById('max-length');
const minLength = document.getElementById('min-length');
const creativity = document.getElementById('creativity');

function createNewChat() {
    const defaultName = `会话 ${chats.length + 1}`;
    const chatName = prompt("请输入会话名称", defaultName);
    if (chatName) {
        const chatId = Date.now().toString();
        chats.push({ id: chatId, name: chatName, messages: [] });
        chatToLocalStorage();
        ChatList();
        switchToChat(chatId);
    }
}

function ChatList() {
    chatList.innerHTML = '';
    chats.forEach(chat => {
        const li = document.createElement('li');
        li.textContent = chat.name;
        li.onclick = () => switchToChat(chat.id);
        if (chat.id === currentChatId) {
            li.classList.add('active');
        }
        const deleteBtn = document.createElement('button');
        deleteBtn.classList.add('delete-btn');
        deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
        deleteBtn.onclick = (e) => {
            e.stopPropagation();
            deleteChat(chat.id);
        };
        const renameBtn = document.createElement('button');
        renameBtn.innerHTML = '&#x270E;';
        renameBtn.className = 'rename-btn';
        renameBtn.onclick = (e) => {
            e.stopPropagation();
            renameChat(chat.id);
        };
        li.appendChild(renameBtn);
        li.appendChild(deleteBtn);
        li.appendChild(deleteBtn);
        chatList.appendChild(li);
    });
}

function switchToChat(chatId) {
    currentChatId = chatId;
    ChatList();
    chatMessage();
}

function deleteChat(chatId) {
    if (confirm('确定要删除这个会话吗？')) {
        chats = chats.filter(chat => chat.id!== chatId);
        chatToLocalStorage();
        if (currentChatId === chatId) {
            currentChatId = chats.length > 0? chats[0].id : null;
        }
        ChatList();
        chatMessage();
    }
}

function renameChat(chatId) {
    const chat = chats.find(c => c.id === chatId);
    if (chat) {
        const newName = prompt("请输入新的会话名称", chat.name);
        if (newName && newName !== chat.name) {
            chat.name = newName;
            chatToLocalStorage();
            ChatList();
        }
    }
}

function chatMessage() {
    chatMessages.innerHTML = '';
    const chat = chats.find(c => c.id === currentChatId);
    if (chat) {
        chat.messages.forEach(message => {
            const messageElement = document.createElement('div');
            messageElement.classList.add('message', message.sender === 'user'? 'user-message' : 'ai-message');
            messageElement.textContent = message.content;
            const deleteBtn = document.createElement('button');
            deleteBtn.classList.add('delete-btn');
            deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
            deleteBtn.onclick = () => {
                chat.messages = chat.messages.filter(m => m!== message);
                chatToLocalStorage();
                chatMessage();
            };
            messageElement.appendChild(deleteBtn);            
            chatMessages.appendChild(messageElement);
        });
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
}

function sendMessage() {
    const message = userInput.value.trim();
    if (message && currentChatId) {
        const chat = chats.find(c => c.id === currentChatId);
        chat.messages.push({ sender: 'user', content: message });
        chatToLocalStorage();
        chatMessage();
        userInput.value = '';
        setTimeout(() => {
            const aiMessage = simulateAIResponse(message);
            chat.messages.push({ sender: 'ai', content: aiMessage });
            chatToLocalStorage();
            chatMessage();
        }, 1000);
    }
}

function simulateAIResponse(userMessage) {
    const maxLength = parseInt(maxLength.value);
    const minLength = parseInt(minLength.value);
    const creativity = parseInt(creativity.value);

    let response = `这是对"${userMessage}"的模拟回复`;

    if (creativity > 70) {
        response += "我的创造力很高，所以我会给出更有趣的回答！";
    } else if (creativity < 30) {
        response += "我的创造力较低，所以我会给出更保守的回答。";
    }

    if (response.length > maxLength) {
        return response.slice(0, maxLength) + '...';
    } else if (response.length < minLength) {
        response += "——本对话由焦糖的大语言模型JoTangLM支持——焦糖工作室(Jotang Studio)";
        return response.slice(0, minLength);
    } else {
        return response;
    }
}

function chatToLocalStorage() {
    localStorage.setItem('chats', JSON.stringify(chats));
}

function changeTheme() {
    document.body.classList.toggle('dark-theme', themeSelect.value === 'dark');
}

newChatBtn.addEventListener('click', createNewChat);
sendBtn.addEventListener('click', sendMessage);
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});
themeSelect.addEventListener('change', changeTheme);

if (chats.length === 0) {
    createNewChat();
} else {
    ChatList();
    switchToChat(chats[0].id);
}