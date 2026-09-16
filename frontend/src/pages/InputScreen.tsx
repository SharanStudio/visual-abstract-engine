import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAbstractAPI } from '../hooks/useAbstractAPI';
import { useArtifactStore } from '../store/artifactStore';

export default function InputScreen() {
  const navigate = useNavigate();
  const { generateAbstract } = useAbstractAPI();
  const setArtifact = useArtifactStore((state) => state.setArtifact);
  
  const [abstractText, setAbstractText] = useState('');
  const [studyType, setStudyType] = useState<'RCT' | 'Cohort' | 'Cross-sectional' | 'Outbreak' | 'Surveillance'>('RCT');
  const [population, setPopulation] = useState('');
  const [outcome, setOutcome] = useState('');
  const [effectSize, setEffectSize] = useState('');
  const [tone, setTone] = useState<'common-man' | 'academic'>('common-man');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!abstractText || !outcome || !effectSize) {
      setError('Please fill all required fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await generateAbstract({
        abstractText,
        studyType,
        population,
        outcome,
        effectSize,
        tone
      });

      if (response.success) {
        setArtifact({
          html: response.artifact.htmlArtifact,
          metadata: response.metadata,
          logos: [],
          colourPalette: response.artifact.designSuggestions.colourPalette,
          tone,
          editHistory: []
        });
        navigate('/editor');
      }
    } catch (err) {
      setError('Failed to generate abstract. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Visual Abstract Engine</h1>
        <p className="text-gray-600 mb-8">Transform your research abstract into a beautiful social media graphic</p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <div className="space-y-6">
          {/* Abstract Text */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Research Abstract *
            </label>
            <textarea
              value={abstractText}
              onChange={(e) => setAbstractText(e.target.value)}
              placeholder="Paste your research abstract here..."
              className="w-full h-32 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Study Type */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Study Type *
            </label>
            <select
              value={studyType}
              onChange={(e) => setStudyType(e.target.value as any)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="RCT">Randomized Controlled Trial (RCT)</option>
              <option value="Cohort">Cohort Study</option>
              <option value="Cross-sectional">Cross-sectional Study</option>
              <option value="Outbreak">Outbreak Investigation</option>
              <option value="Surveillance">Surveillance Data</option>
            </select>
          </div>

          {/* Population */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Population
            </label>
            <input
              type="text"
              value={population}
              onChange={(e) => setPopulation(e.target.value)}
              placeholder="e.g., 2000 adults aged 18-65"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Outcome */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Primary Outcome *
            </label>
            <input
              type="text"
              value={outcome}
              onChange={(e) => setOutcome(e.target.value)}
              placeholder="e.g., Blood pressure reduction"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Effect Size */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Effect Size / Key Finding *
            </label>
            <input
              type="text"
              value={effectSize}
              onChange={(e) => setEffectSize(e.target.value)}
              placeholder="e.g., 8.5 mmHg (95% CI: 6.2-10.8)"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Tone Toggle */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Tone
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="common-man"
                  checked={tone === 'common-man'}
                  onChange={(e) => setTone(e.target.value as any)}
                  className="w-4 h-4"
                />
                <span className="text-gray-700">Common Man (Simple language)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="academic"
                  checked={tone === 'academic'}
                  onChange={(e) => setTone(e.target.value as any)}
                  className="w-4 h-4"
                />
                <span className="text-gray-700">Academic (Professional)</span>
              </label>
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={loading}
            className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition ${
              loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {loading ? 'Generating...' : 'Generate Abstract'}
          </button>
        </div>
      </div>
    </div>
  );
}
