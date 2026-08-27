import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Copy, 
  Check, 
  Sparkles, 
  RotateCcw, 
  FileText, 
  Printer, 
  Trash2,
  ChevronRight,
  ShieldCheck,
  Award,
  AlertCircle,
  Radio,
  Play,
  Square,
  BookmarkPlus,
  Globe,
  ExternalLink
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { ChatMessage, AdvisoryCategory, VoiceSettings } from '../types';
import { ADMIN_INFO, ADVISORY_CATEGORIES } from '../data/knowledgeBase';
import { audioSpeech } from '../utils/audioSpeech';
import { triggerConfetti } from '../utils/celebrationEffects';

interface ChatAreaProps {
  messages: ChatMessage[];
  onSendMessage: (text: string, category?: AdvisoryCategory, isVoice?: boolean, audioBlobUrl?: string) => Promise<void>;
  onDeleteMessage?: (messageId: string) => void;
  onClearMessages?: () => void;
  isLoading: boolean;
  activeCategory: AdvisoryCategory | 'all';
  voiceSettings: VoiceSettings;
  onSelectCategory: (cat: AdvisoryCategory | 'all') => void;
}

export const ChatArea: React.FC<ChatAreaProps> = ({
  messages,
  onSendMessage,
  onDeleteMessage,
  onClearMessages,
  isLoading,
  activeCategory,
  voiceSettings,
  onSelectCategory,
}) => {
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [autoSendVoice, setAutoSendVoice] = useState(true);
  const [activeSpeakingId, setActiveSpeakingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [voiceNotice, setVoiceNotice] = useState<string | null>(null);

  // Audio Recording states for Voice Memo & Auto-Send
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const speechRecognitionRef = useRef<any>(null);
  const recordingTimerRef = useRef<any>(null);
  const silenceTimerRef = useRef<any>(null);
  const latestTranscriptRef = useRef<string>('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Timer for recording duration
  useEffect(() => {
    if (isRecording) {
      setRecordingSeconds(0);
      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
    }
    return () => {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    };
  }, [isRecording]);

  // Handle Speech Recognition (Microphone Speech-to-Text & Voice Memo)
  const toggleListening = () => {
    audioSpeech.playClickSound();

    if (isRecording) {
      finishAndSendRecording();
      return;
    }

    startRecording();
  };

  const startRecording = async () => {
    latestTranscriptRef.current = '';
    const SpeechRecognitionClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    try {
      setIsRecording(true);
      setVoiceNotice('Đang thu âm & nhận diện giọng nói... (Nói xong hệ thống sẽ tự động gửi câu hỏi)');

      // 1. Initialize Web Speech Recognition
      if (SpeechRecognitionClass) {
        const recognition = new SpeechRecognitionClass();
        recognition.lang = 'vi-VN';
        recognition.continuous = true;
        recognition.interimResults = true;

        recognition.onresult = (event: any) => {
          const transcript = Array.from(event.results)
            .map((result: any) => result[0].transcript)
            .join('');
          
          latestTranscriptRef.current = transcript;
          setInputText(transcript);

          // Reset silence timer on every spoken phrase
          if (silenceTimerRef.current) {
            clearTimeout(silenceTimerRef.current);
          }

          // If autoSend is enabled and user pauses for 2.2 seconds after speaking
          if (autoSendVoice && transcript.trim().length > 3) {
            silenceTimerRef.current = setTimeout(() => {
              finishAndSendRecording();
            }, 2200);
          }
        };

        recognition.onerror = (event: any) => {
          console.warn('Speech recognition status:', event.error);
        };

        recognition.onend = () => {
          // If ended naturally and we have text, finish
          if (isRecording && latestTranscriptRef.current.trim().length > 3 && autoSendVoice) {
            finishAndSendRecording();
          }
        };

        speechRecognitionRef.current = recognition;
        try {
          recognition.start();
        } catch (e) {
          console.warn('Recognition start skipped:', e);
        }
      }

      // 2. Also record actual audio stream for voice memo backup
      if (navigator.mediaDevices?.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorder.onstop = () => {
          stream.getTracks().forEach((track) => track.stop());
        };

        mediaRecorderRef.current = mediaRecorder;
        mediaRecorder.start(100);
      }
    } catch (err) {
      console.error('Microphone error:', err);
      setIsRecording(false);
      setVoiceNotice(null);
    }
  };

  const cancelRecording = () => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    if (speechRecognitionRef.current) {
      try {
        speechRecognitionRef.current.stop();
      } catch (e) {}
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {}
    }
    audioChunksRef.current = [];
    setIsRecording(false);
    setVoiceNotice(null);
    audioSpeech.playClickSound();
  };

  const finishAndSendRecording = async () => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }

    if (speechRecognitionRef.current) {
      try {
        speechRecognitionRef.current.stop();
      } catch (e) {}
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {}
    }

    setIsRecording(false);
    setVoiceNotice(null);

    // Wait a brief tick to finalize chunks
    setTimeout(async () => {
      const recognized = (latestTranscriptRef.current || inputText).trim();
      let memoUrl: string | undefined = undefined;

      if (audioChunksRef.current.length > 0) {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        memoUrl = URL.createObjectURL(audioBlob);
        audioChunksRef.current = [];
      }

      const textToSend = recognized || (memoUrl ? '🎤 [Câu hỏi thu âm trực tiếp qua Micro]' : '');
      if (textToSend) {
        setInputText('');
        latestTranscriptRef.current = '';
        audioSpeech.playClickSound();
        const currentCat = activeCategory === 'all' ? 'tam_ly' : activeCategory;
        await onSendMessage(textToSend, currentCat, true, memoUrl);
      }
    }, 200);
  };

  // Submit message
  const handleSend = async (customText?: string) => {
    const textToSend = (customText || inputText).trim();
    if (!textToSend || isLoading) return;

    audioSpeech.playClickSound();
    if (isRecording) {
      cancelRecording();
    }
    setInputText('');

    let memoUrl: string | undefined = undefined;
    if (audioChunksRef.current.length > 0) {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      memoUrl = URL.createObjectURL(audioBlob);
      audioChunksRef.current = [];
    }

    const currentCat = activeCategory === 'all' ? 'tam_ly' : activeCategory;
    await onSendMessage(textToSend, currentCat, !!memoUrl, memoUrl);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSpeakMessage = (id: string, text: string) => {
    if (activeSpeakingId === id) {
      audioSpeech.stop();
      setActiveSpeakingId(null);
    } else {
      audioSpeech.speak(text, {
        rate: voiceSettings.rate,
        pitch: voiceSettings.pitch,
        volume: voiceSettings.volume,
        voiceName: voiceSettings.voiceName,
        onStart: () => setActiveSpeakingId(id),
        onEnd: () => setActiveSpeakingId(null),
        onError: () => setActiveSpeakingId(null),
      });
    }
  };

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    audioSpeech.playClickSound();
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handlePrintSingle = (msg: ChatMessage) => {
    audioSpeech.playClickSound();
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>Trích lục Ý kiến Tư vấn Sư phạm</title>
          <style>
            body { font-family: 'Times New Roman', serif; font-size: 13pt; line-height: 1.6; margin: 20mm 15mm 20mm 30mm; }
            .header-table { width: 100%; border: none; margin-bottom: 20px; }
            .header-table td { border: none; vertical-align: top; }
            .title { text-align: center; font-size: 15pt; font-weight: bold; margin: 15px 0; }
            .content { white-space: pre-wrap; font-size: 13pt; }
          </style>
        </head>
        <body>
          <table class="header-table">
            <tr>
              <td style="width: 45%; text-align: center;">
                <strong>TRƯỜNG TIỂU HỌC TÂN DĨNH</strong><br>
                Hội đồng Tư vấn Sư phạm
              </td>
              <td style="width: 55%; text-align: center;">
                <strong>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</strong><br>
                <strong><u>Độc lập - Tự do - Hạnh phúc</u></strong><br>
                <i>Tân Dĩnh, ngày ${new Date().getDate()} tháng ${new Date().getMonth() + 1} năm ${new Date().getFullYear()}</i>
              </td>
            </tr>
          </table>
          <div class="title">PHIẾU TƯ VẤN SƯ PHẠM VÀ HƯỚNG DẪN CHUYÊN MÔN</div>
          <p><strong>Người tư vấn:</strong> Hoàng Thị Ngọc Bích – Hiệu trưởng</p>
          <p><strong>Thời gian:</strong> ${new Date(msg.timestamp).toLocaleString('vi-VN')}</p>
          <hr/>
          <div class="content">${msg.text}</div>
          <br/><br/>
          <div style="float: right; text-align: center; width: 250px;">
            <strong>HIỆU TRƯỞNG</strong><br/>
            <i>(Ký và xác nhận)</i><br/><br/><br/>
            <strong>${ADMIN_INFO.name}</strong>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 400);
  };

  // Get active category object
  const currentCategoryObj = ADVISORY_CATEGORIES.find((c) => c.id === activeCategory);

  return (
    <div className="flex-1 flex flex-col h-full bg-[#f8fafc] relative">
      
      {/* Category banner / Context info */}
      <div className="bg-blue-50/90 border-b border-blue-200/90 px-4 py-2.5 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center space-x-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
          <span className="text-xs text-blue-950 font-bold uppercase tracking-wider">
            {currentCategoryObj ? currentCategoryObj.title : 'Hệ thống Tư vấn Đa năng 5 Chuyên đề'}
          </span>
        </div>
        <div className="flex items-center space-x-3 text-xs text-slate-500 font-times">
          {messages.length > 1 && onClearMessages && (
            <button
              id="btn-clear-chat"
              onClick={() => {
                if (window.confirm('Đồng chí có chắc chắn muốn xoá toàn bộ lịch sử tin nhắn trong cuộc trò chuyện này?')) {
                  onClearMessages();
                }
              }}
              className="flex items-center space-x-1 px-2.5 py-1 text-xs text-red-700 bg-red-50 hover:bg-red-100 hover:text-red-800 rounded-lg border border-red-200 transition-colors font-medium cursor-pointer shadow-2xs"
              title="Xoá toàn bộ cuộc trò chuyện"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Xoá hội thoại</span>
            </button>
          )}
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-5 space-y-6">
        
        {/* Welcome Banner when only 1 or initial messages */}
        {messages.length <= 1 && (
          <div className="max-w-3xl mx-auto bg-white p-5 sm:p-6 rounded-2xl border-2 border-blue-900/20 shadow-md">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left mb-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full p-1 bg-gradient-to-tr from-amber-400 to-yellow-200 border-2 border-amber-400 flex-shrink-0 shadow-md ring-2 ring-blue-900/30 overflow-hidden">
                <img
                  src={ADMIN_INFO.avatarUrl}
                  alt={ADMIN_INFO.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover rounded-full"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold font-times text-blue-950">
                  Chào mừng quý Thầy Cô đến với Trợ lý ảo Quản trị Nhà trường
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 font-times mt-1 leading-relaxed">
                  Tôi là <strong>Hoàng Thị Ngọc Bích</strong> – Hiệu trưởng Trường Tiểu học Tân Dĩnh. Tôi sẵn sàng lắng nghe, tư vấn tâm lý, hướng dẫn phương pháp dạy học đổi mới, kiểm tra đánh giá không áp lực thành tích, giải quyết tình huống phụ huynh và tháo gỡ mâu thuẫn đồng nghiệp.
                </p>
              </div>
            </div>

            {/* Quick Principles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-3 border-t border-blue-100">
              <div className="bg-blue-50/70 p-2.5 rounded-lg border border-blue-200/60 text-xs text-slate-800">
                ⭐ <strong>HITL (Con người trong vòng lặp):</strong> AI gợi ý tham mưu, thầy cô giữ vai trò quyết định và yêu thương học trò.
              </div>
              <div className="bg-blue-50/70 p-2.5 rounded-lg border border-blue-200/60 text-xs text-slate-800">
                ⭐ <strong>Giao tiếp thấu cảm:</strong> "Khen ngợi công khai nỗ lực, góp ý riêng tư bảo vệ tự trọng".
              </div>
            </div>
          </div>
        )}

        {/* Message Bubble List */}
        {messages.map((msg, index) => {
          const isUser = msg.sender === 'user';
          const isSpeakingThis = activeSpeakingId === msg.id;

          return (
            <div
              key={msg.id || index}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-4xl ${
                isUser ? 'ml-auto' : 'mr-auto'
              }`}
            >
              {/* Sender label */}
              <div className="flex items-center space-x-2 text-xs text-slate-500 mb-1 px-1">
                {!isUser && (
                  <div className="w-6 h-6 rounded-full overflow-hidden ring-1 ring-amber-400 flex-shrink-0 bg-blue-950">
                    <img
                      src={ADMIN_INFO.avatarUrl}
                      alt={ADMIN_INFO.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                )}
                <span className="font-bold text-slate-700">
                  {isUser ? 'Giáo viên' : 'Hiệu trưởng Hoàng Thị Ngọc Bích'}
                </span>
                <span>•</span>
                <span>{new Date(msg.timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
                {msg.isVoice && (
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] px-1.5 py-0.2 rounded font-semibold flex items-center space-x-0.5">
                    <Mic className="w-2.5 h-2.5" />
                    <span>Tin thoại</span>
                  </span>
                )}
              </div>

              {/* Message Bubble */}
              <div
                className={`p-4 sm:p-5 rounded-2xl shadow-xs transition-all relative group ${
                  isUser
                    ? 'bg-blue-900 text-white rounded-tr-xs border border-blue-800 shadow-md'
                    : 'bg-white text-slate-900 rounded-tl-xs border border-slate-200 shadow-sm'
                }`}
              >
                {/* Audio memo player if user recorded voice */}
                {msg.audioBlobUrl && (
                  <div className="mb-3 p-2 bg-blue-950/60 rounded-lg border border-blue-700/50 flex items-center space-x-2 text-xs text-amber-200">
                    <audio src={msg.audioBlobUrl} controls className="h-8 w-full max-w-xs" />
                  </div>
                )}

                {/* Markdown / Text Content in Times New Roman 13pt style */}
                <div
                  className={`text-[13pt] font-times leading-[1.65] selection:bg-blue-200 selection:text-blue-950 ${
                    isUser ? 'text-white' : 'text-slate-900'
                  }`}
                >
                  <ReactMarkdown
                    components={{
                      p: ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,
                      ul: ({ children }) => <ul className="list-disc pl-5 mb-3 space-y-1">{children}</ul>,
                      ol: ({ children }) => <ol className="list-decimal pl-5 mb-3 space-y-1">{children}</ol>,
                      li: ({ children }) => <li className="pl-1">{children}</li>,
                      strong: ({ children }) => <strong className={isUser ? 'text-amber-200 font-bold' : 'text-blue-950 font-bold'}>{children}</strong>,
                      blockquote: ({ children }) => (
                        <blockquote className="border-l-4 border-amber-500 pl-3 italic my-2 text-slate-600 bg-amber-50/50 py-1 rounded-r">
                          {children}
                        </blockquote>
                      ),
                    }}
                  >
                    {msg.text}
                  </ReactMarkdown>
                </div>

                {/* Legal citations tags */}
                {msg.legalCitations && msg.legalCitations.length > 0 && (
                  <div className="mt-3.5 pt-2.5 border-t border-slate-100 flex flex-wrap items-center gap-1.5">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      Căn cứ áp dụng:
                    </span>
                    {msg.legalCitations.map((cite, i) => (
                      <span
                        key={i}
                        className="bg-blue-50 text-blue-950 text-[11px] px-2.5 py-0.5 rounded-full border border-blue-200 font-medium shadow-2xs"
                      >
                        {cite}
                      </span>
                    ))}
                  </div>
                )}

                {/* Real-time Internet Search Grounding Sources */}
                {msg.groundingSources && msg.groundingSources.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-slate-100 flex flex-wrap items-center gap-1.5">
                    <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1">
                      <Globe className="w-3 h-3 text-emerald-600" />
                      Nguồn tra cứu internet:
                    </span>
                    {msg.groundingSources.slice(0, 3).map((source, i) => (
                      <a
                        key={i}
                        href={source.url}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="inline-flex items-center gap-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-[11px] px-2.5 py-0.5 rounded-full border border-emerald-200 font-medium transition-colors shadow-2xs group cursor-pointer"
                        title={source.title}
                      >
                        <span className="max-w-[200px] truncate">{source.title || 'Nguồn tham khảo'}</span>
                        <ExternalLink className="w-2.5 h-2.5 text-emerald-600 group-hover:text-emerald-800" />
                      </a>
                    ))}
                  </div>
                )}

                {/* Bubble Action Toolbar (TTS, Copy, Print) */}
                <div className={`mt-3 pt-2 flex items-center justify-end gap-2 text-xs border-t ${
                  isUser ? 'border-blue-800/60' : 'border-slate-100'
                }`}>
                  {/* Text-to-Speech Button */}
                  <button
                    onClick={() => handleSpeakMessage(msg.id, msg.text)}
                    className={`px-2.5 py-1 rounded-lg flex items-center space-x-1 font-semibold transition-all cursor-pointer ${
                      isSpeakingThis
                        ? 'bg-amber-500 text-slate-950 font-bold animate-pulse'
                        : isUser
                        ? 'bg-blue-950/70 hover:bg-blue-950 text-amber-200'
                        : 'bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-900'
                    }`}
                    title={isSpeakingThis ? 'Dừng đọc' : 'Phát âm thanh giọng Nữ phát thanh viên miền Bắc'}
                  >
                    {isSpeakingThis ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                    <span>{isSpeakingThis ? 'Đang đọc...' : 'Nghe giọng đọc'}</span>
                  </button>

                  {/* Copy Button */}
                  <button
                    onClick={() => handleCopy(msg.id, msg.text)}
                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                      isUser
                        ? 'hover:bg-blue-950 text-blue-100'
                        : 'hover:bg-slate-100 text-slate-600'
                    }`}
                    title="Sao chép nội dung"
                  >
                    {copiedId === msg.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>

                  {/* Print Button */}
                  {!isUser && (
                    <button
                      onClick={() => handlePrintSingle(msg)}
                      className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
                      title="In phiếu tư vấn này"
                    >
                      <Printer className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {/* Delete Single Message Button */}
                  {onDeleteMessage && (
                    <button
                      id={`btn-delete-msg-${msg.id}`}
                      onClick={() => {
                        if (activeSpeakingId === msg.id) {
                          audioSpeech.stop();
                          setActiveSpeakingId(null);
                        }
                        onDeleteMessage(msg.id);
                      }}
                      className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                        isUser
                          ? 'hover:bg-red-500/80 text-blue-200 hover:text-white'
                          : 'hover:bg-red-50 text-slate-400 hover:text-red-600'
                      }`}
                      title="Xoá tin nhắn này"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-start space-x-3 max-w-2xl">
            <div className="w-8 h-8 rounded-full overflow-hidden ring-2 ring-amber-400 flex-shrink-0 animate-pulse bg-blue-950">
              <img
                src={ADMIN_INFO.avatarUrl}
                alt={ADMIN_INFO.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
            <div className="bg-white p-4 rounded-2xl rounded-tl-xs border border-slate-200 shadow-sm flex items-center space-x-3">
              <div className="flex space-x-1.5">
                <div className="w-2.5 h-2.5 bg-blue-900 rounded-full animate-bounce [animation-delay:-0.3s]" />
                <div className="w-2.5 h-2.5 bg-amber-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                <div className="w-2.5 h-2.5 bg-emerald-600 rounded-full animate-bounce" />
              </div>
              <span className="text-xs text-slate-600 font-times italic">
                Hiệu trưởng Hoàng Thị Ngọc Bích đang phân tích ngữ cảnh và tra cứu thông tin thời gian thực...
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Questions Pills */}
      <div className="bg-slate-50/90 border-t border-slate-200 px-4 py-2.5">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center space-x-1.5 text-xs text-slate-600 font-bold mb-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Tình huống thực tế gợi ý ({currentCategoryObj ? currentCategoryObj.shortTitle : '5 Chuyên đề'}):</span>
          </div>
          <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar pb-1">
            {(currentCategoryObj
              ? currentCategoryObj.suggestedQuestions
              : ADVISORY_CATEGORIES.flatMap((c) => c.suggestedQuestions.slice(0, 1))
            ).map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(q)}
                disabled={isLoading}
                className="flex-shrink-0 bg-white hover:bg-blue-50 text-slate-800 text-xs px-3 py-1.5 rounded-full border border-slate-300 hover:border-blue-400 transition-all text-left shadow-2xs cursor-pointer flex items-center space-x-1 max-w-sm truncate"
                title={q}
              >
                <span className="text-blue-900 font-bold">Q:</span>
                <span className="truncate">{q}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Input Box & Microphone Controls */}
      <div className="bg-white border-t border-slate-200 p-4 shadow-lg">
        <div className="max-w-4xl mx-auto">
          
          {/* Active Voice Recording Status Bar with Waveform & Controls */}
          {isRecording && (
            <div className="mb-3 p-3 bg-gradient-to-r from-red-950 via-slate-900 to-blue-950 border-2 border-amber-500 rounded-xl text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-3 animate-in fade-in duration-200">
              <div className="flex items-center space-x-3 w-full sm:w-auto">
                <div className="relative flex items-center justify-center">
                  <span className="animate-ping absolute inline-flex h-8 w-8 rounded-full bg-red-400 opacity-75"></span>
                  <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-white relative z-10 shadow-md">
                    <Mic className="w-4 h-4" />
                  </div>
                </div>

                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-amber-300 uppercase tracking-wide">
                      Đang thu âm & Nhận diện giọng nói
                    </span>
                    <span className="bg-red-600/80 text-white text-[10px] font-mono px-2 py-0.5 rounded-full font-bold">
                      {formatTimer(recordingSeconds)}
                    </span>
                  </div>
                  
                  {/* Live Soundwave Visualizer Bars */}
                  <div className="flex items-center space-x-1 mt-1">
                    {[16, 28, 12, 36, 20, 32, 14, 24, 30, 18, 26, 12].map((height, i) => (
                      <div
                        key={i}
                        className="w-1 bg-amber-400 rounded-full animate-pulse"
                        style={{
                          height: `${Math.max(6, (height * (Math.sin(recordingSeconds * 3 + i) + 1.2)) / 2)}px`,
                          animationDelay: `${i * 0.1}s`,
                          animationDuration: '0.6s'
                        }}
                      />
                    ))}
                    <span className="text-[11px] text-slate-300 ml-2 italic">
                      {autoSendVoice ? 'Hệ thống sẽ tự động gửi khi thầy/cô ngưng nói...' : 'Nói xong bấm Gửi ngay'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Controls inside recording banner */}
              <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
                <label className="flex items-center space-x-1.5 text-[11px] text-slate-200 bg-white/10 hover:bg-white/20 px-2.5 py-1.5 rounded-lg cursor-pointer border border-white/20">
                  <input
                    type="checkbox"
                    checked={autoSendVoice}
                    onChange={(e) => setAutoSendVoice(e.target.checked)}
                    className="w-3.5 h-3.5 accent-amber-400 rounded cursor-pointer"
                  />
                  <span className="select-none">Tự động gửi</span>
                </label>

                <button
                  onClick={cancelRecording}
                  className="text-xs bg-slate-700 hover:bg-slate-600 text-slate-200 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer"
                  title="Hủy thu âm này"
                >
                  Hủy
                </button>

                <button
                  onClick={finishAndSendRecording}
                  className="text-xs bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 px-3.5 py-1.5 rounded-lg font-bold transition-all shadow-md active:scale-95 flex items-center space-x-1 cursor-pointer"
                  title="Hoàn tất thu âm và gửi câu hỏi ngay"
                >
                  <span>Hoàn tất & Gửi</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          <div className="flex items-end space-x-2.5">
            {/* Direct Microphone Button (1-Click Instant Start) */}
            <button
              id="btn-voice-mic"
              onClick={toggleListening}
              className={`p-3 rounded-xl flex-shrink-0 transition-all shadow-md cursor-pointer flex items-center justify-center relative ${
                isRecording
                  ? 'bg-red-600 hover:bg-red-700 text-white ring-4 ring-red-300 animate-pulse'
                  : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 border border-amber-600 active:scale-95'
              }`}
              title={isRecording ? 'Đang thu âm - Nhấp để Hoàn tất & Tự động gửi' : 'Nhấp vào Mic để nói trực tiếp (Chạy ngay, tự động gửi câu hỏi)'}
            >
              {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            {/* Textarea */}
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  isRecording 
                    ? "Đang nhận diện giọng nói của thầy/cô trực tiếp..." 
                    : "Nhập câu hỏi hoặc nhấp Mic để nói (VD: Áp lực hồ sơ sổ sách, ứng xử phụ huynh khiếu nại, phương pháp dạy học STEM...)..."
                }
                rows={2}
                disabled={isLoading}
                className="w-full px-4 py-2.5 text-[13.5px] font-times border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-900 focus:border-blue-900 bg-[#f8fafc] resize-none leading-relaxed text-slate-900 shadow-inner"
              />
            </div>

            {/* Send Button */}
            <button
              id="btn-send-chat"
              onClick={() => handleSend()}
              disabled={isLoading || (!inputText.trim() && !isRecording)}
              className={`p-3 rounded-xl flex-shrink-0 font-bold transition-all shadow-md cursor-pointer flex items-center justify-center ${
                !inputText.trim() && !isRecording || isLoading
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-blue-900 hover:bg-blue-800 text-white active:scale-95 shadow-blue-950/20'
              }`}
              title="Gửi câu hỏi (Enter)"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 px-1 font-times">
            <span>
              💡 <i>Nhấp vào Micro để nói (tự động nhận diện & gửi dữ liệu). Nhấn Enter để gửi phím gõ.</i>
            </span>
            <span className="font-semibold text-slate-600">
              Hotline: (+84) 984331898
            </span>
          </div>

        </div>
      </div>

    </div>
  );
};
