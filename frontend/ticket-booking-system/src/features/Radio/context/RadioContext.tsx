import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
  RefObject,
} from "react";
import { socket } from "../../../index"; // <-- общий socket из src/index.tsx

// Типы для логов
type LogItem = {
  ts: string;
  text: string;
  level?: "info" | "success" | "error" | "warning";
};

// Типы для контекста радио
type RadioContextType = {
  pcsRef: RefObject<Map<string, RTCPeerConnection>>;
  volumeRef: RefObject<number>;
  connectionStatus: string;
  clientCount: number;
  isTalking: boolean;
  logs: LogItem[];
  volume: number;
  peerConnectionsRef: RefObject<Map<string, RTCPeerConnection>>;
  myClientIdRef: RefObject<string | undefined>;
  clientsList: string[];
  setVolume: (v: number) => void;
  connect: () => void;
  createPeerConnection: (clientId: string, createOffer: boolean) => Promise<void>;
  handleVolumeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  startTalking: () => void;
  stopTalking: () => void;
};

const iceServers = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};


// Контекст радио
const RadioContext = createContext<RadioContextType | undefined>(undefined);

// Провайдер контекста радио
export const RadioProvider: React.FC<{ children?: React.ReactNode }> = ({
  children,
}) => {

  const localStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionsRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const remoteAudiosRef = useRef<Map<string, HTMLAudioElement>>(new Map());
  const myClientIdRef = useRef<string | undefined>(undefined);
  const iceCandidatesQueueRef = useRef<Map<string, any[]>>(new Map());

  // Промис ожидания готовности аудио
  const audioReadyResolveRef = useRef<(() => void) | null>(null);
  const audioReadyPromiseRef = useRef<Promise<void>>(
    new Promise<void>((resolve) => {
      audioReadyResolveRef.current = resolve;
    })
  );

  // State
  const [connectionStatus, setConnectionStatus] = useState("Отключено");
  const [clientCount, setClientCount] = useState(0);
  const [clientsList, setClientsList] = useState<string[]>([]);
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [volume, setVolume] = useState(100);
  const [isTalking, setIsTalking] = useState(false);



  // Peer / audio refs
  const pcsRef = useRef<Map<string, RTCPeerConnection>>(new Map());

  // Refs для доступа к актуальному состоянию внутри замыканий
  const volumeRef = useRef<number>(1);


  const addLog = (message: string, type: LogItem["level"] = "info") => {
    const logEntry: LogItem = {
      ts: new Date().toLocaleTimeString("ru-RU"),
      text: message,
      level: type,
    };

    setLogs((prev) => {
      const next = [...prev, logEntry];
      // Ограничиваем количество записей
      if (next.length > 50) {
        return next.slice(-50);
      }
      return next;
    });

    console.log(`[Radio] ${logEntry.ts} ${message}`);
  };

  const initAudio = async () => {
    console.log("[Audio] initAudio started");
    if (localStreamRef.current) {
      console.log("[Audio] Stream already exists, skipping");
      if (audioReadyResolveRef.current) audioReadyResolveRef.current();
      return;
    }

    try {
      console.log("[Audio] Requesting getUserMedia...");
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 48000,
        },
      });
      console.log("[Audio] getUserMedia success");

      localStreamRef.current = stream;
      addLog("Доступ к микрофону получен", "success");

      // Мутим по умолчанию (безопасно)
      stream.getAudioTracks().forEach((track) => {
        track.enabled = false;
      });

      // Сигнализируем, что аудио готово
      if (audioReadyResolveRef.current) {
        console.log("[Audio] Resolving audioReadyPromise");
        audioReadyResolveRef.current();
      }
    } catch (error: any) {
      console.error("[Audio] getUserMedia failed:", error);
      addLog("Ошибка доступа к микрофону: " + error.message, "error");
      // Разрешаем промис даже при ошибке
      if (audioReadyResolveRef.current) {
        console.log("[Audio] Resolving audioReadyPromise (with error)");
        audioReadyResolveRef.current();
      }
    }
  };

  // Close peer
  const closePeerConnection = (clientId: string) => {
    const pc = peerConnectionsRef.current.get(clientId);
    if (pc) {
      pc.close();
      peerConnectionsRef.current.delete(clientId);
    }

    const audio = remoteAudiosRef.current.get(clientId);
    if (audio) {
      audio.srcObject = null;
      remoteAudiosRef.current.delete(clientId);
    }

    addLog(`Соединение с ${clientId.substring(0, 6)}... закрыто`);
  };

  // Create peer connection
  // Создание WebRTC соединения
  const createPeerConnection = async (clientId: string, createOffer: boolean) => {
    try {
      console.log(`[WebRTC] createPeerConnection for ${clientId}, createOffer=${createOffer}`);
      // Ждем инициализации аудио (с таймаутом 5с)
      console.log(`[${clientId}] Waiting for audio init...`);
      const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("Audio init timeout")), 5000));
      try {
        await Promise.race([audioReadyPromiseRef.current, timeoutPromise]);
        console.log(`[${clientId}] Audio init complete`);
      } catch (e) {
        console.warn(`[${clientId}] Audio init timed out or failed, proceeding anyway...`);
      }

      if (peerConnectionsRef.current.has(clientId)) {
        console.log(`Already connected to ${clientId}`);
        return;
      }

      const pc = new RTCPeerConnection(iceServers);
      peerConnectionsRef.current.set(clientId, pc);
      addLog(`Создано соединение с ${clientId.substring(0, 6)}...`);

      // Обработка очереди отложенных ICE кандидатов
      if (iceCandidatesQueueRef.current.has(clientId)) {
        const queue = iceCandidatesQueueRef.current.get(clientId) || [];
        if (queue.length > 0) {
          addLog(`Применяем ${queue.length} отложенных ICE кандидатов для ${clientId.substring(0, 6)}`, "info");
          for (const candidate of queue) {
            await pc.addIceCandidate(new RTCIceCandidate(candidate)).catch((e) => console.error(e));
          }
        }
        iceCandidatesQueueRef.current.delete(clientId);
      }

      // Добавляем локальные треки
      if (localStreamRef.current) {
        localStreamRef.current.getAudioTracks().forEach((track) => {
          console.log(`addTrack → ${clientId}:`, track.id, track.enabled, track.readyState);
          pc.addTrack(track, localStreamRef.current!);
        });
      }

      // Обработка входящих треков
      let audioUnlocked = false;

      document.body.addEventListener(
        "click",
        () => {
          audioUnlocked = true;
          addLog("Звук разблокирован", "success");
        },
        { once: true }
      );

      pc.ontrack = (event) => {
        console.log(`[${clientId}] Track received:`, event.track.kind, event.track.id);
        addLog(`Получен поток от ${clientId.substring(0, 6)}`, "info");

        const audio = new Audio();
        audio.srcObject = event.streams[0];
        audio.autoplay = true;
        audio.controls = false;
        audio.volume = volume / 100;

        audio.onloadedmetadata = () => {
          console.log(`[${clientId}] Audio metadata loaded`);
        };

        audio.onplay = () => {
          console.log(`[${clientId}] Audio playing started`);
        };

        audio.onplaying = () => {
          console.log(`[${clientId}] Audio is actually playing`);
          addLog(`Звук идет от ${clientId.substring(0, 6)}`, "success");
        };

        const playAudio = () => {
          console.log(`[${clientId}] Attempting to play audio...`);
          audio
            .play()
            .then(() => console.log(`[${clientId}] Play success`))
            .catch((err) => {
              console.error(`[${clientId}] Play failed:`, err);
              addLog("Кликните для звука!", "warning");
            });
        };

        if (audioUnlocked) {
          playAudio();
        } else {
          // Ждём первого клика
          document.body.addEventListener("click", playAudio, { once: true });
        }

        remoteAudiosRef.current.set(clientId, audio);
      };

      // Обработка ICE кандидатов
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          const type = event.candidate.type;
          const ip = event.candidate.address || "—";
          console.log(`[${clientId}] ICE Candidate:`, type, ip);
          addLog(`ICE: ${type} (${ip})`, "info");

          socket.emit("ice-candidate", {
            target: clientId,
            candidate: event.candidate,
          });
        } else {
          console.log(`[${clientId}] ICE Gathering Complete`);
          addLog("ICE сбор завершен", "success");
        }
      };

      pc.onconnectionstatechange = () => {
        const state = pc.connectionState;
        console.log(`[${clientId}] Connection State:`, state);
        addLog(`${clientId.substring(0, 6)}: ${state}`);

        if (state === "connected") {
          addLog(`Соединение с ${clientId.substring(0, 6)} установлено`, "success");
        } else if (state === "failed") {
          addLog(`Соединение с ${clientId.substring(0, 6)} не удалось`, "error");
        }
      };

      pc.oniceconnectionstatechange = () => {
        console.log(`[${clientId}] ICE State:`, pc.iceConnectionState);
        addLog(`ICE State: ${pc.iceConnectionState}`, "info");
      };

      pc.onsignalingstatechange = () => {
        console.log(`[${clientId}] Signaling State:`, pc.signalingState);
      };

      if (createOffer) {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        console.log(`[Signaling] Sending OFFER to ${clientId}`);
        socket.emit("offer", {
          target: clientId,
          offer: offer,
        });
      }
    } catch (error) {
      console.error("Error creating peer connection:", error);
      addLog("Ошибка создания соединения", "error");
    }
  };

  const handleOffer = async (fromId: string, offer: any) => {
    console.log(`[WebRTC] handleOffer from ${fromId}`);
    try {
      if (!peerConnectionsRef.current.has(fromId)) {
        await createPeerConnection(fromId, false);
      }

      const pc = peerConnectionsRef.current.get(fromId);
      if (pc) {
        await pc.setRemoteDescription(new RTCSessionDescription(offer));

        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        console.log(`[Signaling] Sending ANSWER to ${fromId}`);
        socket.emit("answer", {
          target: fromId,
          answer: answer,
        });
      }
    } catch (error) {
      console.error("Error handling offer:", error);
    }
  };

  // Обработка входящего answer
  const handleAnswer = async (fromId: string, answer: any) => {
    try {
      const pc = peerConnectionsRef.current.get(fromId);
      if (pc) {
        await pc.setRemoteDescription(new RTCSessionDescription(answer));
      }
    } catch (error) {
      console.error("Error handling answer:", error);
    }
  };

  // Обработка ICE кандидата
  const handleIceCandidate = async (fromId: string, candidate: any) => {
    try {
      const pc = peerConnectionsRef.current.get(fromId);
      if (pc) {
        addLog(`Применение ICE кандидата от ${fromId.substring(0, 6)}`);
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      } else {
        // Если PC еще нет, сохраняем в очередь
        if (!iceCandidatesQueueRef.current.has(fromId)) {
          iceCandidatesQueueRef.current.set(fromId, []);
        }
        iceCandidatesQueueRef.current.get(fromId)?.push(candidate);
        addLog(`ICE кандидат от ${fromId.substring(0, 6)} отложен (нет PC)`, "warning");
      }
    } catch (error) {
      console.error("Error handling ICE candidate:", error);
    }
  };

  // Обработчики кнопки разговора
  const startTalking = () => {
    if (!localStreamRef.current) return;

    setIsTalking(true);

    localStreamRef.current.getAudioTracks().forEach((track) => {
      track.enabled = true;
      console.log("Микрофон включен, track.enabled:", track.enabled, "track.readyState:", track.readyState);
    });

    console.log("Активных peer соединений:", peerConnectionsRef.current.size);
    addLog("Начата передача");
  };

  const stopTalking = () => {
    if (!localStreamRef.current) return;

    setIsTalking(false);

    localStreamRef.current.getAudioTracks().forEach((track) => {
      track.enabled = false;
      console.log("Микрофон выключен, track.enabled:", track.enabled);
    });

    addLog("Передача остановлена");
  };

  // Обработчик громкости
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseInt(e.target.value);
    setVolume(newVolume);

    remoteAudiosRef.current.forEach((audio) => {
      audio.volume = newVolume / 100;
    });
  };

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
    const onInit = async (payload: any) => {
      const clientId = payload?.clientId ?? payload;
      myClientIdRef.current = clientId;
      addLog(`Ваш ID: ${clientId}`, "success");
      await initAudio();
    };

    const onClients = (payload: any) => {
      const list = payload?.clients ?? payload;
      const count = payload?.count ?? (Array.isArray(list) ? list.length : 0);
      setClientCount(count);
      setClientsList(Array.isArray(list) ? list : []);

      const currentId = myClientIdRef.current;
      console.log("Received client list:", list);

      if (list && currentId) {
        for (const clientId of list) {
          if (clientId !== currentId) {
            if (!peerConnectionsRef.current.has(clientId)) {
              // Инициирует соединение только тот, у кого ID "больше"
              if (currentId > clientId) {
                console.log(`Decided to initiate connection with ${clientId} (my ID ${currentId} > ${clientId})`);
                createPeerConnection(clientId, true);
              } else {
                console.log(`Decided to WAIT for connection from ${clientId} (my ID ${currentId} < ${clientId})`);
              }
            } else {
              console.log(`Already connected to ${clientId}`);
            }
          }
        }

        // Удаляем соединения с отключившимися клиентами
        Array.from(peerConnectionsRef.current.keys()).forEach((id) => {
          if (!clientsList.includes(id)) {
            closePeerConnection(id);
          }
        });
      }
    };

    const onOffer = (data: any) => {
      console.log(`[Signaling] Received OFFER from ${data.from}`, data);
      handleOffer(data.from, data.offer);
    };

    const onAnswer = (data: any) => {
      console.log(`[Signaling] Received ANSWER from ${data.from}`, data);
      handleAnswer(data.from, data.answer);
    };

    const onIceCandidate = (data: any) => {
      console.log(`[Signaling] Received ICE CANDIDATE from ${data.from}`, data);
      handleIceCandidate(data.from, data.candidate);
    };

    const onConnect = () => {
      addLog("Подключено к серверу", "success");
      setConnectionStatus("Подключено");
      console.log("[Socket] Connected");
    };

    const onDisconnect = () => {
      addLog("Отключено от сервера", "error");
      setConnectionStatus("Отключено");
      console.log("[Socket] Disconnected");

      // Закрываем все peer соединения
      peerConnectionsRef.current.forEach((pc, clientId) => closePeerConnection(clientId));
    };

    const onConnectError = (err: any) => {
      addLog("Ошибка подключения", "error");
      console.error("Socket error:", err);
    };

    // Подписываемся на события
    socket.on("init", onInit);
    socket.on("clients", onClients);
    socket.on("offer", onOffer);
    socket.on("answer", onAnswer);
    socket.on("ice-candidate", onIceCandidate);
    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("connect_error", onConnectError);

    // Если сокет уже подключен
    if (socket.connected) {
      setConnectionStatus("Подключено");
      addLog("Socket already connected");
    }

    // Cleanup
    return () => {
      socket.off("init", onInit);
      socket.off("clients", onClients);
      socket.off("offer", onOffer);
      socket.off("answer", onAnswer);
      socket.off("ice-candidate", onIceCandidate);
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("connect_error", onConnectError);

      // Закрываем все соединения при размонтировании
      peerConnectionsRef.current.forEach((pc, clientId) => closePeerConnection(clientId));

      // Останавливаем локальный стрим
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);
  // Автоподключение на монтировании
  useEffect(() => {
    connect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <RadioContext.Provider
      value={{
        pcsRef,
        volumeRef,
        connectionStatus,
        clientCount,
        logs,
        volume,
        clientsList,
        isTalking,
        peerConnectionsRef,
        myClientIdRef,
        createPeerConnection,
        setVolume,
        connect,
        handleVolumeChange,
        startTalking,
        stopTalking,
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
