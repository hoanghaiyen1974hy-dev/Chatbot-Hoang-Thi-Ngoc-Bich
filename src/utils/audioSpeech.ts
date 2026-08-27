/**
 * Audio and Speech Synthesizer Utility
 * Chuẩn giọng Nữ phát thanh viên Tiếng Việt giọng miền Bắc (Hà Nội chuẩn)
 * Lời nói to, rõ ràng, tròn vành rõ chữ, giòn nẩy, truyền cảm, trong trẻo, không bị rè méo tiếng.
 */

class AudioSpeechManager {
  private synth: SpeechSynthesis | null = null;
  private audioCtx: AudioContext | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private currentAudioElement: HTMLAudioElement | null = null;
  private isCanceled: boolean = false;
  private cachedVoices: SpeechSynthesisVoice[] = [];

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.loadVoices();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = () => this.loadVoices();
      }
    }
  }

  private loadVoices() {
    if (this.synth) {
      this.cachedVoices = this.synth.getVoices();
    }
  }

  private getAudioContext(): AudioContext {
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.audioCtx = new AudioContextClass();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  /**
   * Bộ lọc nghiêm ngặt tuyển chọn ĐÚNG Giọng Nữ phát thanh viên truyền hình Tiếng Việt miền Bắc
   * Loại bỏ 100% các giọng Nam (như Microsoft An, Microsoft Nam, Google Male...)
   */
  public getVietnameseFemaleVoice(preferredVoiceName?: string): { voice: SpeechSynthesisVoice | null; isVerifiedFemale: boolean } {
    if (!this.synth) return { voice: null, isVerifiedFemale: false };
    let voices = this.synth.getVoices();
    if (!voices || voices.length === 0) {
      voices = this.cachedVoices;
    }
    if (!voices || voices.length === 0) return { voice: null, isVerifiedFemale: false };

    // Danh sách các từ khóa GIỌNG NAM CẤM CHỌN
    const isMale = (name: string): boolean => {
      const n = name.toLowerCase();
      return (
        n.includes('microsoft an') ||
        n.includes('an online') ||
        n.includes('voice-an') ||
        n.includes('microsoft nam') ||
        n.includes('(nam)') ||
        n.includes(' nam ') ||
        n.endsWith(' nam') ||
        n.startsWith('nam ') ||
        n.includes('male') ||
        n.includes('man') ||
        n.includes('minh') ||
        n.includes('hung') ||
        n.includes('hùng') ||
        n.includes('trung') ||
        n.includes('david') ||
        n.includes('mark') ||
        n.includes('george') ||
        n.includes('guy') ||
        n.includes('stefan') ||
        n.includes('richard') ||
        n.includes('james') ||
        n.includes('-vic') ||
        n.includes('-vid') ||
        n.includes('-via')
      );
    };

    // Danh sách các từ khóa GIỌNG NỮ TIÊU CHUẨN ĐƯỢC XÁC THỰC
    const isFemale = (name: string): boolean => {
      const n = name.toLowerCase();
      return (
        n.includes('hoaimy') || // Microsoft HoaiMy Online (Natural) - Chuẩn Nữ phát thanh viên miền Bắc VTV
        n.includes('hoài my') ||
        n.includes('linh') || // Apple Linh (Natural / Enhanced)
        n.includes('mai') ||
        n.includes('chi') ||
        n.includes('thao') ||
        n.includes('thảo') ||
        n.includes('huong') ||
        n.includes('hương') ||
        n.includes('ngoc') ||
        n.includes('ngọc') ||
        n.includes('lan') ||
        n.includes('hoa') ||
        n.includes('thu') ||
        n.includes('trang') ||
        n.includes('quynh') ||
        n.includes('quỳnh') ||
        n.includes('yen') ||
        n.includes('yến') ||
        n.includes('female') ||
        n.includes('nữ') ||
        n.includes('woman') ||
        n.includes('zira') ||
        n.includes('susan') ||
        n.includes('jenny')
      );
    };

    // 1. Nếu người dùng chọn đích danh trong cài đặt
    if (preferredVoiceName && preferredVoiceName !== 'default') {
      const matched = voices.find(v => v.name === preferredVoiceName);
      if (matched && !isMale(matched.name)) {
        return { voice: matched, isVerifiedFemale: isFemale(matched.name) };
      }
    }

    // 2. Lọc các giọng Tiếng Việt
    const viVoices = voices.filter(v => {
      const lang = v.lang.toLowerCase();
      const name = v.name.toLowerCase();
      return (
        lang.startsWith('vi') || 
        lang.includes('vn') || 
        name.includes('vietnam') || 
        name.includes('tiếng việt')
      );
    });

    // 3. Ưu tiên số 1: Giọng Nữ Tiếng Việt miền Bắc chuẩn (HoaiMy Natural / Linh Natural / Mai / Chi)
    const priorityFemaleOrder = [
      'hoaimy', // Microsoft HoaiMy Online (Natural) - Giọng Nữ Hà Nội phát thanh viên chuẩn VTV
      'hoài my',
      'linh (natural)',
      'linh (enhanced)',
      'linh',
      'vietnam female',
      'mai',
      'chi',
      'ngoc',
      'thao',
      'huong',
      'lan',
      'google tiếng việt'
    ];

    for (const key of priorityFemaleOrder) {
      const found = viVoices.find(v => v.name.toLowerCase().includes(key) && !isMale(v.name));
      if (found) {
        return { voice: found, isVerifiedFemale: true };
      }
    }

    // 4. Ưu tiên số 2: Bất kỳ giọng Tiếng Việt nào là Giọng Nữ (loại trừ 100% giọng Nam)
    const strictlyFemaleVi = viVoices.find(v => isFemale(v.name) && !isMale(v.name));
    if (strictlyFemaleVi) {
      return { voice: strictlyFemaleVi, isVerifiedFemale: true };
    }

    // 5. Nếu không có nhãn nữ rõ ràng, chọn giọng Tiếng Việt KHÔNG PHẢI GIỌNG NAM
    const nonMaleVi = viVoices.find(v => !isMale(v.name));
    if (nonMaleVi) {
      return { voice: nonMaleVi, isVerifiedFemale: false };
    }

    // 6. Trường hợp dự phòng trên toàn bộ thiết bị (tìm giọng Nữ có hỗ trợ đa ngôn ngữ)
    const genericFemale = voices.find(v => isFemale(v.name) && !isMale(v.name));
    if (genericFemale) {
      return { voice: genericFemale, isVerifiedFemale: true };
    }

    return { voice: null, isVerifiedFemale: false };
  }

  /**
   * Xử lý và chuẩn hóa văn bản phát thanh để giọng đọc to, tròn vành, rõ ràng, không bị rè, vấp hay nuốt chữ
   */
  public preprocessTextForBroadcast(rawText: string): string {
    if (!rawText) return '';

    let text = rawText;

    // 1. Loại bỏ đường dẫn URL, HTML tag, code block
    text = text.replace(/https?:\/\/\S+/gi, '');
    text = text.replace(/<[^>]*>/g, ' ');
    text = text.replace(/```[\s\S]*?```/g, ' ');

    // 2. Loại bỏ hoàn toàn Emoji và ký tự đặc biệt gây rè hoặc nghẹt âm thanh
    text = text.replace(/[\u{1F300}-\u{1F9FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}]/gu, '');
    text = text.replace(/[🌹🌸💐🌺🌻🌼❤️💖💝💕✨🎉🎊🔔💡📌🎓✓✔✕✖★☆➔→⇒►▼▲@#$^&_~`|\\<>{}]/g, ' ');

    // 3. Chuẩn hóa chuyển đổi các ký tự toán học & đơn vị tiền tệ sang từ ngữ tự nhiên
    text = text.replace(/%/g, ' phần trăm ');
    text = text.replace(/\+/g, ' cộng ');
    text = text.replace(/&/g, ' và ');
    text = text.replace(/\b(\d+)\s*(k|k\b)/gi, '$1 nghìn ');
    text = text.replace(/\b(\d+)\s*(đ|vnđ|vnd)\b/gi, '$1 đồng ');
    text = text.replace(/\b(\d+)\/(\d+)\b/g, '$1 trên $2 ');
    text = text.replace(/\b(\d+)\s*-\s*(\d+)\b/g, '$1 đến $2 ');

    // 4. Chuẩn hóa các bước thứ tự để đọc ngắt nghỉ tự nhiên, tròn vành
    text = text.replace(/\b1\.\s+/g, 'Thứ nhất: ');
    text = text.replace(/\b2\.\s+/g, 'Thứ hai: ');
    text = text.replace(/\b3\.\s+/g, 'Thứ ba: ');
    text = text.replace(/\b4\.\s+/g, 'Thứ tư: ');
    text = text.replace(/\b5\.\s+/g, 'Thứ năm: ');
    text = text.replace(/\bBước 1[:\-]?\s*/gi, 'Bước một: ');
    text = text.replace(/\bBước 2[:\-]?\s*/gi, 'Bước hai: ');
    text = text.replace(/\bBước 3[:\-]?\s*/gi, 'Bước ba: ');
    text = text.replace(/\bBước 4[:\-]?\s*/gi, 'Bước bốn: ');
    text = text.replace(/\bBước 5[:\-]?\s*/gi, 'Bước năm: ');

    // 5. Chuẩn hóa các văn bản quy phạm pháp luật cụ thể sang Tiếng Việt đầy đủ
    const legalDocuments: [RegExp, string][] = [
      [/\b30\/2020\/NĐ-CP\b/gi, 'Nghị định ba mươi năm hai nghìn không trăm hai mươi của Chính phủ'],
      [/\b27\/2020\/TT-BGDĐT\b/gi, 'Thông tư hai mươi bảy năm hai nghìn không trăm hai mươi của Bộ Giáo dục và Đào tạo'],
      [/\b15\/2026\/TT-BGDĐT\b/gi, 'Thông tư mười lăm năm hai nghìn không trăm hai mươi sáu của Bộ Giáo dục và Đào tạo'],
      [/\b18\/2026\/TT-BGDĐT\b/gi, 'Thông tư mười tám năm hai nghìn không trăm hai mươi sáu của Bộ Giáo dục và Đào tạo'],
      [/\b2422\/QĐ-BGDĐT\b/gi, 'Quyết định hai nghìn bốn trăm hai mươi hai của Bộ Giáo dục và Đào tạo'],
      [/\b51\/2026\/QĐ-UBND\b/gi, 'Quyết định năm mươi mốt năm hai nghìn không trăm hai mươi sáu của Ủy ban nhân dân'],
      [/\b12\/CT-UBND\b/gi, 'Chỉ thị mười hai của Ủy ban nhân dân'],
      [/\b91\/2025\/QH15\b/gi, 'Luật số chín mươi mốt năm hai nghìn không trăm hai mươi lăm của Quốc hội khóa mười lăm'],
      [/\bGDPT\s*2018\b/gi, 'Giáo dục phổ thông hai nghìn không trăm mười tám'],
      [/\bNĐ-CP\b/gi, 'Nghị định Chính phủ'],
      [/\bQĐ-UBND\b/gi, 'Quyết định Ủy ban nhân dân'],
      [/\bCT-UBND\b/gi, 'Chỉ thị Ủy ban nhân dân'],
      [/\bTT-BGDĐT\b/gi, 'Thông tư Bộ Giáo dục và Đào tạo'],
    ];

    for (const [regex, replacement] of legalDocuments) {
      text = text.replace(regex, replacement);
    }

    // 6. Chuẩn hóa toàn bộ từ viết tắt hành chính - giáo dục (TUYỆT ĐỐI KHÔNG ĐỌC TẮT)
    const abbreviations: [RegExp, string][] = [
      [/\bNĐ\b/g, 'Nghị định'],
      [/\bTT\b/g, 'Thông tư'],
      [/\bQĐ\b/g, 'Quyết định'],
      [/\bCT\b/g, 'Chỉ thị'],
      [/\bCV\b/g, 'Công văn'],
      [/\bTB\b/g, 'Thông báo'],
      [/\bBB\b/g, 'Biên bản'],
      [/\bGD&ĐT\b/gi, 'Giáo dục và Đào tạo'],
      [/\bGDĐT\b/gi, 'Giáo dục và Đào tạo'],
      [/\bBGDĐT\b/gi, 'Bộ Giáo dục và Đào tạo'],
      [/\bSGDĐT\b/gi, 'Sở Giáo dục và Đào tạo'],
      [/\bPGDĐT\b/gi, 'Phòng Giáo dục và Đào tạo'],
      [/\bPGD\b/gi, 'Phòng Giáo dục'],
      [/\bGDPT\b/gi, 'Giáo dục phổ thông'],
      [/\bGV\b/g, 'giáo viên'],
      [/\bHS\b/g, 'học sinh'],
      [/\bBGH\b/g, 'Ban Giám hiệu'],
      [/\bHT\b/g, 'Hiệu trưởng'],
      [/\bPHT\b/g, 'Phó Hiệu trưởng'],
      [/\bHP\b/g, 'Phó Hiệu trưởng'],
      [/\bCMHS\b/g, 'cha mẹ học sinh'],
      [/\bPHHS\b/g, 'phụ huynh học sinh'],
      [/\bPH\b/g, 'phụ huynh'],
      [/\bĐ\/c\b/g, 'Đồng chí'],
      [/\bđ\/c\b/g, 'đồng chí'],
      [/\bTHTD\b/g, 'Tiểu học Tân Dĩnh'],
      [/\bSTEM\b/gi, 'mô hình ích tem'],
      [/\bSTEAM\b/gi, 'mô hình ích tim'],
      [/\bAI\b/g, 'trí tuệ nhân tạo'],
      [/\bKHTN\b/g, 'Khoa học Tự nhiên'],
      [/\bKHXH\b/g, 'Khoa học Xã hội'],
      [/\bUBND\b/g, 'Ủy ban nhân dân'],
      [/\bHĐND\b/g, 'Hội đồng nhân dân'],
      [/\bTP\b/g, 'Thành phố'],
      [/\bTX\b/g, 'Thị xã'],
      [/\bBN\b/g, 'Bắc Ninh'],
      [/\bBG\b/g, 'Bắc Giang'],
      [/\bHN\b/g, 'Hà Nội'],
      [/\bPPDH\b/gi, 'phương pháp dạy học'],
      [/\bKHBD\b/gi, 'kế hoạch bài dạy'],
      [/\bGAĐT\b/gi, 'giáo án điện tử'],
      [/\bCNTT\b/gi, 'công nghệ thông tin'],
      [/\bCĐS\b/gi, 'chuyển đổi số'],
      [/\bKTTX\b/gi, 'kiểm tra thường xuyên'],
      [/\bKTĐK\b/gi, 'kiểm tra định kỳ'],
      [/\bTKB\b/gi, 'thời khóa biểu'],
      [/\bTBDH\b/gi, 'thiết bị dạy học'],
      [/\bCSVC\b/gi, 'cơ sở vật chất'],
      [/\bCBQL\b/gi, 'cán bộ quản lý'],
      [/\bNV\b/gi, 'nhân viên'],
      [/\bSHCM\b/gi, 'sinh hoạt chuyên môn'],
      [/\bNCBH\b/gi, 'nghiên cứu bài học'],
      [/\bĐG\b/g, 'đánh giá'],
      [/\bNX\b/g, 'nhận xét'],
      [/\bSTT\b/gi, 'số thứ tự'],
      [/\bv\/v\b/gi, 'về việc'],
      [/\bv\.v\.\.\./gi, 'vân vân'],
      [/\bv\.v\b/gi, 'vân vân'],
    ];

    for (const [regex, replacement] of abbreviations) {
      text = text.replace(regex, replacement);
    }

    // 6. Xóa ký tự gạch chân Markdown, dấu ngoặc vuông/tròn và khoảng trắng thừa
    text = text.replace(/[*#`_~[\]()]/g, ' ');
    text = text.replace(/[\r\n]+/g, '. ');
    text = text.replace(/\s+/g, ' ');
    text = text.replace(/\.+/g, '.');
    text = text.trim();

    return text;
  }

  /**
   * Phân tách văn bản thành các câu ngắn vừa phải (dưới 120 ký tự) để giọng đọc liền mạch, không bị đứt đoạn
   */
  private splitIntoSentences(text: string): string[] {
    const cleaned = this.preprocessTextForBroadcast(text);
    if (!cleaned) return [];

    // Tách theo các dấu câu kết thúc
    const rawChunks = cleaned.split(/(?<=[.!?;\n])\s+/);
    const result: string[] = [];

    let current = '';
    for (const chunk of rawChunks) {
      if ((current + ' ' + chunk).length < 130) {
        current = current ? `${current} ${chunk}` : chunk;
      } else {
        if (current) result.push(current);
        current = chunk;
      }
    }
    if (current) result.push(current);

    return result.filter(s => s.trim().length > 0);
  }

  /**
   * Đọc văn bản theo chuẩn Nữ phát thanh viên miền Bắc:
   * To, rõ ràng, tròn vành rõ chữ, giòn nẩy, truyền cảm, không bị rè méo tiếng.
   * Sử dụng Google Studio Voice (MP3 Studio Quality) và dự phòng Web SpeechSynthesis
   */
  public async speak(
    text: string, 
    options?: { 
      rate?: number; 
      pitch?: number; 
      volume?: number; 
      voiceName?: string;
      onStart?: () => void; 
      onEnd?: () => void; 
      onError?: (err: any) => void; 
    }
  ) {
    this.stop();
    this.isCanceled = false;

    const cleanedText = this.preprocessTextForBroadcast(text);
    if (!cleanedText) {
      options?.onEnd?.();
      return;
    }

    // 1. Sử dụng Google Voice TTS Studio chuẩn Giọng Nữ miền Bắc (MP3 chất lượng phòng thu)
    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: cleanedText })
      });

      if (response.ok && !this.isCanceled) {
        const data = await response.json();
        const clips: string[] = data.audioClips || (data.audioBase64 ? [data.audioBase64] : []);

        if (clips.length > 0) {
          let clipIndex = 0;
          let hasStarted = false;

          const playNextClip = () => {
            if (this.isCanceled || clipIndex >= clips.length) {
              this.currentAudioElement = null;
              if (!this.isCanceled && clipIndex >= clips.length) {
                options?.onEnd?.();
              }
              return;
            }

            const base64Data = clips[clipIndex];
            const audioSrc = `data:audio/mp3;base64,${base64Data}`;
            const audio = new Audio(audioSrc);
            audio.volume = Math.min(1.0, Math.max(0.0, options?.volume ?? 1.0));
            audio.playbackRate = options?.rate ?? 1.0;
            this.currentAudioElement = audio;

            audio.onplay = () => {
              if (!hasStarted) {
                hasStarted = true;
                options?.onStart?.();
              }
            };

            audio.onended = () => {
              this.currentAudioElement = null;
              clipIndex++;
              if (!this.isCanceled) {
                // Nhịp thở tự nhiên giữa các vế câu
                setTimeout(() => {
                  playNextClip();
                }, 80);
              }
            };

            audio.onerror = (err) => {
              console.warn('Audio clip error:', err);
              this.currentAudioElement = null;
              clipIndex++;
              if (!this.isCanceled) {
                playNextClip();
              }
            };

            audio.play().catch((err) => {
              console.warn('Audio play invocation prevented:', err);
              // Fallback to local speech if autoplay blocked
              this.speakWithLocalSynth(cleanedText, options);
            });
          };

          playNextClip();
          return;
        }
      }
    } catch (e) {
      console.warn('AI TTS network fallback to Web SpeechSynthesis:', e);
    }

    // 2. Dự phòng bằng Web Speech Synthesis nếu không có mạng
    this.speakWithLocalSynth(cleanedText, options);
  }

  /**
   * Dự phòng bằng Web Speech Synthesis trên thiết bị
   */
  private speakWithLocalSynth(
    cleanedText: string,
    options?: { 
      rate?: number; 
      pitch?: number; 
      volume?: number; 
      voiceName?: string;
      onStart?: () => void; 
      onEnd?: () => void; 
      onError?: (err: any) => void; 
    }
  ) {
    if (!this.synth) {
      options?.onEnd?.();
      return;
    }

    const sentences = this.splitIntoSentences(cleanedText);
    if (sentences.length === 0) {
      options?.onEnd?.();
      return;
    }

    const { voice, isVerifiedFemale } = this.getVietnameseFemaleVoice(options?.voiceName);
    const rate = options?.rate ?? 0.98;
    const basePitch = options?.pitch ?? 1.05;
    const pitch = isVerifiedFemale ? basePitch : Math.max(basePitch, 1.15);
    const volume = options?.volume ?? 1.0;

    let currentIndex = 0;

    const speakNext = () => {
      if (this.isCanceled || !this.synth || currentIndex >= sentences.length) {
        if (currentIndex >= sentences.length) {
          options?.onEnd?.();
        }
        return;
      }

      const sentence = sentences[currentIndex];
      const utterance = new SpeechSynthesisUtterance(sentence);
      utterance.lang = 'vi-VN';
      utterance.rate = rate;
      utterance.pitch = pitch;
      utterance.volume = volume;

      if (voice) {
        utterance.voice = voice;
      }

      utterance.onstart = () => {
        if (currentIndex === 0) {
          options?.onStart?.();
        }
      };

      utterance.onend = () => {
        currentIndex++;
        setTimeout(() => {
          speakNext();
        }, 90);
      };

      utterance.onerror = (e) => {
        console.warn('TTS utterance chunk error:', e);
        currentIndex++;
        if (currentIndex < sentences.length) {
          speakNext();
        } else {
          options?.onError?.(e);
        }
      };

      this.currentUtterance = utterance;
      this.synth.speak(utterance);
    };

    speakNext();
  }

  public stop() {
    this.isCanceled = true;
    if (this.currentAudioElement) {
      try {
        this.currentAudioElement.pause();
        this.currentAudioElement.currentTime = 0;
      } catch (e) {}
      this.currentAudioElement = null;
    }
    if (this.synth) {
      this.synth.cancel();
      this.currentUtterance = null;
    }
  }

  public isSpeaking(): boolean {
    return !!(!this.isCanceled && (this.currentAudioElement || (this.synth && this.synth.speaking)));
  }

  /**
   * Phát âm thanh reo vui nhẹ nhàng sau tương tác
   */
  public playCelebrationChime() {
    try {
      const ctx = this.getAudioContext();
      const now = ctx.currentTime;

      // Harmony chord: C5 - E5 - G5 - C6
      const notes = [523.25, 659.25, 783.99, 1046.50];
      notes.forEach((freq, index) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + index * 0.08);

        gain.gain.setValueAtTime(0.001, now + index * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.16, now + index * 0.08 + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + index * 0.08 + 0.7);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + index * 0.08);
        osc.stop(now + index * 0.08 + 0.8);
      });
    } catch (e) {
      console.warn('Web Audio note play skipped:', e);
    }
  }

  /**
   * Phát âm click phản hồi
   */
  public playClickSound() {
    try {
      const ctx = this.getAudioContext();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(440, now + 0.05);

      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.06);
    } catch (e) {}
  }
}

export const audioSpeech = new AudioSpeechManager();


