import { useEffect, useState } from 'react';
import { getTrials, updateTrial } from './api';
import type { Trial } from './api';

function App() {
  const [trials, setTrials] = useState<Trial[]>([]);
  const [selectedTrial, setSelectedTrial] = useState<Trial | null>(null);
  const [view, setView] = useState<'PENDING_REVIEW' | 'APPROVED' | 'REJECTED'>('PENDING_REVIEW');
  const [customSummary, setCustomSummary] = useState('');

  useEffect(() => {
    loadTrials();
  }, [view]);

  useEffect(() => {
    if (selectedTrial) {
      setCustomSummary(selectedTrial.custom_summary || selectedTrial.official_summary);
    }
  }, [selectedTrial]);

  const loadTrials = async () => {
    try {
      const data = await getTrials(view);
      setTrials(data);
      setSelectedTrial(null);
    } catch (error) {
      console.error("Failed to load trials", error);
    }
  };

  const handleUpdate = async (status: 'APPROVED' | 'REJECTED') => {
    if (!selectedTrial) return;
    try {
      await updateTrial(selectedTrial.nct_id, {
        status,
        custom_summary: customSummary
      });
      // Remove from list if we are in pending view
      if (view === 'PENDING_REVIEW') {
        setTrials(trials.filter(t => t.nct_id !== selectedTrial.nct_id));
        setSelectedTrial(null);
      } else {
        loadTrials();
      }
    } catch (error) {
      console.error("Failed to update trial", error);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r flex flex-col">
        <div className="p-4 border-b font-bold text-xl text-blue-600">
          Trial Explorer
        </div>
        <nav className="flex-1 overflow-y-auto p-2">
          <div className="space-y-1">
            <button
              onClick={() => setView('PENDING_REVIEW')}
              className={`w-full text-left px-3 py-2 rounded ${view === 'PENDING_REVIEW' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'}`}
            >
              Pending Reviews
            </button>
            <button
              onClick={() => setView('APPROVED')}
              className={`w-full text-left px-3 py-2 rounded ${view === 'APPROVED' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'}`}
            >
              Approved
            </button>
            <button
              onClick={() => setView('REJECTED')}
              className={`w-full text-left px-3 py-2 rounded ${view === 'REJECTED' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'}`}
            >
              Rejected
            </button>
          </div>
          
          <div className="mt-8 px-3 text-xs font-semibold text-gray-500 uppercase">
            Trials List
          </div>
          <div className="mt-2 space-y-1">
            {trials.map(trial => (
              <button
                key={trial.nct_id}
                onClick={() => setSelectedTrial(trial)}
                className={`w-full text-left px-3 py-2 rounded text-sm truncate ${selectedTrial?.nct_id === trial.nct_id ? 'bg-gray-200' : 'hover:bg-gray-50'}`}
              >
                {trial.nct_id}
              </button>
            ))}
            {trials.length === 0 && (
              <div className="px-3 py-2 text-sm text-gray-400">No trials found</div>
            )}
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {selectedTrial ? (
          <div className="flex-1 flex flex-col h-full">
            <header className="bg-white border-b px-6 py-4 flex justify-between items-center">
              <div>
                <h1 className="text-xl font-bold text-gray-800">{selectedTrial.title}</h1>
                <div className="text-sm text-gray-500 mt-1">ID: {selectedTrial.nct_id}</div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleUpdate('REJECTED')}
                  className="px-4 py-2 border border-red-300 text-red-600 rounded hover:bg-red-50 transition"
                >
                  Reject
                </button>
                <button
                  onClick={() => handleUpdate('APPROVED')}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
                >
                  Approve & Save
                </button>
              </div>
            </header>
            
            <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
              {/* Official Summary */}
              <div className="flex-1 p-6 overflow-y-auto border-b md:border-b-0 md:border-r">
                <h2 className="font-semibold text-lg mb-4 text-gray-700">Official Summary</h2>
                <div className="prose max-w-none text-gray-600 whitespace-pre-wrap">
                  {selectedTrial.official_summary}
                </div>
              </div>

              {/* Custom/AI Summary */}
              <div className="flex-1 p-6 overflow-y-auto bg-gray-50">
                <h2 className="font-semibold text-lg mb-4 text-gray-700">AI / Custom Summary</h2>
                <textarea
                  className="w-full h-[calc(100%-3rem)] p-4 border rounded shadow-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  value={customSummary}
                  onChange={(e) => setCustomSummary(e.target.value)}
                  placeholder="Edit the summary here..."
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            Select a trial to view details
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
