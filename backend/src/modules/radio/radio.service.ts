const fs = require('fs');
const path = require('path');

// Пытаемся создать HTTPS сервер, если есть сертификаты


//--------в index.ts ---------

// let server;
// const certPath = path.join(__dirname, 'cert.pem');
// const keyPath = path.join(__dirname, 'key.pem');

// if (fs.existsSync(certPath) && fs.existsSync(keyPath)) {
//     const options = {
//         cert: fs.readFileSync(certPath),
//         key: fs.readFileSync(keyPath)
//     };
//     server = https.createServer(options, (req, res) => {
//         handleRequest(req, res);
//     });
//     console.log('Используется HTTPS сервер');
// } else {
//     server = http.createServer((req, res) => {
//         handleRequest(req, res);
//     });
//     console.log('Используется HTTP сервер (для доступа к микрофону на других устройствах нужен HTTPS)');
//     console.log('Создайте сертификаты командой: npm run generate-cert');
// }

function handleRequest(req, res) {
    let filePath = req.url === '/' ? '/index.html' : req.url;
    filePath = path.join(__dirname, 'public', filePath);
    
    const extname = path.extname(filePath);
    const contentType = {
        '.html': 'text/html',
        '.css': 'text/css',
        '.js': 'text/javascript',
        '.json': 'application/json'
    }[extname] || 'text/plain';
    
    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code === 'ENOENT') {
                res.writeHead(404);
                res.end('File not found');
            } else {
                res.writeHead(500);
                res.end('Server error: ' + error.code);
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
}

// Создаем WebSocket сервер
//const wss = new WebSocket.Server({ server });

// Храним всех подключенных клиентов с их ID


//------------ в shared/socketHandlers.ts ------------
// const clients = new Map();

// wss.on('connection', (ws) => {
//     const clientId = generateId();
//     clients.set(clientId, ws);
    
//     console.log(`Клиент ${clientId} подключился`);
    
//     // Отправляем клиенту его ID
//     ws.send(JSON.stringify({
//         type: 'init',
//         clientId: clientId
//     }));
    
//     // Отправляем список всех клиентов
//     broadcastClientList();
    
//     ws.on('message', (message) => {
//         try {
//             const data = JSON.parse(message);
            
//             // Обработка WebRTC сигнализации
//             switch(data.type) {
//                 case 'offer':
//                 case 'answer':
//                 case 'ice-candidate':
//                     // Пересылаем сигнальные сообщения конкретному клиенту
//                     const targetClient = clients.get(data.target);
//                     if (targetClient && targetClient.readyState === WebSocket.OPEN) {
//                         targetClient.send(JSON.stringify({
//                             ...data,
//                             from: clientId
//                         }));
//                     }
//                     break;
                    
//                 case 'broadcast-offer':
//                     // Отправляем offer всем клиентам, кроме отправителя
//                     clients.forEach((client, id) => {
//                         if (id !== clientId && client.readyState === WebSocket.OPEN) {
//                             client.send(JSON.stringify({
//                                 type: 'offer',
//                                 from: clientId,
//                                 offer: data.offer
//                             }));
//                         }
//                     });
//                     break;
//             }
//         } catch (e) {
//             console.error('Ошибка обработки сообщения:', e);
//         }
//     });
    
//     ws.on('close', () => {
//         console.log(`Клиент ${clientId} отключился`);
//         clients.delete(clientId);
//         broadcastClientList();
//     });
    
//     ws.on('error', (error) => {
//         console.error('Ошибка WebSocket:', error);
//         clients.delete(clientId);
//     });
// });

//------------в shared/socketHandlers.ts ------------

// function broadcastClientList() {
//     const clientIds = Array.from(clients.keys());
//     console.log('Broadcasting client list:', clientIds); // LOG
//     const message = JSON.stringify({
//         type: 'clients',
//         clients: clientIds,
//         count: clientIds.length
//     });
    
//     clients.forEach((client, id) => {
//         if (client.readyState === WebSocket.OPEN) {
//             console.log(`Sending list to ${id}`); // LOG
//             client.send(message);
//         } else {
//             console.log(`Client ${id} is not OPEN (state: ${client.readyState})`); // LOG
//         }
//     });
// }

//--------в index.ts ---------

// const PORT = process.env.PORT || 3000;
// const protocol = fs.existsSync(certPath) && fs.existsSync(keyPath) ? 'https' : 'http';

// server.listen(PORT, '0.0.0.0', () => {
//     console.log(`Сервер запущен на ${protocol}://localhost:${PORT}`);
    
//     // Показываем локальные IP адреса
//     const os = require('os');
//     const interfaces = os.networkInterfaces();
//     console.log('\nДоступен по адресам:');
//     console.log(`  ${protocol}://localhost:${PORT}`);
    
//     Object.keys(interfaces).forEach(ifname => {
//         interfaces[ifname].forEach(iface => {
//             if (iface.family === 'IPv4' && !iface.internal) {
//                 console.log(`  ${protocol}://${iface.address}:${PORT}`);
//             }
//         });
//     });
    
//     if (protocol === 'http') {
//         console.log('\n⚠️  Внимание: Для доступа к микрофону на других устройствах требуется HTTPS!');
//         console.log('Создайте сертификаты командой: npm run generate-cert\n');
//     }
// });
