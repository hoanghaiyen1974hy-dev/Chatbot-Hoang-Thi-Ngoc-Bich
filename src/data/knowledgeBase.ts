import { AdvisoryCategory, CategoryInfo, DocumentReference, AdministrativeTemplate } from '../types';

export const ADMIN_INFO = {
  name: 'Hoàng Thị Ngọc Bích',
  title: 'Hiệu trưởng',
  school: 'Trường Tiểu học Tân Dĩnh',
  location: 'Xã Tân Dĩnh, Huyện Lạng Giang / Tỉnh Bắc Ninh',
  hotline: '(+84) 984331898',
  experience: 'Hơn 30 năm kinh nghiệm trong ngành Giáo dục Tiểu học',
  avatarUrl: 'https://i.ibb.co/HD7KpwJ4/nh2.png',
  backupPassword: 'Hoang@Bich1',
  marqueeText: 'Xin chào các bạn đến với Trợ lý ảo tư vấn giáo viên – Admin: Hoàng Thị Ngọc Bích – Hiệu trưởng – Trường Tiểu học Tân Dĩnh – xã Tân Dĩnh - Tỉnh Bắc Ninh. Hotline: (+84) 984331898.',
};

export const ADVISORY_CATEGORIES: CategoryInfo[] = [
  {
    id: 'tam_ly',
    title: '1. Tư vấn Tâm lý Giáo viên',
    shortTitle: 'Tâm lý Giáo viên',
    iconName: 'HeartHandshake',
    badgeColor: 'bg-rose-100 text-rose-800 border-rose-300',
    description: 'Chăm sóc sức khỏe tinh thần, giải tỏa stress, hội chứng kiệt sức (burnout), cân bằng công việc - gia đình và tái tạo nhiệt huyết sư phạm.',
    keyPrinciples: [
      'Lắng nghe không phán xét, thấu cảm với áp lực dạy học và hồ sơ sổ sách.',
      'Nhận diện sớm các dấu hiệu quá tải tâm lý và khủng hoảng cảm xúc.',
      'Khuyến khích nguyên tắc tự chăm sóc: nghỉ ngơi hợp lý, ranh giới công việc ngoài giờ.',
      'Xây dựng môi trường sư phạm nhân văn: yêu thương, chia sẻ và đồng hành.'
    ],
    suggestedQuestions: [
      'Tôi đang bị quá tải vì vừa dạy học vừa làm hồ sơ số hóa, Hiệu trưởng có lời khuyên gì giúp tôi cân bằng?',
      'Làm thế nào để kiềm chế cảm xúc khi học sinh trong lớp liên tục mất trật tự và chống đối?',
      'Tôi là giáo viên mới ra trường, cảm thấy lo lắng thiếu tự tin khi đứng lớp, xin ý kiến tư vấn giải tỏa áp lực?',
      'Cách nhận biết và vượt qua hội chứng kiệt sức nghề nghiệp (burnout) của nhà giáo tiểu học?'
    ]
  },
  {
    id: 'phuong_phap',
    title: '2. Tư vấn Phương pháp Dạy học',
    shortTitle: 'Phương pháp Dạy học',
    iconName: 'BookOpen',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
    description: 'Đổi mới phương pháp dạy học theo Chương trình GDPT 2018; ứng dụng STEM/STEAM, sư phạm số, giáo dục AI (QĐ 2422), mô hình 4C và dạy học phân hóa.',
    keyPrinciples: [
      'Chuyển từ truyền thụ một chiều sang phát triển phẩm chất và năng lực người học.',
      'Ứng dụng mô hình 4C (Context - Challenge - Concept - Conclusion) và Storytelling.',
      'Tích hợp giáo dục STEM/STEAM và Trí tuệ nhân tạo (AI) trực quan, không gây quá tải.',
      'Dạy học phân hóa, phát huy tính tích cực, chủ động, sáng tạo của học sinh tiểu học.'
    ],
    suggestedQuestions: [
      'Hướng dẫn thiết kế một tiết dạy STEM tiểu học 35 phút đơn giản, tiết kiệm và cuốn hút?',
      'Làm sao để tích hợp nội dung giáo dục Trí tuệ nhân tạo (AI) cho học sinh lớp 3-4 theo QĐ 2422/QĐ-BGDĐT?',
      'Cách áp dụng phương pháp kể chuyện (Storytelling) và mô hình 4C trong môn Tự nhiên & Xã hội?',
      'Phương pháp dạy học phân hóa cho lớp có học sinh tiếp thu chậm và học sinh năng khiếu?'
    ]
  },
  {
    id: 'kiem_tra_danh_gia',
    title: '3. Tư vấn Kiểm tra Đánh giá Học sinh',
    shortTitle: 'Kiểm tra Đánh giá',
    iconName: 'CheckSquare',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    description: 'Đánh giá học sinh tiểu học theo Thông tư 27/2020/TT-BGDĐT; đánh giá vì sự tiến bộ, không áp đặt thành tích, Gamification, Học bạ số và Thông tư 57/2026/TT-BGDĐT.',
    keyPrinciples: [
      'Đánh giá vì sự tiến bộ của học sinh, tôn trọng sự khác biệt, không so sánh học sinh.',
      'Kết hợp hài hòa giữa đánh giá thường xuyên (nhận xét thấu cảm) và đánh giá định kỳ.',
      'Không giao chỉ tiêu áp đặt thành tích, nghiêm cấm chạy theo tỷ lệ ảo theo Chỉ thị 12/CT-UBND.',
      'Ứng dụng Học bạ số, hồ sơ học tập điện tử (Portfolio) và Gamification (Quizizz, Wordwall).'
    ],
    suggestedQuestions: [
      'Cách viết lời nhận xét thường xuyên ấm áp, mang tính động viên theo Thông tư 27/2020/TT-BGDĐT?',
      'Khung thời gian tổ chức kiểm tra định kỳ các khối lớp theo hướng dẫn năm học 2026-2027?',
      'Làm thế nào để đánh giá sự tiến bộ của học sinh khuyết tật học hòa nhập một cách công bằng, nhân văn?',
      'Quy trình quản lý, ký số và đồng bộ dữ liệu Học bạ số theo chỉ đạo của Sở GDĐT Bắc Ninh?'
    ]
  },
  {
    id: 'ung_xu_phu_huynh',
    title: '4. Tư vấn Ứng xử với Phụ huynh',
    shortTitle: 'Ứng xử với Phụ huynh',
    iconName: 'Users',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-300',
    description: 'Giao tiếp thấu cảm, "Khen ngợi công khai, góp ý riêng tư", tuân thủ Khung giờ vàng (07h00-19h00), công khai minh bạch thu chi theo QĐ 51/2026/QĐ-UBND và phòng ngừa xung đột.',
    keyPrinciples: [
      'Nguyên tắc vàng giao tiếp: "Khen ngợi công khai sự nỗ lực, góp ý riêng tư bảo vệ tự trọng".',
      'Tuân thủ khung giờ tương tác điện tử (07h00 - 19h00) để tôn trọng quyền riêng tư đôi bên.',
      'Minh bạch tuyệt đối các khoản thu dịch vụ phục vụ giáo dục theo đúng 5 bước QĐ 51/2026/QĐ-UBND.',
      'Điềm tĩnh, lắng nghe cầu thị, bảo vệ dữ liệu cá nhân học sinh và phối hợp gia đình - nhà trường.'
    ],
    suggestedQuestions: [
      'Phụ huynh bức xúc nhắn tin gay gắt vào nhóm Zalo lớp vào ban đêm, tôi nên xử lý thế nào?',
      'Quy trình 5 bước lấy ý kiến phụ huynh về các khoản thu dịch vụ theo QĐ 51/2026/QĐ-UBND tỉnh Bắc Ninh?',
      'Làm sao để phối hợp với phụ huynh hỗ trợ học sinh nghiện điện thoại, lơ là việc học tại nhà?',
      'Cách tổ chức buổi họp phụ huynh đầu năm học đổi mới, tạo sự gắn kết và đồng thuận cao?'
    ]
  },
  {
    id: 'thao_go_mau_thuan',
    title: '5. Tư vấn Tháo gỡ Mâu thuẫn Đồng nghiệp',
    shortTitle: 'Mâu thuẫn Đồng nghiệp',
    iconName: 'ShieldAlert',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-300',
    description: 'Ứng xử chuẩn mực theo Điều lệ trường tiểu học (Thông tư 15/2026/TT-BGDĐT), sinh hoạt chuyên môn theo nghiên cứu bài học, cố vấn đồng đẳng 1 kèm 1 và giải tỏa bất đồng.',
    keyPrinciples: [
      'Đặt quyền lợi của học sinh và danh dự nhà giáo lên trên bất đồng cá nhân.',
      'Sinh hoạt chuyên môn dựa trên nghiên cứu bài học: cùng xây dựng, không soi mói cá nhân.',
      'Mô hình cố vấn đồng đẳng (1 kèm 1): giáo viên trẻ thạo công nghệ hỗ trợ giáo viên giàu kinh nghiệm.',
      'Giải quyết tranh chấp trên tinh thần xây dựng, dân chủ, thẳng thắn và đúng thẩm quyền.'
    ],
    suggestedQuestions: [
      'Tôi và đồng nghiệp cùng khối bất đồng gay gắt về cách chia thời khóa biểu và phân công chuyên môn?',
      'Làm thế nào để gắn kết giữa giáo viên lớn tuổi ngại công nghệ và giáo viên trẻ mới ra trường?',
      'Khi bị đồng nghiệp hiểu lầm hoặc nói xấu sau lưng trong trường, Hiệu trưởng khuyên tôi nên hành xử ra sao?',
      'Cách tổ chức buổi sinh hoạt chuyên môn theo nghiên cứu bài học dân chủ, không gây áp lực cho người dạy?'
    ]
  }
];

