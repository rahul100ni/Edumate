import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Save, Plus, Trash2, Search, Folder, Tag, ChevronRight, Bold, Italic, Underline, Download, X } from 'lucide-react'
import { jsPDF } from "jspdf"
import { useLocation, useNavigate } from 'react-router-dom'

interface Note {
  id: number
  title: string
  content: string
  folder: string
  tags: string[]
  lastModified: Date
}

const NoteTakingPage: React.FC = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [notes, setNotes] = useState<Note[]>(() => {
    const savedNotes = localStorage.getItem('notes')
    return savedNotes ? JSON.parse(savedNotes) : []
  })
  const [currentNote, setCurrentNote] = useState<Note>({ id: 0, title: '', content: '', folder: '', tags: [], lastModified: new Date() })
  const [searchTerm, setSearchTerm] = useState('')
  const [activeFolder, setActiveFolder] = useState('All Notes')
  const [folders, setFolders] = useState<string[]>(['All Notes'])
  const [showFolderInput, setShowFolderInput] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const [showTagInput, setShowTagInput] = useState(false)
  const [newTag, setNewTag] = useState('')
  const [showSidebar, setShowSidebar] = useState(true)
  const [showPDFImportNotification, setShowPDFImportNotification] = useState(false)
  const contentEditableRef = useRef<HTMLDivElement>(null)

  const handlePDFSummaryImport = useCallback(() => {
    const pendingNote = localStorage.getItem('pendingNote')
    if (pendingNote) {
      try {
        const noteData = JSON.parse(pendingNote)
        if (noteData.type === 'pdf_summary') {
          // Create a folder if it doesn't exist
          if (!folders.includes('PDF Summaries')) {
            setFolders(prev => [...prev, 'PDF Summaries'])
          }

          // Create a new note with the PDF summary
          const newNote: Note = {
            id: Date.now(),
            title: noteData.title || `PDF Summary - ${new Date().toLocaleDateString()}`,
            content: noteData.content,
            folder: 'PDF Summaries',
            tags: ['pdf-summary'],
            lastModified: new Date()
          }

          // Add key points as tags if available
          if (noteData.metadata?.keyPoints) {
            const keyPointTags = noteData.metadata.keyPoints
              .map(point => point.substring(0, 30)) // Limit tag length
              .slice(0, 5) // Limit number of tags
            newNote.tags = [...newNote.tags, ...keyPointTags]
          }

          // Add definitions as tags if available
          if (noteData.metadata?.definitions) {
            const definitionTags = noteData.metadata.definitions
              .map(def => def.term.substring(0, 30)) // Limit tag length
              .slice(0, 5) // Limit number of tags
            newNote.tags = [...newNote.tags, ...definitionTags]
          }

          // Format the content with a header section
          const headerSection = `
            <div class="mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p class="text-sm text-gray-500 dark:text-gray-400">
                Generated on ${new Date(noteData.metadata.generatedAt).toLocaleString()}
              </p>
              ${noteData.metadata.originalLength ? 
                `<p class="text-sm text-gray-500 dark:text-gray-400">
                  Original length: ${Math.round(noteData.metadata.originalLength / 1000)}k characters
                </p>` : ''
              }
            </div>
          `.trim();

          newNote.content = headerSection + newNote.content;

          setNotes(prev => [...prev, newNote])
          setShowPDFImportNotification(true)
          
          // Clear the pending note
          localStorage.removeItem('pendingNote')
          
          // Select the new note
          setCurrentNote(newNote)
          if (contentEditableRef.current) {
            contentEditableRef.current.innerHTML = newNote.content
          }

          // Set active folder to PDF Summaries
          setActiveFolder('PDF Summaries')
        }
      } catch (error) {
        console.error('Error importing PDF summary:', error)
      }
    }
  }, [])

  useEffect(() => {
    if (location.search.includes('source=pdf-summary')) {
      handlePDFSummaryImport()
      // Clear the URL parameter
      navigate('/note-taking', { replace: true })
    }
  }, [location, handlePDFSummaryImport, navigate])

  useEffect(() => {
    localStorage.setItem('notes', JSON.stringify(notes))
  }, [notes])

  useEffect(() => {
    const uniqueFolders = ['All Notes', ...new Set(notes.map(note => note.folder).filter(Boolean))]
    setFolders(uniqueFolders)
  }, [notes])

  useEffect(() => {
    if (contentEditableRef.current) {
      contentEditableRef.current.innerHTML = currentNote.content
    }
  }, [currentNote.id])

  const saveNote = () => {
    if (currentNote.title.trim() === '' && contentEditableRef.current?.innerText.trim() === '') return

    const updatedNote = {
      ...currentNote,
      content: contentEditableRef.current?.innerHTML || '',
      lastModified: new Date()
    }

    if (currentNote.id === 0) {
      setNotes([...notes, { ...updatedNote, id: Date.now() }])
    } else {
      setNotes(notes.map(note => note.id === currentNote.id ? updatedNote : note))
    }
    setCurrentNote({ id: 0, title: '', content: '', folder: '', tags: [], lastModified: new Date() })
    if (contentEditableRef.current) {
      contentEditableRef.current.innerHTML = ''
    }
  }

  const deleteNote = (id: number) => {
    setNotes(notes.filter(note => note.id !== id))
    if (currentNote.id === id) {
      setCurrentNote({ id: 0, title: '', content: '', folder: '', tags: [], lastModified: new Date() })
      if (contentEditableRef.current) {
        contentEditableRef.current.innerHTML = ''
      }
    }
  }

  const addFolder = () => {
    if (newFolderName && !folders.includes(newFolderName)) {
      setFolders([...folders, newFolderName])
      setNewFolderName('')
      setShowFolderInput(false)
    }
  }

  const addTag = () => {
    if (newTag && !currentNote.tags.includes(newTag)) {
      setCurrentNote({ ...currentNote, tags: [...currentNote.tags, newTag] })
      setNewTag('')
      setShowTagInput(false)
    }
  }

  const removeTag = (tagToRemove: string) => {
    setCurrentNote({ ...currentNote, tags: currentNote.tags.filter(tag => tag !== tagToRemove) })
  }

  const filteredNotes = notes
    .filter(note => activeFolder === 'All Notes' || note.folder === activeFolder)
    .filter(note =>
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    )

  const applyFormatting = (format: string) => {
    document.execCommand(format, false)
    contentEditableRef.current?.focus()
  }

  const exportNote = (format: 'pdf' | 'markdown') => {
    if (format === 'markdown') {
      const noteContent = `# ${currentNote.title}\n\n${contentEditableRef.current?.innerText || ''}`
      const blob = new Blob([noteContent], { type: 'text/plain;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${currentNote.title || 'Untitled'}.md`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } else if (format === 'pdf') {
      const pdf = new jsPDF()
      pdf.setFontSize(18)
      pdf.text(currentNote.title, 20, 20)
      pdf.setFontSize(12)

      const content = contentEditableRef.current?.innerHTML || ''
      const tempDiv = document.createElement('div')
      tempDiv.innerHTML = content
      
      // Remove metadata section if present
      const metadataSection = tempDiv.querySelector('.mb-4.p-4.bg-gray-50, .mb-4.p-4.bg-gray-800')
      if (metadataSection) {
        const metadataText = metadataSection.textContent || ''
        if (metadataText.includes('Generated on') || metadataText.includes('Original length')) {
          metadataSection.remove()
        }
      }

      let yOffset = 30
      const lineHeight = 7
      const pageWidth = pdf.internal.pageSize.width
      const margin = 20
      const maxWidth = pageWidth - 2 * margin

      const processNode = (node: Node, fontSize: number = 12, isBold: boolean = false, isItalic: boolean = false, isUnderline: boolean = false) => {
        if (node.nodeType === Node.TEXT_NODE) {
          pdf.setFontSize(fontSize)
          pdf.setFont(undefined, isBold ? 'bold' : isItalic ? 'italic' : 'normal')
          
          const textLines = (node.textContent || '').split('\n')
          textLines.forEach((textLine, index) => {
            const words = textLine.split(' ')
            let line = ''
            for (let i = 0; i < words.length; i++) {
              const testLine = line + (line ? ' ' : '') + words[i]
              const testWidth = pdf.getTextWidth(testLine)
              if (testWidth > maxWidth) {
                if (yOffset > pdf.internal.pageSize.height - margin) {
                  pdf.addPage()
                  yOffset = margin
                }
                pdf.text(line, margin, yOffset)
                if (isUnderline) {
                  pdf.line(margin, yOffset + 1, margin + pdf.getTextWidth(line), yOffset + 1)
                }
                yOffset += lineHeight
                line = words[i]
              } else {
                line = testLine
              }
            }
            if (line) {
              if (yOffset > pdf.internal.pageSize.height - margin) {
                pdf.addPage()
                yOffset = margin
              }
              pdf.text(line, margin, yOffset)
              if (isUnderline) {
                pdf.line(margin, yOffset + 1, margin + pdf.getTextWidth(line), yOffset + 1)
              }
              yOffset += lineHeight
            }
            if (index < textLines.length - 1) {
              yOffset += lineHeight / 2 // Add a bit of extra space between paragraphs
            }
          })
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          const element = node as HTMLElement
          if (element.tagName === 'BR') {
            yOffset += lineHeight
          } else if (element.tagName === 'B' || element.tagName === 'STRONG') {
            Array.from(element.childNodes).forEach(child => processNode(child, fontSize, true, isItalic, isUnderline))
          } else if (element.tagName === 'I' || element.tagName === 'EM') {
            Array.from(element.childNodes).forEach(child => processNode(child, fontSize, isBold, true, isUnderline))
          } else if (element.tagName === 'U') {
            Array.from(element.childNodes).forEach(child => processNode(child, fontSize, isBold, isItalic, true))
          } else {
            Array.from(element.childNodes).forEach(child => processNode(child, fontSize, isBold, isItalic, isUnderline))
          }
        }
      }

      processNode(tempDiv)
      pdf.save(`${currentNote.title || 'Untitled'}.pdf`)
    }
  }

  const handleContentChange = () => {
    if (contentEditableRef.current) {
      setCurrentNote(prevNote => ({ ...prevNote, content: contentEditableRef.current?.innerHTML || '' }))
    }
  }

  return (
    <div className="flex flex-col md:flex-row h-full bg-gray-100 dark:bg-gray-900 p-4 md:p-8">
      <button
        onClick={() => setShowSidebar(!showSidebar)}
        className="md:hidden mb-4 p-2 bg-white dark:bg-gray-800 rounded-md shadow-md"
      >
        {showSidebar ? 'Hide Sidebar' : 'Show Sidebar'}
      </button>
      {(showSidebar || window.innerWidth >= 768) && (
        <div className="w-full md:w-1/4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md mb-4 md:mb-0 md:mr-4 overflow-y-auto max-h-screen">
          <div className="mb-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
              <Search className="absolute right-3 top-2.5 text-gray-400" size={20} />
            </div>
          </div>
          <button
            onClick={() => {
              setCurrentNote({ id: 0, title: '', content: '', folder: '', tags: [], lastModified: new Date() })
              if (contentEditableRef.current) {
                contentEditableRef.current.innerHTML = ''
              }
            }}
            className="w-full mb-4 px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 transition-colors duration-300 flex items-center justify-center"
          >
            <Plus size={20} className="mr-2" /> New Note
          </button>
          <div className="mb-4">
            <h3 className="font-semibold mb-2 text-gray-700 dark:text-gray-300">Folders</h3>
            {folders.map(folder => (
              <div
                key={folder}
                className={`flex items-center justify-between p-2 rounded-md cursor-pointer ${activeFolder === folder ? 'bg-indigo-100 dark:bg-indigo-900' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                onClick={() => setActiveFolder(folder)}
              >
                <div className="flex items-center">
                  <Folder size={16} className="mr-2 text-indigo-500" />
                  <span className="text-gray-700 dark:text-gray-300">{folder}</span>
                </div>
                {activeFolder === folder && <ChevronRight size={16} className="text-indigo-500" />}
              </div>
            ))}
            {showFolderInput ? (
              <div className="flex items-center mt-2">
                <input
                  type="text"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  className="flex-grow px-2 py-1 border rounded-l-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="New folder name"
                />
                <button
                  onClick={addFolder}
                  className="px-2 py-1 bg-indigo-500 text-white rounded-r-md hover:bg-indigo-600"
                >
                  Add
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowFolderInput(true)}
                className="mt-2 text-indigo-500 hover:text-indigo-600 flex items-center"
              >
                <Plus size={16} className="mr-1" /> Add Folder
              </button>
            )}
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {filteredNotes.map(note => (
              <div
                key={note.id}
                className={`p-2 bg-white dark:bg-gray-700 rounded-md cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-900 transition-colors duration-300 ${
                  currentNote.id === note.id ? 'border-l-4 border-indigo-500' : ''
                }`}
                onClick={() => {
                  setCurrentNote(note)
                  if (contentEditableRef.current) {
                    contentEditableRef.current.innerHTML = note.content
                  }
                }}
              >
                <h3 className="font-semibold text-gray-800 dark:text-white truncate">{note.title || 'Untitled'}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{note.content.replace(/<[^>]*>/g, '')}</p>
                <div className="flex items-center mt-1 space-x-2 flex-wrap">
                  {note.tags.slice(0, 2).map(tag => (
                    <span key={tag} className="text-xs bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-full">
                      {tag}
                    </span>
                  ))}
                  {note.tags.length > 2 && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">+{note.tags.length - 2} more</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="flex-grow bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md overflow-y-auto">
        {showPDFImportNotification && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/30 rounded-lg border border-green-200 dark:border-green-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-800 dark:text-green-200">
                    PDF Summary imported successfully!
                  </p>
                </div>
              </div>
              <div className="ml-4 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setShowPDFImportNotification(false)}
                  className="inline-flex rounded-md bg-green-50 dark:bg-green-900/30 p-1.5 text-green-500 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-800/50 focus:outline-none"
                >
                  <span className="sr-only">Dismiss</span>
                  <X size={16} />
                </button>
              </div>
            </div>
          </div>
        )}
        <div className="mb-4 flex flex-col md:flex-row justify-between items-start md:items-center">
          <input
            type="text"
            value={currentNote.title}
            onChange={(e) => setCurrentNote({ ...currentNote, title: e.target.value })}
            placeholder="Note Title"
            className="text-2xl font-bold w-full md:w-auto px-4 py-2 mb-2 md:mb-0 border-b focus:outline-none focus:border-indigo-500 bg-transparent dark:text-white"
          />
          <div className="flex items-center space-x-2 w-full md:w-auto">
            <select
              value={currentNote.folder}
              onChange={(e) => setCurrentNote({ ...currentNote, folder: e.target.value })}
              className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="">Select Folder</option>
              {folders.filter(folder => folder !== 'All Notes').map(folder => (
                <option key={folder} value={folder}>{folder}</option>
              ))}
            </select>
            <button
              onClick={saveNote}
              className="px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 transition-colors duration-300"
            >
              <Save size={20} />
            </button>
          </div>
        </div>
        <div className="mb-2 flex space-x-2 flex-wrap">
          <button onClick={() => applyFormatting('bold')} className="p-2 bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600">
            <Bold size={20} />
          </button>
          <button onClick={() => applyFormatting('italic')} className="p-2 bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600">
            <Italic size={20} />
          </button>
          <button onClick={() => applyFormatting('underline')} className="p-2 bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600">
            <Underline size={20} />
          </button>
        </div>
        <div
          ref={contentEditableRef}
          contentEditable
          className="w-full p-4 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-transparent dark:text-white min-h-[200px] overflow-y-auto"
          onInput={handleContentChange}
        />
        <div className="flex flex-wrap items-center mt-2">
          <button
            onClick={() => setShowTagInput(!showTagInput)}
            className="px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 transition-colors duration-300 flex items-center mb-2 mr-2"
          >
            <Tag size={20} className="mr-2" /> Tags
          </button>
          <div className="flex flex-wrap">
            {currentNote.tags.map(tag => (
              <div key={tag} className="flex items-center bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-full mr-2 mb-2">
                {tag}
                <button onClick={() => removeTag(tag)} className="ml-2">
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>
        {showTagInput && (
          <div className="flex items-center mt-2">
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              className="flex-grow px-2 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="New tag"
            />
            <button
              onClick={addTag}
              className="ml-2 px-2 py-1 bg-indigo-500 text-white rounded-md hover:bg-indigo-600"
            >
              Add
            </button>
          </div>
        )}
        <div className="mt-4 flex flex-wrap justify-between">
          {currentNote.id > 0 && (
            <button
              onClick={() => deleteNote(currentNote.id)}
              className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors duration-300 mb-2 md:mb-0"
            >
              <Trash2 size={20} className="mr-2 inline" /> Delete Note
            </button>
          )}
          <div className="flex flex-wrap">
            <button
              onClick={() => exportNote('markdown')}
              className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors duration-300 flex items-center mr-2 mb-2 md:mb-0"
            >
              <Download size={20} className="mr-2" /> Export as Markdown
            </button>
            <button
              onClick={() => exportNote('pdf')}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-300 flex items-center"
            >
              <Download size={20} className="mr-2" /> Export as PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NoteTakingPage