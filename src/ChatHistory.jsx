import React from 'react';

const ChatHistory = ({ chats, onSelectChat, selectedChatId, onCreateNewChat }) => {
  return (
    <div className="w-full md:w-1/4 h-screen bg-dark-background/80 p-4 rounded-l-lg shadow-lg flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-funky-cyan">Chats</h2>
        <button
          onClick={onCreateNewChat}
          className="p-2 rounded-full bg-funky-purple hover:bg-funky-pink transition-colors duration-200"
          title="New Chat"
        >
          <i className="fas fa-plus text-white"></i>
        </button>
      </div>
      <ul className="flex-grow overflow-y-auto">
        {chats.map((chat) => (
          <li
            key={chat.id}
            onClick={() => onSelectChat(chat.id)}
            className={`p-3 my-2 rounded-lg cursor-pointer truncate ${
              selectedChatId === chat.id ? 'bg-funky-purple' : 'bg-dark-background/50 hover:bg-funky-purple/50'
            }`}
          >
            {chat.title}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ChatHistory;