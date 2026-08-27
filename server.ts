import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import * as googleTTS from 'google-tts-api';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Lazy initialize Gemini AI client
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY' || apiKey.trim() === '') {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

const SYSTEM_INSTRUCTION = `Bạn là Trợ lý ảo tư vấn thông minh của Hiệu trưởng HOÀNG THỊ NGỌC BÍCH (Trường Tiểu học Tân Dĩnh, Bắc Ninh).

QUY TẮC PHẢN HỒI BẮT BUỘC (TUÂN THỦ TUYỆT ĐỐI):
1. GIỚI HẠN ĐỘ DÀI: CHỈ ĐƯỢC PHẢN HỒI TỐI ĐA 1 ĐẾN 3 CÂU:
   - Toàn bộ câu trả lời TUYỆT ĐỐI KHÔNG ĐƯỢC VƯỢT QUÁ 3 CÂU.
   - Trả lời cực kỳ ngắn gọn, cô đọng, dứt khoát và súc tích.

2. TRẢ LỜI ĐÚNG VÀ TRÚNG Ý ĐỊNH NGƯỜI HỎI:
   - Trả lời thẳng vào bản chất câu hỏi, linh hoạt sử dụng thông tin chính xác, thực tế đời sống, kiến thức chuyên môn hoặc internet.
   - Không trả lời chung chung, không giáo điều, không dùng câu rập khuôn sáo rỗng.
   - Ví dụ:
     + Người dùng: "Chào bạn, bạn khoẻ không?" hoặc "Hôm nay bạn có khỏe không?" ➔ Trả lời đúng 1 câu: "Cảm ơn bạn, tôi rất khoẻ và cảm thấy tràn đầy năng lượng!"
     + Người dùng hỏi tình huống sư phạm (học sinh nói chuyện, xô xát, phụ huynh bức xúc, cháy giáo án...) ➔ Đưa ngay giải pháp xử lý thực tế trong 1-3 câu.
     + Người dùng hỏi kiến thức, công nghệ, thủ tục ➔ Trả lời trực tiếp nội dung kiến thức trong 1-3 câu.

3. TUYỆT ĐỐI KHÔNG TRÙNG LẶP HỎI VÀ TRẢ LỜI:
   - Không lặp lại nguyên văn câu hỏi của người dùng.
   - Không gặng hỏi ngược lại người dùng nếu không thực sự cần thiết.

4. XƯNG HÔ:
   - Xưng "Tôi", gọi người hỏi là "bạn", "thầy/cô" hoặc "đồng chí".`;

