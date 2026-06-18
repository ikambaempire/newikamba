import { useEffect, useRef, useState } from "react";
import { Type, Image as ImageIcon, Square, Trash2, Copy, MoveUp, MoveDown, Bold } from "lucide-react";

export type CanvasBlock = {
  id: string;
  type: "text" | "image" | "rect";
  x: number; y: number; w: number; h: number;
  text?: string;
  src?: string;
  fontSize?: number;
  color?: string;
  bg?: string;
  bold?: boolean;
  align?: "left" | "center" | "right";
};

// Logical A4-ish canvas in CSS pixels (scaled visually with max-width)
const CANVAS_W = 794;
const CANVAS_H = 1123;

const uid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : Math.random().toString(36).slice(2, 10);

type Props = {
  blocks: CanvasBlock[];
  onChange: (next: CanvasBlock[]) => void;
  /** Optional rendered template that sits BEHIND the editable overlay blocks
   *  so users can edit "on the real template" (Canva-style). */
  background?: React.ReactNode;
};

const CanvasEditor = ({ blocks, onChange, background }: Props) => {
  const [selected, setSelected] = useState<string | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ id: string; mode: "move" | "resize"; startX: number; startY: number; bx: number; by: number; bw: number; bh: number } | null>(null);

  const addBlock = (type: CanvasBlock["type"]) => {
    const base: CanvasBlock = {
      id: uid(),
      type,
      x: 80, y: 80, w: type === "image" ? 240 : 320, h: type === "image" ? 160 : type === "rect" ? 60 : 48,
      ...(type === "text" ? { text: "New text", fontSize: 18, color: "#0C2C47", bold: false, align: "left" } : {}),
      ...(type === "rect" ? { bg: "#D4A739", color: "#FFFFFF" } : {}),
      ...(type === "image" ? { src: "" } : {}),
    };
    onChange([...blocks, base]);
    setSelected(base.id);
  };

  const updateBlock = (id: string, patch: Partial<CanvasBlock>) =>
    onChange(blocks.map((b) => (b.id === id ? { ...b, ...patch } : b)));

  const removeBlock = (id: string) => {
    onChange(blocks.filter((b) => b.id !== id));
    if (selected === id) setSelected(null);
  };

  const duplicate = (id: string) => {
    const b = blocks.find((x) => x.id === id);
    if (!b) return;
    const copy = { ...b, id: uid(), x: b.x + 20, y: b.y + 20 };
    onChange([...blocks, copy]);
    setSelected(copy.id);
  };

  const reorder = (id: string, dir: 1 | -1) => {
    const idx = blocks.findIndex((b) => b.id === id);
    if (idx === -1) return;
    const j = idx + dir;
    if (j < 0 || j >= blocks.length) return;
    const next = [...blocks];
    [next[idx], next[j]] = [next[j], next[idx]];
    onChange(next);
  };

  const onPointerDown = (e: React.PointerEvent, b: CanvasBlock, mode: "move" | "resize") => {
    e.stopPropagation();
    setSelected(b.id);
    (e.target as Element).setPointerCapture?.(e.pointerId);
    dragRef.current = { id: b.id, mode, startX: e.clientX, startY: e.clientY, bx: b.x, by: b.y, bw: b.w, bh: b.h };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const d = dragRef.current;
    if (!d) return;
    const dx = e.clientX - d.startX;
    const dy = e.clientY - d.startY;
    if (d.mode === "move") {
      updateBlock(d.id, { x: Math.max(0, Math.min(CANVAS_W - 20, d.bx + dx)), y: Math.max(0, Math.min(CANVAS_H - 20, d.by + dy)) });
    } else {
      updateBlock(d.id, { w: Math.max(40, d.bw + dx), h: Math.max(20, d.bh + dy) });
    }
  };

  const onPointerUp = () => { dragRef.current = null; };

  const sel = blocks.find((b) => b.id === selected) || null;

  // Click outside on the workspace deselects
  const onCanvasClick = () => setSelected(null);

  return (
    <div className="grid lg:grid-cols-[1fr,260px] gap-4">
      <div>
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <ToolbarBtn onClick={() => addBlock("text")}><Type size={14} /> Text</ToolbarBtn>
          <ToolbarBtn onClick={() => addBlock("image")}><ImageIcon size={14} /> Image</ToolbarBtn>
          <ToolbarBtn onClick={() => addBlock("rect")}><Square size={14} /> Shape</ToolbarBtn>
          <span className="text-[11px] text-os-muted ml-auto">Drag blocks · click to edit · drag corner to resize</span>
        </div>

        <div className="overflow-auto border border-os rounded-xl bg-slate-200 p-3">
          <div
            ref={canvasRef}
            onClick={onCanvasClick}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerLeave={onPointerUp}
            className="relative bg-white shadow-lg mx-auto"
            style={{ width: CANVAS_W, minHeight: CANVAS_H }}
          >
            {/* Real quotation template renders here as the editing surface */}
            {background && (
              <div className="absolute inset-0 overflow-hidden pointer-events-auto">
                {background}
              </div>
            )}
            {/* Drag-and-drop overlay blocks sit on top */}
            <div className="absolute inset-0" style={{ minHeight: CANVAS_H }}>
              {blocks.map((b) => (
                <BlockView
                  key={b.id}
                  block={b}
                  selected={selected === b.id}
                  onPointerDown={(e, m) => onPointerDown(e, b, m)}
                  onChangeText={(t) => updateBlock(b.id, { text: t })}
                />
              ))}
            </div>
            {!background && blocks.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-sm pointer-events-none">
                Empty canvas — add a text, image, or shape block to start.
              </div>
            )}
          </div>
        </div>
      </div>

      <aside className="os-card rounded-xl p-4 h-fit lg:sticky lg:top-4 space-y-3 text-sm">
        <div className="text-xs uppercase tracking-widest text-os-muted">Inspector</div>
        {!sel && <div className="text-os-muted text-xs">Select a block to edit its properties.</div>}
        {sel && (
          <div className="space-y-3">
            <div className="flex items-center gap-1">
              <IconBtn title="Duplicate" onClick={() => duplicate(sel.id)}><Copy size={13} /></IconBtn>
              <IconBtn title="Bring forward" onClick={() => reorder(sel.id, 1)}><MoveUp size={13} /></IconBtn>
              <IconBtn title="Send back" onClick={() => reorder(sel.id, -1)}><MoveDown size={13} /></IconBtn>
              <IconBtn title="Delete" onClick={() => removeBlock(sel.id)} danger><Trash2 size={13} /></IconBtn>
            </div>

            {sel.type === "text" && (
              <>
                <Label>Text</Label>
                <textarea
                  value={sel.text || ""}
                  onChange={(e) => updateBlock(sel.id, { text: e.target.value })}
                  rows={3}
                  className="w-full bg-[hsl(var(--os-surface-2))] border border-os rounded-lg px-2 py-1.5 text-xs text-white"
                />
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label>Font size</Label>
                    <input type="number" min={8} max={120} value={sel.fontSize || 16}
                      onChange={(e) => updateBlock(sel.id, { fontSize: Number(e.target.value) })}
                      className="w-full bg-[hsl(var(--os-surface-2))] border border-os rounded px-2 py-1 text-xs text-white" />
                  </div>
                  <div>
                    <Label>Color</Label>
                    <input type="color" value={sel.color || "#0C2C47"}
                      onChange={(e) => updateBlock(sel.id, { color: e.target.value })}
                      className="w-full h-7 bg-transparent border border-os rounded" />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateBlock(sel.id, { bold: !sel.bold })}
                    className={`px-2 py-1 rounded text-xs border ${sel.bold ? "bg-os-gold text-[hsl(var(--os-navy-deep))] border-os-gold" : "border-os text-white hover:bg-white/5"}`}
                  ><Bold size={12} /></button>
                  {(["left", "center", "right"] as const).map((a) => (
                    <button key={a}
                      onClick={() => updateBlock(sel.id, { align: a })}
                      className={`px-2 py-1 rounded text-xs border capitalize ${sel.align === a ? "bg-os-gold text-[hsl(var(--os-navy-deep))] border-os-gold" : "border-os text-white hover:bg-white/5"}`}
                    >{a}</button>
                  ))}
                </div>
              </>
            )}

            {sel.type === "image" && (
              <>
                <Label>Image URL</Label>
                <input
                  value={sel.src || ""}
                  onChange={(e) => updateBlock(sel.id, { src: e.target.value })}
                  placeholder="https://..."
                  className="w-full bg-[hsl(var(--os-surface-2))] border border-os rounded px-2 py-1.5 text-xs text-white"
                />
                <p className="text-[10px] text-os-muted">Paste any public image URL.</p>
              </>
            )}

            {sel.type === "rect" && (
              <>
                <Label>Fill</Label>
                <input type="color" value={sel.bg || "#D4A739"}
                  onChange={(e) => updateBlock(sel.id, { bg: e.target.value })}
                  className="w-full h-7 bg-transparent border border-os rounded" />
              </>
            )}

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-os/50">
              <Num label="X" value={sel.x} onChange={(v) => updateBlock(sel.id, { x: v })} />
              <Num label="Y" value={sel.y} onChange={(v) => updateBlock(sel.id, { y: v })} />
              <Num label="W" value={sel.w} onChange={(v) => updateBlock(sel.id, { w: v })} />
              <Num label="H" value={sel.h} onChange={(v) => updateBlock(sel.id, { h: v })} />
            </div>
          </div>
        )}
      </aside>
    </div>
  );
};

