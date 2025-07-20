// frontend/src/components/article/ArticleForm.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import api from '../../services/api'; // API servisimiz
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import Highlight from '@tiptap/extension-highlight';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import Color from '@tiptap/extension-color';
import TextStyle from '@tiptap/extension-text-style';
import Underline from '@tiptap/extension-underline';
import Strike from '@tiptap/extension-strike';
import { lowlight } from 'lowlight';
import { FaBold, FaItalic, FaHeading, FaListUl, FaListOl, FaImage, FaUndo, FaRedo, FaLink, FaUnlink, FaAlignLeft, FaAlignCenter, FaAlignRight, FaCode, FaHighlighter, FaTasks, FaQuoteLeft, FaTable, FaFont, FaPalette, FaUnderline, FaStrikethrough, FaMinus, FaChevronDown, FaYoutube } from 'react-icons/fa';

// Basit bir WYSIWYG editör veya Markdown editörü yerine şimdilik textarea kullanıyoruz.
// Önerilen kütüphaneler: react-quill, Tiptap, Editor.js, react-markdown-editor-lite

// Add this style block at the top level, outside the component
if (typeof window !== 'undefined' && !document.getElementById('custom-table-style')) {
  const style = document.createElement('style');
  style.id = 'custom-table-style';
  style.innerHTML = `
    .custom-table {
      border-collapse: collapse;
      width: 100%;
    }
    .custom-table-cell {
      border: 1px solid #888;
      min-width: 40px;
      min-height: 30px;
      padding: 0;
    }
  `;
  document.head.appendChild(style);
}

// Custom Tiptap Iframe extension (YouTube embed)
import { Node, mergeAttributes } from '@tiptap/core';

// Twitter Embed Extension
const TwitterEmbed = Node.create({
  name: 'twitterEmbed',
  group: 'block',
  atom: true,
  addAttributes() {
    return {
      url: { default: null },
    };
  },
  parseHTML() {
    return [
      { tag: 'blockquote.twitter-tweet' },
    ];
  },
  renderHTML({ HTMLAttributes }) {
    // Check for dark mode
    const isDark = typeof document !== 'undefined' && document.body.classList.contains('dark');
    // x.com linklerini twitter.com'a çevir
    let embedUrl = HTMLAttributes.url;
    if (embedUrl && embedUrl.includes('x.com/')) {
      embedUrl = embedUrl.replace('x.com/', 'twitter.com/');
    }
    return [
      'div',
      {
        class: 'twitter-embed-wrapper',
        style: 'margin:16px 0; width:100%; max-width:100%; border-radius:12px; background:transparent;'
      },
      [
        'blockquote',
        {
          class: 'twitter-tweet',
          'data-lang': 'en',
          ...(isDark ? { 'data-theme': 'dark' } : {})
        },
        [
          'a',
          { href: embedUrl },
          embedUrl
        ]
      ]
    ];
  },
  addNodeView() {
    return ({ HTMLAttributes }) => {
      if (typeof window !== 'undefined' && window.twttr && window.twttr.widgets) {
        setTimeout(() => {
          window.twttr.widgets.load();
        }, 0);
      }
      const container = document.createElement('div');
      // Check for dark mode
      const isDark = typeof document !== 'undefined' && document.body.classList.contains('dark');
      // x.com linklerini twitter.com'a çevir
      let embedUrl = HTMLAttributes.url;
      if (embedUrl && embedUrl.includes('x.com/')) {
        embedUrl = embedUrl.replace('x.com/', 'twitter.com/');
      }
      container.innerHTML = `<div class="twitter-embed-wrapper" style="margin:16px 0; width:100%; max-width:100%; border-radius:12px; background:transparent;">
        <blockquote class="twitter-tweet" data-lang="en"${isDark ? ' data-theme=\"dark\"' : ''}><a href="${embedUrl}">${embedUrl}</a></blockquote>
      </div>`;
      return { dom: container };
    };
  }
});

