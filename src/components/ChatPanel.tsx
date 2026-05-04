import { useState, useRef, useEffect } from "react";
import { Send, X, Paperclip, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface Message {
  id: number;
  sender: "me" | "other";
  text: string;
  time: string;
  read: boolean;
}

interface ChatPanelProps {
  contactName: string;
  contactInitials: string;
  contactRole: string;
  isOpen: boolean;
  onClose: () => void;
}

const initialMessages: Message[] = [
  { id: 1, sender: "other", text: "¡Hola! Vi tu solicitud de servicio. ¿En qué puedo ayudarte?", time: "10:30 AM", read: true },
  { id: 2, sender: "me", text: "Hola, necesito una reparación de tubería en la cocina. Tiene una fuga pequeña.", time: "10:32 AM", read: true },
  { id: 3, sender: "other", text: "Entendido. ¿Podrías enviarme una foto del problema para darte un presupuesto más preciso?", time: "10:33 AM", read: true },
  { id: 4, sender: "me", text: "Claro, te la envío ahora. También quería saber si puedes venir este sábado.", time: "10:35 AM", read: true },
  { id: 5, sender: "other", text: "Sí, tengo disponibilidad el sábado de 9AM a 1PM. El costo estimado sería entre $40.000 y $60.000 dependiendo del tipo de tubería. ¿Te parece bien?", time: "10:37 AM", read: true },
];

const ChatPanel = ({ contactName, contactInitials, contactRole, isOpen, onClose }: ChatPanelProps) => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!newMessage.trim()) return;
    const now = new Date();
    const timeStr = now.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit", hour12: true });
    setMessages(prev => [...prev, {
      id: prev.length + 1,
      sender: "me",
      text: newMessage.trim(),
      time: timeStr,
      read: false,
    }]);
    setNewMessage("");

    // Simulated auto-reply
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: prev.length + 1,
        sender: "other",
        text: "¡Perfecto! Quedamos entonces. Te confirmo la hora exacta el viernes. 👍",
        time: new Date().toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit", hour12: true }),
        read: false,
      }]);
    }, 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 w-[380px] h-[520px] bg-card border rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden animate-in slide-in-from-bottom-4">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b bg-primary/5">
        <Avatar className="w-10 h-10">
          <AvatarFallback className="bg-primary text-primary-foreground text-sm font-semibold">{contactInitials}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h3 className="font-semibold text-foreground text-sm">{contactName}</h3>
          <p className="text-xs text-muted-foreground">{contactRole} · <span className="text-success">En línea</span></p>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.sender === "me" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
              msg.sender === "me"
                ? "bg-primary text-primary-foreground rounded-br-md"
                : "bg-muted text-foreground rounded-bl-md"
            }`}>
              <p className="text-sm leading-relaxed">{msg.text}</p>
              <p className={`text-[10px] mt-1 ${msg.sender === "me" ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                {msg.time} {msg.sender === "me" && (msg.read ? "✓✓" : "✓")}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t bg-card">
        <form onSubmit={e => { e.preventDefault(); handleSend(); }} className="flex items-center gap-2">
          <Button type="button" variant="ghost" size="icon" className="h-8 w-8 shrink-0">
            <Paperclip className="w-4 h-4 text-muted-foreground" />
          </Button>
          <Button type="button" variant="ghost" size="icon" className="h-8 w-8 shrink-0">
            <ImageIcon className="w-4 h-4 text-muted-foreground" />
          </Button>
          <Input
            placeholder="Escribe un mensaje..."
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            className="flex-1 h-9 text-sm"
          />
          <Button type="submit" size="icon" className="h-8 w-8 shrink-0" disabled={!newMessage.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ChatPanel;
