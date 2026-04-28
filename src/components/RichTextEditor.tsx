"use client";
import { useEditor, EditorContent, Extension } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import FontFamily from "@tiptap/extension-font-family";
import { useEffect, useCallback } from "react";

// ── Font-size via TextStyle attribute ─────────────────────────────────────────
const FontSize = Extension.create({
  name: "fontSize",
  addGlobalAttributes() {
    return [{
      types: ["textStyle"],
      attributes: {
        fontSize: {
          default: null,
          parseHTML: (el) => el.style.fontSize || null,
          renderHTML: (attrs) => attrs.fontSize ? { style: `font-size: ${attrs.fontSize}` } : {},
        },
      },
    }];
  },
  addCommands() {
    return {
      setFontSize: (size: string) => ({ chain }: any) =>
        chain().setMark("textStyle", { fontSize: size }).run(),
      unsetFontSize: () => ({ chain }: any) =>
        chain().setMark("textStyle", { fontSize: null }).removeEmptyTextStyle().run(),
    } as any;
  },
});

interface Props {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: number;
}

const COLORS = [
  "#000000","#374151","#6B7280","#1B3A6B","#1D4ED8",
  "#059669","#DC2626","#D97706","#7C3AED","#DB2777",
];

const FONT_SIZES = ["12px","14px","16px","18px","20px","24px","28px","32px","36px","48px"];

// Persian + common fonts — Google Fonts loaded in layout
const FONTS = [
  { label: "Default",    value: "" },
  // Persian
  { label: "Vazirmatn",  value: "Vazirmatn" },
  { label: "Estedad",    value: "Estedad" },
  { label: "Lalezar",    value: "Lalezar" },
  { label: "Sahel",      value: "Sahel" },
  // Latin
  { label: "Sans-serif", value: "ui-sans-serif, system-ui, sans-serif" },
  { label: "Serif",      value: "Georgia, serif" },
  { label: "Mono",       value: "ui-monospace, monospace" },
];

function Btn({ onClick, active, title, children }: {
  onClick: () => void; active?: boolean; title: string; children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onMouseDown={(e) => { e.preventDefault(); onClick(); }}
      title={title}
      className={`px-2 py-1 rounded text-sm font-medium transition-colors select-none ${
        active ? "text-white" : "text-gray-600 hover:bg-gray-100"
      }`}
      style={active ? { backgroundColor: "#1B3A6B" } : {}}
    >
      {children}
    </button>
  );
}

function Sep() {
  return <div className="w-px h-5 bg-gray-200 mx-0.5 flex-shrink-0" />;
}

