const express = require('express');
const fs = require('fs-extra');
const { exec } = require("child_process");
const pino = require("pino");
const { Boom } = require("@hapi/boom");
const { upload } = require('./mega');

const {
    default: makeWASocket,
    useMultiFileAuthState,
    delay,
    makeCacheableSignalKeyStore,
    Browsers,
    DisconnectReason
} = require("@whiskeysockets/baileys");

let router = express.Router();

// ✅ Session ID Message
const MESSAGE = `
**━━━━━━━━━━━━━━━━━━━━━━━**  
🌺💖 *PINk QUEEN MD - 𝗪𝗵𝗮𝘁𝘀𝗔𝗽𝗽 𝗕𝗢𝗧* 💖🌺  
**━━━━━━━━━━━━━━━━━━━━━━━**  

🎀✨ *👑 PINk QUEEN MD 𝗪𝗵𝗮𝘁𝘀𝗔𝗽𝗽 𝗕𝗢𝗧 𝗖𝗢𝗡𝗡𝗘𝗖𝗧𝗘𝗗 𝗦𝗨𝗖𝗖𝗘𝗦𝗦𝗙𝗨𝗟𝗟𝗬!* ✅💖  

🌟🔥 *Give a ⭐ to the repo for courage!* 🔥🌟  

🌀 **Support Channel:**  
💬 [Join Our WhatsApp Channel](https://whatsapp.com/channel/0029Vb0rCUr72WU3uq0yMg42)  

📺 **YouTube Tutorials:**  
🪄 [Watch Here](https://youtube.com/@pinkqueenmd)  

☎️ **𝗖𝗢𝗡𝗧𝗔𝗖𝗧 𝗠𝗘:**  
📲 [Click Here to Chat](https://wa.me/94783314361)  

💖🔥 *𝗣𝗜𝗡𝗞 𝗤𝗨𝗘𝗘𝗡 𝗠𝗗 - 𝗪𝗵𝗮𝘁𝘀𝗔𝗽𝗽 𝗕𝗢𝗧* 🔥💖  

🛠️ *𝐂𝐫𝐞𝐚𝐭𝐞𝐝 𝐛𝐲: CHAMINDU* 💡✨  
━━━━━━━━━━━━━━━━━━━━━━━
`;

// ✅ Clean Auth Directory Before Start
if (fs.existsSync('./auth_info_baileys')) {
    fs.emptyDirSync(__dirname + '/auth_info_baileys');
}

// ✅ Function to Connect WhatsApp Bot
async function connectBot(number, res) {
    const { state, saveCreds } = await useMultiFileAuthState(`./auth_info_baileys`);
    
    let Smd = makeWASocket({
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" }).child({ level: "fatal" })),
        },
        printQRInTerminal: false,
        logger: pino({ level: "fatal" }).child({ level: "fatal" }),
        browser: Browsers.macOS("Safari"),
    });

    if (!Smd.authState.creds.registered) {
        await delay(1500);
        number = number.replace(/[^0-9]/g, '');
        const code = await Smd.requestPairingCode(number);
        if (!res.headersSent) {
            return res.send({ code });
        }
    }

    Smd.ev.on('creds.update', saveCreds);
    Smd.ev.on("connection.update", async (s) => {
        const { connection, lastDisconnect } = s;

        if (connection === "open") {
            await sendMessages(Smd);
        }

        if (connection === "close") {
            let reason = new Boom(lastDisconnect?.error)?.output.statusCode;
            handleDisconnect(reason);
        }
    });

    return null;
}

// ✅ QR Code / Session ID API
router.get('/', async (req, res) => {
    let number = req.query.number;
    await connectBot(number, res);
});

// ✅ Function to Send Messages
async function sendMessages(Smd) {
    await delay(10000);

    let user = Smd.user.id;
    const auth_path = './auth_info_baileys/';
    const sessionFile = `${auth_path}creds.json`;

    if (fs.existsSync(sessionFile)) {
        const mega_url = await upload(fs.createReadStream(sessionFile), generateMegaId());
        const Scan_Id = `PINK-QUEEN-MD-${mega_url.replace('https://mega.nz/file/', '')}`;

        let voiceMsg = await Smd.sendMessage(user, {
            audio: { url: "https://github.com/CHAMIYA200820/PINk-QUEEN-MD/raw/refs/heads/main/%20SUCCESSFULLY.mp3" },
            mimetype: "audio/mp4",
            ptt: true
        });

        let imageMessage = await Smd.sendMessage(user, {
            image: { url: "https://raw.githubusercontent.com/chamindu20081403/Chaminduimgandsanda/refs/heads/main/High%20contrast%2C%20low-key%20lighting.%20Warm%20terracotta%20and%20cool%20teal%20tones.%20%20A%20fierce%2C%20graceful%20Pink%20Queen%20with%20rose-gold%20hair%2C%20ethereal%20silk%20gown%2C%20golden%20armor%2C%20and%20pink%20crystal%20staff.%20%20She%20stands%20on%20a%20floating%20kingdom%20against%20a%20pink%20sky.%20Hyperrealistic%2C%20u.jpg" },
            caption: "PINk QUEEN MD 𝘾𝙊𝙉𝙉𝙀𝘾𝙏𝙀𝘿 SUCCESSFULLY ✅"
        }, { quoted: voiceMsg });

        let sessionMessage = await Smd.sendMessage(user, { text: Scan_Id }, { quoted: imageMessage });

        await Smd.sendMessage(user, { text: MESSAGE }, { quoted: sessionMessage });

        await delay(1000);
        fs.emptyDirSync(auth_path);
    }
}

// ✅ Disconnect Handle Function
function handleDisconnect(reason) {
    switch (reason) {
        case DisconnectReason.connectionClosed:
            console.log("Connection closed!");
            break;
        case DisconnectReason.connectionLost:
            console.log("Connection Lost from Server!");
            break;
        case DisconnectReason.restartRequired:
            console.log("Restart Required, Restarting...");
            connectBot().catch(err => console.log(err));
            break;
        case DisconnectReason.timedOut:
            console.log("Connection Timed Out!");
            break;
        default:
            console.log("Unknown disconnect reason:", reason);
            exec('pm2 restart qasim');
    }
}

// ✅ Random Mega ID Generator
function generateMegaId(length = 6, numberLength = 4) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    const number = Math.floor(Math.random() * Math.pow(10, numberLength));
    return `${result}${number}`;
}

// ✅ Export Router
module.exports = router;
