/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { UploadView } from './components/UploadView';
import { LeadsView } from './components/LeadsView';
import { Lead } from './types';

export default function App() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [view, setView] = useState<'upload' | 'leads'>('upload');

  const handleLeadsParsed = (parsedLeads: Lead[]) => {
    setLeads(parsedLeads);
    setView('leads');
  };

  const clearLeads = () => {
    setLeads([]);
    setView('upload');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <header className="bg-white border-b border-gray-200 py-4 px-6 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="8" y1="13" x2="16" y2="13" />
                <line x1="8" y1="17" x2="16" y2="17" />
                <line x1="10" y1="9" x2="8" y2="9" />
              </svg>
            </div>
            <span className="font-bold text-gray-900 text-lg">LeadExtractor</span>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        {view === 'upload' ? (
          <UploadView onLeadsParsed={handleLeadsParsed} />
        ) : (
          <LeadsView leads={leads} onBack={clearLeads} />
        )}
      </main>

      <footer className="text-center py-6 text-sm text-gray-400">
        <p>Desenvolvido para automatizar contatos via WhatsApp.</p>
      </footer>
    </div>
  );
}
