import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
  RefObject,
} from "react";
import { socket } from "../../../index";

type LogItem = {
  ts: string;
  text: string;
  level?: "info" | "success" | "error" | "warning";
};

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

const RadioContext = createContext<RadioContextType | undefined>(undefined);

export const RadioProvider: React.FC<{ children?: React.ReactNode }> = ({
  children,
}) => {
  const localStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionsRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const remoteAudiosRef = useRef<Map<string, HTMLAudioElement>>(new Map());
  const myClientIdRef = useRef<string | undefined>(undefined);
  const iceCandidatesQueueRef = useRef<Map<string, any[]>>(new Map());

  const audioReadyResolveRef = useRef<(() => void) | null>(null);
  const audioReadyPromiseRef = useRef<Promise<void>>(
    new Promise<void>((resolve) => {
      audioReadyResolveRef.current = resolve;
    })
  );

  const [connectionStatus, setConnectionStatus] = useState("Отключено");
  const [clientCount, setClientCount] = useState(0);
  const [clientsList, setClientsList] = useState<string[]>([]);
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [volume, setVolume] = useState(100);
  const [isTalking, setIsTalking] = useState(false);

  const pcsRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const volumeRef = useRef<number>(1);

  const addLog = useCallback((message: string, type: LogItem["level"] = "info") => {
    const logEntry: LogItem = { ts: new Date().toLocaleTimeString("ru-RU"), text: message, level: type };
    setLogs((prev) => {
      const next = [...prev, logEntry];
      return next.length > 50 ? next.slice(-50) : next;
    });
  }, []);

  const initAudio = useCallback(async () => {
    if (localStreamRef.current) {
      if (audioReadyResolveRef.current) audioReadyResolveRef.current();
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 48000,
        },
      });

      localStreamRef.current = stream;
      addLog("Доступ к микрофону получен", "success");

      stream.getAudioTracks().forEach((track) => {
        track.enabled = false;
      });

      if (audioReadyResolveRef.current) {
        audioReadyResolveRef.current();
      }
    } catch (error: any) {
      addLog("Ошибка доступа к микрофону: " + error.message, "error");
      if (audioReadyResolveRef.current) {
        audioReadyResolveRef.current();
      }
    }
  }, [addLog]);

  const closePeerConnection = useCallback((clientId: string) => {
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
  }, [addLog]);

  const createPeerConnection = useCallback(async (clientId: string, createOffer: boolean) => {
    try {
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Audio init timeout")), 5000)
      );
      try {
        await Promise.race([audioReadyPromiseRef.current, timeoutPromise]);
      } catch (e) {
        console.warn(`[${clientId}] Audio init timed out or failed, proceeding anyway...`);
      }

      if (peerConnectionsRef.current.has(clientId)) {
        return;
      }

      const pc = new RTCPeerConnection(iceServers);
      peerConnectionsRef.current.set(clientId, pc);
      addLog(`Создано соединение с ${clientId.substring(0, 6)}...`);

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

      if (localStreamRef.current) {
        localStreamRef.current.getAudioTracks().forEach((track) => {
          console.log(`addTrack → ${clientId}:`, track.id, track.enabled, track.readyState);
          pc.addTrack(track, localStreamRef.current!);
        });
      }

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
        addLog(`Получен поток от ${clientId.substring(0, 6)}`, "info");

        const audio = new Audio();
        audio.srcObject = event.streams[0];
        audio.autoplay = true;
        audio.controls = false;
        audio.volume = volume / 100;

        audio.onplaying = () => {
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
        }

        remoteAudiosRef.current.set(clientId, audio);
      };

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
          addLog("ICE сбор завершен", "success");
        }
      };

      pc.onconnectionstatechange = () => {
        const state = pc.connectionState;
        addLog(`${clientId.substring(0, 6)}: ${state}`);

        if (state === "connected") {
          addLog(`Соединение с ${clientId.substring(0, 6)} установлено`, "success");
        } else if (state === "failed") {
          addLog(`Соединение с ${clientId.substring(0, 6)} не удалось`, "error");
        }
      };

      pc.oniceconnectionstatechange = () => {
        addLog(`ICE State: ${pc.iceConnectionState}`, "info");
      };

      if (createOffer) {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit("offer", {
          target: clientId,
          offer: offer,
        });
      }
    } catch (error) {
      console.error("Error creating peer connection:", error);
      addLog("Ошибка создания соединения", "error");
    }
  }, [addLog, volume]);

  const handleOffer = useCallback(async (fromId: string, offer: any) => {
    try {
      if (!peerConnectionsRef.current.has(fromId)) {
        await createPeerConnection(fromId, false);
      }

      const pc = peerConnectionsRef.current.get(fromId);
      if (pc) {
        await pc.setRemoteDescription(new RTCSessionDescription(offer));

        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        socket.emit("answer", {
          target: fromId,
          answer: answer,
        });
      }
    } catch (error) {
      console.error("Error handling offer:", error);
    }
  }, [createPeerConnection]);

  const handleAnswer = useCallback(async (fromId: string, answer: any) => {
    try {
      const pc = peerConnectionsRef.current.get(fromId);
      if (pc) {
        await pc.setRemoteDescription(new RTCSessionDescription(answer));
      }
    } catch (error) {
      console.error("Error handling answer:", error);
    }
  }, []);

  const handleIceCandidate = useCallback(async (fromId: string, candidate: any) => {
    try {
      const pc = peerConnectionsRef.current.get(fromId);
      if (pc) {
        addLog(`Применение ICE кандидата от ${fromId.substring(0, 6)}`);
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      } else {
        if (!iceCandidatesQueueRef.current.has(fromId)) {
          iceCandidatesQueueRef.current.set(fromId, []);
        }
        iceCandidatesQueueRef.current.get(fromId)?.push(candidate);
        addLog(`ICE кандидат от ${fromId.substring(0, 6)} отложен (нет PC)`, "warning");
      }
    } catch (error) {
      console.error("Error handling ICE candidate:", error);
    }
  }, [addLog]);

  const startTalking = () => {
    if (!localStreamRef.current) return;

    setIsTalking(true);

    localStreamRef.current.getAudioTracks().forEach((track) => {
      track.enabled = true;
    });

    addLog("Начата передача");
  };

  const stopTalking = () => {
    if (!localStreamRef.current) return;

    setIsTalking(false);

    localStreamRef.current.getAudioTracks().forEach((track) => {
      track.enabled = false;
    });

    addLog("Передача остановлена");
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseInt(e.target.value);
    setVolume(newVolume);

    remoteAudiosRef.current.forEach((audio) => {
      audio.volume = newVolume / 100;
    });
  };

  const connect = useCallback(() => {
    try {
      if (socket && socket.connected) {
        return;
      }
      if (socket && (socket as any).disconnect) {
        try { socket.connect(); } catch (e) { }
      }
    } catch (e) {
      console.error("connect error", e);
    }
  }, []);

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

      if (list && currentId) {
        for (const clientId of list) {
          if (clientId !== currentId) {
            if (!peerConnectionsRef.current.has(clientId)) {
              if (currentId > clientId) {
                createPeerConnection(clientId, true);
              } else {
                console.log(`Decided to WAIT for connection from ${clientId} (my ID ${currentId} < ${clientId})`);
              }
            } else {
              console.log(`Already connected to ${clientId}`);
            }
          }
        }

        Array.from(peerConnectionsRef.current.keys()).forEach((id) => {
          if (!clientsList.includes(id)) {
            closePeerConnection(id);
          }
        });
      }
    };

    const onOffer = (data: any) => {
      handleOffer(data.from, data.offer);
    };

    const onAnswer = (data: any) => {
      handleAnswer(data.from, data.answer);
    };

    const onIceCandidate = (data: any) => {
      handleIceCandidate(data.from, data.candidate);
    };

    const onConnect = () => {
      addLog("Подключено к серверу", "success");
      setConnectionStatus("Подключено");
    };

    const onDisconnect = () => {
      addLog("Отключено от сервера", "error");
      setConnectionStatus("Отключено");

      peerConnectionsRef.current.forEach((pc, clientId) => closePeerConnection(clientId));
    };

    const onConnectError = (err: any) => {
      addLog("Ошибка подключения", "error");
      console.error("Socket error:", err);
    };

    socket.on("init", onInit);
    socket.on("clients", onClients);
    socket.on("offer", onOffer);
    socket.on("answer", onAnswer);
    socket.on("ice-candidate", onIceCandidate);
    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("connect_error", onConnectError);

    if (socket.connected) {
      setConnectionStatus("Подключено");
      addLog("Socket already connected");
      // Сокет уже подключён — сервер не пришлёт "init" повторно,
      // запрашиваем ID вручную и инициализируем аудио
      socket.emit("whoami");
      initAudio();
    }

    return () => {
      socket.off("init", onInit);
      socket.off("clients", onClients);
      socket.off("offer", onOffer);
      socket.off("answer", onAnswer);
      socket.off("ice-candidate", onIceCandidate);
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("connect_error", onConnectError);

      peerConnectionsRef.current.forEach((pc, clientId) => closePeerConnection(clientId));

      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);
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
