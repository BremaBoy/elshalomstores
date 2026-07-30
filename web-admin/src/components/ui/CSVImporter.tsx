'use client'

import { useRef, useState } from 'react'
import Papa from 'papaparse'
import { Upload, X, FileText, CheckCircle2, AlertCircle, Loader2, Download } from 'lucide-react'

interface CSVImporterProps {
  onData: (data: Record<string, string>[]) => Promise<void> | void;
  expectedHeaders: string[];
  title: string;
  progress?: number | null; // 0-100 or null when idle
}

export function CSVImporter({ onData, expectedHeaders, title, progress }: CSVImporterProps) {
  const [file, setFile] = useState<File | null>(null)
  const [isParsing, setIsParsing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const selectFile = (selectedFile?: File) => {
    if (!selectedFile) return

    // Browsers frequently report CSV files as an empty MIME type or as the
    // Excel MIME type, especially on macOS and Windows. The extension is the
    // reliable signal here; Papa Parse still validates the actual contents.
    const hasCsvExtension = selectedFile.name.toLowerCase().endsWith('.csv')
    if (hasCsvExtension) {
      setFile(selectedFile)
      setError(null)
    } else {
      setFile(null)
      setError('Please upload a valid .csv file')
    }
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    selectFile(event.target.files?.[0])
  }

  const clearFile = () => {
    setFile(null)
    setError(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  const handleParse = () => {
    if (!file) return
    setIsParsing(true)
    setError(null)

    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.replace(/^\uFEFF/, '').trim(),
      complete: async (results) => {
        const headers = results.meta.fields || []
        const lowHeaders = headers.map(h => h.toLowerCase().trim())
        const hasName = lowHeaders.some(h => h.includes('name') || h === 'title')

        if (!hasName) {
          setError('Required header "name" was not found. Rename the product-name column to "name" or "title".')
          setIsParsing(false)
          return
        }

        const fatalParseErrors = results.errors.filter(item => item.type !== 'FieldMismatch')
        if (fatalParseErrors.length > 0) {
          const details = fatalParseErrors
            .slice(0, 3)
            .map(item => `row ${typeof item.row === 'number' ? item.row + 2 : '?'}: ${item.message}`)
            .join('; ')
          setError(`The CSV could not be parsed cleanly (${details}).`)
          setIsParsing(false)
          return
        }

        if (results.data.length === 0) {
          setError('This CSV contains headers but no product rows.')
          setIsParsing(false)
          return
        }

        try {
          await onData(results.data)
          clearFile()
        } catch (importError) {
          setError(importError instanceof Error ? importError.message : 'The products could not be imported.')
        } finally {
          setIsParsing(false)
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
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
      <h3 className="text-white font-semibold mb-4">{title}</h3>

      {/* Progress Bar — shown while rows are being inserted */}
      {isImporting && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-neutral-400 flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
              Importing products...
            </span>
            <span className="font-bold text-primary tabular-nums text-lg">{progress}%</span>
          </div>
          <div className="h-3 w-full bg-neutral-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-300 ease-out relative"
              style={{ width: `${progress}%` }}
            >
              {/* Shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse rounded-full" />
            </div>
          </div>
          <p className="text-xs text-neutral-500 text-center">Please wait — do not close this window</p>
        </div>
      )}

      {!isImporting && (
        <>
          {!file ? (
            <label
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault()
                selectFile(event.dataTransfer.files?.[0])
              }}
              className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-neutral-800 rounded-xl hover:bg-neutral-800/50 cursor-pointer transition-colors group"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-8 h-8 text-neutral-500 mb-2 group-hover:text-primary" />
                <p className="text-sm text-neutral-400">Click to upload or drag and drop</p>
                <p className="text-xs text-neutral-600 mt-1">CSV files only</p>
              </div>
              <input ref={inputRef} type="file" className="hidden" accept=".csv,text/csv" onChange={handleFileChange} />
            </label>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-neutral-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm text-white font-medium">{file.name}</p>
                    <p className="text-xs text-neutral-500">{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                </div>
                <button type="button" onClick={clearFile} aria-label="Remove selected CSV" className="text-neutral-500 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <button
                type="button"
                onClick={handleParse}
                disabled={isParsing}
                className="w-full py-2 bg-primary text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isParsing ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                {isParsing ? 'Reading file...' : 'Import Data'}
              </button>
            </div>
          )}

          {error && (
            <div role="alert" className="mt-4 flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="mt-4">
            <p className="text-xs text-neutral-500 font-medium mb-2 uppercase tracking-wider">Required Header:</p>
            <span className="px-2 py-1 bg-amber-500/10 rounded border border-amber-500/20 text-[10px] text-amber-500 font-mono">
              name
            </span>

            <p className="text-xs text-neutral-500 font-medium mt-4 mb-2 uppercase tracking-wider">Recommended (Fuzzy Match):</p>
            <div className="flex flex-wrap gap-2">
              {expectedHeaders.filter(h => h !== 'name').map(h => (
                <span key={h} className="px-2 py-1 bg-neutral-950 rounded border border-neutral-800 text-[10px] text-neutral-400 font-mono">
                  {h}
                </span>
              ))}
            </div>
            <a
              href={`data:text/csv;charset=utf-8,${encodeURIComponent(`${expectedHeaders.join(',')}\nSample product,Product description,1000,Kitchen Utensils,10,https://example.com/image.jpg,false,false`)}`}
              download="elshalom-products-template.csv"
              className="mt-5 inline-flex items-center gap-2 text-xs font-semibold text-primary hover:underline"
            >
              <Download className="w-3.5 h-3.5" />
              Download CSV template
            </a>
          </div>
        </>
      )}
    </div>
  )
}
