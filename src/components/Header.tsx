import React, { useState } from 'react';
import { 
  PhoneCall, 
  Sparkles, 
  Volume2, 
  History, 
  FileText, 
  ShieldCheck, 
  GraduationCap
} from 'lucide-react';
import { ADMIN_INFO } from '../data/knowledgeBase';
import { audioSpeech } from '../utils/audioSpeech';

interface HeaderProps {
  onOpenBackup: () => void;
  onOpenDocs: () => void;
  onOpenVoiceSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  onOpenBackup, 
  onOpenDocs, 
  onOpenVoiceSettings 
}) => {
  const [avatarError, setAvatarError] = useState(false);

  return (
    <header className="bg-gradient-to-r from-blue-950 via-slate-900 to-blue-900 text-white shadow-lg border-b-4 border-amber-500 sticky top-0 z-40">
      {/* Slow scrolling marquee banner */}
      <div className="bg-amber-500 text-slate-950 text-sm font-semibold py-1.5 px-4 overflow-hidden border-b border-amber-600 shadow-inner flex items-center">
        <div className="flex-shrink-0 flex items-center space-x-1.5 mr-3 bg-blue-950 text-amber-300 text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wide">
          <Sparkles className="w-3.5 h-3.5 animate-spin" />
          <span>Thông báo</span>
        </div>
        <div className="whitespace-nowrap overflow-hidden flex-1">
          <div className="animate-marquee-slow text-[13.5px] font-medium tracking-wide">
            {ADMIN_INFO.marqueeText}
          </div>
        </div>
      </div>

      {/* Main Header Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Left: Avatar, Title & Principal Information */}
          <div className="flex items-center space-x-3.5 sm:space-x-4 text-center md:text-left">
            {/* Avatar Container with Gold Frame */}
            <div className="relative flex-shrink-0 group">
              <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-full p-1 bg-gradient-to-tr from-amber-400 to-yellow-200 shadow-md ring-2 ring-amber-500/50">
                {!avatarError ? (
                  <img
                    src={ADMIN_INFO.avatarUrl}
                    alt={ADMIN_INFO.name}
                    referrerPolicy="no-referrer"
                    onError={() => setAvatarError(true)}
                    className="w-full h-full object-cover rounded-full bg-blue-950"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-900 to-amber-700 flex items-center justify-center text-amber-200 font-bold text-xl shadow-inner">
                    HT
                  </div>
                )}
              </div>
              <div className="absolute -bottom-1 -right-1 bg-emerald-600 text-white rounded-full p-1 ring-2 ring-blue-950" title="Trợ lý trực tuyến 24/7">
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* School & Admin Info */}
            <div>
              <div className="flex items-center justify-center md:justify-start space-x-2">
                <span className="bg-amber-400/20 text-amber-300 text-xs px-2.5 py-0.5 rounded border border-amber-400/40 font-semibold uppercase tracking-wider">
                  Trường Tiểu học Tân Dĩnh • Bắc Ninh
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-1 drop-shadow-sm font-times uppercase">
                Trợ lý ảo Tư vấn Giáo viên
              </h1>
              <p className="text-sm text-amber-100/90 font-medium">
                Admin: <strong className="text-amber-300">{ADMIN_INFO.name}</strong> – {ADMIN_INFO.title} • Tân Dĩnh, Bắc Ninh
              </p>
            </div>
          </div>

          {/* Right: Actions, Documents, Backup & Voice Settings */}
          <div className="flex flex-wrap items-center justify-center md:justify-end gap-2 sm:gap-2.5">
            {/* Document Library Button */}
            <button
              id="btn-open-docs"
              onClick={() => {
                audioSpeech.playClickSound();
                onOpenDocs();
              }}
              className="bg-blue-900/80 hover:bg-blue-800 text-white text-xs px-3 py-2 rounded-lg border border-blue-700 flex items-center space-x-1.5 transition-colors shadow-sm"
              title="Tra cứu Văn bản & Mẫu hành chính NĐ 30"
            >
              <FileText className="w-3.5 h-3.5 text-amber-300" />
              <span className="font-semibold">Văn bản & Mẫu NĐ 30</span>
            </button>

            {/* Backup & Export History (Password Protected) */}
            <button
              id="btn-open-backup"
              onClick={() => {
                audioSpeech.playClickSound();
                onOpenBackup();
              }}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs px-3.5 py-2 rounded-lg font-bold flex items-center space-x-1.5 transition-all shadow-md active:scale-95 border border-amber-600"
              title="Sao lưu, xem lại, in ấn & tải lịch sử (Mật khẩu: Hoang@Bich1)"
            >
              <History className="w-3.5 h-3.5" />
              <span>Sao lưu / In ấn</span>
            </button>

            {/* Voice Settings */}
            <button
              id="btn-voice-settings"
              onClick={() => {
                audioSpeech.playClickSound();
                onOpenVoiceSettings();
              }}
              className="bg-blue-950 hover:bg-blue-900 text-amber-300 p-2 rounded-lg border border-amber-500/40 text-xs flex items-center justify-center transition-colors shadow-sm"
              title="Tùy chỉnh giọng đọc chuẩn Nữ phát thanh viên miền Bắc"
            >
              <Volume2 className="w-4 h-4" />
            </button>

            {/* Hotline Call Button */}
            <a
              id="link-hotline"
              href={`tel:${ADMIN_INFO.hotline.replace(/[^0-9+]/g, '')}`}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs px-3 py-2 rounded-lg font-semibold flex items-center space-x-1.5 transition-colors shadow-sm"
              title={`Hotline trực tiếp: ${ADMIN_INFO.hotline}`}
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>{ADMIN_INFO.hotline}</span>
            </a>
          </div>

        </div>
      </div>
    </header>
  );
};
