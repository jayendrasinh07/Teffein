import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Star, Heart, ThumbsUp, Send } from 'lucide-react';

export const FeedbackModal: React.FC = () => {
  const { isFeedbackModalOpen, setIsFeedbackModalOpen, submitCustomerFeedback } = useApp();

  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>(['Home-style Taste', 'Hot & Fresh', 'Low Oil']);

  if (!isFeedbackModalOpen) return null;

  const availableTags = [
    'Home-style Taste',
    'Low Oil',
    'Soft Phulkas',
    'Hot & Fresh',
    'Punctual Delivery',
    'Delicious Dal Tadka',
    'Chilled Chaas',
    'Good Portion',
    'Mild Spices',
    'Clean Packaging'
  ];

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitCustomerFeedback(rating, comment || 'Loved today’s phulkas and dal tadka! Perfect home taste.', selectedTags);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-stone-200 overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-[#107048] text-white p-5 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-extrabold tracking-wider text-amber-300">
              Daily Quality Loop
            </span>
            <h3 className="text-lg font-bold text-white leading-tight">Rate Today's Meal (GDM-2841)</h3>
          </div>
          <button
            onClick={() => setIsFeedbackModalOpen(false)}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Star Rating */}
          <div className="text-center">
            <div className="text-xs text-stone-500 font-medium mb-2">How was your lunch today?</div>
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1.5 focus:outline-none transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-8 h-8 ${
                      (hoverRating || rating) >= star
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-stone-300'
                    }`}
                  />
                </button>
              ))}
            </div>
            <div className="text-xs font-bold text-emerald-800 mt-1">
              {rating === 5 && '🌟 Outstanding Authentic Home Taste!'}
              {rating === 4 && '👍 Very Good & Fresh'}
              {rating === 3 && '👌 Satisfactory Home Meal'}
              {rating === 2 && '⚠️ Needs Attention'}
              {rating === 1 && '❌ Not as Expected'}
            </div>
          </div>

          {/* Quick Tags */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-2">What did you like the most?</label>
            <div className="flex flex-wrap gap-1.5">
              {availableTags.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    type="button"
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      isSelected
                        ? 'bg-emerald-100 text-emerald-900 border border-emerald-300 ring-1 ring-emerald-400'
                        : 'bg-stone-100 text-stone-600 border border-stone-200 hover:bg-stone-200'
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Comment */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Any specific note for Maharaj / Chef? (Optional)
            </label>
            <textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="e.g. Ringan Olo had the perfect smoky flavor. Keep oil controlled just like this!"
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-[#107048] hover:bg-[#0A4E32] text-white text-sm font-bold shadow-md shadow-emerald-950/20 flex items-center justify-center gap-2 transition-colors"
            >
              <Send className="w-4 h-4" />
              <span>Submit Meal Rating</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