export const LEGAL_DOCUMENTS: DocumentReference[] = [
  {
    id: 'doc_qd51',
    title: 'Quyết định số 51/2026/QĐ-UBND ngày 03/7/2026 của UBND tỉnh Bắc Ninh',
    number: '51/2026/QĐ-UBND',
    issuingAuthority: 'UBND tỉnh Bắc Ninh',
    date: '03/7/2026',
    summary: 'Quy định cơ chế thu và sử dụng mức thu dịch vụ tuyển sinh, danh mục và mức thu dịch vụ phục vụ và hỗ trợ hoạt động giáo dục trong cơ sở giáo dục công lập tỉnh Bắc Ninh.',
    keyPoints: [
      'Trình tự 5 bước: (1) Lập dự toán thu chi; (2) Hoàn thiện dự thảo; (3) Tổ chức lấy ý kiến cha mẹ học sinh (Mẫu 01, Mẫu 02); (4) Lập hồ sơ trình thẩm định (Mẫu 03); (5) Thẩm định và phê duyệt (Mẫu 04) trước 25/9.',
      'Mức trần: Tiền ăn bán trú tự nấu tối đa 30.000đ/ngày, đặt suất ăn 35.000đ/ngày; thuê người nấu ăn/phục vụ 150.000đ/tháng; quản lý bán trú 150.000đ/tháng; nước uống 10.000đ/tháng; vệ sinh trường 15.000đ/tháng.',
      'Tỷ lệ phân bổ chi: Dạy kỹ năng sống, STEM, ngoại ngữ tự chọn thì chi giáo viên trực tiếp tối thiểu 80%, chi quản lý tối đa 10%.',
      'Quản lý học sinh bán trú: Chi trả giáo viên trực tiếp trông chăm sóc tối thiểu 85%.'
    ],
    category: 'ung_xu_phu_huynh'
  },
  {
    id: 'doc_tt18',
    title: 'Thông tư số 18/2026/TT-BGDĐT ngày 27/3/2026 của Bộ GDĐT',
    number: '18/2026/TT-BGDĐT',
    issuingAuthority: 'Bộ Giáo dục và Đào tạo',
    date: '27/3/2026',
    summary: 'Ban hành Khung năng lực số đối với giáo viên, cán bộ quản lý cơ sở giáo dục mầm non, phổ thông và GDTX.',
    keyPoints: [
      'Cấu trúc 6 miền năng lực: (1) Tổ chức dạy học trong môi trường số; (2) Kiểm tra, đánh giá số; (3) Trao quyền cho người học; (4) Kỹ năng công nghệ số; (5) Phát triển chuyên môn; (6) Ứng dụng Trí tuệ nhân tạo (AI).',
      'Miền 6 (AI): Tư duy lấy con người làm trung tâm, Đạo đức AI, Sư phạm AI, AI cho phát triển chuyên môn.',
      '3 cấp độ đánh giá: Cơ bản - Thành thạo - Nâng cao.'
    ],
    category: 'phuong_phap'
  },
  {
    id: 'doc_qd2422',
    title: 'Quyết định số 2422/QĐ-BGDĐT ngày 18/8/2026 của Bộ GDĐT',
    number: '2422/QĐ-BGDĐT',
    issuingAuthority: 'Bộ Giáo dục và Đào tạo',
    date: '18/8/2026',
    summary: 'Ban hành Khung nội dung giáo dục Trí tuệ nhân tạo (AI) cho học sinh phổ thông.',
    keyPoints: [
      '4 mạch kiến thức: Tư duy lấy con người làm trung tâm (NLa); Đạo đức AI (NLb); Kỹ thuật & ứng dụng AI (NLc); Thiết kế hệ thống AI (NLd).',
      'Tiểu học: Trải nghiệm AI trực quan qua tranh ảnh, thẻ bài, trò chơi, đóng vai, không yêu cầu tạo tài khoản cá nhân; thời lượng 12 tiết/lớp/năm học.',
      'Không tổ chức bài thi hoặc chấm điểm riêng cho giáo dục AI, đánh giá quá trình là chủ đạo.'
    ],
    category: 'phuong_phap'
  },
  {
    id: 'doc_tt15',
    title: 'Thông tư số 15/2026/TT-BGDĐT ngày 24/3/2026 của Bộ GDĐT',
    number: '15/2026/TT-BGDĐT',
    issuingAuthority: 'Bộ Giáo dục và Đào tạo',
    date: '24/3/2026',
    summary: 'Ban hành Điều lệ trường tiểu học, trường THCS, trường THPT và trường phổ thông có nhiều cấp học.',
    keyPoints: [
      'Quy định cơ cấu tổ chức, nhiệm vụ và quyền hạn của Hiệu trưởng, Phó Hiệu trưởng, Tổ chuyên môn, Tổ văn phòng.',
      'Quy định chuẩn nghề nghiệp, quy tắc ứng xử của nhà giáo và nhân viên hỗ trợ giáo dục.',
      'Quy định quyền và nhiệm vụ của học sinh, quan hệ phối hợp giữa Nhà trường - Gia đình - Xã hội.'
    ],
    category: 'thao_go_mau_thuan'
  },
  {
    id: 'doc_tt27',
    title: 'Thông tư số 27/2020/TT-BGDĐT của Bộ Giáo dục và Đào tạo',
    number: '27/2020/TT-BGDĐT',
    issuingAuthority: 'Bộ Giáo dục và Đào tạo',
    date: '04/9/2020',
    summary: 'Quy định đánh giá học sinh tiểu học theo định hướng phát triển phẩm chất và năng lực.',
    keyPoints: [
      'Đánh giá thường xuyên bằng nhận xét (lời nói, viết), ghi nhận sự tiến bộ cụ thể của học sinh.',
      'Đánh giá định kỳ bằng điểm số kết hợp nhận xét các môn học theo quy định.',
      'Đánh giá vì sự tiến bộ của người học, không so sánh học sinh, không gây áp lực cho phụ huynh và học sinh.'
    ],
    category: 'kiem_tra_danh_gia'
  },
  {
    id: 'doc_ct12',
    title: 'Chỉ thị số 12/CT-UBND ngày 15/8/2026 của UBND tỉnh Bắc Ninh',
    number: '12/CT-UBND',
    issuingAuthority: 'UBND tỉnh Bắc Ninh',
    date: '15/8/2026',
    summary: 'Về việc thực hiện nhiệm vụ, giải pháp trọng tâm năm học 2026-2027 trên địa bàn tỉnh Bắc Ninh.',
    keyPoints: [
      'Chủ đề xuyên suốt: "Đổi mới tư duy - Chuyển biến mạnh mẽ - Kết quả thực chất".',
      'Chuyển từ "quản lý giáo dục" sang "quản trị phát triển giáo dục", không giao chỉ tiêu thành tích áp đặt.',
      'Đẩy mạnh chuyển đổi số toàn diện, học bạ số, an toàn trường học, giáo dục STEM/STEAM và AI.'
    ],
    category: 'chung'
  },
  {
    id: 'doc_sotay_ai',
    title: 'Sổ tay AI phiên bản 2.0 (2026) - UBND tỉnh Bắc Ninh',
    number: 'Sổ tay AI v2.0/2026',
    issuingAuthority: 'Sở KH&CN tỉnh Bắc Ninh (KS. Nguyễn Giang Tuấn)',
    date: '2026',
    summary: 'Cẩm nang ứng dụng Trí tuệ nhân tạo, kỹ năng số và khai thác dữ liệu số phục vụ công tác chuyên môn.',
    keyPoints: [
      'Nguyên tắc HITL (Human-in-the-Loop): Con người luôn giữ vai trò quyết định và chịu trách nhiệm cuối cùng.',
      'Công thức câu lệnh B.V.N.Đ: Bối cảnh - Vai trò - Nhiệm vụ - Định dạng.',
      'Mô hình chuyển hóa dữ liệu DIKW: Dữ liệu -> Thông tin -> Tri thức -> Trí tuệ.',
      '3 Ranh giới đỏ: Tuyệt đối không nhập bí mật nhà nước, bảo vệ dữ liệu cá nhân (ẩn danh hóa), cảnh giác ảo giác AI.'
    ],
    category: 'chung'
  },
  {
    id: 'doc_kh151',
    title: 'Kế hoạch số 151/KH-UBND ngày 17/8/2026 của UBND xã Tân Dĩnh',
    number: '151/KH-UBND',
    issuingAuthority: 'UBND xã Tân Dĩnh',
    date: '17/8/2026',
    summary: 'Triển khai các nhiệm vụ, giải pháp trọng tâm tiếp tục đẩy mạnh Phong trào "Bình dân học vụ số" trên địa bàn xã Tân Dĩnh.',
    keyPoints: [
      'Mô hình "Đại sứ số" trong trường học: 100% học sinh tiểu học & THCS hướng dẫn kỹ năng số an toàn cho ông bà, cha mẹ.',
      'Chỉ tiêu 100% cán bộ, giáo viên hoàn thành bồi dưỡng trên nền tảng binhdanhocvuso.gov.vn.',
      'Tổ chức hỗ trợ người dân tại Nhà văn hóa thôn và trường học.'
    ],
    category: 'chung'
  }
];

