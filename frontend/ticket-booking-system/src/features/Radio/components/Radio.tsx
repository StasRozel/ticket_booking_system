import React from "react";
import { useNavigate } from "react-router-dom";
import "./Radio.css";
import Header from "../../../shared/components/Header";
import Footer from "../../../shared/components/Footer";
import { useRadio } from "../context/RadioContext";

export const Radio: React.FC = () => {
  const navigate = useNavigate();

  const { myClientIdRef, volume, connectionStatus, clientCount, logs, isTalking, clientsList, peerConnectionsRef, handleVolumeChange, startTalking, stopTalking, createPeerConnection} = useRadio();  

  return (
    <>
      <Header />
      <div className="radio-page">

        <div className="container">
          <button className="radio-back-btn" onClick={() => navigate('/driver-dashboard')}>
            ← Вернуться к дашборду водителя
          </button>

          <div className="radio-container">
            <div className="status-item">
              <span className="status-label">Статус:</span>
              <span className={`status-value ${connectionStatus === "Подключено" ? "connected" : "disconnected"}`}>
                {connectionStatus}
              </span>
            </div>
            <div className="status-item">
              <span className="status-label">Ваш ID:</span>
              <span className="status-value" style={{ fontSize: "14px" }}>{myClientIdRef.current || "..."}</span>
            </div>
            <div className="status-item">
              <span className="status-label">Клиентов онлайн:</span>
              <span className="status-value">{clientCount}</span>
            </div>
          </div>

          <div className="clients-list" style={{ marginBottom: "20px", padding: "10px", background: "#fff", borderRadius: "8px" }}>
            <h3>Список клиентов</h3>
            {clientsList.length === 0 && <p>Нет других клиентов</p>}
            <ul style={{ listStyle: "none", padding: 0 }}>
              {clientsList.map((clientId) => {
                if (clientId === myClientIdRef.current) return null;
                const isConnected = peerConnectionsRef.current.has(clientId);
                return (
                  <li key={clientId} style={{ padding: "5px", borderBottom: "1px solid #eee", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span>{clientId} {isConnected ? "✅" : "❌"}</span>
                    {!isConnected && (
                      <button
                        onClick={() => createPeerConnection(clientId, true)}
                        style={{ padding: "5px 10px", background: "#007bff", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
                      >
                        Подключить
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="control-panel">
            <button
              id="talkButton"
              className={`talk-button ${isTalking ? "active" : ""}`}
              onMouseDown={startTalking}
              onMouseUp={stopTalking}
              onMouseLeave={stopTalking}
              onTouchStart={(e) => {
                e.preventDefault();
                startTalking();
              }}
              onTouchEnd={(e) => {
                e.preventDefault();
                stopTalking();
              }}
            >
              <span className="button-icon">🎤</span>
              <span className="button-text">
                {isTalking ? "Говорите..." : "Удерживайте для говорения"}
              </span>
            </button>

            <div className="volume-control">
              <label htmlFor="volumeSlider">
                Громкость: <span id="volumeValue">{volume}%</span>
              </label>
              <input
                id="volumeSlider"
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={handleVolumeChange}
              />
            </div>
          </div>

          <div className="log-panel">
            <h3>Журнал событий</h3>
            <div id="logContainer" className="log-container">
              {logs.map((log, idx) => (
                <div key={idx} className={`log-entry ${log.level || "info"}`}>
                  <span className="timestamp">{log.ts}</span>
                  {log.text}
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
      <Footer />
    </>
  );
};