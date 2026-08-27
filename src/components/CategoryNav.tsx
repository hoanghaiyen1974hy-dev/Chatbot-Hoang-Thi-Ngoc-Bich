import React from 'react';
import { 
  HeartHandshake, 
  BookOpen, 
  CheckSquare, 
  Users, 
  ShieldAlert, 
  LayoutGrid 
} from 'lucide-react';
import { AdvisoryCategory } from '../types';
import { ADVISORY_CATEGORIES } from '../data/knowledgeBase';
import { audioSpeech } from '../utils/audioSpeech';

interface CategoryNavProps {
  activeCategory: AdvisoryCategory | 'all';
  onSelectCategory: (cat: AdvisoryCategory | 'all') => void;
}

export const CategoryNav: React.FC<CategoryNavProps> = ({
  activeCategory,
  onSelectCategory,
}) => {
  const getIcon = (id: string) => {
    switch (id) {
      case 'tam_ly':
        return <HeartHandshake className="w-4 h-4" />;
      case 'phuong_phap':
        return <BookOpen className="w-4 h-4" />;
      case 'kiem_tra_danh_gia':
        return <CheckSquare className="w-4 h-4" />;
      case 'ung_xu_phu_huynh':
        return <Users className="w-4 h-4" />;
      case 'thao_go_mau_thuan':
        return <ShieldAlert className="w-4 h-4" />;
      default:
        return <LayoutGrid className="w-4 h-4" />;
    }
  };

  return (
    <div className="bg-white border-b border-blue-100/90 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
        <div className="flex items-center justify-between overflow-x-auto no-scrollbar gap-2 pb-1">
          {/* All topics button */}
          <button
            id="nav-cat-all"
            onClick={() => {
              audioSpeech.playClickSound();
              onSelectCategory('all');
            }}
            className={`flex-shrink-0 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold flex items-center space-x-2 transition-all cursor-pointer ${
              activeCategory === 'all'
                ? 'bg-blue-900 text-white shadow-sm ring-2 ring-blue-900/30'
                : 'bg-slate-50 text-slate-700 hover:bg-blue-50/60 border border-slate-200'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            <span className="whitespace-nowrap">Tổng hợp 5 Chuyên đề</span>
          </button>

          {/* 5 Core categories */}
          {ADVISORY_CATEGORIES.map((cat, idx) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                id={`nav-cat-${cat.id}`}
                onClick={() => {
                  audioSpeech.playClickSound();
                  onSelectCategory(cat.id);
                }}
                className={`flex-shrink-0 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold flex items-center space-x-2 transition-all cursor-pointer ${
                  isActive
                    ? 'bg-blue-900 text-white shadow-sm ring-2 ring-blue-900/30'
                    : 'bg-blue-50/40 text-slate-800 hover:bg-blue-100/70 border border-blue-200/60'
                }`}
                title={cat.description}
              >
                <span className={isActive ? 'text-amber-300' : 'text-blue-900'}>
                  {getIcon(cat.id)}
                </span>
                <span className="whitespace-nowrap">
                  {idx + 1}. {cat.shortTitle}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
