#!/bin/bash

echo "========================================="
echo "Диагностика Nginx и Backend"
echo "========================================="
echo ""

echo "1. Проверка статуса контейнеров:"
docker ps --filter "name=tickets_booking_system" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
echo ""

echo "2. Проверка конфигурации nginx:"
docker exec tickets_booking_system-nginx nginx -t
echo ""

echo "3. Проверка сети Docker:"
docker network inspect ticket_booking_network | grep -A 5 "tickets_booking_system-backend\|tickets_booking_system-frontend\|tickets_booking_system-nginx" | head -20
echo ""

echo "4. Проверка доступности backend изнутри nginx:"
docker exec tickets_booking_system-nginx sh -c "apk add --no-cache curl 2>/dev/null && curl -k -I https://backend:3443 2>&1 | head -10"
echo ""

echo "5. Проверка доступности frontend изнутри nginx:"
docker exec tickets_booking_system-nginx sh -c "curl -I http://frontend:3000 2>&1 | head -10"
echo ""

echo "6. Последние логи nginx error.log:"
docker exec tickets_booking_system-nginx tail -20 /var/log/nginx/error.log 2>/dev/null || echo "Нет ошибок в логах"
echo ""

echo "7. Последние логи nginx access.log:"
docker exec tickets_booking_system-nginx tail -10 /var/log/nginx/access.log 2>/dev/null || echo "Нет записей в access.log"
echo ""

echo "8. Проверка портов backend:"
docker exec tickets_booking_system-backend netstat -tlnp 2>/dev/null | grep -E "3001|3443|4029" || echo "netstat не доступен"
echo ""

echo "========================================="
echo "Попробуйте открыть в браузере:"
echo "https://localhost/ или https://ticket-booking/"
echo "========================================="