export const ADMINISTRATIVE_TEMPLATES: AdministrativeTemplate[] = [
  {
    id: 'tpl_cv_dondoc',
    name: 'Công văn đôn đốc thực hiện nhiệm vụ chuyên môn',
    type: 'cong_van',
    standard: 'Nghị định 30/2020/NĐ-CP',
    description: 'Mẫu công văn hành chính chuẩn thể thức NĐ 30/2020 gồm Căn cứ, Nội dung chỉ đạo và Thời hạn hoàn thành.',
    sampleContent: `PHÒNG GIÁO DỤC VÀ ĐÀO TẠO
TRƯỜNG TIỂU HỌC TÂN DĨNH
Số: .../TH-TD
V/v đôn đốc thực hiện báo cáo chuyên môn và kế hoạch giáo dục năm học 2026-2027

CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
Độc lập - Tự do - Hạnh phúc
Tân Dĩnh, ngày ... tháng ... năm 2026

Kính gửi: Các Tổ chuyên môn, Giáo viên chủ nhiệm trường Tiểu học Tân Dĩnh

Căn cứ Chỉ thị số 12/CT-UBND ngày 15/8/2026 của UBND tỉnh Bắc Ninh về nhiệm vụ trọng tâm năm học 2026-2027;
Căn cứ Hướng dẫn thực hiện nhiệm vụ giáo dục tiểu học năm học 2026-2027 của Sở GDĐT Bắc Ninh;
Hiệu trưởng Trường Tiểu học Tân Dĩnh yêu cầu các Tổ chuyên môn và giáo viên thực hiện các nội dung sau:

1. Rà soát và hoàn thiện kế hoạch bài dạy (giáo án số), tích hợp nội dung giáo dục STEM/STEAM và giáo dục AI theo Quyết định số 2422/QĐ-BGDĐT.
2. Hoàn thành việc cập nhật dữ liệu học sinh, hồ sơ sổ sách điện tử trên hệ thống trước 17h00 ngày 25/9/2026.
3. Tổ trưởng chuyên môn kiểm tra, ký duyệt điện tử và báo cáo kết quả về Ban Giám hiệu đúng thời hạn.

Yêu cầu các đồng chí nghiêm túc triển khai thực hiện./.

Nơi nhận:
- Như kính gửi;
- Ban Giám hiệu;
- Lưu: VT, CM.

HIỆU TRƯỞNG
(Ký, đóng dấu, ghi rõ họ tên)
Hoàng Thị Ngọc Bích`
  },
  {
    id: 'tpl_tb_ketluan',
    name: 'Thông báo kết luận cuộc họp giao ban chuyên môn',
    type: 'thong_bao',
    standard: 'Nghị định 30/2020/NĐ-CP',
    description: 'Mẫu thông báo kết luận cuộc họp theo chuẩn 3 phần: Đánh giá tình hình - Quan điểm chỉ đạo - Phân công thực hiện (rõ người, rõ việc, rõ tiến độ).',
    sampleContent: `TRƯỜNG TIỂU HỌC TÂN DĨNH
Số: .../TB-TH-TD
THÔNG BÁO
Kết luận của Hiệu trưởng tại cuộc họp giao ban chuyên môn tháng ... năm 2026

CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
Độc lập - Tự do - Hạnh phúc
Tân Dĩnh, ngày ... tháng ... năm 2026

Ngày ... tháng ... năm 2026, Trường Tiểu học Tân Dĩnh đã tổ chức cuộc họp giao ban chuyên môn do đồng chí Hoàng Thị Ngọc Bích - Hiệu trưởng chủ trì. Sau khi nghe báo cáo và các ý kiến thảo luận, Hiệu trưởng kết luận như sau:

I. ĐÁNH GIÁ TÌNH HÌNH
1. Ưu điểm: Các tổ khối đã chủ động xây dựng kế hoạch dạy học, nề nếp lớp học ổn định, việc ứng dụng học liệu số bước đầu đạt kết quả tích cực.
2. Tồn tại: Việc ghi nhận xét đánh giá thường xuyên trên phần mềm một số đồng chí còn chậm; cần tăng cường giải pháp hỗ trợ học sinh có hoàn cảnh khó khăn.

II. QUAN ĐIỂM VÀ NHIỆM VỤ TRỌNG TÂM
1. Kiên quyết thực hiện đúng tinh thần "Đổi mới tư duy - Chuyển biến mạnh mẽ - Kết quả thực chất", không áp đặt bệnh thành tích.
2. Tuyệt đối tuân thủ quy chế tương tác với phụ huynh: "Khen ngợi công khai, góp ý riêng tư", tuân thủ khung giờ vàng 07h00 - 19h00.

III. TỔ CHỨC THỰC HIỆN
1. Đồng chí Phó Hiệu trưởng phụ trách chuyên môn: Đôn đốc sinh hoạt chuyên môn theo nghiên cứu bài học, hoàn thành trước ngày 20 hàng tháng.
2. Các Tổ trưởng chuyên môn: Xây dựng chuyên đề STEM liên môn khối 3, 4, 5 trước ngày 25 hàng tháng.
3. Giáo viên chủ nhiệm: Rà soát 100% học sinh diện chính sách để nhà trường có phương án hỗ trợ kịp thời.

Nhà trường thông báo để các bộ phận và cá nhân liên quan nghiêm túc thực hiện./.

Nơi nhận:
- Toàn thể CB, GV, NV;
- Lưu: VT, BGH.

HIỆU TRƯỞNG
Hoàng Thị Ngọc Bích`
  },
  {
    id: 'tpl_bien_ban_thu_chi',
    name: 'Biên bản họp phụ huynh về các khoản thu dịch vụ (Mẫu 02 - QĐ 51)',
    type: 'bien_ban',
    standard: 'Hướng dẫn số 07/HD-SGDĐT',
    description: 'Biên bản họp cha mẹ học sinh lớp về dự thảo các khoản thu dịch vụ phục vụ, hỗ trợ hoạt động giáo dục theo Quyết định 51/2026/QĐ-UBND.',
    sampleContent: `TRƯỜNG TIỂU HỌC TÂN DĨNH
LỚP: ......

CỘNG HOÀ XÃ HỘI CHỦ NGHĨA VIỆT NAM
Độc lập - Tự do - Hạnh phúc

BIÊN BẢN HỌP CHA MẸ HỌC SINH LỚP
Về việc lấy ý kiến dự thảo các khoản thu dịch vụ phục vụ, hỗ trợ hoạt động giáo dục năm học 2026-2027

Hôm nay, ngày ... tháng ... năm 2026, tại phòng học lớp ..., Trường Tiểu học Tân Dĩnh.
Thành phần tham dự:
- Giáo viên chủ nhiệm: ....................................................
- Cha mẹ học sinh tham gia: ... / ... phụ huynh (vắng: ...).
- Thư ký cuộc họp do hội nghị bầu: Ông/Bà .................................

NỘI DUNG:
1. Tuyên truyền Quyết định số 51/2026/QĐ-UBND ngày 03/7/2026 của UBND tỉnh Bắc Ninh và Hướng dẫn số 07/HD-SGDĐT.
2. Thảo luận, xin ý kiến dự thảo danh mục và mức thu các khoản dịch vụ:
   - Tiền ăn bán trú tự nấu: Dự kiến ... đ/ngày (tối đa 30.000đ).
   - Thuê người nấu ăn, phục vụ bán trú: Dự kiến ... đ/tháng (tối đa 150.000đ).
   - Quản lý học sinh bán trú: Dự kiến ... đ/tháng (tối đa 150.000đ).
   - Nước uống học sinh: Dự kiến ... đ/tháng (tối đa 10.000đ).
   - Vệ sinh trường học: Dự kiến ... đ/tháng (tối đa 15.000đ).
   - Giáo dục kỹ năng sống / STEM: Dự kiến ... đ/tiết (theo thỏa thuận tự nguyện).

3. Ý kiến thảo luận của cha mẹ học sinh:
...............................................................................................

4. Kết quả biểu quyết:
- Đồng ý: ... / ... phụ huynh có mặt (chiếm tỷ lệ: ...%).
- Không đồng ý: ... ý kiến (lý do: .......................................).
- Ý kiến khác: ...

Cuộc họp kết thúc hồi ... giờ ... cùng ngày, biên bản được đọc thông qua toàn thể hội nghị nhất trí ký tên./.

ĐẠI DIỆN CMHS LỚP          THƯ KÝ HỘI NGHỊ          CHỦ TỌA (GVCN)
(Ký và ghi rõ họ tên)     (Ký và ghi rõ họ tên)    (Ký và ghi rõ họ tên)`
  }
];
