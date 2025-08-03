import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import axios from "../utils/AxiosConfig.jsx";
import socket from "../utils/socket.js";

import ChatHeader from "../components/ChatHeader.jsx";
import MessageInput from "../components/MessageInput.jsx";
import MessageList from "../components/MessageList.jsx";
import { useSocket } from "../store/SocketContext.jsx";

const ChatPage = () => {
  const { chatId } = useParams();
  const { activeUsers } = useSocket();

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
  const [editingMessage, setEditingMessage] = useState(null);

  const containerRef = useRef(null);
  const bottomRef = useRef(null);
  const notificationAudio = useRef(null);
  const typingTimeoutRef = useRef(null);
  const isAtBottomRef = useRef(true);

  const isChatUserOnline = chatUser?._id && activeUsers.includes(chatUser._id);

  useEffect(() => {
    notificationAudio.current = new Audio("/notification.mp3");
    notificationAudio.current.load();
  }, []);

  const handleScroll = () => {
    const container = containerRef.current;
    if (!container) return;

    isAtBottomRef.current =
      container.scrollHeight - container.scrollTop - container.clientHeight < 50;

    if (hasMore && container.scrollTop < 50 && !isLoadingMore) {
      fetchMessages(true);
    }
  };

  const onCancelEdit = () => {
    setEditingMessage(null);
    setContent("");
  };

  const fetchMessages = async (loadMore = false) => {
    if (isLoadingMore) return;

    try {
      setIsLoadingMore(true);
      const res = await axios.get(
        `/message/getmessage/${chatId}?limit=${limit}&skip=${loadMore ? skip : 0}`
      );
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

  useEffect(() => {
    if (chatId) {
      setSkip(0);
      setHasMore(true);
      fetchMessages(false);
    }
  }, [chatId]);

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

  useEffect(() => {
    if (!chatId) return;

    socket.emit("joinChat", chatId);
    socket.emit("getActiveUsers");

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

        if (
          (message.sender._id || message.sender) !== userId &&
          document.visibilityState === "visible"
        ) {
          notificationAudio.current?.play().catch(() => {});
        }
      }
    };

    const handleEditMessage = (updatedMessage) => {
      setMessages((prev) =>
        prev.map((msg) => (msg._id === updatedMessage._id ? updatedMessage : msg))
      );
    };

    const handleDeleteMessage = (deletedId) => {
      setMessages((prev) => prev.filter((m) => m._id !== deletedId));
    };

    const handleTyping = (id) => {
      if (id === chatUser?._id) setTyping(true);
    };

    const handleStopTyping = (id) => {
      if (id === chatUser?._id) setTyping(false);
    };

    const handleMessagesDelivered = ({ userId: senderId, messageIds }) => {
      setMessages((prev) =>
        prev.map((m) =>
          messageIds.includes(m._id) ? { ...m, status: "delivered" } : m
        )
      );
    };

    const handleMessagesRead = ({ userId: readerId, messageIds }) => {
      setMessages((prev) =>
        prev.map((m) =>
          messageIds.includes(m._id) ? { ...m, status: "read" } : m
        )
      );
    };

    socket.on("newMessage", handleNewMessage);
    socket.on("editMessage", handleEditMessage);
    socket.on("deleteMessage", handleDeleteMessage);
    socket.on("typing", handleTyping);
    socket.on("stopTyping", handleStopTyping);
    socket.on("messagesDelivered", handleMessagesDelivered);
    socket.on("messagesRead", handleMessagesRead);

    return () => {
      socket.emit("leaveChat", chatId);
      socket.off("newMessage", handleNewMessage);
      socket.off("editMessage", handleEditMessage);
      socket.off("deleteMessage", handleDeleteMessage);
      socket.off("typing", handleTyping);
      socket.off("stopTyping", handleStopTyping);
      socket.off("messagesDelivered", handleMessagesDelivered);
      socket.off("messagesRead", handleMessagesRead);
    };
  }, [chatId, chatUser?._id, userId, isChatUserOnline]);

  useEffect(() => {
    if (!chatId || !userId || !isChatUserOnline || messages.length === 0) return;

    const undelivered = messages.some(
      (msg) =>
        (msg.sender._id || msg.sender) !== userId &&
        (msg.status === "sent" || msg.status === undefined)
    );

    if (undelivered && document.visibilityState === "visible") {
      socket.emit("messageDelivered", { chatId });
    }
  }, [isChatUserOnline, messages, chatId, userId]);

  useEffect(() => {
    if (!chatId || !userId || messages.length === 0) return;

    const unreadMessages = messages
      .filter((msg) => (msg.sender._id || msg.sender) !== userId && msg.status !== "read")
      .map((msg) => msg._id);

    if (unreadMessages.length > 0) {
      socket.emit("messageRead", { chatId, messageIds: unreadMessages });
    }
  }, [messages, userId, chatId]);

  const sendMessage = async (e, retryId = null) => {
    e?.preventDefault();
    const trimmed = content.trim();
    if (!trimmed && !retryId) return;

    if (editingMessage) {
      try {
        const { data } = await axios.put(`/message/edit/${editingMessage._id}`, {
          content: trimmed,
        });
        socket.emit("editMessage", data);
        setMessages((prev) =>
          prev.map((msg) => (msg._id === data._id ? data : msg))
        );
        setEditingMessage(null);
        setContent("");
      } catch (err) {
        console.error("Failed to edit message:", err);
      }
      return;
    }

    const tempId = retryId || `temp-${Date.now()}`;
    const msgContent = retryId
      ? messages.find((m) => m._id === retryId)?.content
      : trimmed;

    const tempMsg = {
      _id: tempId,
      content: msgContent,
      sender: userId,
      chat: chatId,
      status: "sending",
      read: false,
    };

    if (!retryId) {
      setMessages((prev) => [...prev, tempMsg]);
      setContent("");
    } else {
      setMessages((prev) => prev.map((m) => (m._id === retryId ? tempMsg : m)));
    }

    try {
      const { data } = await axios.post(`/message/sendmessage/${chatId}`, {
        content: msgContent,
        messageType: "text",
        attachments: [],
      });
      setMessages((prev) => {
        const filtered = prev.filter((m) => m._id !== tempId);
        return filtered.some((m) => m._id === data._id)
          ? filtered
          : [...filtered, data];
      });
      socket.emit("newMessage", data);
      setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch {
      setMessages((prev) =>
        prev.map((m) => (m._id === tempId ? { ...m, status: "failed" } : m))
      );
    }
  };

  const handleDelete = async (messageId) => {
    try {
      await axios.delete(`/message/delete/${messageId}`);
      setMessages((prev) => prev.filter((m) => m._id !== messageId));
    } catch (err) {
      console.error("Failed to delete message", err);
    }
  };

  const handleEdit = (msg) => {
    setEditingMessage(msg);
    setContent(msg.content);
  };

  useEffect(() => {
    if (typing && isAtBottomRef.current) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [typing]);

  return (
    <div className="flex flex-col h-[100dvh] bg-gradient-to-br from-gray-900 to-black text-white">
      <div className="fixed top-0 left-0 right-0 z-10 bg-gradient-to-br from-gray-900 to-black">
        <ChatHeader
          chatId={chatId}
          chatUser={chatUser}
          isChatUserOnline={isChatUserOnline}
          setChatUser={setChatUser}
        />
      </div>

      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="pt-[64px] pb-28 px-4 overflow-y-auto h-[100dvh] space-y-3 scrollbar-thin scrollbar-thumb-gray-600"
      >
        {hasMore && isLoadingMore && (
          <div className="text-center text-sm text-gray-500">
            Loading older messages...
          </div>
        )}
        <MessageList
          messages={messages}
          userId={userId}
          chatUser={chatUser}
          typing={typing}
          onRetry={sendMessage}
          onDelete={handleDelete}
          onEdit={handleEdit}
          bottomRef={bottomRef}
          editingMessageId={editingMessage?._id}
          onCancelEdit={onCancelEdit}
        />
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
        editingMessage={editingMessage}
        onCancelEdit={onCancelEdit}
        setEditingMessage={setEditingMessage}
      />
    </div>
  );
};

export default ChatPage;
