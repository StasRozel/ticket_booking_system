import React, { useState } from 'react';
import { UserType } from '../../../shared/types/UserType';

type Props = {
  user: UserType;
  isOpen: boolean;
  onClose: () => void;
};

const TelegramConnectModal: React.FC<Props> = ({ user, isOpen, onClose }) => {
  const [status, setStatus] = useState<'idle' | 'checking' | 'connected' | 'timeout' | null>(null);

  if (!isOpen) return null;

  const openBotLink = () => {
    const bot = process.env.REACT_APP_TELEGRAM_BOT_USERNAME || '';
    const url = `https://t.me/${bot}?start=${user.id}`;
    window.open(url, '_blank', 'noopener');
  };

  const checkConnection = async () => {
    setStatus('checking');
    const start = Date.now();
    const timeout = 60_000; // 60s

    const poll = async () => {
      try {
        const res = await fetch(`/api/users/${user.id}`);
        if (!res.ok) throw new Error('Failed');
        const data = await res.json();
        if (data.telegram_id) {
          setStatus('connected');
          return;
        }
      } catch (e) {
        console.error(e);
      }
      if (Date.now() - start < timeout) {
        setTimeout(poll, 2000);
      } else {
        setStatus('timeout');
      }
    };

    poll();
  };

  return (
    <div className="telegram-modal">
      <div className="telegram-modal__content">
        <h3>Подключить Telegram</h3>
        <p>
          Для подключения нажмите кнопку «Открыть бота» — откроется бот в Telegram. Затем в чате выполните команду
          <code> /start {user.id}</code> или <code>/register {user.id}</code>.
        </p>

        <div className="telegram-modal__actions">
          <button className="telegram-modal__open-bot" onClick={openBotLink}>
            Открыть бота
          </button>

          <button className="telegram-modal__check-button" onClick={checkConnection}>
            Проверить подключение
          </button>

          <button className="telegram-modal__close-button" onClick={() => { setStatus(null); onClose(); }}>
            Закрыть
          </button>
        </div>

        {status === 'checking' && <p className="status status--checking">Проверяю...</p>}
        {status === 'connected' && <p className="status status--connected">Успешно подключено!</p>}
        {status === 'timeout' && <p className="status status--timeout">Не удалось подключиться — проверьте, отправили ли вы команду /start.</p>}
      </div>
    </div>
  );
};

export default TelegramConnectModal;
