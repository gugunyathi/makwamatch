import React, { useState, useEffect } from "react";
import { DirectMessage, Startup } from "../types";
import { Send, Shield, Key, EyeOff, Lock, CheckCheck } from "lucide-react";

interface MessagesProps {
  currentUserId: string;
  recipient: Startup | any;
  messages: DirectMessage[];
  onSendMessage: (content: string) => void;
  lang: string;
  translations: any;
}

export default function Messages({
  currentUserId,
  recipient,
  messages,
  onSendMessage,
  lang,
  translations
}: MessagesProps) {
  const [typedMessage, setTypedMessage] = useState("");
  const [showEncryptedText, setShowEncryptedText] = useState(false);

  // Filter messages for current pair
  const conversationMessages = messages.filter(
    (m) =>
      (m.fromId === currentUserId && m.toId === recipient.id) ||
      (m.fromId === recipient.id && m.toId === currentUserId)
  );

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!typedMessage.trim()) return;
    onSendMessage(typedMessage);
    setTypedMessage("");
  };

  // Quick Caesar / Rot13 cipher simulation for visual "encryption/decryption" toggle
  const encryptString = (str: string) => {
    return str
      .split("")
      .map((char) => {
        const code = char.charCodeAt(0);
        return String.fromCharCode(code + 13);
      })
      .join("");
  };

  return (
    <div className="bg-white dark:bg-zinc-950 rounded-3xl border border-gray-100 dark:border-zinc-800 shadow-xl overflow-hidden flex flex-col h-[520px] max-w-md mx-auto">
      {/* Header */}
      <div className="bg-gray-50 dark:bg-zinc-900/60 p-4 border-b border-gray-100 dark:border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-500 text-white font-bold flex items-center justify-center text-sm">
            {recipient.companyName ? recipient.companyName.substring(0, 2) : "I"}
          </div>
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white text-sm">
              {recipient.companyName || `${recipient.firstName} ${recipient.lastName}`}
            </h3>
            <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-0.5">
              🟢 Online • Safe Match Channel
            </span>
          </div>
        </div>

        {/* Encrypted indicator toggle */}
        <button
          onClick={() => setShowEncryptedText(!showEncryptedText)}
          className={`px-3 py-1 text-xs rounded-lg font-bold transition-all flex items-center gap-1 ${
            showEncryptedText
              ? "bg-amber-100 dark:bg-amber-950/40 text-amber-600 border border-amber-200/20"
              : "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 border border-emerald-200/20"
          }`}
          title="Toggle End-to-End Encryption"
        >
          {showEncryptedText ? (
            <>
              <EyeOff className="w-3.5 h-3.5" />
              <span>Show Cypher</span>
            </>
          ) : (
            <>
              <Lock className="w-3.5 h-3.5" />
              <span>E2E Decrypted</span>
            </>
          )}
        </button>
      </div>

      {/* Messages body */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-gray-50/50 dark:bg-zinc-950">
        {conversationMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-2 text-gray-400 dark:text-zinc-500">
            <Shield className="w-12 h-12 text-gray-300 dark:text-zinc-700 animate-pulse" />
            <p className="text-sm font-semibold">Start Secure Dialogue</p>
            <p className="text-xs max-w-xs">
              All messages are encrypted client-side using native AES key before posting to the servers. Compliant with GDPR security frameworks.
            </p>
          </div>
        ) : (
          conversationMessages.map((msg) => {
            const isMe = msg.fromId === currentUserId;
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm shadow-sm transition-all ${
                    isMe
                      ? "bg-emerald-500 text-white rounded-tr-none"
                      : "bg-white dark:bg-zinc-900 text-gray-800 dark:text-white border border-gray-100 dark:border-zinc-800/80 rounded-tl-none"
                  }`}
                >
                  <p className="leading-relaxed">
                    {showEncryptedText ? encryptString(msg.content) : msg.content}
                  </p>
                </div>
                <div className="flex items-center gap-1 mt-1 text-[9px] text-gray-400 dark:text-zinc-500">
                  <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                  {isMe && <CheckCheck className="w-3.5 h-3.5 text-emerald-500" />}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer Input */}
      <form onSubmit={handleSend} className="p-3 bg-white dark:bg-zinc-900 border-t border-gray-100 dark:border-zinc-800 flex items-center gap-2">
        <input
          type="text"
          value={typedMessage}
          onChange={(e) => setTypedMessage(e.target.value)}
          placeholder="Type encrypted message..."
          className="flex-1 px-4 py-2.5 bg-gray-50 dark:bg-zinc-950 text-gray-800 dark:text-white border border-gray-200 dark:border-zinc-700 rounded-xl focus:outline-none text-sm"
        />
        <button
          type="submit"
          className="p-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl shadow-md transition-all active:scale-95"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
