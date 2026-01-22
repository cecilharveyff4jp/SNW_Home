import React from 'react';
import type { RamenQuizState } from '../../types/animations';

interface RamenQuizUIProps {
  quiz: RamenQuizState;
  consecutiveCorrect: number;
  onClose: () => void;
  onChoiceClick: (choice: string) => void;
  onNextQuestion: () => void;
}

export default function RamenQuizUI({
  quiz,
  consecutiveCorrect,
  onClose,
  onChoiceClick,
  onNextQuestion,
}: RamenQuizUIProps) {
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
          background: "linear-gradient(135deg, #2d1810 0%, #4a2818 100%)",
          borderRadius: "20px",
          padding: "40px",
          maxWidth: "700px",
          width: "100%",
          boxShadow: "0 20px 60px rgba(0,0,0,0.5), 0 0 40px rgba(255,140,0,0.3)",
          border: "2px solid rgba(255,140,0,0.5)",
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
                color: "#ff8c00",
                lineHeight: "1",
                padding: "5px",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = "#fff"; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = "#ff8c00"; }}
            >
              ×
            </button>
            <div style={{
              fontSize: "100px",
              marginBottom: "20px",
              animation: "pulse 0.8s ease-in-out",
            }}>
              🍜
            </div>
            <h2 style={{ fontSize: "24px", color: "#ff8c00", marginBottom: "10px" }}>
              世界のラーメンクイズ
            </h2>
            <p style={{ color: "#ddd", fontSize: "16px" }}>
              問題を準備中...
            </p>
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
                color: "#ff8c00",
                lineHeight: "1",
                padding: "5px",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = "#fff"; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = "#ff8c00"; }}
            >
              ×
            </button>
            <div style={{ textAlign: "center", marginBottom: "30px" }}>
              <div style={{ fontSize: "60px", marginBottom: "15px" }}>🍜</div>
              <h3 style={{ fontSize: "22px", color: "#ff8c00", marginBottom: "20px" }}>
                {quiz.question.question}
              </h3>
              {consecutiveCorrect > 0 && (
                <div style={{
                  color: "#ff8c00",
                  fontSize: "18px",
                  marginBottom: "15px",
                  fontWeight: "bold",
                }}>
                  🔥 連続正解: {consecutiveCorrect}回
                </div>
              )}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
              {quiz.choices.map((choice, index) => (
                <button
                  key={index}
                  onClick={() => onChoiceClick(choice)}
                  style={{
                    padding: "20px",
                    fontSize: "20px",
                    fontWeight: "bold",
                    border: "2px solid rgba(255,140,0,0.5)",
                    borderRadius: "15px",
                    background: "linear-gradient(135deg, rgba(255,140,0,0.1) 0%, rgba(255,140,0,0.05) 100%)",
                    color: "#fff",
                    cursor: "pointer",
                    transition: "all 0.3s",
                    textAlign: "center",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "linear-gradient(135deg, rgba(255,140,0,0.3) 0%, rgba(255,140,0,0.2) 100%)";
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = "0 8px 20px rgba(255,140,0,0.3)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "linear-gradient(135deg, rgba(255,140,0,0.1) 0%, rgba(255,140,0,0.05) 100%)";
                    e.currentTarget.style.transform = "translateY(0)";
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
            <div style={{
              fontSize: "120px",
              marginBottom: "20px",
              animation: "bounce 0.6s ease-in-out",
            }}>
              🎉
            </div>
            <h2 style={{ fontSize: "36px", color: "#4ade80", marginBottom: "15px" }}>
              正解！
            </h2>
            <p style={{ fontSize: "24px", color: "#ff8c00", marginBottom: "15px", fontWeight: "bold" }}>
              {quiz.question.correct}
            </p>
            {quiz.question.explanation && (
              <div style={{
                background: "rgba(255,140,0,0.1)",
                padding: "15px",
                borderRadius: "10px",
                marginBottom: "15px",
                border: "1px solid rgba(255,140,0,0.3)",
              }}>
                <p style={{ color: "#ddd", fontSize: "16px", margin: 0 }}>
                  {quiz.question.explanation}
                </p>
              </div>
            )}
            <p style={{ fontSize: "20px", color: "#ff8c00", marginBottom: "20px", fontWeight: "bold" }}>
              +{quiz.reward} コイン獲得！
            </p>
            <div style={{
              background: "rgba(255,140,0,0.1)",
              padding: "15px",
              borderRadius: "10px",
              marginBottom: "20px",
              border: "1px solid rgba(255,140,0,0.3)",
            }}>
              <p style={{ color: "#ddd", fontSize: "16px", margin: 0 }}>
                連続正解: {consecutiveCorrect}回
              </p>
            </div>
            <button
              onClick={onNextQuestion}
              style={{
                padding: "15px 40px",
                fontSize: "18px",
                fontWeight: "bold",
                border: "none",
                borderRadius: "10px",
                background: "linear-gradient(135deg, #ff8c00 0%, #ffa500 100%)",
                color: "#fff",
                cursor: "pointer",
                marginRight: "10px",
                transition: "all 0.3s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.05)";
                e.currentTarget.style.boxShadow = "0 5px 15px rgba(255,140,0,0.5)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              次の問題へ
            </button>
            <button
              onClick={onClose}
              style={{
                padding: "15px 40px",
                fontSize: "18px",
                fontWeight: "bold",
                border: "2px solid #ff8c00",
                borderRadius: "10px",
                background: "transparent",
                color: "#ff8c00",
                cursor: "pointer",
                transition: "all 0.3s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255,140,0,0.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
              }}
            >
              閉じる
            </button>
          </div>
        )}

        {quiz.state === 'wrong' && (
          <div style={{ textAlign: "center" }}>
            <div style={{
              fontSize: "120px",
              marginBottom: "20px",
            }}>
              💔
            </div>
            <h2 style={{ fontSize: "36px", color: "#f87171", marginBottom: "15px" }}>
              不正解...
            </h2>
            <p style={{ fontSize: "20px", color: "#ddd", marginBottom: "10px" }}>
              正解は...
            </p>
            <p style={{ fontSize: "28px", color: "#ff8c00", marginBottom: "15px", fontWeight: "bold" }}>
              {quiz.question.correct}
            </p>
            {quiz.question.explanation && (
              <div style={{
                background: "rgba(255,140,0,0.1)",
                padding: "15px",
                borderRadius: "10px",
                marginBottom: "20px",
                border: "1px solid rgba(255,140,0,0.3)",
              }}>
                <p style={{ color: "#ddd", fontSize: "16px", margin: 0 }}>
                  {quiz.question.explanation}
                </p>
              </div>
            )}
            <button
              onClick={onClose}
              style={{
                padding: "15px 40px",
                fontSize: "18px",
                fontWeight: "bold",
                border: "2px solid #ff8c00",
                borderRadius: "10px",
                background: "linear-gradient(135deg, rgba(255,140,0,0.2) 0%, rgba(255,140,0,0.1) 100%)",
                color: "#ff8c00",
                cursor: "pointer",
                transition: "all 0.3s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "linear-gradient(135deg, rgba(255,140,0,0.3) 0%, rgba(255,140,0,0.2) 100%)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "linear-gradient(135deg, rgba(255,140,0,0.2) 0%, rgba(255,140,0,0.1) 100%)";
              }}
            >
              閉じる
            </button>
          </div>
        )}

        {quiz.state === 'insufficient_coins' && (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "100px", marginBottom: "20px" }}>
              💰
            </div>
            <h2 style={{ fontSize: "28px", color: "#f87171", marginBottom: "15px" }}>
              コインが足りません
            </h2>
            <p style={{ fontSize: "18px", color: "#ddd", marginBottom: "30px" }}>
              クイズに挑戦するには100コイン必要です
            </p>
            <button
              onClick={onClose}
              style={{
                padding: "15px 40px",
                fontSize: "18px",
                fontWeight: "bold",
                border: "2px solid #ff8c00",
                borderRadius: "10px",
                background: "linear-gradient(135deg, rgba(255,140,0,0.2) 0%, rgba(255,140,0,0.1) 100%)",
                color: "#ff8c00",
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