const BlockView = ({
  block: b, selected, onPointerDown, onChangeText,
}: {
  block: CanvasBlock;
  selected: boolean;
  onPointerDown: (e: React.PointerEvent, mode: "move" | "resize") => void;
  onChangeText: (t: string) => void;
}) => {
  const [editing, setEditing] = useState(false);
  useEffect(() => { if (!selected) setEditing(false); }, [selected]);

  const style: React.CSSProperties = {
    position: "absolute", left: b.x, top: b.y, width: b.w, height: b.h,
    boxShadow: selected ? "0 0 0 2px #D4A739" : undefined,
    cursor: editing ? "text" : "move",
    userSelect: editing ? "text" : "none",
  };

  const content = () => {
    if (b.type === "image") {
      return b.src ? (
        <img src={b.src} alt="" className="w-full h-full object-cover pointer-events-none" />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400 text-xs">
          Image URL not set
        </div>
      );
    }
    if (b.type === "rect") {
      return <div className="w-full h-full" style={{ background: b.bg || "#D4A739" }} />;
    }
    // text
    const textStyle: React.CSSProperties = {
      fontSize: b.fontSize || 16, color: b.color || "#0C2C47",
      fontWeight: b.bold ? 700 : 400, textAlign: b.align || "left",
      width: "100%", height: "100%", overflow: "hidden", whiteSpace: "pre-wrap",
      padding: 4, background: "transparent", border: "none", outline: "none",
      fontFamily: "Poppins, 'Plus Jakarta Sans', sans-serif",
    };
    return editing ? (
      <textarea
        autoFocus
        value={b.text || ""}
        onChange={(e) => onChangeText(e.target.value)}
        onBlur={() => setEditing(false)}
        onClick={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
        style={textStyle}
      />
    ) : (
      <div style={textStyle} onDoubleClick={(e) => { e.stopPropagation(); setEditing(true); }}>
        {b.text || "Double-click to edit"}
      </div>
    );
  };

  return (
    <div
      style={style}
      onPointerDown={(e) => { if (!editing) onPointerDown(e, "move"); }}
      onClick={(e) => e.stopPropagation()}
    >
      {content()}
      {selected && (
        <div
          onPointerDown={(e) => onPointerDown(e, "resize")}
          className="absolute right-0 bottom-0 w-3 h-3 bg-[#D4A739] cursor-se-resize"
          style={{ transform: "translate(50%, 50%)" }}
        />
      )}
    </div>
  );
};

const ToolbarBtn = ({ children, onClick }: { children: React.ReactNode; onClick: () => void }) => (
  <button onClick={onClick} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-os text-white hover:bg-white/5">
    {children}
  </button>
);
const IconBtn = ({ children, onClick, title, danger }: { children: React.ReactNode; onClick: () => void; title: string; danger?: boolean }) => (
  <button onClick={onClick} title={title}
    className={`p-1.5 rounded text-xs ${danger ? "hover:bg-rose-500/15 text-rose-300" : "text-os-muted hover:text-white hover:bg-white/10"}`}>
    {children}
  </button>
);
const Label = ({ children }: { children: React.ReactNode }) => (
  <div className="text-[10px] uppercase tracking-widest text-os-muted">{children}</div>
);
const Num = ({ label, value, onChange }: { label: string; value: number; onChange: (n: number) => void }) => (
  <div>
    <Label>{label}</Label>
    <input type="number" value={Math.round(value)} onChange={(e) => onChange(Number(e.target.value))}
      className="w-full bg-[hsl(var(--os-surface-2))] border border-os rounded px-2 py-1 text-xs text-white" />
  </div>
);

export default CanvasEditor;
