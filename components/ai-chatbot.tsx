"use client";

import { useState, useEffect, useRef } from 'react';
import { generateDialogue, DialoguePractice, getAIStatus } from '@/lib/ai-assistant';
import { MessageSquare, Send, RotateCcw, Loader2, Info } from 'lucide-react';

export function AIChatbot() {
  const [dialogue, setDialogue] = useState<DialoguePractice | null>(null);
  const [currentTurnIndex, setCurrentTurnIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<string>('restaurant');
  const [difficulty, setDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const aiStatus = getAIStatus();

  const topics = [
    { id: 'restaurant', name: '餐厅点餐', icon: '🍽️' },
    { id: 'shopping', name: '购物', icon: '🛍️' },
    { id: 'travel', name: '旅行', icon: '✈️' },
    { id: 'work', name: '工作', icon: '💼' }
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentTurnIndex]);

  const handleStartDialogue = async () => {
    setIsLoading(true);
    try {
      const result = await generateDialogue(selectedTopic, difficulty);
      setDialogue(result);
      setCurrentTurnIndex(0);
      setUserInput('');
    } catch (error) {
      console.error('Failed to generate dialogue:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = () => {
    if (!userInput.trim() || !dialogue) return;

    // 移动到下一轮对话
    if (currentTurnIndex < dialogue.turns.length - 1) {
      setCurrentTurnIndex(currentTurnIndex + 2); // 跳过用户和 AI 的回复
      setUserInput('');
    }
  };

  const handleReset = () => {
    setDialogue(null);
    setCurrentTurnIndex(0);
    setUserInput('');
  };

  const visibleTurns = dialogue ? dialogue.turns.slice(0, currentTurnIndex + 1) : [];
  const currentTurn = dialogue?.turns[currentTurnIndex];
  const isUserTurn = currentTurn?.speaker === 'user';

  return (
    <div className="mx-auto max-w-4xl">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">AI 对话练习</h2>
        <p className="text-sm text-muted">通过真实场景对话提升口语能力</p>
      </div>

      {/* Status Banner */}
      {aiStatus.provider === 'mock' && (
        <div className="mb-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20 p-3">
          <div className="flex items-start gap-2">
            <Info size={16} className="text-yellow-500 mt-0.5" />
            <p className="text-sm text-yellow-200">{aiStatus.message}</p>
          </div>
        </div>
      )}

      {!dialogue ? (
        /* Setup Screen */
        <div className="panel p-8">
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-4">选择对话场景</h3>
            <div className="grid grid-cols-2 gap-3">
              {topics.map((topic) => (
                <button
                  key={topic.id}
                  onClick={() => setSelectedTopic(topic.id)}
                  className={`rounded-lg border p-4 text-left transition ${
                    selectedTopic === topic.id
                      ? 'border-brand bg-brand/20'
                      : 'border-white/10 hover:border-white/20 hover:bg-white/5'
                  }`}
                >
                  <div className="text-2xl mb-2">{topic.icon}</div>
                  <div className="font-medium">{topic.name}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-medium mb-4">选择难度</h3>
            <div className="flex gap-3">
              {(['beginner', 'intermediate', 'advanced'] as const).map((level) => (
                <button
                  key={level}
                  onClick={() => setDifficulty(level)}
                  className={`flex-1 rounded-lg border px-4 py-3 transition ${
                    difficulty === level
                      ? 'border-brand bg-brand/20'
                      : 'border-white/10 hover:border-white/20 hover:bg-white/5'
                  }`}
                >
                  {level === 'beginner' && '初级'}
                  {level === 'intermediate' && '中级'}
                  {level === 'advanced' && '高级'}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleStartDialogue}
            disabled={isLoading}
            className="w-full rounded-lg bg-brand px-6 py-3 font-medium transition hover:opacity-90 disabled:opacity-50"
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <Loader2 size={18} className="animate-spin" />
                生成对话中...
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <MessageSquare size={18} />
                开始对话
              </div>
            )}
          </button>
        </div>
      ) : (
        /* Chat Screen */
        <div className="panel flex flex-col" style={{ height: '600px' }}>
          {/* Chat Header */}
          <div className="flex items-center justify-between border-b border-white/10 p-4">
            <div>
              <h3 className="font-medium">{dialogue.scenario}</h3>
              <p className="text-xs text-muted">
                {currentTurnIndex + 1} / {dialogue.turns.length}
              </p>
            </div>
            <button
              onClick={handleReset}
              className="rounded-lg p-2 transition hover:bg-white/10"
            >
              <RotateCcw size={18} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {visibleTurns.map((turn, index) => (
              <div
                key={index}
                className={`flex ${turn.speaker === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    turn.speaker === 'user'
                      ? 'bg-brand text-white'
                      : 'bg-white/5 border border-white/10'
                  }`}
                >
                  <p className="text-sm leading-relaxed">{turn.text}</p>
                  {turn.translation && (
                    <p className="mt-1 text-xs opacity-70">{turn.translation}</p>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          {currentTurnIndex < dialogue.turns.length && (
            <div className="border-t border-white/10 p-4">
              {isUserTurn ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder={currentTurn.text}
                    className="flex-1 rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm focus:border-brand focus:outline-none"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!userInput.trim()}
                    className="rounded-lg bg-brand px-4 py-3 transition hover:opacity-90 disabled:opacity-50"
                  >
                    <Send size={18} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setCurrentTurnIndex(currentTurnIndex + 1)}
                  className="w-full rounded-lg border border-white/10 px-4 py-3 text-sm transition hover:bg-white/5"
                >
                  继续对话
                </button>
              )}
            </div>
          )}

          {/* Completion */}
          {currentTurnIndex >= dialogue.turns.length && (
            <div className="border-t border-white/10 p-4 text-center">
              <p className="text-sm text-muted mb-3">对话完成！</p>
              <button
                onClick={handleReset}
                className="rounded-lg bg-brand px-6 py-2 text-sm font-medium transition hover:opacity-90"
              >
                开始新对话
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
