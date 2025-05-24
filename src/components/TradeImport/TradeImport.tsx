import React, { useState } from 'react';
import { parseCSV } from '../../utils/csvParser';
import { ImportService } from '../../services/importService';
import type { ImportResult } from '../../services/importService';
import type { Trade } from '../../types/trade';
import { downloadTradeTemplate } from '../../utils/tradeTemplate';
import styles from './TradeImport.module.css';

export const TradeImport: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setResult(null);
      setError(null);
    }
  };

  const handleImport = async () => {
    if (!file) return;

    setImporting(true);
    setError(null);
    setResult(null);

    try {
      const parseResult = await parseCSV<Trade>(file);
      
      if (parseResult.errors.length > 0) {
        setError('Error parsing CSV file: ' + parseResult.errors.map(e => e.message).join(', '));
        return;
      }

      const importResult = await ImportService.importTrades(parseResult.data);
      setResult(importResult);

      if (!importResult.success) {
        setError('Import failed: ' + importResult.errors.join(', '));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Import Trades</h2>
      
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium text-gray-700">
            Select CSV File
          </label>
          <button
            onClick={downloadTradeTemplate}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Download Template
          </button>
        </div>
        <input
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-md file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100"
        />
      </div>

      <button
        onClick={handleImport}
        disabled={!file || importing}
        className={`px-4 py-2 rounded-md text-white font-medium
          ${!file || importing
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700'
          }`}
      >
        {importing ? 'Importing...' : 'Import Trades'}
      </button>

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {result && (
        <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-md">
          <h3 className="font-medium mb-2">Import Results</h3>
          <ul className="space-y-1">
            <li>Total Trades: {result.total}</li>
            <li>Successfully Imported: {result.imported}</li>
            <li>Failed: {result.failed}</li>
          </ul>
          {result.errors.length > 0 && (
            <div className="mt-2">
              <h4 className="font-medium text-red-700">Errors:</h4>
              <ul className="list-disc list-inside text-sm text-red-600">
                {result.errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}; 