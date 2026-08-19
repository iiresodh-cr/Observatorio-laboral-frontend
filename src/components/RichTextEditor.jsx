import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import { Box, ToggleButton, ToggleButtonGroup, Divider } from '@mui/material';
import {
  Bold, Italic, Quote, List,
  AlignLeft, AlignCenter, AlignJustify, Heading2, Heading3
} from 'lucide-react';

const MenuBar = ({ editor }) => {
  if (!editor) return null;

  return (
    <Box sx={{ borderBottom: 1, borderColor: 'divider', p: 0.5, display: 'flex', flexWrap: 'wrap', gap: 0.5, bgcolor: '#f5f5f5' }}>
      <ToggleButtonGroup size="small" aria-label="text formatting">
        <ToggleButton 
          value="bold" 
          selected={editor.isActive('bold')} 
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold size={20} />
        </ToggleButton>
        <ToggleButton 
          value="italic" 
          selected={editor.isActive('italic')} 
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic size={20} />
        </ToggleButton>
      </ToggleButtonGroup>
      
      <Divider orientation="vertical" flexItem />
      
      <ToggleButtonGroup size="small" aria-label="heading">
        <ToggleButton 
          value="h2" 
          selected={editor.isActive('heading', { level: 2 })} 
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          title="Subtítulo Principal"
        >
          <Heading2 size={20} />
        </ToggleButton>
        <ToggleButton 
          value="h3" 
          selected={editor.isActive('heading', { level: 3 })} 
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          title="Subtítulo Secundario"
        >
          <Heading3 size={20} />
        </ToggleButton>
      </ToggleButtonGroup>
      
      <Divider orientation="vertical" flexItem />
      
      <ToggleButtonGroup size="small" aria-label="lists and quotes">
        <ToggleButton 
          value="bulletList" 
          selected={editor.isActive('bulletList')} 
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List size={20} />
        </ToggleButton>
        <ToggleButton 
          value="blockquote" 
          selected={editor.isActive('blockquote')} 
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          <Quote size={20} />
        </ToggleButton>
      </ToggleButtonGroup>
      
      <Divider orientation="vertical" flexItem />
      
      <ToggleButtonGroup size="small" aria-label="text alignment">
        <ToggleButton 
          value="left" 
          selected={editor.isActive({ textAlign: 'left' })} 
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
        >
          <AlignLeft size={20} />
        </ToggleButton>
        <ToggleButton 
          value="center" 
          selected={editor.isActive({ textAlign: 'center' })} 
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
        >
          <AlignCenter size={20} />
        </ToggleButton>
        <ToggleButton 
          value="justify" 
          selected={editor.isActive({ textAlign: 'justify' })} 
          onClick={() => editor.chain().focus().setTextAlign('justify').run()}
        >
          <AlignJustify size={20} />
        </ToggleButton>
      </ToggleButtonGroup>
    </Box>
  );
};

export default function RichTextEditor({ value, onChange }) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  return (
    <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, overflow: 'hidden' }}>
      <MenuBar editor={editor} />
      <Box sx={{ p: 2, minHeight: '200px', '& .ProseMirror': { outline: 'none', minHeight: '200px' } }}>
        <EditorContent editor={editor} />
      </Box>
    </Box>
  );
}