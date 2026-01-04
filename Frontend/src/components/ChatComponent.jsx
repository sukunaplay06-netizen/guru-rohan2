import { useState } from "react";
import { Button } from "./ui/button";
import { Send, MessageCircle, Users } from "lucide-react";
import socket from "./socket";

const ChatComponent = ({
  selectedUser,
  adminName,
  onSelectUser,
  onlineUsers,
  chatMessages,
  onReply,
  onBroadcast,
  replyMessage,
  setReplyMessage,
  broadcastMessage,
  setBroadcastMessage
}) => {

  const handleReply = () => {
    if (replyMessage.trim() && selectedUser?._id) {
      const privateRoom = `private_${selectedUser._id}`;

      socket.emit("adminReply", {
        room: privateRoom,
        message: replyMessage,
        adminName,
        targetUserId: selectedUser._id
      });

      onReply(replyMessage);
      setReplyMessage("");
    }
  };

  const handleBroadcast = () => {
    if (broadcastMessage.trim()) {
      socket.emit("adminBroadcast", {
        message: broadcastMessage,
        adminName
      });

      onBroadcast(broadcastMessage);
      setBroadcastMessage("");
    }
  };

  return (
    <div className="flex gap-4">
      {/* USERS */}
      <div className="w-1/3 bg-gray-50 p-4 rounded border">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Users className="h-4 w-4" />
          Online Users ({onlineUsers.length})
        </h3>

        <div className="space-y-2 max-h-96 overflow-y-auto">
          {onlineUsers.map((user) => (
            <Button
              key={user._id}
              variant={selectedUser?._id === user._id ? "default" : "outline"}

              className="w-full justify-start"
              onClick={() => onSelectUser(user)}
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              {user.userName}
            </Button>
          ))}
        </div>
      </div>

      {/* CHAT */}
      <div className="w-2/3 space-y-4">
        {selectedUser ? (
          <>
            <h3 className="font-semibold">
              Chat with {selectedUser.userName}
            </h3>

            <div
              className="h-64 border rounded overflow-y-auto p-2 bg-white"
              ref={(el) => el && (el.scrollTop = el.scrollHeight)}
            >
              {chatMessages.map((msg, i) => (
                <div key={i} className={`mb-2 p-2 rounded ${msg.senderId === "admin" ? "bg-blue-100 ml-auto" : "bg-gray-100"}`}>
                  <strong>{msg.userName}:</strong> {msg.message}
                </div>
              ))}
            </div>


            <div className="flex gap-2">
              <input
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleReply()}
                placeholder="Reply to user..."
                className="flex-1 p-2 border rounded"
              />
              <Button onClick={handleReply}>
                <Send className="h-4 w-4 mr-2" /> Reply
              </Button>
            </div>
          </>
        ) : (
          <>
            <h3 className="font-semibold">General Broadcast</h3>

            <div className="h-64 border rounded overflow-y-auto p-2 bg-white">
              {chatMessages
                .filter((msg) => msg.isBroadcast)
                .map((msg, i) => (
                  <div key={i} className="bg-gray-100 p-2 mb-2 rounded">
                    <strong>{msg.userName}:</strong> {msg.message}
                  </div>
                ))}
            </div>

            <div className="flex gap-2">
              <input
                value={broadcastMessage}
                onChange={(e) => setBroadcastMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleBroadcast()}
                placeholder="Broadcast to all..."
                className="flex-1 p-2 border rounded"
              />
              <Button onClick={handleBroadcast}>
                <Send className="h-4 w-4 mr-2" /> Broadcast
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ChatComponent;
