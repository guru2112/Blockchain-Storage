// components/modals/UploadFileModal.tsx
"use client";

import Upload from "../file-management/Upload";

type UploadFileModalProps = {
  isOpen: boolean;
  onClose: () => void;
  folderId: number;
  onSuccess: () => void;
};

export default function UploadFileModal({ isOpen, onClose, folderId, onSuccess }: UploadFileModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl relative border border-slate-200">
        <div className="flex justify-center items-center mb-6 relative">
          <h2 className="text-xl font-bold text-slate-900">Upload File</h2>
          <button 
            onClick={onClose} 
            className="absolute right-0 text-red-500 hover:text-red-600 border border-red-200 hover:bg-red-50 rounded-md px-2 py-0.5 font-bold transition-colors"
          >
            ✕
          </button>
        </div>
        <Upload folderId={folderId} onUploadSuccess={() => { onSuccess(); onClose(); }} />
      </div>
    </div>
  );
}