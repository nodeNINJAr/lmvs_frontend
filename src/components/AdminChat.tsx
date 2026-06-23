import { useAdminChatMutation } from '../store/api';
import { ChatWidget, type ChatMsg } from './ChatWidget';

export function AdminChat() {
  const [chat, { isLoading }] = useAdminChatMutation();

  const sendMessage = async (message: string, history: ChatMsg[]) => {
    const res = await chat({ message, history }).unwrap();
    return res.reply;
  };

  return (
    <ChatWidget
      title="🤖 Ask about workers & stats"
      hint='Try: "How many workers are verified?" or "Tell me about worker 01900000000."'
      placeholder="Ask about a worker or stats…"
      isLoading={isLoading}
      sendMessage={sendMessage}
    />
  );
}