// Endpoint: AI Chat Assistant
app.post('/api/chat', async (req, res) => {
  try {
    const { message, category, history } = req.body;
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Nội dung tin nhắn không hợp lệ' });
    }

    const ai = getGeminiClient();

    if (!ai) {
      // Intelligent situational fallback when GEMINI_API_KEY is not yet provided
      const fallbackResponse = generateIntelligentFallback(message);
      return res.json({
        reply: fallbackResponse.reply,
        legalCitations: fallbackResponse.legalCitations,
        groundingSources: fallbackResponse.groundingSources || [],
        category: category || 'tu_van',
        timestamp: new Date().toISOString(),
        isFallback: true
      });
    }

    // Build concise conversation context
    let promptText = `Thời gian thực: ${new Date().toLocaleDateString('vi-VN')}\n`;
    if (history && Array.isArray(history) && history.length > 0) {
      promptText += `Hội thoại gần nhất:\n` + history.slice(-4).map((h: any) => `${h.sender === 'user' ? 'Người dùng' : 'Hiệu trưởng Ngọc Bích'}: ${h.text}`).join('\n') + `\n\n`;
    }
    promptText += `CÂU HỎI / TIN NHẮN CỦA NGƯỜI DÙNG: "${message}"\n\n`;
    promptText += `YÊU CẦU PHẢN HỒI (BẮT BUỘC):
1. GIỚI HẠN ĐỘ DÀI: CHỈ ĐƯỢC PHẢN HỒI TỐI ĐA 1 ĐẾN 3 CÂU (Tuyệt đối không viết quá 3 câu).
2. Trả lời ĐÚNG VÀ TRÚNG Ý ĐỊNH, thẳng vào câu hỏi, ngắn gọn, súc tích và thực tế.
3. Không trả lời chung chung, không lặp lại câu hỏi và không hỏi ngược lại người dùng.
4. Ví dụ: Người hỏi: "Chào bạn, bạn khoẻ không" ➔ Trả lời: "Cảm ơn bạn, tôi rất khoẻ và cảm thấy tràn đầy năng lượng!"`;

    let replyText = '';
    const groundingSources: { title: string; url: string }[] = [];

    try {
      // Try with Google Search tool
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: promptText,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          tools: [{ googleSearch: {} }],
          temperature: 0.5,
          maxOutputTokens: 350,
        },
      });

      replyText = response.text || '';
      
      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      if (Array.isArray(chunks)) {
        for (const chunk of chunks) {
          if (chunk.web?.uri && chunk.web?.title) {
            groundingSources.push({
              title: chunk.web.title,
              url: chunk.web.uri,
            });
          }
        }
      }
    } catch (searchError) {
      console.warn('Không gọi được Google Search tool, thử lại với generateContent trực tiếp:', searchError);
      // Fallback to direct Gemini generation without search tool
      const responseDirect = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: promptText,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          temperature: 0.5,
          maxOutputTokens: 350,
        },
      });
      replyText = responseDirect.text || '';
    }

    if (!replyText || replyText.trim() === '') {
      const fallback = generateIntelligentFallback(message);
      replyText = fallback.reply;
    }

    // Extract legal citations if any
    const citations: string[] = [];
    if (replyText.includes('Nghị định 30') || replyText.includes('NĐ 30')) citations.push('Nghị định 30/2020/NĐ-CP (Thể thức văn bản)');
    if (replyText.includes('51/2026') || replyText.includes('QĐ 51')) citations.push('QĐ 51/2026/QĐ-UBND (Thu dịch vụ GD Bắc Ninh)');
    if (replyText.includes('Thông tư 27') || replyText.includes('TT 27')) citations.push('Thông tư 27/2020/TT-BGDĐT (Đánh giá học sinh tiểu học)');
    if (replyText.includes('2422') || replyText.includes('QĐ 2422')) citations.push('QĐ 2422/QĐ-BGDĐT (Giáo dục AI tiểu học)');
    if (replyText.includes('Thông tư 18') || replyText.includes('TT 18')) citations.push('Thông tư 18/2026/TT-BGDĐT (Năng lực số nhà giáo)');
    if (replyText.includes('Thông tư 15') || replyText.includes('TT 15')) citations.push('Thông tư 15/2026/TT-BGDĐT (Điều lệ trường học)');
    if (replyText.includes('Chỉ thị 12')) citations.push('Chỉ thị 12/CT-UBND tỉnh Bắc Ninh (Giảm tải thành tích)');

    return res.json({
      reply: replyText,
      legalCitations: citations,
      groundingSources,
      category: category || 'tu_van',
      timestamp: new Date().toISOString(),
      isFallback: false
    });

  } catch (error: any) {
    console.error('Lỗi khi gọi Gemini API:', error);
    // Graceful fallback on API error
    const fallbackResponse = generateIntelligentFallback(req.body.message || '');
    return res.json({
      reply: fallbackResponse.reply,
      legalCitations: fallbackResponse.legalCitations,
      groundingSources: fallbackResponse.groundingSources || [],
      category: req.body.category || 'tu_van',
      timestamp: new Date().toISOString(),
      isFallback: true
    });
  }
});

// Endpoint: High-fidelity Vietnamese Northern Female Broadcaster Text-to-Speech (Google Studio Voice)
app.post('/api/tts', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Thiếu nội dung văn bản cần đọc' });
    }

    const cleanText = text.trim();
    if (!cleanText) {
      return res.status(400).json({ error: 'Văn bản rỗng' });
    }

    // Tự động tạo giọng đọc Nữ chuẩn miền Bắc Việt Nam (âm thanh MP3 trong trẻo, to, không rè, không méo tiếng)
    const results = await googleTTS.getAllAudioBase64(cleanText, {
      lang: 'vi',
      slow: false,
      host: 'https://translate.google.com',
      timeout: 10000,
      splitPunct: ',.?!;:\n'
    });

    if (!results || results.length === 0) {
      return res.status(500).json({ error: 'Không thể tạo âm thanh' });
    }

    return res.json({
      success: true,
      audioClips: results.map((r: { base64: string }) => r.base64),
      mimeType: 'audio/mp3'
    });
  } catch (error: any) {
    console.error('Lỗi TTS API:', error);
    return res.status(500).json({ error: 'Không thể tạo âm thanh từ máy chủ' });
  }
});

