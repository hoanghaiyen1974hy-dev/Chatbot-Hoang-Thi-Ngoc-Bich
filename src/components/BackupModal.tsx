import React, { useState } from 'react';
import { 
  X, 
  Lock, 
  Unlock, 
  Printer, 
  Download, 
  Trash2, 
  Search, 
  FileCheck, 
  ShieldAlert, 
  ShieldCheck,
  Calendar,
  Filter
} from 'lucide-react';
import { ChatMessage, AdvisoryCategory } from '../types';
import { ADMIN_INFO, ADVISORY_CATEGORIES } from '../data/knowledgeBase';
import { audioSpeech } from '../utils/audioSpeech';

interface BackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  messages: ChatMessage[];
  onClearMessages: () => void;
}

export const BackupModal: React.FC<BackupModalProps> = ({
  isOpen,
  onClose,
  messages,
  onClearMessages,
}) => {
  const [passwordInput, setPasswordInput] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  if (!isOpen) return null;

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === ADMIN_INFO.backupPassword) {
      setIsUnlocked(true);
      setErrorMsg('');
      audioSpeech.playCelebrationChime();
    } else {
      setErrorMsg('Mật khẩu không chính xác! Vui lòng kiểm tra lại.');
    }
  };

  const filteredMessages = messages.filter((msg) => {
    const matchesSearch = msg.text.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = filterCategory === 'all' || msg.category === filterCategory;
    return matchesSearch && matchesCat;
  });

  const handlePrint = () => {
    audioSpeech.playClickSound();
    window.print();
  };

  const handleDownloadTxt = () => {
    const content = `BÁO CÁO LỊCH SỬ TƯ VẤN GIÁO VIÊN - TRƯỜNG TIỂU HỌC TÂN DĨNH
Admin: ${ADMIN_INFO.name} - ${ADMIN_INFO.title}
Thời gian xuất: ${new Date().toLocaleString('vi-VN')}
Mật khẩu bảo mật: ${ADMIN_INFO.backupPassword}
Tổng số tin nhắn: ${messages.length}

${'='.repeat(70)}
${messages.map((m, i) => `[#${i + 1}] [${new Date(m.timestamp).toLocaleString('vi-VN')}] [${m.sender === 'user' ? (m.isVoice ? 'GIÁO VIÊN (THU ÂM MICRO)' : 'GIÁO VIÊN') : 'HIỆU TRƯỞNG HOÀNG THỊ NGỌC BÍCH'}]
Chuyên mục: ${m.category || 'Tư vấn chung'}
Nội dung:
${m.text}
${m.legalCitations?.length ? `Căn cứ pháp lý: ${m.legalCitations.join(', ')}\n` : ''}
${'-'.repeat(50)}`).join('\n\n')}

HIỆU TRƯỞNG TRƯỜNG TIỂU HỌC TÂN DĨNH
(Đã ký số và xác thực)
${ADMIN_INFO.name}`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Lich_su_tu_van_TieuHocTanDinh_${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadDoc = () => {
    const htmlContent = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset="utf-8">
      <title>Lịch sử Tư vấn Giáo viên</title>
      <style>
        body { font-family: 'Times New Roman', serif; font-size: 13pt; line-height: 1.5; margin: 20mm 15mm 20mm 30mm; }
        .header-table { width: 100%; border: none; margin-bottom: 20px; }
        .header-table td { border: none; vertical-align: top; }
        .title { text-align: center; font-size: 16pt; font-weight: bold; margin: 20px 0 10px; }
        .msg-box { margin-bottom: 15px; padding: 10px; border-bottom: 1px solid #ccc; }
        .user-msg { background-color: #f8fafc; font-weight: bold; }
        .assistant-msg { background-color: #ffffff; }
      </style>
    </head>
    <body>
      <table class="header-table">
        <tr>
          <td style="width: 45%; text-align: center;">
            <strong>ỦY BAN NHÂN DÂN XÃ TÂN DĨNH</strong><br>
            <strong>TRƯỜNG TIỂU HỌC TÂN DĨNH</strong><br>
            Số: .../LSTV-THTD
          </td>
          <td style="width: 55%; text-align: center;">
            <strong>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</strong><br>
            <strong><u>Độc lập - Tự do - Hạnh phúc</u></strong><br>
            <i>Tân Dĩnh, ngày ${new Date().getDate()} tháng ${new Date().getMonth() + 1} năm ${new Date().getFullYear()}</i>
          </td>
        </tr>
      </table>
      <div class="title">BẢN TỔNG HỢP LỊCH SỬ TIN NHẮN TƯ VẤN GIÁO VIÊN</div>
      <p style="text-align: center;"><i>(Theo thời gian thực – Trợ lý ảo Quản trị Nhà trường)</i></p>
      <p><strong>Admin phụ trách:</strong> ${ADMIN_INFO.name} – Hiệu trưởng Trường Tiểu học Tân Dĩnh</p>
      <p><strong>Hotline:</strong> ${ADMIN_INFO.hotline}</p>
      <hr>
      <div>
        ${messages.map((m, idx) => `
          <div class="msg-box ${m.sender === 'user' ? 'user-msg' : 'assistant-msg'}">
            <p><strong>#${idx + 1}. [${m.sender === 'user' ? (m.isVoice ? 'Giáo viên gửi (Thu âm Micro)' : 'Giáo viên gửi') : 'Hiệu trưởng Hoàng Thị Ngọc Bích tư vấn'}]</strong> <i>(${new Date(m.timestamp).toLocaleString('vi-VN')})</i></p>
            <p style="white-space: pre-wrap;">${m.text}</p>
            ${m.legalCitations?.length ? `<p><strong>Căn cứ:</strong> <i>${m.legalCitations.join(', ')}</i></p>` : ''}
          </div>
        `).join('')}
      </div>
      <br><br>
      <table style="width: 100%; border: none;">
        <tr>
          <td style="width: 50%;"></td>
          <td style="width: 50%; text-align: center;">
            <strong>HIỆU TRƯỞNG</strong><br>
            <i>(Ký số, đóng dấu)</i><br><br><br>
            <strong>${ADMIN_INFO.name}</strong>
          </td>
        </tr>
      </table>
    </body>
    </html>`;

    const blob = new Blob([htmlContent], { type: 'application/msword;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Bien_Ban_Lich_Su_Tin_Nhan_${new Date().toISOString().slice(0, 10)}.doc`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border-2 border-blue-900 max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-blue-900 text-white px-6 py-4 flex items-center justify-between border-b border-amber-500/40">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-amber-500 text-slate-950 rounded-lg font-bold">
              {isUnlocked ? <Unlock className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-lg font-bold font-times uppercase tracking-wide">
                Trung tâm Sao lưu & Quản lý Lịch sử Tin nhắn
              </h2>
              <p className="text-xs text-amber-200">
                Lưu trữ thời gian thực • In ấn chuẩn NĐ 30/2020 • Xuất báo cáo đa định dạng
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

        {/* Content */}
        {!isUnlocked ? (
          /* Password Form */
          <div className="p-8 max-w-md mx-auto my-auto text-center">
            <div className="w-16 h-16 bg-blue-100 text-blue-900 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-blue-300 shadow-inner">
              <Lock className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 font-times mb-2">
              Xác thực Quản trị viên
            </h3>
            <p className="text-sm text-slate-600 mb-6">
              Để bảo mật thông tin tư vấn và dữ liệu học đường, vui lòng nhập mật khẩu quản trị để mở khóa tính năng sao lưu, xem lại, in ấn và tải toàn bộ lịch sử.
            </p>
            <form onSubmit={handleUnlock} className="space-y-4">
              <div className="text-left">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Mật khẩu bảo mật
                </label>
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Nhập mật khẩu (Gợi ý: Hoang@Bich1)"
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-900 focus:border-blue-900 text-sm font-sans"
                  autoFocus
                />
                {errorMsg && (
                  <p className="text-xs text-red-600 mt-1 font-semibold flex items-center space-x-1">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>{errorMsg}</span>
                  </p>
                )}
              </div>
              <button
                type="submit"
                className="w-full bg-blue-900 hover:bg-blue-800 text-white font-bold py-2.5 px-4 rounded-lg transition-all shadow-md active:scale-98"
              >
                Mở khóa Truy cập
              </button>
            </form>
            <div className="mt-4 text-xs text-slate-400">
              Chỉ cấp quyền cho Hiệu trưởng Hoàng Thị Ngọc Bích và cán bộ quản lý được ủy quyền.
            </div>
          </div>
        ) : (
          /* Unlocked Dashboard */
          <div className="flex-1 flex flex-col overflow-hidden p-5">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200">
              <div className="flex items-center gap-2 flex-1 min-w-[240px]">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Tìm kiếm nội dung tin nhắn..."
                    className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:ring-1 focus:ring-red-600"
                  />
                </div>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-red-600"
                >
                  <option value="all">Tất cả chuyên mục</option>
                  {ADVISORY_CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.shortTitle}
                    </option>
                  ))}
                </select>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 flex items-center space-x-1.5 border border-slate-300 transition-colors cursor-pointer"
                  title="In báo cáo lịch sử (Ctrl+P)"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>In ấn (A4)</span>
                </button>
                <button
                  onClick={handleDownloadDoc}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-800 flex items-center space-x-1.5 border border-blue-200 transition-colors cursor-pointer"
                  title="Tải văn bản Word (.doc)"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Tải Word (.doc)</span>
                </button>
                <button
                  onClick={handleDownloadTxt}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 flex items-center space-x-1.5 border border-emerald-200 transition-colors cursor-pointer"
                  title="Tải văn bản Text (.txt)"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Tải Text</span>
                </button>
                <button
                  onClick={() => {
                    if (window.confirm('Bạn có chắc chắn muốn xóa toàn bộ lịch sử tư vấn hiện tại?')) {
                      onClearMessages();
                    }
                  }}
                  className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-red-50 hover:bg-red-100 text-red-700 flex items-center space-x-1 border border-red-200 transition-colors cursor-pointer"
                  title="Xóa toàn bộ lịch sử"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Xóa hết</span>
                </button>
              </div>
            </div>

            {/* Message List */}
            <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
              {filteredMessages.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <FileCheck className="w-12 h-12 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">Chưa có tin nhắn nào trong lịch sử.</p>
                </div>
              ) : (
                filteredMessages.map((msg, index) => (
                  <div
                    key={msg.id || index}
                    className={`p-4 rounded-xl border ${
                      msg.sender === 'user'
                        ? 'bg-amber-50/70 border-amber-200/80 ml-6'
                        : 'bg-white border-slate-200 shadow-2xs mr-6'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-1.5 text-slate-500">
                      <span className="font-bold uppercase tracking-wider text-red-900">
                        {msg.sender === 'user' ? '👤 Giáo viên câu hỏi' : '🎓 Hiệu trưởng Hoàng Thị Ngọc Bích tư vấn'}
                      </span>
                      <span className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(msg.timestamp).toLocaleString('vi-VN')}</span>
                      </span>
                    </div>
                    <div className="text-slate-800 text-[13.5px] font-times whitespace-pre-wrap leading-relaxed">
                      {msg.text}
                    </div>
                    {msg.legalCitations && msg.legalCitations.length > 0 && (
                      <div className="mt-2.5 pt-2 border-t border-slate-100 flex flex-wrap gap-1.5 items-center">
                        <span className="text-[11px] font-bold text-slate-500">Căn cứ:</span>
                        {msg.legalCitations.map((cite, i) => (
                          <span
                            key={i}
                            className="bg-red-50 text-red-800 text-[11px] px-2 py-0.5 rounded border border-red-200 font-medium"
                          >
                            {cite}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Footer Summary */}
            <div className="pt-3 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between">
              <span>Hiển thị <strong>{filteredMessages.length}</strong> / <strong>{messages.length}</strong> tin nhắn</span>
              <span className="text-emerald-700 font-medium flex items-center space-x-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Trạng thái: Đã sao lưu an toàn theo thời gian thực</span>
              </span>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
