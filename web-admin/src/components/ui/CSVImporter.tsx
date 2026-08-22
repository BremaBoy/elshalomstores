'use client'

import { useState } from 'react'
import Papa from 'papaparse'
import { Upload, X, FileText, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'

interface CSVImporterProps {
  onData: (data: any[]) => void;
  expectedHeaders: string[];
  title: string;
  progress?: number | null; // 0-100 or null when idle
}

export function CSVImporter({ onData, expectedHeaders, title, progress }: CSVImporterProps) {
  const [file, setFile] = useState<File | null>(null)
  const [isParsing, setIsParsing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile)
      setError(null)
    } else {
      setError('Please upload a valid .csv file')
    }
  }

  const handleParse = () => {
    if (!file) return
    setIsParsing(true)

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const headers = results.meta.fields || []
        const lowHeaders = headers.map(h => h.toLowerCase().trim())

        const hasName = lowHeaders.some(h => h.includes('name') || h === 'title')

        if (!hasName) {
          setError(`Required header "name" not found. Please ensure your CSV has a column for the product name.`)
          setIsParsing(false)
        } else {
          onData(results.data)
          setIsParsing(false)
          setFile(null)
        }
      },
      error: (err) => {
        setError(err.message)
        setIsParsing(false)
      }
    })
  }

  const isImporting = progress !== null && progress !== undefined

  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
      <h3 className="text-foreground font-semibold mb-4">{title}</h3>

      {/* Progress Bar — shown while rows are being inserted */}
      {isImporting && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
              Importing products...
            </span>
            <span className="font-bold text-primary tabular-nums text-lg">{progress}%</span>
          </div>
          <div className="h-3 w-full bg-blue-soft rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-300 ease-out relative"
              style={{ width: `${progress}%` }}
            >
              {/* Shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse rounded-full" />
            </div>
          </div>
          <p className="text-xs text-muted-foreground text-center">Please wait — do not close this window</p>
        </div>
      )}

      {!isImporting && (
        <>
          {!file ? (
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-xl hover:bg-blue-soft/50 cursor-pointer transition-colors group">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-8 h-8 text-muted-foreground mb-2 group-hover:text-primary" />
                <p className="text-sm text-muted-foreground">Click to upload or drag and drop</p>
                <p className="text-xs text-muted-foreground mt-1">CSV files only</p>
              </div>
              <input type="file" className="hidden" accept=".csv" onChange={handleFileChange} />
            </label>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-blue-soft/60 rounded-xl">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm text-foreground font-medium">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                </div>
                <button onClick={() => setFile(null)} className="text-muted-foreground hover:text-primary">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}

              <button
                onClick={handleParse}
                disabled={isParsing}
                className="w-full py-2 bg-primary text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isParsing ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                {isParsing ? 'Reading file...' : 'Import Data'}
              </button>
            </div>
          )}

          <div className="mt-4">
            <p className="text-xs text-muted-foreground font-medium mb-2 uppercase tracking-wider">Required Header:</p>
            <span className="px-2 py-1 bg-gold-soft rounded border border-gold/25 text-[10px] text-[#694B12] font-mono">
              name
            </span>

            <p className="text-xs text-muted-foreground font-medium mt-4 mb-2 uppercase tracking-wider">Recommended (Fuzzy Match):</p>
            <div className="flex flex-wrap gap-2">
              {expectedHeaders.filter(h => h !== 'name').map(h => (
                <span key={h} className="px-2 py-1 bg-lilac rounded border border-border text-[10px] text-foreground font-mono">
                  {h}
                </span>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
