import React, { useContext, useEffect, useRef, useState } from 'react';
import assets from '../assets/assets';
import { formatMessageTime } from '../lib/utils';

import { ChatContext } from '../../context/ChatContext';
import { AuthContext } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const ChatContainer = () => {
  const { messages, selectedUser, setSelectedUser, sendMessage, getMessages } = useContext(ChatContext);
  const { authUser, onlineUsers } = useContext(AuthContext);
  const scrollEnd = useRef();
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Trigger loading animation for 4 seconds when selectedUser changes
  useEffect(() => {
    if (selectedUser) {
      setIsLoading(true);
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 7000); // 4 seconds
      return () => clearTimeout(timer); // Cleanup on unmount or selectedUser change
    }
  }, [selectedUser]);

  // Handle sending a text message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (input.trim() === '') return;
    try {
      await sendMessage({ text: input.trim() });
      setInput('');
    } catch (error) {
      toast.error('Failed to send message');
    }
  };

  // Handle sending an image
  const handleSendImage = async (e) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        await sendMessage({ image: reader.result });
        e.target.value = ''; // Reset file input
      } catch (error) {
        toast.error('Failed to send image');
      }
    };
    reader.readAsDataURL(file);
  };

  // Fetch messages when selectedUser changes
  useEffect(() => {
    if (selectedUser) {
      getMessages(selectedUser._id);
    }
  }, [selectedUser, getMessages]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollEnd.current && messages && !isLoading) {
      scrollEnd.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  return selectedUser ? (
    isLoading ? (
      <div className="h-full flex flex-col items-center justify-center bg-[#8185B2]/10" aria-live="polite" aria-label="Loading chat...">
        <div className="relative w-20 h-20">
          {/* Outer ring with gradient and spin */}
          <div
            className="absolute inset-0 border-4 border-t-transparent rounded-full animate-spin"
            style={{ borderImage: 'linear-gradient(45deg, #8B5CF6, #EC4899) 1' }}
          ></div>
          {/* Middle ring with reverse spin and pulsating effect */}
          <div
            className="absolute inset-2 border-4 border-t-transparent rounded-full animate-[spin_1.5s_linear_infinite, pulse_2s_ease-in-out_infinite]"
            style={{ borderImage: 'linear-gradient(45deg, #A78BFA, #F472B6) 1' }}
          ></div>
          {/* Inner ring with faster spin */}
          <div
            className="absolute inset-4 border-2 border-t-transparent rounded-full animate-spin"
            style={{ borderImage: 'linear-gradient(45deg, #C4B5FD, #F9A8D4) 1' }}
          ></div>
        </div>
        <p className="mt-4 text-gray-400 text-sm font-light animate-[fadeIn_1s_ease-in-out]">
          Loading Chat...
        </p>
      </div>
    ) : (
      <div className="h-full overflow-scroll relative backdrop-blur-lg">
        {/*-------header-------*/}
        <div className="flex items-center gap-3 py-3 mx-4 border-b border-stone-500">
          <img
            src={selectedUser.profilePic || assets.avatar_icon}
            alt=""
            className="w-8 rounded-full"
          />
          <p className="flex-1 text-lg text-white flex items-center gap-2">
            {selectedUser.fullName}
            {onlineUsers && onlineUsers.includes(selectedUser._id) && (
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
            )}
          </p>
          <img
            onClick={() => setSelectedUser(null)}
            src={assets.arrow_icon}
            alt=""
            className="md:hidden max-w-7"
          />
          <img src={assets.help_icon} alt="" className="max-md:hidden max-w-5" />
        </div>
        {/*-------chat messages-------*/}
        <div className="flex flex-col h-[calc(100%-120px)] overflow-y-scroll p-3 pb-6">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex items-end gap-2 justify-end ${
                msg.senderId !== authUser?._id && 'flex-row-reverse'
              }`}
            >
              {msg.image ? (
                <img
                  src={msg.image}
                  alt=""
                  className="max-w-[230px] border border-gray-700 rounded-lg overflow-hidden mb-8"
                />
              ) : (
                <p
                  className={`p-2 max-w-[200px] md:text-sm font-light rounded-lg mb-8 break-all bg-violet-500/30 text-white ${
                    msg.senderId === authUser?._id ? 'rounded-br-none' : 'rounded-bl-none'
                  }`}
                >
                  {msg.text}
                </p>
              )}
              <div className="text-center text-xs">
                <img
                  src={
                    msg.senderId === authUser?._id
                      ? authUser?.profilePic || assets.avatar_icon
                      : selectedUser?.profilePic || assets.avatar_icon
                  }
                  alt=""
                  className="w-7 rounded-full"
                />
                <p className="text-gray-500">{formatMessageTime(msg.createdAt)}</p>
              </div>
            </div>
          ))}
          <div ref={scrollEnd}></div>
        </div>
        {/*-------bottom area-------*/}
        <div className="absolute bottom-0 left-0 right-0 flex items-center gap-3 p-3">
          <div className="flex-1 flex items-center bg-gray-100/12 px-3 rounded-full">
            <input
              onChange={(e) => setInput(e.target.value)}
              value={input}
              onKeyDown={(e) => (e.key === 'Enter' ? handleSendMessage(e) : null)}
              type="text"
              placeholder="Send a message"
              className="flex-1 text-sm p-3 border-none rounded-lg outline-none text-white placeholder-gray-400"
            />
            <input onChange={handleSendImage} type="file" id="image" accept="image/png, image/jpeg" hidden />
            <label htmlFor="image">
              <img src={assets.gallery_icon} alt="" className="w-5 mr-2 cursor-pointer" />
            </label>
          </div>
          <img
            onClick={handleSendMessage}
            src={assets.send_button}
            alt=""
            className="w-7 cursor-pointer"
          />
        </div>
      </div>
    )
  ) : (
    <div className="flex flex-col items-center justify-center gap-2 text-gray-500 bg-white/10 max-md:hidden">
      <img src={assets.logo_icon} className="max-w-16" alt="" />
      <p>Chat anytime, anywhere</p>
    </div>
  );
};

export default ChatContainer;