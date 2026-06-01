import { useState, useRef, useEffect } from "react";
import { Send, X, Paperclip, Image as ImageIcon, FileText, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { obtenerConversacion, enviarMensaje, type Mensaje } from "@/services/mensajeService";

interface ChatPanelProps {
  contactName: string;
  contactInitials: string;
  contactRole: string;
  contactId: string; // ID del otro usuario
  isOpen: boolean;
  onClose: () => void;
}

const ChatPanel = ({ contactName, contactInitials, contactRole, contactId, isOpen, onClose }: ChatPanelProps) => {
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const miId = localStorage.getItem('user_profile') ? JSON.parse(localStorage.getItem('user_profile')!).id : null;

  const cargarMensajes = async () => {
    if (!contactId) return;
    try {
      const data = await obtenerConversacion(contactId);
      setMensajes(data);
    } catch {
      // Silenciar si falla la carga
    }
  };

  useEffect(() => {
    if (isOpen && contactId) {
      cargarMensajes();
      const intervalo = setInterval(cargarMensajes, 5000); // Polling cada 5s
      return () => clearInterval(intervalo);
    }
  }, [isOpen, contactId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensajes]);

  const handleSend = async () => {
    if (!texto.trim() || !contactId) return;
    const textoEnviar = texto.trim();
    setTexto("");
    setEnviando(true);
    try {
      const msg = await enviarMensaje(contactId, textoEnviar);
      setMensajes(prev => [...prev, msg]);
    } catch {
      setTexto(textoEnviar); // Restaurar si falla
    } finally {
      setEnviando(false);
    }
  };

  const handleArchivo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const archivo = e.target.files?.[0];
    if (!archivo || !contactId) return;
    setEnviando(true);
    try {
      const msg = await enviarMensaje(contactId, undefined, archivo);
      setMensajes(prev => [...prev, msg]);
    } catch (err) {
      console.error("Error al enviar archivo:", err);
    } finally {
      setEnviando(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const formatearHora = (fecha: string) => {
    return new Date(fecha).toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit", hour12: true });
  };

  const renderMensaje = (msg: Mensaje) => {
    const esMio = msg.emisor_id === miId;
    return (
      <div key={msg.id} className={`flex ${esMio ? "justify-end" : "justify-start"}`}>
        <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
          esMio ? "bg-primary text-primary-foreground rounded-br-md" : "bg-muted text-foreground rounded-bl-md"
        }`}>
          {msg.tipo === 'texto' && (
            <p className="text-sm leading-relaxed">{msg.contenido}</p>
          )}
          {msg.tipo === 'imagen' && (
            <a href={msg.url_archivo} target="_blank" rel="noopener noreferrer">
              <img src={msg.url_archivo} alt="imagen" className="max-w-full rounded-lg max-h-48 object-cover" />
            </a>
          )}
          {msg.tipo === 'video' && (
            <a href={msg.url_archivo} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm">
              <Video className="w-4 h-4" />{msg.nombre_archivo}
            </a>
          )}
          {msg.tipo === 'documento' && (
            <a href={msg.url_archivo} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm">
              <FileText className="w-4 h-4" />{msg.nombre_archivo}
            </a>
          )}
          <p className={`text-[10px] mt-1 ${esMio ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
            {formatearHora(msg.created_at)} {esMio && (msg.leido ? "✓✓" : "✓")}
          </p>
        </div>
      </div>
    );
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
          <p className="text-xs text-muted-foreground">{contactRole}</p>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Mensajes */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {mensajes.length === 0 && (
          <p className="text-center text-xs text-muted-foreground pt-8">No hay mensajes aún. ¡Sé el primero en escribir!</p>
        )}
        {mensajes.map(renderMensaje)}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t bg-card">
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept="image/*,video/*,.pdf,.doc,.docx,.xlsx"
          onChange={handleArchivo}
        />
        <form onSubmit={e => { e.preventDefault(); handleSend(); }} className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick={() => fileInputRef.current?.click()}
            disabled={enviando}
            title="Adjuntar archivo"
          >
            <Paperclip className="w-4 h-4 text-muted-foreground" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick={() => { if (fileInputRef.current) { fileInputRef.current.accept = "image/*"; fileInputRef.current.click(); } }}
            disabled={enviando}
            title="Enviar imagen"
          >
            <ImageIcon className="w-4 h-4 text-muted-foreground" />
          </Button>
          <Input
            placeholder="Escribe un mensaje..."
            value={texto}
            onChange={e => setTexto(e.target.value)}
            className="flex-1 h-9 text-sm"
            disabled={enviando}
          />
          <Button type="submit" size="icon" className="h-8 w-8 shrink-0" disabled={!texto.trim() || enviando}>
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ChatPanel;