const Iframe = Node.create({
  name: 'iframe',
  group: 'block',
  atom: true,
  addAttributes() {
    return {
      src: { default: null },
      width: { default: '560' },
      height: { default: '315' },
      allowfullscreen: { default: true },
    };
  },
  parseHTML() {
    return [
      {
        tag: 'iframe[src*="youtube.com/embed/"]',
      },
    ];
  },
  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      { class: 'yt-embed-wrapper', style: 'margin:16px 0; width:100%;' },
      ['iframe', mergeAttributes(HTMLAttributes, {
        frameborder: '0',
        allow: 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share',
        style: 'width:100%;max-width:100%;border-radius:12px;display:block;',
        title: 'YouTube video player',
      })],
    ];
  },
});

const ArticleForm = ({ articleData, onSubmit, isEditing = false, formError, setFormError }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [coverImageFile, setCoverImageFile] = useState(null);
  const [currentCoverImageUrl, setCurrentCoverImageUrl] = useState('');
  const [status, setStatus] = useState('draft');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState('');

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({ inline: false, allowBase64: false }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 hover:underline',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Placeholder.configure({
        placeholder: 'Makalenizi buraya yazın...',
      }),
      CodeBlockLowlight.configure({
        lowlight,
      }),
      Highlight,
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      Table.configure({
        resizable: false,
        HTMLAttributes: {
          class: 'custom-table',
          style: 'border-collapse: collapse; width: 100%;',
        },
      }),
      TableRow.configure({
        HTMLAttributes: {
          class: 'custom-table-row',
        },
      }),
      TableCell.configure({
        HTMLAttributes: {
          class: 'custom-table-cell',
          style: 'border: 1px solid #888; min-width: 40px; min-height: 30px; padding: 0;',
        },
      }),
      TableHeader.configure({
        HTMLAttributes: {
          class: 'border border-slate-300 p-2 bg-slate-100 font-semibold text-slate-700',
        },
      }),
      Color,
      TextStyle,
      Underline,
      Strike,
      Iframe,
      TwitterEmbed,
    ],
    content: '',
    editorProps: {
      attributes: {
        class: 'min-h-[200px] p-3 border border-slate-300 rounded-lg bg-white focus:outline-none prose prose-slate max-w-none',
      },
    },
  });

  useEffect(() => {
    if (isEditing && articleData) {
      setTitle(articleData.title || '');
      setDescription(articleData.description || '');
      setCurrentCoverImageUrl(articleData.coverImage || '');
      setStatus(articleData.status || 'draft');
      setImagePreview(articleData.coverImage || '');
      if (editor && articleData.content) {
        editor.commands.setContent(articleData.content);
      }
    } else {
      setTitle('');
      setDescription('');
      setCoverImageFile(null);
      setCurrentCoverImageUrl('');
      setStatus('draft');
      setImagePreview('');
      if (editor) {
        editor.commands.clearContent();
      }
    }
    // eslint-disable-next-line
  }, [isEditing, articleData]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setFormError('Dosya boyutu 5MB\'dan büyük olamaz.');
        e.target.value = null;
        return;
      }
      if (!file.type.startsWith('image/')) {
        setFormError('Lütfen geçerli bir resim dosyası seçin.');
        e.target.value = null;
        return;
      }
      setCoverImageFile(file);
      setFormError('');
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setCoverImageFile(null);
      setImagePreview(currentCoverImageUrl || '');
    }
  };

  const handleUploadCoverImage = useCallback(async () => {
    if (!coverImageFile) {
      return currentCoverImageUrl || '';
    }
    setIsUploading(true);
    setFormError('');
    try {
      const presignedResponse = await api.post('/upload/cover', {
        fileName: coverImageFile.name,
        contentType: coverImageFile.type,
      });
      const { uploadUrl, accessUrl } = presignedResponse.data;
      await fetch(uploadUrl, {
        method: 'PUT',
        body: coverImageFile,
        headers: {
          'Content-Type': coverImageFile.type
        },
      });
      await new Promise(resolve => setTimeout(resolve, 2000));
      setCurrentCoverImageUrl(accessUrl);
      setIsUploading(false);
      return accessUrl;
    } catch (err) {
      console.error('Kapak resmi yüklenirken hata:', err);
      const uploadErrorMessage = err.response?.data?.message || err.message || 'Kapak resmi yüklenemedi.';
      setFormError(`Resim Yükleme Hatası: ${uploadErrorMessage}`);
      setIsUploading(false);
      throw new Error(uploadErrorMessage);
    }
  }, [coverImageFile, currentCoverImageUrl, setFormError]);

  const handleImageUpload = async () => {
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = async () => {
        const file = input.files[0];
        if (file) {
          const presignedResponse = await api.post('/upload/content-image', {
            fileName: file.name,
            contentType: file.type,
          });
          const { uploadUrl, accessUrl } = presignedResponse.data;
          await fetch(uploadUrl, {
            method: 'PUT',
            body: file,
            headers: { 'Content-Type': file.type },
          });
          resolve(accessUrl);
        }
      };
      input.click();
    });
  };

  const addImage = async () => {
    const url = await handleImageUpload();
    if (url && editor) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !editor || editor.isEmpty) {
      setFormError('Başlık ve İçerik alanları boş bırakılamaz.');
      return;
    }
    setIsSubmitting(true);
    setFormError('');
    try {
      let finalCoverImageUrl = currentCoverImageUrl;
      if (coverImageFile) {
        finalCoverImageUrl = await handleUploadCoverImage();
      }
      const payload = {
        title: title.trim(),
        description: description.trim(),
        content: editor.getHTML(),
        coverImage: finalCoverImageUrl,
        status
      };
      await onSubmit(payload);
    } catch (err) {
      console.error('Makale formu gönderilirken hata:', err);
      if (!formError && !isUploading) {
        setFormError(err.message || 'Makale kaydedilemedi. Lütfen tüm alanları kontrol edin.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const inputClass = "block w-full px-4 py-2.5 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors sm:text-sm placeholder-slate-400";
  const labelClass = "block text-sm font-medium text-slate-700 mb-1.5";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {formError && (
        <div className="p-3 mb-4 bg-red-50 border border-red-300 text-red-700 rounded-lg text-sm">
          {formError}
        </div>
      )}
      <div>
        <label htmlFor="title" className={labelClass}>Başlık</label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className={inputClass}
          placeholder="Etkileyici bir başlık girin"
        />
      </div>
      <div>
        <label htmlFor="description" className={labelClass}>Kısa Açıklama (SEO ve önizleme için)</label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows="3"
          className={inputClass}
          placeholder="Makalenizin kısa bir özeti (isteğe bağlı)"
        />
      </div>
      <div>
        <label className={labelClass}>İçerik</label>
        <div className="border border-slate-300 rounded-lg bg-white">
          <EditorContent 
            editor={editor} 
            className="font-sans" 
            style={{ 
              fontFamily: 'Inter, sans-serif',
              '--tiptap-table-border-color': '#e2e8f0',
              '--tiptap-table-header-bg': '#f8fafc',
              '--tiptap-table-cell-padding': '0.5rem',
            }} 
          />
          {/* Toolbar */}
          <div className="flex flex-wrap gap-2 p-2 border-t border-slate-200 bg-slate-50 rounded-b-lg">
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={`p-2 rounded hover:bg-slate-200 ${editor?.isActive('bold') ? 'bg-slate-200 text-blue-600' : 'text-slate-700'}`}
              title="Kalın"
            >
              <FaBold />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={`p-2 rounded hover:bg-slate-200 ${editor?.isActive('italic') ? 'bg-slate-200 text-blue-600' : 'text-slate-700'}`}
              title="İtalik"
            >
              <FaItalic />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              className={`p-2 rounded hover:bg-slate-200 ${editor?.isActive('heading', { level: 1 }) ? 'bg-slate-200 text-blue-600' : 'text-slate-700'}`}
              title="Başlık 1"
            >
              <span className="font-bold">H1</span>
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              className={`p-2 rounded hover:bg-slate-200 ${editor?.isActive('heading', { level: 2 }) ? 'bg-slate-200 text-blue-600' : 'text-slate-700'}`}
              title="Başlık 2"
            >
              <span className="font-bold">H2</span>
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
              className={`p-2 rounded hover:bg-slate-200 ${editor?.isActive('heading', { level: 3 }) ? 'bg-slate-200 text-blue-600' : 'text-slate-700'}`}
              title="Başlık 3"
            >
              <span className="font-bold">H3</span>
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              className={`p-2 rounded hover:bg-slate-200 ${editor?.isActive('underline') ? 'bg-slate-200 text-blue-600' : 'text-slate-700'}`}
              title="Altı Çizili"
            >
              <FaUnderline />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleStrike().run()}
              className={`p-2 rounded hover:bg-slate-200 ${editor?.isActive('strike') ? 'bg-slate-200 text-blue-600' : 'text-slate-700'}`}
              title="Üstü Çizili"
            >
              <FaStrikethrough />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              className={`p-2 rounded hover:bg-slate-200 ${editor?.isActive('bulletList') ? 'bg-slate-200 text-blue-600' : 'text-slate-700'}`}
              title="Madde İşaretli Liste"
            >
              <FaListUl />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              className={`p-2 rounded hover:bg-slate-200 ${editor?.isActive('orderedList') ? 'bg-slate-200 text-blue-600' : 'text-slate-700'}`}
              title="Numaralı Liste"
            >
              <FaListOl />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleTaskList().run()}
              className={`p-2 rounded hover:bg-slate-200 ${editor?.isActive('taskList') ? 'bg-slate-200 text-blue-600' : 'text-slate-700'}`}
              title="Görev Listesi"
            >
              <FaTasks />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              className={`p-2 rounded hover:bg-slate-200 ${editor?.isActive('blockquote') ? 'bg-slate-200 text-blue-600' : 'text-slate-700'}`}
              title="Alıntı"
            >
              <FaQuoteLeft />
            </button>
            <button
              type="button"
              onClick={() => {
                const color = window.prompt('Metin rengi (örn: #ff0000):');
                if (color) {
                  editor.chain().focus().setColor(color).run();
                }
              }}
              className="p-2 rounded hover:bg-slate-200 text-slate-700"
              title="Metin Rengi"
            >
              <FaFont />
            </button>
            <button
              type="button"
              onClick={() => {
                const color = window.prompt('Arka plan rengi (örn: #ff0000):');
                if (color) {
                  editor.chain().focus().setHighlight({ color }).run();
                }
              }}
              className="p-2 rounded hover:bg-slate-200 text-slate-700"
              title="Arka Plan Rengi"
            >
              <FaPalette />
            </button>
            <div className="relative inline-block">
              <button
                type="button"
                onClick={() => {
                  const rows = window.prompt('Satır sayısı:', '3');
                  const cols = window.prompt('Sütun sayısı:', '3');
                  if (rows && cols) {
                    editor.chain().focus().insertTable({ 
                      rows: parseInt(rows), 
                      cols: parseInt(cols), 
                      withHeaderRow: true 
                    }).run();
                  }
                }}
                className="p-2 rounded hover:bg-slate-200 text-slate-700 flex items-center gap-1"
                title="Tablo Ekle"
              >
                <FaTable />
                <FaChevronDown className="text-xs" />
              </button>
              {editor?.isActive('table') && (
                <div className="absolute bottom-full left-0 mb-2 bg-white border border-slate-200 rounded-lg shadow-lg p-2 z-10">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => editor.chain().focus().addColumnBefore().run()}
                      disabled={!editor?.can().addColumnBefore()}
                      className="p-2 rounded hover:bg-slate-200 text-slate-700 disabled:opacity-50 text-sm"
                      title="Sütun Ekle (Sol)"
                    >
                      ← Sütun Ekle
                    </button>
                    <button
                      type="button"
                      onClick={() => editor.chain().focus().addColumnAfter().run()}
                      disabled={!editor?.can().addColumnAfter()}
                      className="p-2 rounded hover:bg-slate-200 text-slate-700 disabled:opacity-50 text-sm"
                      title="Sütun Ekle (Sağ)"
                    >
                      Sütun Ekle →
                    </button>
                    <button
                      type="button"
                      onClick={() => editor.chain().focus().addRowBefore().run()}
                      disabled={!editor?.can().addRowBefore()}
                      className="p-2 rounded hover:bg-slate-200 text-slate-700 disabled:opacity-50 text-sm"
                      title="Satır Ekle (Üst)"
                    >
                      ↑ Satır Ekle
                    </button>
                    <button
                      type="button"
                      onClick={() => editor.chain().focus().addRowAfter().run()}
                      disabled={!editor?.can().addRowAfter()}
                      className="p-2 rounded hover:bg-slate-200 text-slate-700 disabled:opacity-50 text-sm"
                      title="Satır Ekle (Alt)"
                    >
                      Satır Ekle ↓
                    </button>
                    <button
                      type="button"
                      onClick={() => editor.chain().focus().deleteColumn().run()}
                      disabled={!editor?.can().deleteColumn()}
                      className="p-2 rounded hover:bg-slate-200 text-slate-700 disabled:opacity-50 text-sm"
                      title="Sütun Sil"
                    >
                      Sütun Sil
                    </button>
                    <button
                      type="button"
                      onClick={() => editor.chain().focus().deleteRow().run()}
                      disabled={!editor?.can().deleteRow()}
                      className="p-2 rounded hover:bg-slate-200 text-slate-700 disabled:opacity-50 text-sm"
                      title="Satır Sil"
                    >
                      Satır Sil
                    </button>
                    <button
                      type="button"
                      onClick={() => editor.chain().focus().deleteTable().run()}
                      disabled={!editor?.can().deleteTable()}
                      className="p-2 rounded hover:bg-slate-200 text-slate-700 disabled:opacity-50 text-sm col-span-2"
                      title="Tabloyu Sil"
                    >
                      Tabloyu Sil
                    </button>
                  </div>
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => editor.chain().focus().setHorizontalRule().run()}
              className="p-2 rounded hover:bg-slate-200 text-slate-700"
              title="Yatay Çizgi"
            >
              <FaMinus />
            </button>
            <button
              type="button"
              onClick={addImage}
              className="p-2 rounded hover:bg-slate-200 text-slate-700"
              title="Resim Ekle"
            >
              <FaImage />
            </button>
            {/* Video Ekle Butonu */}
            <button
              type="button"
              onClick={() => {
                const url = window.prompt('YouTube video linkini girin:');
                if (!url) return;
                // Sadece YouTube linkleri için çalışsın
                const ytMatch = url.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{11})/);
                if (!ytMatch) {
                  alert('Sadece geçerli bir YouTube video linki ekleyebilirsiniz!');
                  return;
                }
                const videoId = ytMatch[1];
                if (editor) {
                  editor.commands.focus();
                  editor.commands.insertContent({
                    type: 'iframe',
                    attrs: {
                      src: `https://www.youtube.com/embed/${videoId}`,
                      width: '560',
                      height: '315',
                      allowfullscreen: 'true',
                    },
                  });
                }
              }}
              className="p-2 rounded hover:bg-slate-200 text-slate-700"
              title="YouTube Videosu Ekle"
            >
              <FaYoutube />
            </button>
            {/* Twitter Embed Butonu */}
            <button
              type="button"
              onClick={() => {
                const url = window.prompt('Tweet linkini girin:');
                if (!url) return;
                // Sadece geçerli Twitter veya X status URL'si için çalışsın
                const twMatch = url.match(/^https?:\/\/(www\.)?(twitter\.com|x\.com)\/[A-Za-z0-9_]+\/status\/\d+/);
                if (!twMatch) {
                  alert('Sadece geçerli bir Tweet linki ekleyebilirsiniz!');
                  return;
                }
                if (editor) {
                  editor.commands.focus();
                  editor.commands.insertContent({
                    type: 'twitterEmbed',
                    attrs: { url },
                  });
                }
              }}
              className="p-2 rounded hover:bg-slate-200 text-slate-700"
              title="Tweet Ekle"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" width="1em" height="1em">
                <g>
                  <path d="M22.46 5.924c-.793.352-1.646.59-2.54.697a4.48 4.48 0 001.965-2.482 8.97 8.97 0 01-2.828 1.082 4.48 4.48 0 00-7.634 4.086A12.73 12.73 0 013.15 4.868a4.48 4.48 0 001.39 5.973 4.47 4.47 0 01-2.03-.56v.056a4.48 4.48 0 003.6 4.392 4.5 4.5 0 01-2.025.077 4.48 4.48 0 004.183 3.11A8.99 8.99 0 012 19.54a12.7 12.7 0 006.92 2.03c8.302 0 12.846-6.877 12.846-12.846 0-.195-.004-.39-.013-.583A9.23 9.23 0 0024 4.59a8.98 8.98 0 01-2.54.697z" />
                </g>
              </svg>
            </button>
            <button
              type="button"
              onClick={() => {
                const url = window.prompt('URL:');
                if (url) {
                  editor.chain().focus().setLink({ href: url }).run();
                }
              }}
              className={`p-2 rounded hover:bg-slate-200 ${editor?.isActive('link') ? 'bg-slate-200 text-blue-600' : 'text-slate-700'}`}
              title="Bağlantı Ekle"
            >
              <FaLink />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().unsetLink().run()}
              className="p-2 rounded hover:bg-slate-200 text-slate-700"
              title="Bağlantıyı Kaldır"
            >
              <FaUnlink />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().setTextAlign('left').run()}
              className={`p-2 rounded hover:bg-slate-200 ${editor?.isActive({ textAlign: 'left' }) ? 'bg-slate-200 text-blue-600' : 'text-slate-700'}`}
              title="Sola Hizala"
            >
              <FaAlignLeft />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().setTextAlign('center').run()}
              className={`p-2 rounded hover:bg-slate-200 ${editor?.isActive({ textAlign: 'center' }) ? 'bg-slate-200 text-blue-600' : 'text-slate-700'}`}
              title="Ortala"
            >
              <FaAlignCenter />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().setTextAlign('right').run()}
              className={`p-2 rounded hover:bg-slate-200 ${editor?.isActive({ textAlign: 'right' }) ? 'bg-slate-200 text-blue-600' : 'text-slate-700'}`}
              title="Sağa Hizala"
            >
              <FaAlignRight />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleCodeBlock().run()}
              className={`p-2 rounded hover:bg-slate-200 ${editor?.isActive('codeBlock') ? 'bg-slate-200 text-blue-600' : 'text-slate-700'}`}
              title="Kod Bloğu"
            >
              <FaCode />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleHighlight().run()}
              className={`p-2 rounded hover:bg-slate-200 ${editor?.isActive('highlight') ? 'bg-slate-200 text-blue-600' : 'text-slate-700'}`}
              title="Vurgula"
            >
              <FaHighlighter />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().undo().run()}
              className="p-2 rounded hover:bg-slate-200 text-slate-700"
              title="Geri Al"
            >
              <FaUndo />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().redo().run()}
              className="p-2 rounded hover:bg-slate-200 text-slate-700"
              title="İleri Al"
            >
              <FaRedo />
            </button>
          </div>
        </div>
      </div>
      <div>
        <label htmlFor="coverImage" className={labelClass}>Kapak Görseli</label>
        <input
          type="file"
          id="coverImage"
          accept="image/png, image/jpeg, image/webp, image/gif"
          onChange={handleFileChange}
          className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-colors cursor-pointer"
        />
        {(isUploading) && <p className="text-sm text-blue-600 mt-2">Kapak resmi yükleniyor, lütfen bekleyin...</p>}
        {imagePreview && !isUploading && (
          <div className="mt-3 p-2 border border-slate-200 rounded-lg inline-block">
            <p className="text-xs text-slate-500 mb-1">Görsel Önizleme:</p>
            <img src={imagePreview} alt="Kapak Görseli Önizleme" className="max-h-48 rounded-md shadow-sm" />
          </div>
        )}
         {isEditing && currentCoverImageUrl && !coverImageFile && (
          <p className="text-xs text-slate-500 mt-1">Mevcut resim: <a href={currentCoverImageUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{currentCoverImageUrl.substring(currentCoverImageUrl.lastIndexOf('/') + 1)}</a></p>
        )}
      </div>
      <div>
        <label htmlFor="status" className={labelClass}>Yayın Durumu</label>
        <select
          id="status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className={`${inputClass} appearance-none`}
        >
          <option value="draft">Taslak Olarak Kaydet</option>
          <option value="published">Şimdi Yayınla</option>
        </select>
      </div>
      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={isSubmitting || isUploading}
          className="flex items-center justify-center min-w-[120px] px-6 py-2.5 border border-transparent shadow-md text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
        >
          {(isSubmitting || isUploading) ? (
            <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (isEditing ? 'Makaleyi Güncelle' : 'Makaleyi Oluştur')}
        </button>
      </div>
    </form>
  );
};

export default ArticleForm;
