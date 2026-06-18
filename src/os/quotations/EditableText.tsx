import { useEffect, useRef } from "react";

/**
 * Lightweight inline-editable text used by quotation sheets in canvas mode.
 * Uncontrolled to avoid cursor-jump on every keystroke — commits on blur.
 */
const EditableText = ({
  value,
  onChange,
  editable,
  multiline,
  as: Tag = "span",
  className,
  style,
  placeholder,
}: {
  value: any;
  onChange?: (v: string) => void;
  editable?: boolean;
  multiline?: boolean;
  as?: any;
  className?: string;
  style?: React.CSSProperties;
  placeholder?: string;
}) => {
  const ref = useRef<HTMLElement>(null);
  const display = value === undefined || value === null || value === "" ? "" : String(value);

  useEffect(() => {
    if (!ref.current) return;
    if (document.activeElement === ref.current) return; // don't overwrite while typing
    ref.current.textContent = display;
  }, [display]);

  if (!editable) {
    return <Tag className={className} style={style}>{display || placeholder || ""}</Tag>;
  }

  return (
    <Tag
      ref={ref as any}
      contentEditable
      suppressContentEditableWarning
      data-placeholder={placeholder || ""}
      onPointerDown={(e: React.PointerEvent) => e.stopPropagation()}
      onClick={(e: React.MouseEvent) => e.stopPropagation()}
      onKeyDown={(e: React.KeyboardEvent) => {
        if (!multiline && e.key === "Enter") {
          e.preventDefault();
          (e.target as HTMLElement).blur();
        }
      }}
      onBlur={(e: React.FocusEvent<HTMLElement>) => {
        const next = e.currentTarget.textContent || "";
        if (next !== display) onChange?.(next);
      }}
      className={(className || "") + " qtn-edit"}
      style={{ outline: "none", minWidth: 8, ...style }}
    />
  );
};

export default EditableText;
