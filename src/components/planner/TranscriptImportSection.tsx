import { useRef, useState } from "react";
import { FileText, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type ScannedTranscriptClass = {
  code: string;
  name: string;
  credits?: number;
  grade?: string;
  semester?: string;
};

interface TranscriptImportSectionProps {
  onScanTranscript: (payload: {
    text?: string;
    fileName?: string;
    classes?: ScannedTranscriptClass[];
  }) => void;
}

const ACCEPTED_TYPES = ".pdf,.png,.jpg,.jpeg";

export function TranscriptImportSection({ onScanTranscript }: TranscriptImportSectionProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isPasteOpen, setIsPasteOpen] = useState(false);
  const [pastedText, setPastedText] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setSelectedFile(file);
  };

  const handleDrop = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files?.[0] ?? null;
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleScanTranscript = async () => {
    setScanError(null);
    if (!pastedText.trim() && !selectedFile) {
      onScanTranscript({ text: "", fileName: undefined });
      return;
    }

    setIsScanning(true);
    try {
      let text = pastedText.trim();
      if (!text && selectedFile) {
        const formData = new FormData();
        formData.append("file", selectedFile);
        const response = await fetch("http://localhost:3001/api/scan-transcript", {
          method: "POST",
          body: formData,
        });
        if (!response.ok) {
          throw new Error("Unable to scan this transcript. Try pasting the text instead.");
        }
        const data = await response.json();
        if (!data?.success) {
          throw new Error(data?.error || "Unable to scan this transcript. Try pasting the text instead.");
        }
        const classes = Array.isArray(data?.classes) ? data.classes : [];
        if (classes.length > 0) {
          onScanTranscript({ classes, fileName: selectedFile?.name, text: data.rawText });
          return;
        }
        text = String(data.rawText || data.text || "").trim();
      }
      onScanTranscript({ text, fileName: selectedFile?.name });
    } catch (error: any) {
      setScanError(
        error?.message || "Unable to scan this transcript. Try pasting the text instead."
      );
    } finally {
      setIsScanning(false);
    }
  };

  const handlePasteTranscript = () => {
    // Placeholder for future transcript paste flow.
    setIsPasteOpen((prev) => !prev);
  };

  return (
    <div className="bg-card border border-border rounded-xl p-3 shadow-sm">
      <div className="space-y-1">
        <h3 className="text-base font-semibold text-foreground">
          Import Academic Transcript <span>(Optional)</span>
        </h3>
        <p className="text-sm text-muted-foreground">
          Upload your unofficial or official transcript. We’ll automatically detect completed
          courses and fill them into your plan.
        </p>
      </div>

      <div className="mt-3">
        <label
          htmlFor="transcript-upload"
          onDragOver={(event) => {
            event.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`flex flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed px-3 py-2 text-center transition ${
            isDragging ? "border-primary/60 bg-primary/5" : "border-border/70 bg-muted/20"
          }`}
        >
          <div className="flex items-center gap-2 text-primary">
            <Upload className="h-3.5 w-3.5" />
            <span className="text-xs font-medium">Drag and drop your transcript</span>
          </div>
          <p className="text-[11px] text-muted-foreground">
            PDF, PNG, or JPG files only. Click to browse.
          </p>
          <div className="mt-1 flex items-center gap-2 text-[11px] text-muted-foreground">
            <FileText className="h-3 w-3" />
            <span>{selectedFile ? selectedFile.name : "No file selected"}</span>
          </div>
        </label>
        <input
          ref={fileInputRef}
          id="transcript-upload"
          type="file"
          accept={ACCEPTED_TYPES}
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <Button
          type="button"
          className="h-9 w-full sm:min-w-[180px]"
          onClick={handleScanTranscript}
          disabled={isScanning}
        >
          {isScanning ? "Scanning..." : "Scan Transcript"}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="h-9 w-full sm:w-auto"
          onClick={handlePasteTranscript}
          disabled={isScanning}
        >
          Paste transcript text instead
        </Button>
      </div>

      {isPasteOpen && (
        <div className="mt-3">
          <Textarea
            value={pastedText}
            onChange={(event) => setPastedText(event.target.value)}
            placeholder="Paste your transcript text here..."
            className="min-h-[96px] text-sm"
          />
        </div>
      )}

      {scanError && (
        <p className="mt-2 text-xs text-destructive">{scanError}</p>
      )}
    </div>
  );
}