export default function RichTextEditor({ value, onChange, placeholder, minHeight = 320 }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Underline,
      TextStyle,
      Color,
      FontFamily,
      FontSize,
      Highlight.configure({ multicolor: true }),
      Link.configure({ openOnClick: false }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class: "prose prose-gray max-w-none focus:outline-none px-4 py-3 min-h-[inherit] prose-ul:list-disc prose-ol:list-decimal prose-ul:pl-6 prose-ol:pl-6",
        style: `min-height: ${minHeight}px`,
      },
    },
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) return;
    if (editor.getHTML() !== value) editor.commands.setContent(value || "");
  }, [value, editor]);

  const setLink = useCallback(() => {
    if (!editor) return;
    const prev = editor.getAttributes("link").href ?? "";
    const url = window.prompt("Link URL", prev);
    if (url === null) return;
    if (url === "") { editor.chain().focus().extendMarkRange("link").unsetLink().run(); return; }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  if (!editor) return null;

  // Current font size from selection
  const currentSize = (editor.getAttributes("textStyle") as any).fontSize ?? "";
  const currentFont = (editor.getAttributes("textStyle") as any).fontFamily ?? "";

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-[#1B3A6B]">
      {/* ── Toolbar ── */}
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-gray-100 bg-gray-50">

        {/* Heading style */}
        <select
          value={
            editor.isActive("heading", { level: 1 }) ? "h1"
            : editor.isActive("heading", { level: 2 }) ? "h2"
            : editor.isActive("heading", { level: 3 }) ? "h3"
            : "p"
          }
          onChange={(e) => {
            const v = e.target.value;
            if (v === "p") editor.chain().focus().setParagraph().run();
            else editor.chain().focus().toggleHeading({ level: parseInt(v[1]) as 1|2|3 }).run();
          }}
          className="border border-gray-200 rounded px-1.5 py-0.5 text-xs text-gray-600 bg-white"
        >
          <option value="p">Normal</option>
          <option value="h1">Heading 1</option>
          <option value="h2">Heading 2</option>
          <option value="h3">Heading 3</option>
        </select>

        <Sep />

        {/* Font family */}
        <select
          value={currentFont}
          onChange={(e) => {
            const v = e.target.value;
            if (v === "") editor.chain().focus().unsetFontFamily().run();
            else editor.chain().focus().setFontFamily(v).run();
          }}
          className="border border-gray-200 rounded px-1.5 py-0.5 text-xs text-gray-600 bg-white max-w-[110px]"
          title="Font family"
        >
          {FONTS.map((f) => (
            <option key={f.value} value={f.value} style={f.value ? { fontFamily: f.value } : {}}>
              {f.label}
            </option>
          ))}
        </select>

        {/* Font size */}
        <select
          value={currentSize}
          onChange={(e) => {
            const v = e.target.value;
            if (v === "") (editor.chain().focus() as any).unsetFontSize().run();
            else (editor.chain().focus() as any).setFontSize(v).run();
          }}
          className="border border-gray-200 rounded px-1.5 py-0.5 text-xs text-gray-600 bg-white w-[68px]"
          title="Font size"
        >
          <option value="">Size</option>
          {FONT_SIZES.map((s) => (
            <option key={s} value={s}>{s.replace("px", "")}</option>
          ))}
        </select>

        <Sep />

        {/* Bold / Italic / Underline / Strike */}
        <Btn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} title="Bold">
          <strong>B</strong>
        </Btn>
        <Btn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} title="Italic">
          <em>I</em>
        </Btn>
        <Btn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive("underline")} title="Underline">
          <span style={{ textDecoration: "underline" }}>U</span>
        </Btn>
        <Btn onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive("strike")} title="Strikethrough">
          <span style={{ textDecoration: "line-through" }}>S</span>
        </Btn>

        <Sep />

        {/* Align */}
        <Btn onClick={() => editor.chain().focus().setTextAlign("left").run()} active={editor.isActive({ textAlign: "left" })} title="Align left">
          <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><path d="M3 6h18v2H3zm0 4h12v2H3zm0 4h18v2H3zm0 4h12v2H3z"/></svg>
        </Btn>
        <Btn onClick={() => editor.chain().focus().setTextAlign("center").run()} active={editor.isActive({ textAlign: "center" })} title="Center">
          <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><path d="M3 6h18v2H3zm3 4h12v2H6zm-3 4h18v2H3zm3 4h12v2H6z"/></svg>
        </Btn>
        <Btn onClick={() => editor.chain().focus().setTextAlign("right").run()} active={editor.isActive({ textAlign: "right" })} title="Align right">
          <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><path d="M3 6h18v2H3zm6 4h12v2H9zm-6 4h18v2H3zm6 4h12v2H9z"/></svg>
        </Btn>

        <Sep />

        {/* Lists */}
        <Btn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} title="Bullet list">
          <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><path d="M4 6a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm0 6a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm0 6a1 1 0 1 1 0-2 1 1 0 0 1 0 2zM8 5h13v2H8zm0 6h13v2H8zm0 6h13v2H8z"/></svg>
        </Btn>
        <Btn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} title="Numbered list">
          <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><path d="M3 17h2v.5H4v1h1v.5H3v1h3v-4H3v1zm1-9h1V4H3v1h1v3zm-1 3h1.8L3 13.1v.9h3v-1H4.2L6 10.9V10H3v1zm5-7v2h13V4H8zm0 14h13v-2H8v2zm0-6h13v-2H8v2z"/></svg>
        </Btn>

        <Sep />

        {/* Blockquote */}
        <Btn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")} title="Blockquote">
          <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><path d="M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z"/></svg>
        </Btn>

        {/* Link */}
        <Btn onClick={setLink} active={editor.isActive("link")} title="Insert link">🔗</Btn>

        <Sep />

        {/* Text color */}
        <div className="flex items-center gap-0.5">
          <span className="text-xs text-gray-400 mr-0.5">A</span>
          {COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().setColor(c).run(); }}
              title={c}
              className="w-4 h-4 rounded-full border border-white shadow-sm hover:scale-110 transition-transform flex-shrink-0"
              style={{ backgroundColor: c }}
            />
          ))}
          <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().unsetColor().run(); }}
            title="Remove color"
            className="text-xs text-gray-400 hover:text-gray-600 ml-0.5"
          >✕</button>
        </div>

        <Sep />

        {/* Undo / Redo */}
        <Btn onClick={() => editor.chain().focus().undo().run()} title="Undo">↩</Btn>
        <Btn onClick={() => editor.chain().focus().redo().run()} title="Redo">↪</Btn>
      </div>

      {/* Editor area */}
      <div className="relative">
        {!editor.getText() && placeholder && (
          <div className="absolute top-3 left-4 pointer-events-none text-gray-400 text-sm">{placeholder}</div>
        )}
        <EditorContent editor={editor} />
      </div>

      {/* List & font styles injected so they work regardless of prose config */}
      <style>{`
        .ProseMirror ul { list-style-type: disc !important; padding-left: 1.5rem !important; margin: 0.5rem 0 !important; }
        .ProseMirror ol { list-style-type: decimal !important; padding-left: 1.5rem !important; margin: 0.5rem 0 !important; }
        .ProseMirror li { margin: 0.25rem 0 !important; }
        .ProseMirror blockquote { border-left: 3px solid #1B3A6B; padding-left: 1rem; color: #4B5563; margin: 0.75rem 0; }
        .ProseMirror a { color: #1D4ED8; text-decoration: underline; }
        .ProseMirror h1 { font-size: 1.875rem; font-weight: 700; margin: 1rem 0 0.5rem; }
        .ProseMirror h2 { font-size: 1.5rem; font-weight: 700; margin: 0.875rem 0 0.4rem; }
        .ProseMirror h3 { font-size: 1.25rem; font-weight: 600; margin: 0.75rem 0 0.35rem; }
      `}</style>
    </div>
  );
}
