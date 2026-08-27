import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { CategoryNav } from './components/CategoryNav';
import { ChatArea } from './components/ChatArea';
import { BackupModal } from './components/BackupModal';
import { DocumentLibraryModal } from './components/DocumentLibraryModal';
import { VoiceSettingsModal } from './components/VoiceSettingsModal';
import { ChatMessage, AdvisoryCategory, VoiceSettings } from './types';
import { ADMIN_INFO } from './data/knowledgeBase';
import { audioSpeech } from './utils/audioSpeech';
import { triggerInteractionCelebration } from './utils/celebrationEffects';

const INITIAL_GREETING: ChatMessage = {
  id: 'msg_welcome',
  sender: 'assistant',
  text: `Kính chào quý Thầy, Cô giáo và cán bộ quản lý!

Tôi là **Hoàng Thị Ngọc Bích** – Hiệu trưởng Trường Tiểu học Tân Dĩnh, xã Tân Dĩnh, tỉnh Bắc Ninh. 

Với hơn 30 năm kinh nghiệm công tác và gắn bó cùng bậc học Tiểu học, tôi xây dựng **Trợ lý ảo Tư vấn Giáo viên** này nhằm lắng nghe, đồng hành và hỗ trợ giải quyết ngay các vấn đề thực tiễn của quý thầy cô:

1. 🌸 **Tư vấn tâm lý giáo viên:** Hóa giải áp lực giảng dạy, cân bằng cảm xúc, phòng tránh hội chứng kiệt sức nghề nghiệp (burnout).
2. 📖 **Tư vấn phương pháp dạy học:** Đổi mới theo GDPT 2018, mô hình 4C, Storytelling, giáo dục STEM/STEAM và Trí tuệ nhân tạo (AI) theo Quyết định số 2422/QĐ-BGDĐT.
3. 📝 **Tư vấn kiểm tra đánh giá học sinh:** Thực hiện Thông tư số 27/2020/TT-BGDĐT, đánh giá vì sự tiến bộ, không áp đặt chỉ tiêu thành tích (Chỉ thị 12/CT-UBND) và quản trị Học bạ số.
4. 👨‍👩‍👧 **Tư vấn ứng xử với phụ huynh:** "Khen ngợi công khai, góp ý riêng tư", tuân thủ Khung giờ vàng (07h00 - 19h00), minh bạch thu chi theo Quyết định 51/2026/QĐ-UBND.
5. 🤝 **Tư vấn tháo gỡ mâu thuẫn đồng nghiệp:** Chuẩn mực Điều lệ trường tiểu học (Thông tư 15/2026/TT-BGDĐT), sinh hoạt chuyên môn theo nghiên cứu bài học, cố vấn 1 kèm 1.

Quý thầy cô có thể **gõ câu hỏi** hoặc **chọn biểu tượng Micro** để nói trực tiếp, tôi sẽ tư vấn nhanh và chính xác nhất!`,
  timestamp: new Date().toISOString(),
  legalCitations: [
    'Nghị định 30/2020/NĐ-CP',
    'Thông tư 27/2020/TT-BGDĐT',
    'Quyết định số 51/2026/QĐ-UBND tỉnh Bắc Ninh',
    'Quyết định số 2422/QĐ-BGDĐT của Bộ GDĐT'
  ]
};

const DEFAULT_VOICE_SETTINGS: VoiceSettings = {
  pitch: 1.06,
  rate: 0.97,
  volume: 1.0,
  autoSpeak: false,
  voiceName: 'default',
};

