import React, { useState, useEffect } from 'react';
import { X, Volume2, Play, Square, Sparkles, Check } from 'lucide-react';
import { VoiceSettings } from '../types';
import { audioSpeech } from '../utils/audioSpeech';

interface VoiceSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: VoiceSettings;
  onSaveSettings: (settings: VoiceSettings) => void;
}

export const VoiceSettingsModal: React.FC<VoiceSettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
}) => {
  const [localSettings, setLocalSettings] = useState<VoiceSettings>(settings);
  const [isPlaying, setIsPlaying] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    setLocalSettings(settings);
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const updateVoices = () => {
        const vList = window.speechSynthesis.getVoices();
        // Lọc các giọng tiếng Việt hoặc hỗ trợ tiếng Việt, LOẠI BỎ TOÀN BỘ GIỌNG NAM
        const filtered = vList.filter((v) => {
          const n = v.name.toLowerCase();
          const l = v.lang.toLowerCase();
          const isVi = l.startsWith('vi') || l.includes('vn') || n.includes('vietnam') || n.includes('tiếng việt');
          const isMale = 
            n.includes('microsoft an') || 
            n.includes('an online') || 
            n.includes('microsoft nam') || 
            n.includes('(nam)') || 
            n.includes('male') || 
            n.includes('man') || 
            n.includes('david') || 
            n.includes('mark') || 
            n.includes('george') || 
            n.includes('minh') || 
            n.includes('hung') || 
            n.includes('trung');
          return isVi && !isMale;
        });
        setVoices(filtered);
      };
      updateVoices();
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }
  }, [settings, isOpen]);

  if (!isOpen) return null;

  const testSentence =
    'Xin chào quý thầy cô! Tôi là Hoàng Thị Ngọc Bích, Hiệu trưởng Trường Tiểu học Tân Dĩnh. Tôi rất vui được đồng hành và hỗ trợ quý thầy cô trong mọi hoạt động sư phạm và tâm lý học đường.';

  const handleTestVoice = () => {
    if (isPlaying) {
      audioSpeech.stop();
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      audioSpeech.speak(testSentence, {
        rate: localSettings.rate,
        pitch: localSettings.pitch,
        volume: localSettings.volume,
        onStart: () => setIsPlaying(true),
        onEnd: () => setIsPlaying(false),
        onError: () => setIsPlaying(false),
      });
    }
  };

  const handleSave = () => {
    audioSpeech.stop();
    onSaveSettings(localSettings);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border-2 border-blue-900 overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-blue-900 text-white px-6 py-4 flex items-center justify-between border-b border-amber-500/40">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-amber-500 text-slate-950 rounded-lg font-bold">
              <Volume2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold font-times uppercase tracking-wide">
                Cấu hình Giọng nói Phát thanh viên
              </h2>
              <p className="text-xs text-amber-200">
                Chuẩn giọng Nữ phát thanh viên truyền hình Tiếng Việt miền Bắc
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              audioSpeech.stop();
              onClose();
            }}
            className="p-1.5 rounded-lg text-amber-200 hover:bg-blue-800 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-5">
          {/* Preset Badge */}
          <div className="bg-amber-50 p-3.5 rounded-xl border border-amber-200 flex items-start space-x-3">
            <Sparkles className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-amber-900 leading-relaxed">
              <strong>Đặc tính giọng đọc:</strong> Giọng Nữ phát thanh viên miền Bắc chuẩn mực, lời nói to, rõ ràng, tròn vành rõ chữ, nhịp điệu giòn nẩy, truyền cảm và thân thiện tự nhiên.
            </div>
          </div>

          {/* Preset Buttons */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Chế độ phong cách Giọng đọc
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setLocalSettings({ ...localSettings, rate: 0.97, pitch: 1.06, volume: 1.0 })}
                className={`p-2.5 rounded-lg border text-left text-xs transition-all cursor-pointer ${
                  localSettings.rate === 0.97 && localSettings.pitch === 1.06
                    ? 'border-blue-900 bg-blue-50/80 font-bold text-blue-950 shadow-xs'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="font-bold flex items-center justify-between">
                  <span>Phát thanh viên VTV</span>
                  {localSettings.rate === 0.97 && localSettings.pitch === 1.06 && <Check className="w-3.5 h-3.5 text-blue-900" />}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">To, tròn vành, giòn, nẩy</div>
              </button>

              <button
                type="button"
                onClick={() => setLocalSettings({ ...localSettings, rate: 0.94, pitch: 1.04, volume: 1.0 })}
                className={`p-2.5 rounded-lg border text-left text-xs transition-all cursor-pointer ${
                  localSettings.rate === 0.94 && localSettings.pitch === 1.04
                    ? 'border-blue-900 bg-blue-50/80 font-bold text-blue-950 shadow-xs'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="font-bold flex items-center justify-between">
                  <span>Truyền cảm, ấm áp</span>
                  {localSettings.rate === 0.94 && localSettings.pitch === 1.04 && <Check className="w-3.5 h-3.5 text-blue-900" />}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">Thân thiện, gần gũi, lịch sự</div>
              </button>

              <button
                type="button"
                onClick={() => setLocalSettings({ ...localSettings, rate: 0.90, pitch: 1.02, volume: 1.0 })}
                className={`p-2.5 rounded-lg border text-left text-xs transition-all cursor-pointer ${
                  localSettings.rate === 0.90 && localSettings.pitch === 1.02
                    ? 'border-blue-900 bg-blue-50/80 font-bold text-blue-950 shadow-xs'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="font-bold flex items-center justify-between">
                  <span>Từ tốn, ân cần</span>
                  {localSettings.rate === 0.90 && localSettings.pitch === 1.02 && <Check className="w-3.5 h-3.5 text-blue-900" />}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">Chậm rãi, rõ ràng từng ý</div>
              </button>
            </div>
          </div>

          {/* Voice selector if available */}
          {voices.length > 0 && (
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Giọng đọc hệ thống Tiếng Việt
              </label>
              <select
                value={localSettings.voiceName}
                onChange={(e) => setLocalSettings({ ...localSettings, voiceName: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-blue-900"
              >
                <option value="default">Mặc định (Tối ưu giọng Nữ phát thanh viên miền Bắc chuẩn)</option>
                {voices.map((v) => (
                  <option key={v.name} value={v.name}>
                    {v.name} ({v.lang})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Rate Slider */}
          <div>
            <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
              <span>Tốc độ đọc (Cadence / Rate)</span>
              <span className="text-blue-900 font-mono font-bold">{localSettings.rate}x</span>
            </div>
            <input
              type="range"
              min="0.7"
              max="1.3"
              step="0.01"
              value={localSettings.rate}
              onChange={(e) => setLocalSettings({ ...localSettings, rate: parseFloat(e.target.value) })}
              className="w-full accent-blue-900"
            />
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>Chậm rãi, từ tốn</span>
              <span>Chuẩn phát thanh (0.95 - 0.98)</span>
              <span>Nhanh</span>
            </div>
          </div>

          {/* Pitch Slider */}
          <div>
            <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
              <span>Cao độ giọng (Pitch / Timbre)</span>
              <span className="text-blue-900 font-mono font-bold">{localSettings.pitch}</span>
            </div>
            <input
              type="range"
              min="0.8"
              max="1.4"
              step="0.01"
              value={localSettings.pitch}
              onChange={(e) => setLocalSettings({ ...localSettings, pitch: parseFloat(e.target.value) })}
              className="w-full accent-blue-900"
            />
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>Trầm ấm</span>
              <span>Thanh thoát, tươi tắn, nẩy (1.04 - 1.08)</span>
              <span>Cao nẩy</span>
            </div>
          </div>

          {/* Auto speak checkbox */}
          <div className="pt-2">
            <label className="flex items-center space-x-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={localSettings.autoSpeak}
                onChange={(e) => setLocalSettings({ ...localSettings, autoSpeak: e.target.checked })}
                className="w-4 h-4 rounded border-slate-300 text-blue-900 focus:ring-blue-900 accent-blue-900"
              />
              <span className="text-xs font-bold text-slate-800">
                Tự động đọc to câu trả lời của Hiệu trưởng bằng giọng phát thanh viên
              </span>
            </label>
          </div>

          {/* Test Voice Button */}
          <div className="pt-2 flex items-center justify-between gap-3 border-t border-slate-200">
            <button
              onClick={handleTestVoice}
              className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center space-x-2 transition-all cursor-pointer ${
                isPlaying
                  ? 'bg-rose-600 text-white animate-pulse'
                  : 'bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-300'
              }`}
            >
              {isPlaying ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{isPlaying ? 'Dừng đọc thử' : 'Đọc thử giọng mẫu'}</span>
            </button>

            <button
              onClick={handleSave}
              className="px-5 py-2 rounded-lg text-xs font-bold bg-blue-900 hover:bg-blue-800 text-white flex items-center space-x-1.5 shadow-md transition-all cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Lưu cấu hình</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
