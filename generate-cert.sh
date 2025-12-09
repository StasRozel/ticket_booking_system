#!/bin/bash

echo "Генерация самоподписанного SSL сертификата..."

openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes \
  -subj "/C=RU/ST=State/L=City/O=Organization/CN=localhost" \
  -addext "subjectAltName=DNS:localhost,IP:127.0.0.1,IP:192.168.1.1,IP:192.168.0.1,IP:10.0.0.1"

echo "✓ Сертификаты созданы: cert.pem и key.pem"
echo "⚠️  Это самоподписанный сертификат - браузер покажет предупреждение безопасности"
echo "   При подключении нужно будет принять риск и продолжить"
