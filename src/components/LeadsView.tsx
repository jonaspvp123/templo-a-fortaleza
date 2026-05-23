import React, { useState, useMemo } from 'react';
import { Search, MessageCircle, ArrowLeft, Calendar, User, Phone, CheckCircle2 } from 'lucide-react';
import { format, parseISO, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Lead } from '../types';

interface LeadsViewProps {
  leads: Lead[];
  onBack: () => void;
}

export function LeadsView({ leads, onBack }: LeadsViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Manage contacted state locally just for better UX
  const [contactedLeads, setContactedLeads] = useState<Set<string>>(new Set());

  const filteredLeads = useMemo(() => {
    if (!searchTerm.trim()) return leads;
    const lowerSearch = searchTerm.toLowerCase();
    return leads.filter(l => 
      l.name.toLowerCase().includes(lowerSearch) || 
      l.phone.includes(lowerSearch)
    );
  }, [leads, searchTerm]);

  const handleWhatsApp = (lead: Lead) => {
    // Add to contacted set
    setContactedLeads(prev => {
      const next = new Set(prev);
      next.add(lead.id);
      return next;
    });

    const num = lead.phone.startsWith('55') ? lead.phone : `55${lead.phone}`;
    window.open(`https://wa.me/${num}?text=Olá,%20${encodeURIComponent(lead.name)}...`, '_blank');
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'Data não disponível';
    try {
      const parsed = parseISO(dateStr);
      if (isValid(parsed)) {
        return format(parsed, "dd 'de' MMM, yyyy 'às' HH:mm", { locale: ptBR });
      }
    } catch (e) {
      // ignore
    }
    return dateStr;
  };

  return (
    <div className="w-full max-w-5xl mx-auto mt-8 p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 space-y-4 md:space-y-0">
        <div className="flex items-center space-x-4">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            title="Voltar"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Lista de Leads</h1>
            <p className="text-sm text-gray-500">{leads.length} contatos encontrados na planilha</p>
          </div>
        </div>
        
        <div className="relative">
          <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input 
            type="text"
            placeholder="Buscar por nome ou número..."
            className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-sm w-full md:w-64"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredLeads.map(lead => {
          const isContacted = contactedLeads.has(lead.id);
          
          return (
            <div key={lead.id} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full">
              <div className="flex-grow">
                <h3 className="font-semibold text-lg text-gray-900 mb-3 flex items-start truncate">
                  <User className="w-5 h-5 mr-2 text-gray-400 flex-shrink-0 mt-0.5" />
                  <span className="truncate" title={lead.name}>{lead.name}</span>
                </h3>
                
                <div className="space-y-2 mb-6">
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="w-4 h-4 mr-2 text-gray-400" />
                    <span>{lead.phone || 'Sem número'}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                    <span className="truncate" title={formatDate(lead.createdAt)}>
                      {formatDate(lead.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="pt-4 mt-auto border-t border-gray-100 flex items-center justify-between">
                <button 
                  onClick={() => handleWhatsApp(lead)}
                  disabled={!lead.phone}
                  className={`flex items-center justify-center w-full space-x-2 py-2.5 px-4 rounded-lg font-medium text-sm transition-colors
                    ${lead.phone 
                      ? 'bg-green-600 hover:bg-green-700 text-white' 
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Chamar no WhatsApp</span>
                </button>
              </div>

              {isContacted && (
                <div className="absolute top-3 right-3 text-green-600 bg-green-50 rounded-full p-1 border border-green-200">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}
        
        {filteredLeads.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-500">
            Nenhum contato encontrado na busca.
          </div>
        )}
      </div>
    </div>
  );
}
