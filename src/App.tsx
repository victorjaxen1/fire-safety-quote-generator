import { useState } from 'react';
import QuoteBuilder from './components/QuoteBuilder';
import AdminPanel from './components/AdminPanel';

function App() {
  const [currentView, setCurrentView] = useState<'quote' | 'admin'>('quote');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                Fire Safety Quote Generator
              </h1>
            </div>
            <nav className="flex space-x-4">
              <button
                onClick={() => setCurrentView('quote')}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  currentView === 'quote'
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Quote Builder
              </button>
              <button
                onClick={() => setCurrentView('admin')}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  currentView === 'admin'
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Admin
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {currentView === 'quote' ? <QuoteBuilder /> : <AdminPanel />}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">
            Fire Safety Quote Generator - Australian Standards Compliant
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;