export default function App() {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem('tan_dinh_chat_messages');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return [INITIAL_GREETING];
  });

  const [activeCategory, setActiveCategory] = useState<AdvisoryCategory | 'all'>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [isBackupOpen, setIsBackupOpen] = useState(false);
  const [isDocsOpen, setIsDocsOpen] = useState(false);
  const [isVoiceSettingsOpen, setIsVoiceSettingsOpen] = useState(false);
  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>(() => {
    try {
      const saved = localStorage.getItem('tan_dinh_voice_settings');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return DEFAULT_VOICE_SETTINGS;
  });

  // Persist messages to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('tan_dinh_chat_messages', JSON.stringify(messages));
    } catch (e) {}
  }, [messages]);

  // Persist voice settings
  useEffect(() => {
    try {
      localStorage.setItem('tan_dinh_voice_settings', JSON.stringify(voiceSettings));
    } catch (e) {}
  }, [voiceSettings]);

  // Send message handler
  const handleSendMessage = async (
    text: string, 
    category?: AdvisoryCategory, 
    isVoice?: boolean, 
    audioBlobUrl?: string
  ) => {
    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toISOString(),
      category: category || (activeCategory === 'all' ? 'tam_ly' : activeCategory),
      isVoice: !!isVoice,
      audioBlobUrl,
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          category: category || (activeCategory === 'all' ? 'tam_ly' : activeCategory),
          history: messages.slice(-4).map((m) => ({
            sender: m.sender,
            text: m.text,
          })),
        }),
      });

      const data = await res.json();
      const assistantMsg: ChatMessage = {
        id: `ast_${Date.now()}`,
        sender: 'assistant',
        text: data.reply || 'Cảm ơn đồng chí đã chia sẻ.',
        timestamp: data.timestamp || new Date().toISOString(),
        category: data.category || category,
        legalCitations: data.legalCitations || [],
        groundingSources: data.groundingSources || [],
      };

      setMessages((prev) => [...prev, assistantMsg]);

      // Tự động tung hoa, pháo giấy, trái tim rực rỡ sau khi tương tác xong trong hộp chatbox
      triggerInteractionCelebration();

      // Auto speak if enabled
      if (voiceSettings.autoSpeak) {
        audioSpeech.speak(assistantMsg.text, {
          rate: voiceSettings.rate,
          pitch: voiceSettings.pitch,
          volume: voiceSettings.volume,
          voiceName: voiceSettings.voiceName,
        });
      }
    } catch (err) {
      console.error('Error sending message:', err);
      const errorMsg: ChatMessage = {
        id: `err_${Date.now()}`,
        sender: 'assistant',
        text: `Chào đồng chí, hiện tại hệ thống kết nối AI đang có độ trễ ngắn. Cô Bích khuyên đồng chí luôn ghi nhớ nguyên tắc HITL (Human-in-the-loop): Luôn ưu tiên lắng nghe thấu cảm và tuân thủ đúng các quy định chuyên môn tại Thông tư số 27/2020/TT-BGDĐT và Điều lệ trường tiểu học. Đồng chí hãy thử gửi lại câu hỏi nhé!`,
        timestamp: new Date().toISOString(),
        category: category,
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearMessages = () => {
    audioSpeech.stop();
    setMessages([INITIAL_GREETING]);
    try {
      localStorage.removeItem('tan_dinh_chat_messages');
    } catch (e) {}
    audioSpeech.playClickSound();
  };

  const handleDeleteMessage = (messageId: string) => {
    audioSpeech.stop();
    setMessages((prev) => {
      const updated = prev.filter((m) => m.id !== messageId);
      if (updated.length === 0) {
        return [INITIAL_GREETING];
      }
      return updated;
    });
    audioSpeech.playClickSound();
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] text-slate-900 font-times selection:bg-blue-200 selection:text-blue-950">
      {/* Top Header */}
      <Header
        onOpenBackup={() => setIsBackupOpen(true)}
        onOpenDocs={() => setIsDocsOpen(true)}
        onOpenVoiceSettings={() => setIsVoiceSettingsOpen(true)}
      />

      {/* 5 Core Advisory Categories Navigation */}
      <CategoryNav
        activeCategory={activeCategory}
        onSelectCategory={setActiveCategory}
      />

      {/* Main Interactive Chat & Advisory Area */}
      <main className="flex-1 flex flex-col max-w-7xl w-full mx-auto shadow-sm border-x border-slate-200/60 bg-white">
        <ChatArea
          messages={messages}
          onSendMessage={handleSendMessage}
          onDeleteMessage={handleDeleteMessage}
          onClearMessages={handleClearMessages}
          isLoading={isLoading}
          activeCategory={activeCategory}
          voiceSettings={voiceSettings}
          onSelectCategory={setActiveCategory}
        />
      </main>

      {/* Modals */}
      <BackupModal
        isOpen={isBackupOpen}
        onClose={() => setIsBackupOpen(false)}
        messages={messages}
        onClearMessages={handleClearMessages}
      />

      <DocumentLibraryModal
        isOpen={isDocsOpen}
        onClose={() => setIsDocsOpen(false)}
        onUseTemplateInChat={(text) => handleSendMessage(text, activeCategory === 'all' ? 'phuong_phap' : activeCategory)}
      />

      <VoiceSettingsModal
        isOpen={isVoiceSettingsOpen}
        onClose={() => setIsVoiceSettingsOpen(false)}
        settings={voiceSettings}
        onSaveSettings={setVoiceSettings}
      />
    </div>
  );
}
