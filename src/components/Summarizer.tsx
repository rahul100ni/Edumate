import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, AlertCircle, Loader, ChevronUp, ChevronDown, Copy, Download, Maximize2, Minimize2, Settings2, X, Save, BookOpen } from 'lucide-react'
import { summarizeText, SummaryProgress } from '../utils/summarizer';
import { useNavigate } from 'react-router-dom';

interface SummarizerProps {
  text: string;
  settings?: {
    length: 'short' | 'medium' | 'detailed';
    tone: 'academic' | 'simple' | 'creative';
    format: 'bullets' | 'paragraphs';
    highlightKeyPoints: boolean;
    preserveStructure: boolean;
    extractDefinitions: boolean;
  };
  onSummaryComplete?: (summary: string) => void;
  initialSummary?: string | null;
}

const Summarizer: React.FC<SummarizerProps> = ({ text, settings, onSummaryComplete, initialSummary }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [summary, setSummary] = useState<string | null>(initialSummary || null);
  const [progress, setProgress] = useState<SummaryProgress | null>(null);
  const [copied, setCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentFormat, setCurrentFormat] = useState(settings?.format || 'paragraphs');
  const [settingsState, setSettingsState] = useState({
    needsRegeneration: false,
    showIndicator: false,
    lastSettings: settings,
    indicatorTimeout: null as NodeJS.Timeout | null
  });
  const [definitions, setDefinitions] = useState<Array<{ term: string; definition: string }>>([]);
  const [keyPoints, setKeyPoints] = useState<string[]>([]);
  const [showSaveToNotes, setShowSaveToNotes] = useState(false);
  const navigate = useNavigate();

  const handleSaveToNotes = () => {
    // Get the PDF filename from localStorage
    const pdfMetadata = localStorage.getItem('pdfMetadata');
    let filename = 'Document';
    if (pdfMetadata) {
      const metadata = JSON.parse(pdfMetadata);
      filename = metadata.filename.replace(/\.pdf$/i, '');
    }

    const title = `Summary of ${filename}`;

    const noteData = {
      type: 'pdf_summary',
      title,
      content: formatContentForNotes(summary),
      metadata: {
        keyPoints,
        definitions,
        format: currentFormat,
        generatedAt: new Date().toISOString(),
        originalLength: text.length
      }
    };

    localStorage.setItem('pendingNote', JSON.stringify(noteData));
    navigate('/note-taking?source=pdf-summary');
  };

  // Function to format content with proper HTML formatting
  const formatContentForNotes = (content: string) => {
    let formattedContent = content;

    const lines = formattedContent.split('\n');
    let inList = false;
    let processedLines = [];

    // Skip metadata header if present
    let startIndex = 0;
    if (lines[0]?.includes('Generated on') && lines[1]?.includes('Original length')) {
      startIndex = 3; // Skip the metadata lines and the empty line after them
    }

    for (let line of lines) {
      const trimmedLine = line.trim();
      
      // Skip empty lines
      if (!trimmedLine) {
        if (inList) {
          processedLines.push('</ul>');
          inList = false;
        }
        continue;
      }

      // Process the line content with markdown formatting
      const formattedLine = trimmedLine
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/__(.*?)__/g, '<u>$1</u>')
        .replace(/`(.*?)`/g, '<code>$1</code>')
        .replace(/~~(.*?)~~/g, '<del>$1</del>');

      // Check if line is a bullet point
      if (trimmedLine.startsWith('-') || trimmedLine.startsWith('•')) {
        const bulletContent = formattedLine.replace(/^[-•]\s*/, '').trim();
        if (!inList) {
          processedLines.push('<ul class="list-disc pl-6 space-y-2">');
          inList = true;
        }
        processedLines.push(`<li>${bulletContent}</li>`);
      } else {
        if (inList) {
          processedLines.push('</ul>');
          inList = false;
        }
        processedLines.push(`<p>${formattedLine}</p>`);
      }
    }

    // Close any open list
    if (inList) {
      processedLines.push('</ul>');
    }

    return processedLines.join('\n');
  };

  // Watch for settings changes
  useEffect(() => {
    if (summary && settings && JSON.stringify(settings) !== JSON.stringify(settingsState.lastSettings)) {
      // Clear any existing timeout
      if (settingsState.indicatorTimeout) {
        clearTimeout(settingsState.indicatorTimeout);
      }

      // Set up new timeout
      const timeout = setTimeout(() => {
        setSettingsState(prev => ({
          ...prev,
          showIndicator: false
        }));
      }, 2000);

      setSettingsState({
        needsRegeneration: true,
        showIndicator: true,
        lastSettings: settings,
        indicatorTimeout: timeout
      });
    }
  }, [settings, settingsState.lastSettings, summary]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (settingsState.indicatorTimeout) {
        clearTimeout(settingsState.indicatorTimeout);
      }
    };
  }, []);

  // Function to convert markdown-style formatting to HTML
  const formatText = (text: string) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
      .replace(/\*(.*?)\*/g, '<em>$1</em>') // Italic
      .replace(/`(.*?)`/g, '<code>$1</code>') // Code
      .replace(/__(.*?)__/g, '<u>$1</u>') // Underline
      .replace(/~~(.*?)~~/g, '<del>$1</del>') // Strikethrough
      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'); // Links
  };

  const handleCopy = async () => {
    if (summary) {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (summary) {
      const blob = new Blob([summary], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'summary.txt';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const extractDefinitionsFromText = (text: string) => {
    const definitionPattern = /\*([^*]+)\*:\s+([^*]+)/g;
    const definitions = [];
    let match;
    
    while ((match = definitionPattern.exec(text)) !== null) {
      definitions.push({
        term: match[1].trim(),
        definition: match[2].trim()
      });
    }
    
    return definitions;
  };

  const extractKeyPoints = (text: string) => {
    const keyPointPattern = /\*\*([^*]+)\*\*/g;
    const points = [];
    let match;
    
    while ((match = keyPointPattern.exec(text)) !== null) {
      points.push(match[1].trim());
    }
    
    return points;
  };

  const handleSummarize = async () => {
    if (!text) return;
    
    setIsLoading(true);
    setError(null);
    setProgress({
      status: 'Preparing text for summarization...',
      progress: 0,
      currentChunk: 0,
      totalChunks: 0
    });
    setSettingsState(prev => ({
      ...prev,
      needsRegeneration: false
    }));

    try {
      const result = await summarizeText(text, {
        onProgress: (progress) => {
          setProgress(progress)
        },
        maxTokens: settings?.length === 'short' ? 150 :
                  settings?.length === 'medium' ? 300 : 500,
        temperature: settings?.tone === 'creative' ? 0.8 :
                    settings?.tone === 'academic' ? 0.3 : 0.5,
        format: settings?.format,
        highlightKeyPoints: settings?.highlightKeyPoints,
        preserveStructure: settings?.preserveStructure,
        extractDefinitions: settings?.extractDefinitions
      });
      
      // Clean and format the summary
      const formattedSummary = settings?.format === 'bullets'
        ? result
            .split('\n')
            .filter(line => line.trim()) // Remove empty lines
            .map(line => line.trim().replace(/^[-•*]\s*/, '')) // Remove any existing bullet points
            .filter(line => line) // Remove any remaining empty lines
            .map(line => `- ${line}`) // Add consistent bullet points
            .join('\n')
        : result;
      
      setSummary(formattedSummary);
      
      if (settings?.extractDefinitions) {
        setDefinitions(extractDefinitionsFromText(formattedSummary));
      }
      
      if (settings?.highlightKeyPoints) {
        setKeyPoints(extractKeyPoints(formattedSummary));
      }
      
      if (onSummaryComplete) {
        onSummaryComplete(formattedSummary);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate summary');
    } finally {
      setIsLoading(false);
      setProgress(null);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="p-4 bg-red-50 dark:bg-red-900/50 rounded-lg flex items-center"
        >
          <AlertCircle className="text-red-500 mr-2" />
          <p className="text-red-800 dark:text-red-200">{error}</p>
        </motion.div>
      )}

      {!summary && !isLoading && (
        <button
          onClick={handleSummarize}
          className={`w-full px-4 py-3 rounded-lg flex items-center justify-center relative ${
            settingsState.needsRegeneration
            ? 'bg-yellow-500 hover:bg-yellow-600'
            : 'bg-indigo-600 hover:bg-indigo-700'
          } text-white transition-colors duration-300`}
        >
          <FileText className="mr-2" />
          {settingsState.needsRegeneration ? 'Regenerate Summary' : 'Generate Summary'}
          {settingsState.needsRegeneration && (
            <span className="absolute top-0 right-0 transform -translate-y-1/2 translate-x-1/2">
              <span className="flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-500"></span>
              </span>
            </span>
          )}
        </button>
      )}

      {isLoading && progress && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="p-4 bg-indigo-50 dark:bg-indigo-900 rounded-lg space-y-2 border border-indigo-100 dark:border-indigo-800"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Loader className="animate-spin text-indigo-600 dark:text-indigo-400 mr-2" />
              <span className="text-indigo-700 dark:text-indigo-300">
                {progress.status}
              </span>
            </div>
            <span className="text-indigo-600 dark:text-indigo-400">
              {Math.round(progress.progress)}%
            </span>
          </div>
          {progress.totalChunks > 1 && (
            <div>
              <div className="text-sm text-indigo-600 dark:text-indigo-400">
                Processing chunk {progress.currentChunk} of {progress.totalChunks}
              </div>
              <div className="w-full bg-indigo-200 dark:bg-indigo-800 rounded-full h-2 mt-1">
                <div
                  className="bg-indigo-600 dark:bg-indigo-400 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress.progress}%` }}
                />
              </div>
            </div>
          )}
        </motion.div>
      )}

      {summary && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`${
            isFullscreen 
              ? 'fixed inset-0 z-50 m-4 bg-white dark:bg-gray-800' 
              : 'sticky top-4 bg-white dark:bg-gray-800'
          } rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-300`}
        >
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Summary</h3>
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="ml-2 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors duration-200"
              >
                {isCollapsed ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
              </button>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
                title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
              >
                {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
              </button>

              <button
                onClick={handleCopy}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200 flex items-center"
                title="Copy to clipboard"
              >
                <Copy size={18} />
                {copied && (
                  <span className="ml-2 text-sm text-green-500">Copied!</span>
                )}
              </button>
              <button
                onClick={handleDownload}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
                title="Download summary">
                <Download size={18} />
              </button>
              <button
                onClick={() => setShowSaveToNotes(true)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
                title="Save to Notes">
                <Save size={18} />
              </button>
            </div>
          </div>
          <motion.div
            key={summary} // Force re-render on new summary
            initial={false}
            animate={{ height: isCollapsed ? 0 : 'auto' }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            {settingsState.needsRegeneration && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mx-4 mt-4 p-3 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/30 dark:to-yellow-900/30 rounded-lg border border-yellow-200 dark:border-yellow-800/30 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Settings2 className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                    <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                      Settings have changed
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleSummarize}
                      className="px-3 py-1.5 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-white text-sm font-medium rounded-md transition-all duration-200 shadow-sm hover:shadow flex items-center space-x-1"
                    >
                      <span>Regenerate Summary</span>
                    </button>
                    <button
                      onClick={() => setSettingsState(prev => ({ ...prev, needsRegeneration: false }))}
                      className="p-1.5 text-yellow-600 dark:text-yellow-400 hover:text-yellow-700 dark:hover:text-yellow-300 rounded-md hover:bg-yellow-100 dark:hover:bg-yellow-900/30 transition-colors duration-200"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {settingsState.showIndicator && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="fixed top-4 right-4 px-3 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 rounded-full text-sm shadow-lg z-50"
              >
                Settings Updated
              </motion.div>
            )}

            <div className="p-4 max-h-[70vh] overflow-y-auto space-y-6">
              {keyPoints.length > 0 && (
                <div className="bg-indigo-50 dark:bg-indigo-900/30 rounded-lg p-4">
                  <h4 className="text-lg font-semibold mb-3 text-gray-800 dark:text-white">
                    Key Points
                  </h4>
                  <ul className="space-y-2">
                    {keyPoints.map((point, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-indigo-500 mr-2">•</span>
                        <span className="text-gray-700 dark:text-gray-300">{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {definitions.length > 0 && (
                <div className="bg-purple-50 dark:bg-purple-900/30 rounded-lg p-4">
                  <h4 className="text-lg font-semibold mb-3 text-gray-800 dark:text-white">
                    Key Terms & Definitions
                  </h4>
                  <dl className="space-y-3">
                    {definitions.map((def, index) => (
                      <div key={index}>
                        <dt className="font-medium text-gray-800 dark:text-white">{def.term}</dt>
                        <dd className="text-gray-600 dark:text-gray-400 ml-4">{def.definition}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              )}

              {settings?.format === 'bullets' ? (
                <ul className="space-y-2">
                  {summary
                    .split('\n')
                    .filter(point => point.trim()) // Remove empty lines
                    .map((point, index) => {
                      const content = point.replace(/^[-•*]\s*/, '').trim(); // Remove bullet point and trim
                      if (!content) return null;
                      
                      return (
                        <li key={index} className="flex items-start">
                          <span className="mr-2 text-indigo-500">•</span>
                          <span className={`text-gray-700 dark:text-gray-300 ${
                            settings?.highlightKeyPoints 
                              ? 'prose prose-indigo dark:prose-invert max-w-none' 
                              : ''
                          }`}
                            dangerouslySetInnerHTML={{ __html: formatText(content) }}>
                          </span>
                        </li>
                      );
                    })
                    .filter(Boolean)} {/* Remove any null items */}
                </ul>
              ) : (
                <div className={`text-gray-700 dark:text-gray-300 space-y-4 ${
                  settings?.highlightKeyPoints ? 'prose prose-indigo dark:prose-invert' : ''
                } max-w-none`}>
                  {summary.split('\n\n').map((paragraph, index) => (
                    <p 
                      key={index} 
                      dangerouslySetInnerHTML={{ 
                        __html: formatText(paragraph)
                      }} 
                    />
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}

      <AnimatePresence>
        {showSaveToNotes && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ y: 20 }}
              animate={{ y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full shadow-xl"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <BookOpen className="w-6 h-6 text-indigo-500 mr-2" />
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                    Save to Notes
                  </h3>
                </div>
                <button
                  onClick={() => setShowSaveToNotes(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <X size={20} />
                </button>
              </div>
              
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Your summary will be saved to the Notes app with all formatting, key points, and definitions preserved.
              </p>

              <div className="space-y-4">
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Rich text formatting preserved
                </div>
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Key points and definitions included
                </div>
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Automatic organization
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowSaveToNotes(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveToNotes}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200 flex items-center"
                >
                  <Save size={18} className="mr-2" />
                  Save to Notes
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Summarizer;