import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import { socket } from "../../../index"; // <-- общий socket из src/index.tsx
import type { Socket } from "socket.io-client";

// Типы для логов
type LogItem = {
  ts: string;
  text: string;
  level?: "info" | "success" | "error" | "warning";
};

// Типы для контекста радио
type RadioContextType = {
  connectionStatus: string;
  clientCount: number;
  myClientId?: string;
  logs: LogItem[];
  volume: number;
  setVolume: (v: number) => void;
  connect: () => void;
  startTalking: () => void;
  stopTalking: () => void;
  ensureAudio: () => Promise<void>;
};

// Контекст радио
const RadioContext = createContext<RadioContextType | undefined>(undefined);

// Провайдер контекста радио
export const RadioProvider: React.FC<{ children?: React.ReactNode }> = ({
  children,
}) => {
  // Peer / audio refs
  const pcsRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const iceCandidatesQueueRef = useRef<Map<string, any[]>>(new Map()); // Очередь ICE кандидатов
  const remoteAudiosRef = useRef<Map<string, HTMLAudioElement>>(new Map());
  const localStreamRef = useRef<MediaStream | null>(null);
  const audioReadyResolveRef = useRef<() => void>(() => { });
  const audioReadyPromiseRef = useRef<Promise<void>>(
    new Promise<void>((r) => {
      audioReadyResolveRef.current = r;
    })
  );

  // Refs для доступа к актуальному состоянию внутри замыканий
  const myClientIdRef = useRef<string | undefined>(undefined);
  const volumeRef = useRef<number>(1);

  // Состояния
  const [connectionStatus, setConnectionStatus] = useState("Отключено");
  const [clientCount, setClientCount] = useState(0);
  const [myClientId, setMyClientId] = useState<string | undefined>(undefined);
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [volume, setVolumeState] = useState<number>(1);

  const iceServers = { iceServers: [{ urls: "stun:stun.l.google.com:19302" }] };

  const addLog = useCallback((text: string, level: LogItem["level"] = "info") => {
    const item: LogItem = {
      ts: new Date().toLocaleTimeString("ru-RU"),
      text,
      level,
    };
    setLogs((prev) => {
      const next = [...prev, item].slice(-60);
      return next;
    });
    console.log(`[radio] ${item.ts} ${text}`);
  }, []);

    // Audio
  const ensureAudio = useCallback(async () => {
    // Если стрим уже есть, просто разрешаем промис (на случай если он был пересоздан) и выходим
    if (localStreamRef.current) {
      audioReadyResolveRef.current();
      return;
    }
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      // Изначально выключаем микрофон
      s.getAudioTracks().forEach((t) => (t.enabled = false));
      
      localStreamRef.current = s;
      addLog("Доступ к микрофону получен", "success");
      
      // Если уже есть соединения, добавляем треки и пересогласовываем
      if (pcsRef.current.size > 0) {
        addLog(`Добавляем аудио в ${pcsRef.current.size} активных соединений...`);
        
        // Используем forEach вместо for..of для совместимости с итераторами Map
        pcsRef.current.forEach(async (pc, clientId) => {
           s.getTracks().forEach(track => {
             // Проверяем, нет ли уже такого трека
             const senders = pc.getSenders();
             const hasTrack = senders.some((sender: any) => sender.track?.kind === 'audio');
             if (!hasTrack) {
               pc.addTrack(track, s);
               addLog(`Трек добавлен в соединение с ${clientId.substring(0, 6)}`);
             }
           });
           
           // Renegotiation
           try {
             const offer = await pc.createOffer();
             await pc.setLocalDescription(offer);
             socket.emit("offer", { target: clientId, offer });
             addLog(`Отправлен новый Offer (renegotiation) для ${clientId.substring(0, 6)}`);
           } catch (e: any) {
             addLog(`Ошибка renegotiation с ${clientId}: ${e.message}`, "error");
           }
        });
      }

      audioReadyResolveRef.current();
    } catch (err: any) {
      addLog("Ошибка доступа к микрофону: " + (err?.message || err), "error");
      audioReadyResolveRef.current();
    }
  }, [addLog]);

  useEffect(() => {
    // новый промис при монтировании
    audioReadyPromiseRef.current = new Promise<void>((r) => {
      audioReadyResolveRef.current = r;
    });
    // Если после HMR или ремаунта стрим уже есть — разрешаем промис сразу
    if (localStreamRef.current) {
      audioReadyResolveRef.current();
    }
  }, []);

  // Set volume
  const setVolume = useCallback((v: number) => {
    setVolumeState(v);
    volumeRef.current = v;
    remoteAudiosRef.current.forEach((audio) => {
      audio.volume = v;
    });
  }, []);

  // Close peer
  const closePeerConnection = useCallback(
    (clientId: string) => {
      const pc = pcsRef.current.get(clientId);
      if (pc) {
        try {
          pc.close();
        } catch (e) { }
        pcsRef.current.delete(clientId);
      }
      const audio = remoteAudiosRef.current.get(clientId);
      if (audio) {
        audio.srcObject = null;
        remoteAudiosRef.current.delete(clientId);
      }
      addLog(`Соединение с ${clientId.substring(0, 6)} закрыто`);
    },
    [addLog]
  );

  // Create peer connection
  const createPeerConnection = useCallback(
    async (clientId: string, createOffer = false) => {
      try {
        addLog(`createPeerConnection called for ${clientId}, waiting for audio...`);
        await audioReadyPromiseRef.current;
        addLog(`Audio ready, proceeding to create peer for ${clientId}`);
        
        if (pcsRef.current.has(clientId)) {
             addLog(`Peer connection for ${clientId} already exists`);
             return;
        }
        const pc = new RTCPeerConnection(iceServers as any);
        pcsRef.current.set(clientId, pc);
        addLog(`Создано соединение с ${clientId.substring(0, 6)}`);

        // Обработка очереди ICE кандидатов
        if (iceCandidatesQueueRef.current.has(clientId)) {
            const queue = iceCandidatesQueueRef.current.get(clientId) || [];
            if (queue.length > 0) {
                addLog(`Применяем ${queue.length} отложенных ICE кандидатов для ${clientId.substring(0, 6)}`, "info");
                for (const candidate of queue) {
                    pc.addIceCandidate(new RTCIceCandidate(candidate)).catch(e => console.error(e));
                }
            }
            iceCandidatesQueueRef.current.delete(clientId);
        }

        if (localStreamRef.current) {
          localStreamRef.current
            .getTracks()
            .forEach((track) => pc.addTrack(track, localStreamRef.current as MediaStream));
        }

        pc.ontrack = (ev) => {
          const audio = new Audio();
          audio.srcObject = ev.streams[0];
          audio.autoplay = true;
          audio.volume = volumeRef.current;
          remoteAudiosRef.current.set(clientId, audio);
          addLog(`Получен поток от ${clientId.substring(0, 6)}`, "info");
          audio.play().catch(() => { });
        };

        pc.onicecandidate = (event) => {
          if (event.candidate) {
            // Send ice candidate via shared socket
            try {
              socket.emit("ice-candidate", { target: clientId, candidate: event.candidate });
            } catch (e) {
              console.error("Emit ice-candidate failed", e);
            }
          }
        };

        pc.onconnectionstatechange = () => {
          addLog(`${clientId.substring(0, 6)}: ${pc.connectionState}`);
          if (pc.connectionState === "failed") {
            addLog(`Соединение с ${clientId.substring(0, 6)} не удалось`, "error");
          }
        };

        if (createOffer) {
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          socket.emit("offer", { target: clientId, offer });
        }
      } catch (err: any) {
        addLog("Ошибка при создании peer: " + (err?.message || err), "error");
      }
    },
    [addLog]
  );

  // handle offer/answer/ice
  const handleOffer = useCallback(
    async (fromId: string, offer: any) => {
      if (!pcsRef.current.has(fromId)) await createPeerConnection(fromId, false);
      const pc = pcsRef.current.get(fromId)!;
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socket.emit("answer", { target: fromId, answer });
    },
    [createPeerConnection]
  );

  const handleAnswer = useCallback(async (fromId: string, answer: any) => {
    const pc = pcsRef.current.get(fromId);
    if (pc) await pc.setRemoteDescription(new RTCSessionDescription(answer));
  }, []);

  const handleIceCandidate = useCallback(async (fromId: string, candidate: any) => {
    const pc = pcsRef.current.get(fromId);
    if (pc) {
        try {
            await pc.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (e) { console.error(e); }
    } else {
        // Если PC еще нет, сохраняем в очередь
        if (!iceCandidatesQueueRef.current.has(fromId)) {
            iceCandidatesQueueRef.current.set(fromId, []);
        }
        iceCandidatesQueueRef.current.get(fromId)?.push(candidate);
    }
  }, []);

  // Подключение/инициализация: используем общий socket из src/index.tsx
  const connect = useCallback(() => {
    try {
      if (socket && socket.connected) {
        return;
      }
      // Если socket был отключён, можно попытаться переподключиться
      if (socket && (socket as any).disconnect) {
        try { socket.connect(); } catch (e) { }
      }
    } catch (e) {
      console.error("connect error", e);
    }
  }, []);

  // Подписка на события socket — регистрируем при монтировании и очищаем при размонтировании
  useEffect(() => {
    const s = socket;

    const onInit = async (payload: any) => {
      const clientId = payload?.clientId ?? payload;
      setMyClientId(clientId);
      myClientIdRef.current = clientId;
      addLog(`Ваш ID: ${clientId}`, "success");
      await ensureAudio();
    };

    const onClients = (payload: any) => {
      const clientsList = payload?.clients ?? payload;
      const count = payload?.count ?? (Array.isArray(clientsList) ? clientsList.length : 0);
      setClientCount(count);

      const currentId = myClientIdRef.current;
      addLog(`onClients: current=${currentId}, list=${JSON.stringify(clientsList)}`, "info");

      if (clientsList && currentId) {
        for (const clientId of clientsList) {
          if (clientId === currentId) continue;
          if (!pcsRef.current.has(clientId)) {
            const shouldInitiate = currentId > clientId;
            addLog(`Check peer ${clientId}: shouldInitiate=${shouldInitiate}`, "info");
            if (shouldInitiate) {
               createPeerConnection(clientId, true);
            }
          }
        }

        Array.from(pcsRef.current.keys()).forEach((id) => {
          if (!clientsList.includes(id)) closePeerConnection(id);
        });
      }
    };

    const onOffer = (data: any) => {
      handleOffer(data.from, data.offer);
    };

    const onAnswer = (data: any) => {
      handleAnswer(data.from, data.answer);
    };

    const onIce = (data: any) => {
      handleIceCandidate(data.from, data.candidate);
    };

    const onDisconnect = (reason: any) => {
      setConnectionStatus("Отключено");
      addLog("Socket disconnected: " + reason, "error");
      pcsRef.current.forEach((_, id) => closePeerConnection(id));
      // попытка переподключения через короткий таймаут
      setTimeout(connect, 3000);
    };

    s.on("init", onInit);
    s.on("clients", onClients);
    s.on("offer", onOffer);
    s.on("answer", onAnswer);
    s.on("ice-candidate", onIce);
    s.on("disconnect", onDisconnect);
    s.on("connect", () => {
      setConnectionStatus("Подключено");
      addLog("Socket connected", "success");
    });
    s.on("error", (err: any) => {
      addLog("Socket error", "error");
      console.error(err);
    });

    // Если сокет уже подключен, запрашиваем ID заново
    if (s.connected) {
      addLog("Socket already connected, requesting ID...");
      s.emit("whoami");
    }

    return () => {
      s.off("init", onInit);
      s.off("clients", onClients);
      s.off("offer", onOffer);
      s.off("answer", onAnswer);
      s.off("ice-candidate", onIce);
      s.off("disconnect", onDisconnect);
      s.off("connect");
      s.off("error");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [createPeerConnection, ensureAudio, handleAnswer, handleIceCandidate, handleOffer, closePeerConnection, connect]);

  // Talking controls
  const startTalking = useCallback(() => {
    if (!localStreamRef.current) return;
    localStreamRef.current.getAudioTracks().forEach((t) => (t.enabled = true));
    addLog("Начата передача", "info");
  }, [addLog]);

  const stopTalking = useCallback(() => {
    if (!localStreamRef.current) return;
    localStreamRef.current.getAudioTracks().forEach((t) => (t.enabled = false));
    addLog("Передача остановлена", "info");
  }, [addLog]);

  // Автоподключение на монтировании
  useEffect(() => {
    connect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <RadioContext.Provider
      value={{
        connectionStatus,
        clientCount,
        myClientId,
        logs,
        volume,
        setVolume,
        connect,
        startTalking,
        stopTalking,
        ensureAudio,
      }}
    >
      {children}
    </RadioContext.Provider>
  );
};

export const useRadio = () => {
  const ctx = useContext(RadioContext);
  if (!ctx) throw new Error("useRadio must be used inside RadioProvider");
  return ctx;
};
