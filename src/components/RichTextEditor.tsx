"use client";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import { useEffect, useCallback } from "react";

interface Props {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: number;
}

const COLORS = [
  "#000000", "#374151", "#6B7280", "#1B3A6B", "#1D4ED8",
  "#059669", "#DC2626", "#D97706", "#7C3AED", "#DB2777",
];

function ToolbarButton({
  onClick, active, title, children,
}: {
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

export default function RichTextEditor({ value, onChange, placeholder, minHeight = 320 }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Underline,
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      Link.configure({ openOnClick: false }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class: "prose prose-gray max-w-none focus:outline-none px-4 py-3 min-h-[inherit]",
        style: `min-height: ${minHeight}px`,
      },
    },
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
  });

  // Sync external value changes (e.g. when post loads)
  useEffect(() => {
    if (!editor) return;
    if (editor.getHTML() !== value) {
      editor.commands.setContent(value || "");
    }
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

  const can = editor.can().chain().focus();

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-[#1B3A6B]">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-gray-100 bg-gray-50">

        {/* Heading */}
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
          className="border border-gray-200 rounded px-1.5 py-0.5 text-xs text-gray-600 bg-white mr-1"
        >
          <option value="p">Normal</option>
          <option value="h1">Heading 1</option>
          <option value="h2">Heading 2</option>
          <option value="h3">Heading 3</option>
        </select>

        <div className="w-px h-5 bg-gray-200 mx-1" />

        {/* Bold / Italic / Underline / Strike */}
        <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} title="Bold">
          <strong>B</strong>
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} title="Italic">
          <em>I</em>
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive("underline")} title="Underline">
          <span style={{ textDecoration: "underline" }}>U</span>
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive("strike")} title="Strikethrough">
          <span style={{ textDecoration: "line-through" }}>S</span>
        </ToolbarButton>

        <div className="w-px h-5 bg-gray-200 mx-1" />

        {/* Align */}
        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign("left").run()} active={editor.isActive({ textAlign: "left" })} title="Align left">≡</ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign("center").run()} active={editor.isActive({ textAlign: "center" })} title="Center">≡</ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign("right").run()} active={editor.isActive({ textAlign: "right" })} title="Align right">≡</ToolbarButton>

        <div className="w-px h-5 bg-gray-200 mx-1" />

        {/* Lists */}
        <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} title="Bullet list">• List</ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} title="Numbered list">1. List</ToolbarButton>

        <div className="w-px h-5 bg-gray-200 mx-1" />

        {/* Blockquote */}
        <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")} title="Quote">&ldquo; &rdquo;</ToolbarButton>

        {/* Link */}
        <ToolbarButton onClick={setLink} active={editor.isActive("link")} title="Insert link">🔗</ToolbarButton>

        <div className="w-px h-5 bg-gray-200 mx-1" />

        {/* Text color */}
        <div className="flex items-center gap-0.5">
          <span className="text-xs text-gray-500 mr-1">Color:</span>
          {COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().setColor(c).run(); }}
              title={c}
              className="w-4 h-4 rounded-full border border-white shadow-sm hover:scale-110 transition-transform"
              style={{ backgroundColor: c }}
            />
          ))}
          <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().unsetColor().run(); }}
            title="Remove color"
            className="text-xs text-gray-400 hover:text-gray-600 ml-1 leading-none"
          >✕</button>
        </div>

        <div className="w-px h-5 bg-gray-200 mx-1" />

        {/* Undo / Redo */}
        <ToolbarButton onClick={() => editor.chain().focus().undo().run()} title="Undo">↩</ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().redo().run()} title="Redo">↪</ToolbarButton>
      </div>

      {/* Editor area */}
      {!editor.getText() && placeholder && (
        <div className="absolute pointer-events-none px-4 py-3 text-gray-400 text-sm">{placeholder}</div>
      )}
      <EditorContent editor={editor} />
    </div>
  );
}
