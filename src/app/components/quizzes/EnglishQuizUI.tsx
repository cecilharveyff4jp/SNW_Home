import React from 'react';
import type { EnglishQuizState } from '../../types/animations';

interface EnglishQuizUIProps {
  quiz: EnglishQuizState;
  consecutiveCorrect: number;
  onClose: () => void;
  onChoiceClick: (choice: string) => void;
  onNextQuestion: () => void;
}

export default function EnglishQuizUI({
  quiz,
  consecutiveCorrect,
  onClose,
  onChoiceClick,
  onNextQuestion,
}: EnglishQuizUIProps) {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0,0,0,0.7)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 2000,
        padding: "20px",
      }}
      onClick={() => {
        if (quiz.state === 'correct' || quiz.state === 'wrong') {
          onClose();
        }
      }}
    >
      <div
        style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          borderRadius: "20px",
          padding: "40px",
          maxWidth: "600px",
          width: "100%",
          boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {quiz.state === 'showing' && (
          <div style={{ textAlign: "center" }}>
            <button
              onClick={onClose}
              style={{
                position: "absolute",
                top: "10px",
                right: "10px",
                background: "transparent",
                border: "none",
                fontSize: "40px",
                cursor: "pointer",
                color: "rgba(255,255,255,0.7)",
                lineHeight: "1",
                padding: "5px",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = "white"; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.7)"; }}
            >
              ×
            </button>
            <div style={{
              fontSize: "80px",
              color: "white",
              marginBottom: "20px",
              animation: "pulse 0.8s ease-in-out",
            }}>
              📖
            </div>
            <h2 style={{ fontSize: "24px", color: "white" }}>
              問題を準備中...
            </h2>
          </div>
        )}

        {quiz.state === 'answering' && (
          <div>
            <button
              onClick={onClose}
              style={{
                position: "absolute",
                top: "10px",
                right: "10px",
                background: "transparent",
                border: "none",
                fontSize: "40px",
                cursor: "pointer",
                color: "rgba(255,255,255,0.7)",
                lineHeight: "1",
                padding: "5px",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = "white"; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.7)"; }}
            >
              ×
            </button>
            <div style={{ textAlign: "center", marginBottom: "30px" }}>
              <div style={{
                fontSize: "80px",
                fontWeight: "bold",
                color: "white",
                marginBottom: "15px",
              }}>
                {quiz.question.word}
              </div>
              <p style={{ fontSize: "20px", color: "white", marginBottom: "10px" }}>
                {quiz.question.type === 'english_to_japanese'
                  ? 'この英単語の意味は？'
                  : 'この日本語を英語で？'}
              </p>
              {consecutiveCorrect > 0 && (
                <div style={{
                  background: "rgba(255,255,255,0.2)",
                  padding: "10px",
                  borderRadius: "8px",
                  marginTop: "10px",
                }}>
                  <div style={{ fontSize: "14px", color: "white", fontWeight: "bold" }}>
                    🔥 連続正解中: {consecutiveCorrect}回
                  </div>
                  <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.9)", marginTop: "3px" }}>
                    次回ボーナス: ×{Math.min(consecutiveCorrect + 1, 1000)}倍 ({Math.min(consecutiveCorrect + 1, 1000) * 10}コイン)
                  </div>
                </div>
              )}
              {consecutiveCorrect === 0 && (
                <div style={{ fontSize: "14px", color: "rgba(255,255,255,0.8)", marginTop: "5px" }}>
                  正解で ×1倍 (10コイン)！
                </div>
              )}
            </div>

            <div style={{ display: "grid", gap: "12px" }}>
              {quiz.choices.map((choice, index) => (
                <button
                  key={index}
                  onClick={() => onChoiceClick(choice)}
                  style={{
                    padding: "20px",
                    fontSize: "28px",
                    fontWeight: "bold",
                    background: "rgba(255,255,255,0.95)",
                    border: "3px solid rgba(255,255,255,0.3)",
                    borderRadius: "12px",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    color: "#764ba2",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "scale(1.02)";
                    e.currentTarget.style.boxShadow = "0 4px 15px rgba(0,0,0,0.15)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "scale(1)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  {choice}
                </button>
              ))}
            </div>
          </div>
        )}

        {quiz.state === 'correct' && (
          <div style={{ textAlign: "center" }}>
            <button
              onClick={onClose}
              style={{
                position: "absolute",
                top: "10px",
                right: "10px",
                background: "transparent",
                border: "none",
                fontSize: "40px",
                cursor: "pointer",
                color: "rgba(255,255,255,0.7)",
                lineHeight: "1",
                padding: "5px",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = "white"; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.7)"; }}
            >
              ×
            </button>
            <div style={{
              fontSize: "32px",
              fontWeight: "bold",
              color: "white",
              marginBottom: "20px",
              animation: "bounce 0.5s",
            }}>
              🎉 正解！ 🎉
            </div>
            <p style={{ fontSize: "18px", color: "white", marginBottom: "10px" }}>
              「{quiz.question.word}」は「{quiz.question.correct}」です
            </p>
            <div style={{
              background: "linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)",
              padding: "15px",
              borderRadius: "12px",
              marginBottom: "20px",
            }}>
              <div style={{ fontSize: "20px", fontWeight: "bold", color: "#37b24d", marginBottom: "5px" }}>
                💰 +{quiz.reward} コイン獲得！
              </div>
              {quiz.consecutiveCount && quiz.consecutiveCount > 0 && (
                <div style={{ fontSize: "16px", color: "#666" }}>
                  連続正解 {quiz.consecutiveCount} 回！
                </div>
              )}
            </div>
            <button
              onClick={onNextQuestion}
              style={{
                padding: "12px 40px",
                fontSize: "18px",
                fontWeight: "bold",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "white",
                border: "none",
                borderRadius: "50px",
                cursor: "pointer",
              }}
            >
              次の問題
            </button>
          </div>
        )}

        {quiz.state === 'wrong' && (
          <div style={{ textAlign: "center" }}>
            <button
              onClick={onClose}
              style={{
                position: "absolute",
                top: "10px",
                right: "10px",
                background: "transparent",
                border: "none",
                fontSize: "40px",
                cursor: "pointer",
                color: "rgba(255,255,255,0.7)",
                lineHeight: "1",
                padding: "5px",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = "white"; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.7)"; }}
            >
              ×
            </button>
            <div style={{
              fontSize: "32px",
              fontWeight: "bold",
              color: "white",
              marginBottom: "20px",
              animation: "shake 0.5s",
            }}>
              😢 残念！
            </div>
            <p style={{ fontSize: "18px", color: "white", marginBottom: "10px" }}>
              正解は「{quiz.question.correct}」でした
            </p>
            {consecutiveCorrect > 0 && (
              <p style={{ fontSize: "16px", color: "rgba(255,255,255,0.9)", marginBottom: "15px" }}>
                連続正解がリセットされました
              </p>
            )}
            <button
              onClick={onClose}
              style={{
                padding: "12px 40px",
                fontSize: "18px",
                fontWeight: "bold",
                background: "#6b7280",
                color: "white",
                border: "none",
                borderRadius: "50px",
                cursor: "pointer",
              }}
            >
              閉じる
            </button>
          </div>
        )}

        {quiz.state === 'insufficient_coins' && (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "28px", fontWeight: "bold", color: "white", marginBottom: "20px" }}>
              コイン不足
            </div>
            <p style={{ fontSize: "18px", color: "white", marginBottom: "25px" }}>
              英単語クイズには10コインが必要です
            </p>
            <button
              onClick={onClose}
              style={{
                padding: "12px 40px",
                fontSize: "18px",
                fontWeight: "bold",
                background: "#6b7280",
                color: "white",
                border: "none",
                borderRadius: "50px",
                cursor: "pointer",
              }}
            >
              閉じる
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
