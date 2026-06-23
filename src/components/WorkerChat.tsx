import { useWorkerChatMutation } from '../store/api';
import { ChatWidget, type ChatMsg } from './ChatWidget';

export function WorkerChat() {
  const [chat, { isLoading }] = useWorkerChatMutation();

  const sendMessage = async (message: string, history: ChatMsg[]) => {
    const res = await chat({ message, history }).unwrap();
    return res.reply;
  };

  return (
    <ChatWidget
      title="🤖 Help & document support"
      hint='Try: "What documents do I need?" or "Why was my document rejected?"'
      placeholder="Ask about documents or your status…"
      isLoading={isLoading}
      sendMessage={sendMessage}
    />
  );
}
