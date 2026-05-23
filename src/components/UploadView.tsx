import React, { useCallback, useState } from 'react';
import { Upload, FileSpreadsheet } from 'lucide-react';
import { read, utils } from 'xlsx';
import { Lead } from '../types';

interface UploadViewProps {
  onLeadsParsed: (leads: Lead[]) => void;
}

export function UploadView({ onLeadsParsed }: UploadViewProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processFile = (file: File) => {
    setError(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = read(data, { type: 'array' });
        
        if (workbook.SheetNames.length === 0) {
          throw new Error("O arquivo não tem planilhas.");
        }

        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Use sheet_to_json with raw options to get exact headers
        const rows = utils.sheet_to_json<Record<string, any>>(worksheet);
        
        if (rows.length === 0) {
          throw new Error("A planilha está vazia.");
        }

        const leads: Lead[] = rows.map((row, index) => {
          // Try to find the keys
          const keys = Object.keys(row);
          
          const nameKey = keys.find(k => /name|nome|full_name/i.test(k));
          const phoneKey = keys.find(k => /phone|telefone|celular|contato/i.test(k));
          const dateKey = keys.find(k => /created|time|date|data|criado/i.test(k));

          const rawName = nameKey ? row[nameKey] : '';
          const rawPhone = phoneKey ? row[phoneKey] : '';
          const rawDate = dateKey ? row[dateKey] : '';

          let phoneStr = String(rawPhone || '');
          // clean phone for whatsapp link (keep only numbers)
          const cleanPhone = phoneStr.replace(/\D/g, '');

          // We format the date or keep original string
          let dateStr = String(rawDate || '');

          return {
            id: String(index),
            name: String(rawName || 'Desconhecido'),
            phone: cleanPhone,
            createdAt: dateStr,
          };
        }).filter(l => l.name !== 'Desconhecido' || l.phone !== '');

        if (leads.length === 0) {
          throw new Error("Não foi possível encontrar as colunas de nome e telefone na planilha.");
        }

        onLeadsParsed(leads);
      } catch (err: any) {
        setError(err.message || "Erro ao ler o arquivo.");
      }
    };
    reader.onerror = () => {
      setError("Erro ao ler o arquivo.");
    };
    reader.readAsArrayBuffer(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto mt-12 p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Importar Contatos</h1>
        <p className="text-gray-500">Envie sua planilha Excel ou CSV para extrair os leads.</p>
      </div>

      <div
        className={`border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center transition-colors cursor-pointer
          ${isDragging ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-gray-400 bg-gray-50'}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => document.getElementById('file-upload')?.click()}
      >
        <Upload className={`w-12 h-12 mb-4 ${isDragging ? 'text-primary' : 'text-gray-400'}`} />
        <h3 className="text-lg font-medium text-gray-900 mb-1">Clique ou arraste a planilha aqui</h3>
        <p className="text-sm text-gray-500 mb-4">Suporta arquivos .xlsx, .xls e .csv</p>
        
        <input 
          id="file-upload" 
          type="file" 
          accept=".xlsx, .xls, .csv" 
          className="hidden" 
          onChange={handleFileInput}
        />
        
        <button className="bg-black text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-800 transition-colors">
          Selecionar Arquivo
        </button>
      </div>

      {error && (
        <div className="mt-6 p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm text-center">
          {error}
        </div>
      )}

      <div className="mt-8 bg-blue-50 border border-blue-100 p-4 rounded-lg flex items-start space-x-3 text-sm text-blue-800">
        <FileSpreadsheet className="w-5 h-5 flex-shrink-0 mt-0.5 text-blue-600" />
        <div>
          <p className="font-medium mb-1">Como deve ser a minha planilha?</p>
          <p>O sistema irá buscar automaticamente pelas colunas que contenham nomes como <strong>nome</strong>, <strong>telefone/phone</strong> e <strong>data/created</strong> no cabeçalho.</p>
        </div>
      </div>
    </div>
  );
}
