'use client'

import { useRef, useState } from 'react'
import Papa from 'papaparse'
import { Upload, X, FileText, CheckCircle2, AlertCircle, Loader2, Download } from 'lucide-react'

const MAX_FILE_SIZE = 500 * 1024 * 1024
const MAX_PRODUCTS = 200_000
const PRODUCTS_PER_BATCH = 100
const PARSE_CHUNK_SIZE = 5 * 1024 * 1024

export interface CSVBatchContext {
  batchNumber: number
  totalBatches: number
  startRow: number
  totalRows: number
  reportProgress: (processedRows: number) => void
}

interface CSVImporterProps {
  onValidate: (data: Record<string, string>[], startRow: number) => void
  onBatch: (data: Record<string, string>[], context: CSVBatchContext) => Promise<number>
  onComplete: (importedRows: number, totalBatches: number) => Promise<void> | void
  onBusyChange?: (isBusy: boolean) => void
  expectedHeaders: string[]
  title: string
}

interface ImportState {
  phase: 'scanning' | 'importing'
  scanProgress: number
  batchNumber: number
  totalBatches: number
  batchProgress: number
  processedRows: number
  totalRows: number
}

export function CSVImporter({
  onValidate,
  onBatch,
  onComplete,
  onBusyChange,
  expectedHeaders,
  title,
}: CSVImporterProps) {
  const [file, setFile] = useState<File | null>(null)
  const [isParsing, setIsParsing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [importState, setImportState] = useState<ImportState | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const selectFile = (selectedFile?: File) => {
    if (!selectedFile) return

    // Browsers frequently report CSV files as an empty MIME type or as the
    // Excel MIME type, especially on macOS and Windows. The extension is the
    // reliable signal here; Papa Parse still validates the actual contents.
    const hasCsvExtension = selectedFile.name.toLowerCase().endsWith('.csv')
    if (!hasCsvExtension) {
      setFile(null)
      setError('Please upload a valid .csv file.')
      if (inputRef.current) inputRef.current.value = ''
    } else if (selectedFile.size === 0) {
      setFile(null)
      setError('This CSV file is empty.')
      if (inputRef.current) inputRef.current.value = ''
    } else if (selectedFile.size > MAX_FILE_SIZE) {
      setFile(null)
      setError('This CSV is larger than the 500 MB import limit.')
      if (inputRef.current) inputRef.current.value = ''
    } else {
      setFile(selectedFile)
      setError(null)
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

  const validateParseChunk = (
    results: Papa.ParseResult<Record<string, string>>,
    startRow: number,
    checkHeaders: boolean,
  ) => {
    if (checkHeaders) {
      const headers = results.meta.fields || []
      const lowHeaders = headers.map(h => h.toLowerCase().trim())
      const hasName = lowHeaders.some(h => h.includes('name') || h === 'title')

      if (!hasName) {
        throw new Error('Required header "name" was not found. Rename the product-name column to "name" or "title".')
      }
    }

    const fatalParseErrors = results.errors.filter(item => item.type !== 'FieldMismatch')
    if (fatalParseErrors.length > 0) {
      const details = fatalParseErrors
        .slice(0, 3)
        .map(item => `row ${typeof item.row === 'number' ? startRow + item.row : '?'}: ${item.message}`)
        .join('; ')
      throw new Error(`The CSV could not be parsed cleanly (${details}).`)
    }
  }

  const scanFile = (selectedFile: File) => {
    return new Promise<number>((resolve, reject) => {
      let totalRows = 0
      let isFirstChunk = true
      let settled = false

      Papa.parse<Record<string, string>>(selectedFile, {
        header: true,
        skipEmptyLines: 'greedy',
        chunkSize: PARSE_CHUNK_SIZE,
        transformHeader: (header) => header.replace(/^\uFEFF/, '').trim(),
        chunk: (results, parser) => {
          if (settled) return

          try {
            const startRow = totalRows + 2
            validateParseChunk(results, startRow, isFirstChunk)
            isFirstChunk = false

            if (totalRows + results.data.length > MAX_PRODUCTS) {
              throw new Error(`This CSV exceeds the limit of ${MAX_PRODUCTS.toLocaleString()} products per import.`)
            }

            onValidate(results.data, startRow)
            totalRows += results.data.length
            setImportState({
              phase: 'scanning',
              scanProgress: Math.min(100, Math.round((results.meta.cursor / selectedFile.size) * 100)),
              batchNumber: 0,
              totalBatches: 0,
              batchProgress: 0,
              processedRows: totalRows,
              totalRows,
            })
          } catch (scanError) {
            settled = true
            parser.abort()
            reject(scanError)
          }
        },
        complete: () => {
          if (settled) return
          settled = true
          if (totalRows === 0) {
            reject(new Error('This CSV contains headers but no product rows.'))
          } else {
            resolve(totalRows)
          }
        },
        error: (parseError) => {
          if (settled) return
          settled = true
          reject(parseError)
        },
      })
    })
  }

  const importFile = (selectedFile: File, totalRows: number) => {
    const totalBatches = Math.ceil(totalRows / PRODUCTS_PER_BATCH)

    return new Promise<number>((resolve, reject) => {
      let rowBuffer: Record<string, string>[] = []
      let processedRows = 0
      let batchNumber = 0
      let settled = false

      const processBatch = async (rows: Record<string, string>[]) => {
        batchNumber += 1
        const completedBeforeBatch = processedRows
        const startRow = completedBeforeBatch + 2

        setImportState({
          phase: 'importing',
          scanProgress: 100,
          batchNumber,
          totalBatches,
          batchProgress: 0,
          processedRows,
          totalRows,
        })

        const imported = await onBatch(rows, {
          batchNumber,
          totalBatches,
          startRow,
          totalRows,
          reportProgress: (processedInBatch) => {
            const safeProcessed = Math.min(rows.length, Math.max(0, processedInBatch))
            setImportState({
              phase: 'importing',
              scanProgress: 100,
              batchNumber,
              totalBatches,
              batchProgress: Math.round((safeProcessed / rows.length) * 100),
              processedRows: completedBeforeBatch + safeProcessed,
              totalRows,
            })
          },
        })

        if (imported !== rows.length) {
          throw new Error(`Batch ${batchNumber} imported ${imported} of ${rows.length} products.`)
        }

        processedRows += imported
      }

      const processFullBatches = async () => {
        while (rowBuffer.length >= PRODUCTS_PER_BATCH) {
          const rows = rowBuffer.splice(0, PRODUCTS_PER_BATCH)
          await processBatch(rows)
        }
      }

      Papa.parse<Record<string, string>>(selectedFile, {
        header: true,
        skipEmptyLines: 'greedy',
        chunkSize: PARSE_CHUNK_SIZE,
        transformHeader: (header) => header.replace(/^\uFEFF/, '').trim(),
        chunk: (results, parser) => {
          if (settled) return
          rowBuffer.push(...results.data)
          parser.pause()

          void processFullBatches()
            .then(() => parser.resume())
            .catch((batchError) => {
              settled = true
              parser.abort()
              reject(batchError)
            })
        },
        complete: () => {
          if (settled) return

          void (async () => {
            if (rowBuffer.length > 0) {
              const finalRows = rowBuffer
              rowBuffer = []
              await processBatch(finalRows)
            }
            settled = true
            resolve(processedRows)
          })().catch((batchError) => {
            settled = true
            reject(batchError)
          })
        },
        error: (parseError) => {
          if (settled) return
          settled = true
          reject(parseError)
        },
      })
    })
  }

  const handleParse = async () => {
    if (!file) return
    setIsParsing(true)
    setError(null)
    onBusyChange?.(true)
    setImportState({
      phase: 'scanning',
      scanProgress: 0,
      batchNumber: 0,
      totalBatches: 0,
      batchProgress: 0,
      processedRows: 0,
      totalRows: 0,
    })

    try {
      const totalRows = await scanFile(file)
      const totalBatches = Math.ceil(totalRows / PRODUCTS_PER_BATCH)
      const importedRows = await importFile(file, totalRows)
      await onComplete(importedRows, totalBatches)
      clearFile()
    } catch (importError) {
      setError(importError instanceof Error ? importError.message : 'The products could not be imported.')
    } finally {
      setImportState(null)
      setIsParsing(false)
      onBusyChange?.(false)
    }
  }

  const isImporting = importState !== null
  const displayFileSize = file
    ? file.size >= 1024 * 1024
      ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
      : `${(file.size / 1024).toFixed(1)} KB`
    : ''

  const overallProgress =
    importState?.phase === 'importing' && importState.totalRows > 0
      ? Math.round((importState.processedRows / importState.totalRows) * 100)
      : 0

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
      <h3 className="text-white font-semibold mb-4">{title}</h3>

      {isImporting && importState.phase === 'scanning' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-neutral-400 flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
              Scanning and validating CSV...
            </span>
            <span className="font-bold text-primary tabular-nums text-lg">{importState.scanProgress}%</span>
          </div>
          <div className="h-3 w-full bg-neutral-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-300 ease-out"
              style={{ width: `${importState.scanProgress}%` }}
            />
          </div>
          <p className="text-xs text-neutral-500 text-center">
            {importState.processedRows.toLocaleString()} products checked
          </p>
        </div>
      )}

      {isImporting && importState.phase === 'importing' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-neutral-300 flex items-center gap-2 text-sm font-semibold">
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
              Batch {importState.batchNumber.toLocaleString()} of {importState.totalBatches.toLocaleString()}
            </span>
            <span className="font-bold text-primary tabular-nums text-lg">{importState.batchProgress}%</span>
          </div>
          <div className="h-3 w-full bg-neutral-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-300 ease-out relative"
              style={{ width: `${importState.batchProgress}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse rounded-full" />
            </div>
          </div>
          <div className="flex items-center justify-between text-xs text-neutral-500">
            <span>
              {importState.processedRows.toLocaleString()} / {importState.totalRows.toLocaleString()} products
            </span>
            <span>{overallProgress}% overall</span>
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
                <p className="text-xs text-neutral-600 mt-1">CSV up to 500 MB · 200,000 products</p>
              </div>
              <input ref={inputRef} type="file" className="hidden" accept=".csv,text/csv" onChange={handleFileChange} />
            </label>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-neutral-800 rounded-lg">
                <div className="flex items-center gap-3 min-w-0">
                  <FileText className="w-5 h-5 text-primary flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm text-white font-medium truncate">{file.name}</p>
                    <p className="text-xs text-neutral-500">{displayFileSize}</p>
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
