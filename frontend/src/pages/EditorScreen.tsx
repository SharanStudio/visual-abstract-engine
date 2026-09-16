import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useArtifactStore } from '../store/artifactStore';
import { useAbstractAPI } from '../hooks/useAbstractAPI';
import ChatPanel from '../components/ChatPanel';
import ArtifactPreview from '../components/ArtifactPreview';

export default function EditorScreen() {
  const navigate = useNavigate();
  const artifact = useArtifactStore((state) => state.artifact);
  const { chat } = useAbstractAPI();
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([]);
  const [currentHtml, setCurrentHtml] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!artifact) {
      navigate('/');
      return;
    }
    setCurrentHtml(artifact.html);
  }, [artifact, navigate]);

  const handleSendMessage = async (message: string) => {
    if (!artifact) return;

    setMessages((prev) => [...prev, { role: 'user', content: message }]);
    setLoading(true);

    try {
      const response = await chat({
        currentHTML: currentHtml,
        userMessage: message,
        conversationHistory: messages,
        abstractMetadata: artifact.metadata,
        tone: artifact.tone
      });

      if (response.success) {
        setCurrentHtml(response.html);
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: response.explanation }
        ]);
      }
    } catch (err) {
      console.error('Error:', err);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Failed to update design. Please try again.' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (!artifact) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="grid grid-cols-2 gap-0 h-screen">
        {/* Left: Chat Panel */}
        <div className="border-r border-gray-200 bg-white overflow-hidden">
          <ChatPanel
            messages={messages}
            onSendMessage={handleSendMessage}
            loading={loading}
          />
        </div>

        {/* Right: Preview Panel */}
        <div className="bg-gray-100 overflow-hidden">
          <ArtifactPreview html={currentHtml} />
        </div>
      </div>
    </div>
  );
}
