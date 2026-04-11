import { useState, useRef, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Upload, X, Image, FileVideo, Sparkles, Copy, Check, Loader2, Paintbrush, Type, Download } from "lucide-react";
import { toast } from "sonner";

type MessageFile = { name: string; type: string; url: string };

type Message = {
  role: "user" | "assistant";
  content: string;
  files?: MessageFile[];
  images?: string[]; // base64 image URLs from graphic generator
};

type Mode = "caption" | "graphic";

const CAPTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/caption-generator`;
const GRAPHIC_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/graphic-generator`;

const CaptionGenerator = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [mode, setMode] = useState<Mode>("caption");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    const valid = selected.filter(f => f.size <= 10 * 1024 * 1024);
    if (valid.length < selected.length) toast.error("Files over 10MB were skipped.");
    setFiles(prev => [...prev, ...valid].slice(0, 5));
  };

  const removeFile = (idx: number) => setFiles(prev => prev.filter((_, i) => i !== idx));

  const copyCaption = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    toast.success("Caption copied!");
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const downloadImage = (dataUrl: string) => {
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `ikamba-design-${Date.now()}.png`;
    a.click();
    toast.success("Image downloaded!");
  };

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed && files.length === 0) return;

    const fileInfo = files.map(f => ({ name: f.name, type: f.type, url: URL.createObjectURL(f) }));
    const userMsg: Message = {
      role: "user",
      content: trimmed || (mode === "graphic" ? "Generate a graphic design." : "Generate a caption for these files."),
      files: fileInfo.length > 0 ? fileInfo : undefined,
    };

    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    if (mode === "graphic") {
      await sendGraphicRequest(trimmed, userMsg);
    } else {
      await sendCaptionRequest(trimmed);
    }

    setFiles([]);
  };

  const sendGraphicRequest = async (prompt: string, _userMsg: Message) => {
    try {
      // If user uploaded an image, convert to base64 for editing
      let editImage: string | undefined;
      if (files.length > 0 && files[0].type.startsWith("image")) {
        editImage = await fileToBase64(files[0]);
      }

      const resp = await fetch(GRAPHIC_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ prompt: prompt || "Generate a stunning graphic design.", editImage }),
      });

      if (!resp.ok) {
        if (resp.status === 429) { toast.error("Too many requests. Please wait a moment."); setIsLoading(false); return; }
        if (resp.status === 402) { toast.error("Service temporarily unavailable."); setIsLoading(false); return; }
        throw new Error("Failed to generate graphic");
      }

      const data = await resp.json();
      const images = (data.images || []).map((img: any) => img.image_url?.url || img.url).filter(Boolean);

      setMessages(prev => [...prev, {
        role: "assistant",
        content: data.text || "Here's your graphic design!",
        images,
      }]);
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate graphic. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const sendCaptionRequest = async (trimmed: string) => {
    const fileDescriptions = files.map(f => `[Attached: ${f.name} (${f.type})]`).join("\n");
    const fullContent = [trimmed, fileDescriptions].filter(Boolean).join("\n\n");

    const chatHistory = messages.map(m => ({ role: m.role, content: m.content }));
    chatHistory.push({ role: "user", content: fullContent });

    let assistantSoFar = "";
    try {
      const resp = await fetch(CAPTION_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: chatHistory }),
      });

      if (!resp.ok || !resp.body) {
        if (resp.status === 429) { toast.error("Too many requests. Please wait a moment."); setIsLoading(false); return; }
        if (resp.status === 402) { toast.error("Service temporarily unavailable."); setIsLoading(false); return; }
        throw new Error("Failed to generate caption");
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let streamDone = false;

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") { streamDone = true; break; }
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantSoFar += content;
              setMessages(prev => {
                const last = prev[prev.length - 1];
                if (last?.role === "assistant") {
                  return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantSoFar } : m);
                }
                return [...prev, { role: "assistant", content: assistantSoFar }];
              });
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate caption. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const clearChat = () => {
    setMessages([]);
    setFiles([]);
    setInput("");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="flex-1 flex flex-col pt-20">
        {/* Header */}
        <div className="border-b border-border bg-card">
          <div className="max-w-4xl mx-auto px-4 py-6 text-center">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-center gap-2 mb-2">
              <Sparkles className="text-accent" size={24} />
              <h1 className="text-2xl md:text-3xl font-extrabold text-foreground">
                {mode === "caption" ? "Free SEO Caption Generator" : "AI Graphic Design Studio"}
              </h1>
            </motion.div>
            <p className="text-muted-foreground text-sm max-w-lg mx-auto mb-4">
              {mode === "caption"
                ? "Describe your post or upload an image/video, and our AI will craft SEO-optimized captions tailored to your content."
                : "Describe the graphic you need — include text, colors, style — and our AI will generate hyper-realistic, professional designs instantly."}
            </p>

            {/* Mode Toggle */}
            <div className="flex items-center justify-center gap-1 bg-secondary rounded-lg p-1 max-w-xs mx-auto">
              <button
                onClick={() => { setMode("caption"); clearChat(); }}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  mode === "caption"
                    ? "bg-accent text-accent-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Type size={14} />
                Captions
              </button>
              <button
                onClick={() => { setMode("graphic"); clearChat(); }}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  mode === "graphic"
                    ? "bg-accent text-accent-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Paintbrush size={14} />
                Graphics
              </button>
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
            {messages.length === 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
                {mode === "caption" ? (
                  <Sparkles className="mx-auto text-accent mb-4" size={48} />
                ) : (
                  <Paintbrush className="mx-auto text-accent mb-4" size={48} />
                )}
                <h2 className="text-xl font-bold text-foreground mb-2">
                  {mode === "caption" ? "What are you posting about?" : "What graphic do you need?"}
                </h2>
                <p className="text-muted-foreground text-sm max-w-md mx-auto mb-6">
                  {mode === "caption"
                    ? "Tell us about your post — the platform, topic, tone — and we'll generate the perfect SEO caption."
                    : "Describe your design — include text, dimensions, style, colors — and we'll generate a hyper-realistic graphic instantly."}
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {mode === "caption"
                    ? ["Instagram product launch", "LinkedIn thought leadership", "YouTube video description", "TikTok trending content"].map(s => (
                        <button key={s} onClick={() => setInput(`I'm creating a post about: ${s}`)}
                          className="px-3 py-1.5 rounded-full border border-border bg-card text-xs text-muted-foreground hover:border-accent hover:text-accent transition-colors">
                          {s}
                        </button>
                      ))
                    : [
                        "Instagram story for a coffee brand with bold text 'WAKE UP'",
                        "Professional LinkedIn banner for a tech startup",
                        "Event flyer for a music festival with neon colors",
                        "Product showcase poster for luxury sneakers",
                      ].map(s => (
                        <button key={s} onClick={() => setInput(s)}
                          className="px-3 py-1.5 rounded-full border border-border bg-card text-xs text-muted-foreground hover:border-accent hover:text-accent transition-colors">
                          {s.length > 40 ? s.slice(0, 40) + "…" : s}
                        </button>
                      ))
                  }
                </div>
              </motion.div>
            )}

            <AnimatePresence>
              {messages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div className={`max-w-[85%] rounded-xl px-4 py-3 ${
                    msg.role === "user"
                      ? "bg-accent text-accent-foreground"
                      : "bg-card border border-border text-foreground"
                  }`}>
                    {/* Attached files */}
                    {msg.files && msg.files.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-2">
                        {msg.files.map((f, fi) => (
                          <div key={fi} className="flex items-center gap-1.5 px-2 py-1 rounded bg-background/20 text-xs">
                            {f.type.startsWith("image") ? <Image size={12} /> : <FileVideo size={12} />}
                            <span className="truncate max-w-[120px]">{f.name}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Text content */}
                    {msg.content && (
                      <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                    )}

                    {/* Generated images */}
                    {msg.images && msg.images.length > 0 && (
                      <div className="mt-3 space-y-3">
                        {msg.images.map((imgUrl, imgIdx) => (
                          <div key={imgIdx} className="relative group">
                            <img
                              src={imgUrl}
                              alt={`Generated graphic ${imgIdx + 1}`}
                              className="w-full rounded-lg shadow-lg border border-border"
                            />
                            <button
                              onClick={() => downloadImage(imgUrl)}
                              className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm border border-border rounded-lg p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                              title="Download image"
                            >
                              <Download size={16} className="text-foreground" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Copy button for captions */}
                    {msg.role === "assistant" && !msg.images?.length && (
                      <button
                        onClick={() => copyCaption(msg.content, idx)}
                        className="mt-2 flex items-center gap-1 text-xs text-muted-foreground hover:text-accent transition-colors"
                      >
                        {copiedIdx === idx ? <Check size={12} /> : <Copy size={12} />}
                        {copiedIdx === idx ? "Copied" : "Copy caption"}
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                <div className="bg-card border border-border rounded-xl px-4 py-3 flex items-center gap-2">
                  <Loader2 className="animate-spin text-accent" size={16} />
                  <span className="text-sm text-muted-foreground">
                    {mode === "graphic" ? "Generating your graphic design..." : "Crafting your caption..."}
                  </span>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="border-t border-border bg-card">
          <div className="max-w-4xl mx-auto px-4 py-3">
            {files.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {files.map((f, i) => (
                  <div key={i} className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-secondary text-xs text-foreground">
                    {f.type.startsWith("image") ? <Image size={12} /> : <FileVideo size={12} />}
                    <span className="truncate max-w-[120px]">{f.name}</span>
                    <button onClick={() => removeFile(i)}><X size={12} className="text-muted-foreground hover:text-destructive" /></button>
                  </div>
                ))}
              </div>
            )}
            <div className="flex items-end gap-2">
              <input ref={fileInputRef} type="file" multiple accept="image/*,video/*" className="hidden" onChange={handleFileSelect} />
              <Button type="button" variant="ghost" size="icon" onClick={() => fileInputRef.current?.click()} className="shrink-0" title="Upload image or video">
                <Upload size={18} />
              </Button>
              <Textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={mode === "graphic"
                  ? "Describe your graphic design... (include text, colors, style, dimensions)"
                  : "Describe your post... (platform, topic, tone, hashtags)"}
                className="min-h-[44px] max-h-[120px] resize-none text-sm"
                rows={1}
              />
              <Button onClick={sendMessage} disabled={isLoading || (!input.trim() && files.length === 0)} size="icon" className="shrink-0">
                {isLoading ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
              </Button>
            </div>
            <p className="text-[10px] text-muted-foreground mt-1.5 text-center">
              Free tool by Ikamba — {mode === "graphic" ? "designs" : "captions"} are AI-generated. Review before using.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CaptionGenerator;