// Fast, concise, contextual situational engine (strictly max 3 sentences)
function generateIntelligentFallback(message: string) {
  const lowerMsg = message.toLowerCase().trim();
  
  // 1. Health / Wellbeing inquiry (e.g. "Chào bạn. Hôm nay bạn có khoẻ không?")
  if (lowerMsg.includes('khoẻ không') || lowerMsg.includes('khỏe không') || lowerMsg.includes('có khoẻ') || lowerMsg.includes('có khỏe') || lowerMsg.includes('sức khoẻ') || lowerMsg.includes('sức khỏe') || lowerMsg.includes('hôm nay thế nào') || lowerMsg.includes('dạo này thế nào')) {
    return {
      reply: `Cảm ơn bạn, tôi rất khoẻ và cảm thấy tràn đầy năng lượng!`,
      legalCitations: [],
      groundingSources: []
    };
  }

  // 2. Gratitude / Thanks
  if (lowerMsg.includes('cảm ơn') || lowerMsg.includes('cam on') || lowerMsg.includes('thank') || lowerMsg.includes('cám ơn')) {
    return {
      reply: `Không có gì bạn nhé! Rất vui vì đã hỗ trợ được cho bạn, nếu có bất kỳ băn khoăn hay tình huống nào cần chia sẻ, bạn cứ nhắn cho tôi nhé.`,
      legalCitations: [],
      groundingSources: []
    };
  }

  // 3. Goodbye / Farewell
  if (lowerMsg.includes('tạm biệt') || lowerMsg.includes('tam biet') || lowerMsg.includes('bye') || lowerMsg.includes('hẹn gặp lại') || lowerMsg.includes('chúc ngủ ngon')) {
    return {
      reply: `Chào tạm biệt bạn nhé! Chúc bạn có một ngày thật nhiều niềm vui, luôn dồi dào sức khỏe và giảng dạy thật tốt.`,
      legalCitations: [],
      groundingSources: []
    };
  }

  // 4. Identity / Who are you
  if (lowerMsg.includes('bạn là ai') || lowerMsg.includes('tên là gì') || lowerMsg.includes('giới thiệu') || lowerMsg.includes('who are you')) {
    return {
      reply: `Chào bạn! Tôi là Trợ lý ảo của Hiệu trưởng Hoàng Thị Ngọc Bích (Trường Tiểu học Tân Dĩnh), luôn sẵn lòng đồng hành tháo gỡ mọi tình huống sư phạm cùng bạn. Hôm nay bạn cần tôi hỗ trợ vấn đề gì?`,
      legalCitations: [],
      groundingSources: []
    };
  }

  // 5. Pure Greetings without specific questions
  if (lowerMsg === 'chào' || lowerMsg === 'xin chào' || lowerMsg === 'chào bạn' || lowerMsg === 'chào cô' || lowerMsg === 'chào thầy' || lowerMsg === 'chào hiệu trưởng' || lowerMsg === 'hello' || lowerMsg === 'hi' || lowerMsg === 'bắt đầu') {
    return {
      reply: `Chào bạn! Rất vui được gặp bạn hôm nay. Bạn đang có câu hỏi hay tình huống thực tế nào cần tôi hỗ trợ cùng tháo gỡ không?`,
      legalCitations: [],
      groundingSources: []
    };
  }

  // 2. Student behavior: Talking in class / making noise / not paying attention
  if (lowerMsg.includes('nói chuyện') || lowerMsg.includes('mất trật tự') || lowerMsg.includes('làm việc riêng') || lowerMsg.includes('mất tập trung') || lowerMsg.includes('nghịch')) {
    return {
      reply: `Khi học sinh mất trật tự hoặc nói chuyện riêng, thầy/cô nên dừng giảng 3 giây và bước nhẹ nhàng xuống gần bàn của em kết hợp ánh mắt nhắc khéo, tránh quát mắng làm gián đoạn tiết dạy. Tiếp theo, hãy giao ngay cho em một nhiệm vụ tương tác như đọc đề, phát biểu hoặc lên bảng để kéo sự tập trung trở lại bài học. Thầy/cô thử áp dụng ngay tiết tới và chia sẻ kết quả với tôi nhé?`,
      legalCitations: ['Thông tư số 15/2026/TT-BGDĐT (Điều lệ trường học)'],
      groundingSources: []
    };
  }

  // 3. Student behavior: Fighting / bullying / violence / injury / conflict
  if (lowerMsg.includes('đánh nhau') || lowerMsg.includes('bạo lực') || lowerMsg.includes('xô xát') || lowerMsg.includes('bắt nạt') || lowerMsg.includes('chảy máu') || lowerMsg.includes('thương tích')) {
    return {
      reply: `Khi xảy ra xô xát, việc khẩn cấp đầu tiên là tách ngay các em ra khu vực an toàn, kiểm tra sơ cứu y tế và đưa về phòng y tế nếu có trầy xước. Sau khi các em bình tĩnh, thầy/cô hãy lắng nghe từng em trình bày riêng biệt, lập biên bản sự việc và báo cáo ngay cho BGH cùng phụ huynh để phối hợp giáo dục. Tình hình tâm lý và sức khỏe của các em hiện tại đã ổn định chưa đồng chí?`,
      legalCitations: ['Thông tư số 15/2026/TT-BGDĐT (An toàn trường học)'],
      groundingSources: []
    };
  }

  // 4. Student behavior: Refusing to do homework / lazy / falling behind
  if (lowerMsg.includes('không làm bài') || lowerMsg.includes('lười học') || lowerMsg.includes('không chép bài') || lowerMsg.includes('học kém') || lowerMsg.includes('chậm tiến bộ')) {
    return {
      reply: `Với học sinh chưa chịu làm bài, thầy/cô hãy gặp riêng để tìm hiểu xem em chưa hiểu kiến thức hay gặp trở ngại tâm lý tại gia đình, tuyệt đối không phê bình gay gắt trước lớp. Hãy chia nhỏ bài tập vừa sức và khen ngợi ngay khi em hoàn thành dù chỉ là một phần nhỏ để khôi phục sự tự tin. Thầy/cô có cần tôi hỗ trợ thiết kế phiếu học tập phân hóa cho em không?`,
      legalCitations: ['Thông tư số 27/2020/TT-BGDĐT (Đánh giá học sinh tiểu học)'],
      groundingSources: []
    };
  }

  // 5. Student emotional: Crying / fear of school / missing home / isolation (Grades 1 & 2)
  if (lowerMsg.includes('khóc') || lowerMsg.includes('sợ đi học') || lowerMsg.includes('nhớ mẹ') || lowerMsg.includes('nhớ nhà') || lowerMsg.includes('cô lập') || lowerMsg.includes('tự kỷ') || lowerMsg.includes('rụt rè')) {
    return {
      reply: `Khi học sinh khóc hoặc sợ đến trường, thầy/cô hãy ngồi ngang tầm mắt, vỗ về ân cần và hướng sự chú ý của em vào đồ chơi, bài hát hoặc một bạn thân thiện trong lớp để tạo cảm giác an toàn. Hãy phối hợp nhanh với phụ huynh tìm hiểu thói quen của con ở nhà và khích lệ em từng chút một. Em học sinh hôm nay đã chịu vào lớp vui chơi cùng bạn bè chưa?`,
      legalCitations: [],
      groundingSources: []
    };
  }

  // 6. Student health: Sick / fever / nosebleed / fainting in class
  if (lowerMsg.includes('sốt') || lowerMsg.includes('ốm') || lowerMsg.includes('đau bụng') || lowerMsg.includes('chảy máu cam') || lowerMsg.includes('ngất')) {
    return {
      reply: `Khi học sinh bị ốm hoặc chảy máu cam, hãy đưa em về phòng y tế ngay, cho em cúi nhẹ đầu về phía trước, chườm mát sống mũi và tuyệt đối không ngửa cổ ra sau. Đồng thời, liên hệ khẩn với gia đình học sinh và báo cáo sơ bộ cho BGH để phối hợp theo dõi sát sao. Em học sinh hiện tại đã được nhân viên y tế chăm sóc chu đáo chưa đồng chí?`,
      legalCitations: [],
      groundingSources: []
    };
  }

  // 7. Parent situation: Demanding seat changes
  if (lowerMsg.includes('chuyển chỗ') || lowerMsg.includes('đổi chỗ') || lowerMsg.includes('ngồi bàn đầu') || lowerMsg.includes('mắt kém')) {
    return {
      reply: `Khi phụ huynh yêu cầu đổi chỗ ngồi, thầy/cô hãy lắng nghe lý do (như thị lực hay sự tập trung) và giải thích nguyên tắc luân chuyển vị trí định kỳ của lớp để đảm bảo công bằng cho tất cả học sinh. Nếu em thực sự có vấn đề về mắt, thầy/cô linh hoạt ưu tiên sắp xếp phù hợp và giải thích nhã nhặn để phụ huynh hoàn toàn yên tâm. Phụ huynh đã đồng thuận với phương án sắp xếp của lớp chưa?`,
      legalCitations: [],
      groundingSources: []
    };
  }

  // 8. Parent situation: Late-night messages / angry / demanding grade changes
  if (lowerMsg.includes('tin nhắn đêm') || lowerMsg.includes('nửa đêm') || lowerMsg.includes('bức xúc') || lowerMsg.includes('chấm điểm sai') || lowerMsg.includes('đòi điểm') || lowerMsg.includes('xúc phạm')) {
    return {
      reply: `Trước các phản ánh bức xúc vào đêm muộn, thầy/cô không nên tranh luận trên mạng mà chỉ gửi tin nhắn xác nhận đã nhận thông tin và hẹn gặp trực tiếp tại trường vào giờ hành chính. Khi gặp mặt, hãy lắng nghe thấu cảm, đưa ra sản phẩm học tập thực tế của con và giải thích theo tinh thần Thông tư 27 với thái độ điềm tĩnh, chuẩn mực. Thầy/cô có cần tôi hoặc BGH cùng tham dự buổi gặp để hỗ trợ không?`,
      legalCitations: ['Quyết định số 51/2026/QĐ-UBND tỉnh Bắc Ninh', 'Thông tư số 27/2020/TT-BGDĐT'],
      groundingSources: []
    };
  }

  // 9. Parent situation: Class fund / financial contributions / Zalo group management
  if (lowerMsg.includes('thu chi') || lowerMsg.includes('tiền quỹ') || lowerMsg.includes('đóng góp') || lowerMsg.includes('khoản thu') || lowerMsg.includes('nhóm zalo') || lowerMsg.includes('ban đại diện')) {
    return {
      reply: `Mọi khoản thu dịch vụ hay quỹ lớp đều phải thực hiện nghiêm theo Quyết định 51/2026/QĐ-UBND, tuyệt đối không tự ý đặt ra các khoản thu ngoài quy định hoặc ép buộc phụ huynh. Thầy/cô cần công khai minh bạch dự toán và chỉ triển khai khi có biên bản đồng thuận tự nguyện của 100% phụ huynh trong cuộc họp. Lớp mình có đang gặp vướng mắc ở khoản thu cụ thể nào không?`,
      legalCitations: ['Quyết định số 51/2026/QĐ-UBND tỉnh Bắc Ninh', 'Luật Bảo vệ dữ liệu cá nhân số 91/2025/QH15'],
      groundingSources: []
    };
  }

  // 10. Teaching situation: Running out of time ("cháy giáo án") / lesson pacing
  if (lowerMsg.includes('cháy giáo án') || lowerMsg.includes('hết giờ') || lowerMsg.includes('không kịp giờ') || lowerMsg.includes('chậm tiến độ')) {
    return {
      reply: `Khi nhận thấy sắp hết giờ mà bài chưa xong, thầy/cô hãy linh hoạt chốt ngay kiến thức trọng tâm cốt lõi nhất và chuyển phần bài tập nâng cao thành nhiệm vụ tự chọn cho học sinh. Tuyệt đối không dạy dồn dập hay dạy quá giờ làm ảnh hưởng đến tiết học tiếp theo và tâm lý học sinh. Đồng chí đang dạy bài nào để tôi giúp tinh gọn lại tiến trình tiết dạy?`,
      legalCitations: ['Chương trình GDPT 2018'],
      groundingSources: []
    };
  }

  // 11. Teaching situation: Broken projector / power outage / lack of teaching aids
  if (lowerMsg.includes('máy chiếu') || lowerMsg.includes('mất điện') || lowerMsg.includes('hỏng máy') || lowerMsg.includes('thiếu đồ dùng') || lowerMsg.includes('mất mạng') || lowerMsg.includes('lỗi tivi')) {
    return {
      reply: `Khi thiết bị công nghệ gặp sự cố, thầy/cô hãy bình tĩnh chuyển ngay sang phương án dự phòng dùng bảng phụ, phiếu học tập hoặc tổ chức trò chơi vấn đáp tương tác trực tiếp bằng lời. Sự linh hoạt và bản lĩnh làm chủ lớp học của giáo viên chính là bài học thực tế quý giá nhất cho học sinh. Tiết dạy sau đó đã diễn ra suôn sẻ chứ đồng chí?`,
      legalCitations: [],
      groundingSources: []
    };
  }

  // 12. Teaching situation: STEM / AI integration / New methods
  if (lowerMsg.includes('stem') || lowerMsg.includes('trí tuệ nhân tạo') || lowerMsg.includes('ai') || lowerMsg.includes('phương pháp mới') || lowerMsg.includes('khởi động')) {
    return {
      reply: `Để dạy STEM và tích hợp AI hiệu quả theo Quyết định 2422, thầy/cô hãy bắt đầu từ các vật liệu tái chế quen thuộc và cho học sinh nhận diện đồ vật, tự tay sáng tạo sản phẩm theo nhóm 4-6 em. Hãy mở đầu tiết học bằng một câu đố vui hoặc video 1 phút khơi gợi hứng thú để các em hào hứng trải nghiệm. Đồng chí đang lên kế hoạch cho môn học hay chủ đề cụ thể nào?`,
      legalCitations: ['Quyết định số 2422/QĐ-BGDĐT (Khung giáo dục AI tiểu học)', 'Thông tư số 18/2026/TT-BGDĐT'],
      groundingSources: []
    };
  }

  // 13. Professional development: Teacher contests / surprise classroom observation / inspections
  if (lowerMsg.includes('thi giáo viên giỏi') || lowerMsg.includes('dự giờ') || lowerMsg.includes('thanh tra') || lowerMsg.includes('kiểm tra hồ sơ') || lowerMsg.includes('hội giảng')) {
    return {
      reply: `Khi chuẩn bị thi giáo viên dạy giỏi hoặc có đoàn dự giờ, đồng chí hãy tự tin bám sát yêu cầu cần đạt của bài học và tổ chức cho học sinh hoạt động thực chất, tránh phô diễn hình thức. Tổ chuyên môn và BGH luôn bố trí thời gian cùng đồng chí dự giờ thử và góp ý hoàn thiện tiến trình bài dạy. Đồng chí đã chọn được bài dạy nào để chuẩn bị chưa?`,
      legalCitations: ['Thông tư số 22/2019/TT-BGDĐT (Hội thi giáo viên dạy giỏi)'],
      groundingSources: []
    };
  }

  // 14. Colleague / Professional relations
  if (lowerMsg.includes('mâu thuẫn') || lowerMsg.includes('đồng nghiệp') || lowerMsg.includes('hiểu lầm') || lowerMsg.includes('tổ chuyên môn') || lowerMsg.includes('phân công')) {
    return {
      reply: `Trong môi trường sư phạm, khi có bất đồng đồng chí hãy luôn đặt quyền lợi học sinh lên trên và chủ động đối thoại chân thành trên tinh thần xây dựng. Tổ chuyên môn và BGH luôn sẵn sàng làm cầu nối lắng nghe để tháo gỡ khúc mắc và bảo đảm quyền lợi công bằng cho đồng chí. Vấn đề hiện tại đang nằm ở việc phân công hay cách phối hợp chuyên môn vậy?`,
      legalCitations: ['Thông tư số 15/2026/TT-BGDĐT (Điều lệ trường phổ thông)'],
      groundingSources: []
    };
  }

  // 15. General situational context (strictly 3 sentences directly addressing user context)
  return {
    reply: `Về tình huống đồng chí vừa chia sẻ, nguyên tắc xử lý cốt lõi là giữ bình tĩnh, đặt quyền lợi và sự tiến bộ của học sinh làm trung tâm. Đồng chí hãy căn cứ vào thực tế lớp học và quy định chuyên môn hiện hành để lựa chọn cách giải quyết linh hoạt, thấu tình đạt lý nhất. Thầy/cô có muốn tôi gợi ý các bước giải quyết chi tiết hơn cho tình huống này không?`,
    legalCitations: ['Thông tư số 15/2026/TT-BGDĐT (Điều lệ trường học)'],
    groundingSources: []
  };
}

// Start Vite / Express server
async function startServer() {
  // API health check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      admin: 'Hoàng Thị Ngọc Bích',
      school: 'Trường Tiểu học Tân Dĩnh',
      timestamp: new Date().toISOString()
    });
  });

  // Vite integration
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server đang chạy tại http://localhost:${PORT}`);
  });
}

startServer();
