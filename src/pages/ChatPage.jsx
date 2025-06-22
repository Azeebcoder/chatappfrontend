import { useParams } from "react-router-dom";
import ChatBox from "../components/ChatBox.jsx"; // Adjust the import path as necessary

const ChatPage = () => {
  const { chatId } = useParams();
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <ChatBox chatId={chatId} />
    </div>
  );
};

export default ChatPage;
