import React, { useState } from 'react';
import { 
  X, 
  BookOpen, 
  FileText, 
  Copy, 
  Check, 
  ExternalLink, 
  Download, 
  Search,
  Scale
} from 'lucide-react';
import { LEGAL_DOCUMENTS, ADMINISTRATIVE_TEMPLATES } from '../data/knowledgeBase';
import { audioSpeech } from '../utils/audioSpeech';

interface DocumentLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUseTemplateInChat?: (text: string) => void;
}

export const DocumentLibraryModal: React.FC<DocumentLibraryModalProps> = ({
  isOpen,
  onClose,
  onUseTemplateInChat,
}) => {
  const [activeTab, setActiveTab] = useState<'docs' | 'templates'>('docs');
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    audioSpeech.playClickSound();
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredDocs = LEGAL_DOCUMENTS.filter(
    (d) =>
      d.title.toLowerCase().includes(search.toLowerCase()) ||
      d.summary.toLowerCase().includes(search.toLowerCase()) ||
      d.number.toLowerCase().includes(search.toLowerCase())
  );

  const filteredTemplates = ADMINISTRATIVE_TEMPLATES.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase()) ||
      t.standard.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border-2 border-blue-900 max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-blue-900 text-white px-6 py-4 flex items-center justify-between border-b border-amber-500/40">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-amber-500 text-slate-950 rounded-lg font-bold">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-times uppercase tracking-wide">
                Kho Văn bản Chỉ đạo & Biểu mẫu Hành chính
              </h2>
              <p className="text-xs text-amber-200">
                Chuẩn hóa thể thức Nghị định 30/2020/NĐ-CP • QĐ 51/2026/QĐ-UBND • QĐ 2422/QĐ-BGDĐT
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-amber-200 hover:bg-blue-800 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab & Search Bar */}
        <div className="bg-slate-50 border-b border-slate-200 p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <button
              onClick={() => {
                audioSpeech.playClickSound();
                setActiveTab('docs');
              }}
              className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-bold flex items-center space-x-2 transition-all cursor-pointer ${
                activeTab === 'docs'
                  ? 'bg-blue-900 text-white shadow-sm ring-2 ring-blue-900/30'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Văn bản Quy phạm ({LEGAL_DOCUMENTS.length})</span>
            </button>
            <button
              onClick={() => {
                audioSpeech.playClickSound();
                setActiveTab('templates');
              }}
              className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-bold flex items-center space-x-2 transition-all cursor-pointer ${
                activeTab === 'templates'
                  ? 'bg-blue-900 text-white shadow-sm ring-2 ring-blue-900/30'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Mẫu Thể thức NĐ 30 ({ADMINISTRATIVE_TEMPLATES.length})</span>
            </button>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm số hiệu, từ khóa..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:ring-1 focus:ring-blue-900 bg-white"
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {activeTab === 'docs' ? (
            /* Documents */
            <div className="space-y-4">
              {filteredDocs.map((doc) => (
                <div
                  key={doc.id}
                  className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs hover:border-red-300 transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2 pb-2 border-b border-slate-100">
                    <span className="bg-red-50 text-red-800 text-xs px-2.5 py-0.5 rounded font-bold border border-red-200 w-fit">
                      Số: {doc.number}
                    </span>
                    <span className="text-xs text-slate-500">
                      Cơ quan ban hành: <strong>{doc.issuingAuthority}</strong> • Ngày: {doc.date}
                    </span>
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-800 font-times mb-1">
                    {doc.title}
                  </h3>
                  <p className="text-xs text-slate-600 mb-3 leading-relaxed">
                    {doc.summary}
                  </p>
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/80">
                    <h4 className="text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                      Nội dung cốt lõi áp dụng tại Trường Tiểu học:
                    </h4>
                    <ul className="list-disc pl-4 space-y-1 text-xs text-slate-700">
                      {doc.keyPoints.map((kp, i) => (
                        <li key={i}>{kp}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Administrative Templates */
            <div className="space-y-6">
              {filteredTemplates.map((tpl) => (
                <div
                  key={tpl.id}
                  className="bg-white p-5 rounded-xl border-2 border-slate-200 shadow-sm"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 pb-2 border-b border-slate-200">
                    <div>
                      <span className="bg-amber-100 text-amber-900 text-xs px-2.5 py-0.5 rounded font-bold border border-amber-300 mr-2">
                        {tpl.standard}
                      </span>
                      <h3 className="text-base font-bold text-slate-900 font-times inline">
                        {tpl.name}
                      </h3>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleCopy(tpl.id, tpl.sampleContent)}
                        className="px-3 py-1.5 text-xs font-semibold rounded bg-slate-100 hover:bg-slate-200 text-slate-800 flex items-center space-x-1 border border-slate-300 transition-all cursor-pointer"
                      >
                        {copiedId === tpl.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedId === tpl.id ? 'Đã sao chép' : 'Sao chép mẫu'}</span>
                      </button>
                      {onUseTemplateInChat && (
                        <button
                          onClick={() => {
                            onUseTemplateInChat(`Tôi muốn soạn thảo ${tpl.name} theo đúng Nghị định 30/2020. Hãy giúp tôi hoàn thiện dựa trên mẫu này.`);
                            onClose();
                          }}
                          className="px-3 py-1.5 text-xs font-semibold rounded bg-red-800 hover:bg-red-700 text-white flex items-center space-x-1 shadow-xs transition-all cursor-pointer"
                        >
                          <span>Áp dụng vào chat</span>
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 mb-3 italic">
                    {tpl.description}
                  </p>
                  <pre className="bg-[#fdfbf7] p-4 rounded-lg border border-amber-200 text-slate-800 font-times text-[13px] leading-relaxed overflow-x-auto whitespace-pre-wrap selection:bg-amber-200">
                    {tpl.sampleContent}
                  </pre>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 text-center text-xs text-slate-500">
          Nguồn dữ liệu được trích xuất chính xác từ hệ thống văn bản chỉ đạo của Sở GDĐT Bắc Ninh & Bộ GDĐT
        </div>
      </div>
    </div>
  );
};
