export type AdvisoryCategory = 
  | 'tam_ly'
  | 'phuong_phap'
  | 'kiem_tra_danh_gia'
  | 'ung_xu_phu_huynh'
  | 'thao_go_mau_thuan';

export interface CategoryInfo {
  id: AdvisoryCategory;
  title: string;
  shortTitle: string;
  iconName: string;
  badgeColor: string;
  description: string;
  keyPrinciples: string[];
  suggestedQuestions: string[];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  text: string;
  timestamp: string;
  category?: AdvisoryCategory;
  isVoice?: boolean;
  audioBlobUrl?: string;
  legalCitations?: string[];
  groundingSources?: { title: string; url: string }[];
  administrativeForm?: {
    type: string;
    title: string;
    number?: string;
  };
}

export interface DocumentReference {
  id: string;
  title: string;
  number: string;
  issuingAuthority: string;
  date: string;
  summary: string;
  keyPoints: string[];
  category: AdvisoryCategory | 'chung';
}

export interface AdministrativeTemplate {
  id: string;
  name: string;
  type: 'cong_van' | 'thong_bao' | 'bien_ban' | 'to_trinh' | 'ke_hoach';
  standard: 'Nghị định 30/2020/NĐ-CP' | 'Hướng dẫn số 07/HD-SGDĐT';
  description: string;
  sampleContent: string;
}

export interface VoiceSettings {
  pitch: number;
  rate: number;
  volume: number;
  autoSpeak: boolean;
  voiceName: string;
}
