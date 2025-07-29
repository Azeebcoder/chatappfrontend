import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import axios from "../utils/AxiosConfig.jsx";
import socket from "../utils/socket.js";

import ChatHeader from "../components/ChatHeader.jsx";
import MessageInput from "../components/MessageInput.jsx";
import MessageList from "../components/MessageList.jsx";

const ChatPage = () => {
  const { chatId } = useParams();
  const [content, setContent] = useState("");
  const [messages, setMessages] = useState([]);
  const [chatUser, setChatUser] = useState(null);
  const [userId, setUserId] = useState("");
  const [typing, setTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [skip, setSkip] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [limit] = useState(20);

  const containerRef = useRef(null);
  const bottomRef = useRef(null);
  const notificationAudio = useRef(null);
  const typingTimeoutRef = useRef(null);
  const isAtBottomRef = useRef(true); // Track if user is near bottom

  /** Load notification sound */
  useEffect(() => {
    notificationAudio.current = new Audio("/notification.mp3");
    notificationAudio.current.load();
  }, []);

  /** Detect scroll position */
  const handleScroll = () => {
    const container = containerRef.current;
    if (!container) return;
    isAtBottomRef.current =
      container.scrollHeight - container.scrollTop - container.clientHeight < 50;

    if (hasMore && container.scrollTop < 50 && !isLoadingMore) {
      fetchMessages(true);
    }
  };

  /** Fetch Chat User Info */
  useEffect(() => {
    const fetchChatUser = async () => {
      try {
        const { data } = await axios.get(`/message/user/${chatId}`);
        setChatUser(data);
      } catch (err) {
        console.error("Error fetching chat user:", err);
      }
    };
    if (chatId) fetchChatUser();
  }, [chatId]);

  /** Fetch Current User ID */
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const { data } = await axios.get("/chat/me");
        setUserId(data.data._id);
      } catch (err) {
        console.error("Failed to fetch current user:", err);
      }
    };
    fetchCurrentUser();
  }, []);

  /** Fetch Messages with Scroll Preservation */
  const fetchMessages = async (loadMore = false) => {
    if (isLoadingMore) return;
    try {
      setIsLoadingMore(true);
      const res = await axios.get(`/message/getmessage/${chatId}?limit=${limit}&skip=${loadMore ? skip : 0}`);
      const newMessages = res.data;

      if (loadMore) {
        const container = containerRef.current;
        const prevScrollHeight = container.scrollHeight;

        setMessages((prev) => [...newMessages, ...prev]);
        setSkip((prev) => prev + newMessages.length);

        requestAnimationFrame(() => {
          const newScrollHeight = container.scrollHeight;
          container.scrollTop = newScrollHeight - prevScrollHeight;
        });
      } else {
        setMessages(newMessages);
        setSkip(newMessages.length);
        requestAnimationFrame(() => {
          bottomRef.current?.scrollIntoView({ behavior: "auto" });
        });
      }

      if (newMessages.length < limit) setHasMore(false);
    } catch (err) {
      console.error("Failed to fetch messages:", err);
    } finally {
      setIsLoadingMore(false);
    }
  };

  /** Load Messages when chat changes */
  useEffect(() => {
    if (chatId) {
      setSkip(0);
      setHasMore(true);
      fetchMessages(false);
    }
  }, [chatId]);

  /** Socket Join and Events */
  useEffect(() => {
    if (chatId) socket.emit("joinChat", chatId);
    return () => socket.emit("leaveChat", chatId);
  }, [chatId]);

  /** Handle new incoming messages */
  useEffect(() => {
    const handleNewMessage = (message) => {
      if (message.chat === chatId) {
        setMessages((prev) => {
          const exists = prev.some((m) => m._id === message._id);
          return exists ? prev : [...prev, message];
        });

        if (isAtBottomRef.current) {
          setTimeout(() => {
            bottomRef.current?.scrollIntoView({ behavior: "smooth" });
          }, 100);
        }

        if (message.sender._id !== userId) {
          notificationAudio.current?.play().catch(() => {});
        }
      }
    };
    socket.on("newMessage", handleNewMessage);
    return () => socket.off("newMessage", handleNewMessage);
  }, [chatId, userId]);

  /** Typing and Online Users */
  /** Typing & Online Status */
useEffect(() => {
  if (!chatUser?._id) return;

  const handleTyping = (id) => {
    if (id === chatUser._id) setTyping(true);
  };

  const handleStopTyping = (id) => {
    if (id === chatUser._id) setTyping(false);
  };

  socket.on("typing", handleTyping);
  socket.on("stopTyping", handleStopTyping);

  return () => {
    socket.off("typing", handleTyping);
    socket.off("stopTyping", handleStopTyping);
  };
}, [chatUser?._id]);


  /** Send Message */
  const sendMessage = async (e, retryId = null) => {
    e?.preventDefault();
    const trimmed = content.trim();
    if (!trimmed && !retryId) return;

    const tempId = retryId || `temp-${Date.now()}`;
    const msgContent = retryId
      ? messages.find((m) => m._id === retryId)?.content
      : trimmed;

    const tempMsg = {
      _id: tempId,
      content: msgContent,
      sender: { _id: userId, username: "You" },
      chat: chatId,
      status: "sending",
      read: false,
    };

    if (!retryId) {
      setMessages((prev) => [...prev, tempMsg]);
      setContent("");
    } else {
      setMessages((prev) =>
        prev.map((m) => (m._id === retryId ? tempMsg : m))
      );
    }

    try {
      const { data } = await axios.post(
        `/message/sendmessage/${chatId}`,
        { content: msgContent, messageType: "text", attachments: [] }
      );
      setMessages((prev) => {
        const filtered = prev.filter((m) => m._id !== tempId);
        return filtered.some((m) => m._id === data._id)
          ? filtered
          : [...filtered, data];
      });
      socket.emit("newMessage", chatId);

      // Auto scroll to bottom
      setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch {
      setMessages((prev) =>
        prev.map((m) =>
          m._id === tempId ? { ...m, status: "failed" } : m
        )
      );
    }
  };

  return (
    <div className="flex flex-col h-[100dvh] bg-gradient-to-br from-gray-900 to-black text-white">
      <ChatHeader chatId={chatId} chatUser={chatUser} setChatUser={setChatUser}/>
      
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-4 pt-4 pb-28 space-y-3 scrollbar-thin scrollbar-thumb-gray-600"
      >
        {hasMore && isLoadingMore && (
          <div className="text-center text-sm text-gray-500">Loading older messages...</div>
        )}
        <MessageList
          messages={messages}
          userId={userId}
          chatUser={chatUser}
          typing={typing}
          onRetry={sendMessage}
        />
        <div ref={bottomRef} />
      </div>

      <MessageInput
        content={content}
        setContent={setContent}
        sendMessage={sendMessage}
        socket={socket}
        chatId={chatId}
        isTyping={isTyping}
        setIsTyping={setIsTyping}
        typingTimeoutRef={typingTimeoutRef}
      />
    </div>
  );
};

export default ChatPage;
