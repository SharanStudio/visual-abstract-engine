import { useAbstractAPI } from '../hooks/useAbstractAPI';

interface ArtifactPreviewProps {
  html: string;
}

export default function ArtifactPreview({ html }: ArtifactPreviewProps) {
  const { exportPNG } = useAbstractAPI();
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      await exportPNG(html, `abstract_${Date.now()}`);
    } catch (err) {
      console.error('Export failed:', err);
      alert('Failed to export PNG');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-gray-800 text-white p-4 border-b">
        <h2 className="text-lg font-semibold">Live Preview</h2>
        <p className="text-sm text-gray-300">1200×1200px</p>
      </div>

      {/* Preview Container */}
      <div className="flex-1 flex items-center justify-center p-8 overflow-auto">
        <div
          className="w-96 h-96 bg-white rounded-lg shadow-xl border-2 border-gray-300 overflow-hidden"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>

      {/* Export Button */}
      <div className="bg-white border-t border-gray-200 p-4">
        <button
          onClick={handleExport}
          disabled={exporting}
          className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition ${
            exporting
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-green-600 hover:bg-green-700'
          }`}
        >
          {exporting ? 'Exporting...' : 'Download PNG (1200×1200)'}
        </button>
      </div>
    </div>
  );
}
