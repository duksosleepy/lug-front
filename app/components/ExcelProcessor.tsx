'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Upload, FileSpreadsheet, Download } from 'lucide-react';
import { useToast } from '@/app/components/ui/use-toast';

const ExcelProcessor = () => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [resultFileUrl, setResultFileUrl] = useState<string | null>(null);
  const [mode, setMode] = useState<'online' | 'offline'>('online');
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      // Chỉ cho phép Excel, không cho phép CSV
      if (
        selectedFile.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        selectedFile.type === 'application/vnd.ms-excel'
      ) {
        setFile(selectedFile);
        setResultFileUrl(null);
      } else {
        toast({
          title: "Invalid file type",
          description: "Please upload an Excel file (.xlsx or .xls)",
          variant: "destructive",
        });
      }
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const droppedFile = event.dataTransfer.files[0];
    if (droppedFile) {
      if (
        droppedFile.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        droppedFile.type === 'application/vnd.ms-excel'
      ) {
        setFile(droppedFile);
        setResultFileUrl(null);
      } else {
        toast({
          title: "Invalid file type",
          description: "Please upload an Excel file (.xlsx or .xls)",
          variant: "destructive",
        });
      }
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      // URL endpoint phụ thuộc mode được chọn
      const endpoint = `/process/${mode}`;
      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      setResultFileUrl(url);

      toast({
        title: "Success!",
        description: "File processed successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to process file: ${error instanceof Error ? error.message : "Unknown error"}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center text-slate-800 flex items-center justify-center gap-2">
            <FileSpreadsheet className="h-6 w-6 text-emerald-600" />
            Excel File Processor
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Toggle để chọn mode online hoặc offline */}
          <div className="flex justify-center gap-2 mb-4">
            <Button
              variant={mode === 'online' ? 'default' : 'outline'}
              onClick={() => setMode('online')}
            >
              Online
            </Button>
            <Button
              variant={mode === 'offline' ? 'default' : 'outline'}
              onClick={() => setMode('offline')}
            >
              Offline
            </Button>
          </div>

          <div
            className="border-2 border-dashed border-slate-200 rounded-lg p-8 text-center hover:border-emerald-500 transition-colors"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            <div className="space-y-4">
              <div className="flex justify-center">
                <Upload className="h-12 w-12 text-slate-400" />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-slate-700">
                  {file ? file.name : 'Drag and drop your Excel file here'}
                </p>
                <p className="text-sm text-slate-500">or</p>
                <div className="flex justify-center gap-2">
                  <Button
                    variant="outline"
                    className="bg-white hover:bg-slate-50"
                    onClick={() => document.getElementById('file-upload')?.click()}
                  >
                    Browse Files
                  </Button>
                  <input
                    id="file-upload"
                    type="file"
                    className="hidden"
                    accept=".xlsx,.xls"
                    onChange={handleFileChange}
                  />
                </div>
              </div>
              <p className="text-xs text-slate-400">Supports: .xlsx, .xls</p>
            </div>
          </div>

          <div className="flex justify-center gap-2">
            <Button
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
              disabled={!file || loading}
              onClick={handleUpload}
            >
              {loading ? 'Processing...' : 'Process File'}
            </Button>

            {resultFileUrl && (
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => window.open(resultFileUrl)}
              >
                <Download className="w-4 h-4 mr-2" />
                Download Result
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExcelProcessor;
