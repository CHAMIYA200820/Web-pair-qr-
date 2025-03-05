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

// ✅ MESSAGE TEMPLATE
const MESSAGE = `
━━━━━━━━━━━━━━━━━━━━━━━  
🌺💖 *PINk QUEEN MD - WhatsApp BOT* 💖🌺  
━━━━━━━━━━━━━━━━━━━━━━━  

🎀✨ *👑 PINk QUEEN MD CONNECTED SUCCESSFULLY!* ✅💖  

📺 **YouTube Tutorials:**  
🪄 [Watch Here](https://youtube.com/@pinkqueenmd)  

☎️ **Contact Me:**  
📲 [Chat Here](https://wa.me/94783314361)  

💖🔥 *PINk QUEEN MD - WhatsApp BOT* 🔥💖  

🛠️ *Created by: CHAMINDU* 💡✨  
━━━━━━━━━━━━━━━━━━━━━━━
`;

// ✅ FUNCTION TO GENERATE RANDOM MEGA ID
function randomMegaId(length = 6, numberLength = 4) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    const number = Math.floor(Math.random() * Math.pow(10, numberLength));
    return `${result}${number}`;
}

// ✅ FUNCTION TO START WHATSAPP CONNECTION
async function startWhatsAppConnection(number, res) {
    const { state, saveCreds } = await useMultiFileAuthState(`./auth_info_baileys`);

    try {
        let Smd = makeWASocket({
            auth: {
                creds: state.creds,
                keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" }).child({ level: "fatal" })),
            },
            printQRInTerminal: false,
            logger: pino({ level: "fatal" }).child({ level: "fatal" }),
            browser: Browsers.macOS("Safari"),
        });

        Smd.ev.on('creds.update', saveCreds);
        Smd.ev.on("connection.update", async (s) => {
            const { connection, lastDisconnect } = s;

            if (connection === "open") {
                try {
                    await delay(5000);
                    if (fs.existsSync('./auth_info_baileys/creds.json')) {
                        const auth_path = './auth_info_baileys/';
                        let user = Smd.user.id;

                        // 🔹 Upload session file to MEGA & Generate ID
                        const mega_url = await upload(fs.createReadStream(auth_path + 'creds.json'), `${randomMegaId()}.json`);
                        const sessionID = mega_url.replace('https://mega.nz/file/', '');
                        const scanID = `PINK-QUEEN-MD-${sessionID}`;

                        // ✅ 1. Send Voice Message
                        let voiceMsg = await Smd.sendMessage(user, {
                            audio: { url: "https://github.com/CHAMIYA200820/PINk-QUEEN-MD/raw/main/SUCCESSFULLY.mp3" },
                            mimetype: "audio/mp4",
                            ptt: true
                        });

                        await delay(1000); // Add slight delay for better sequence

                        // ✅ 2. Send Image with Caption
                        let imageMessage = await Smd.sendMessage(user, {
                            image: { url: "https://raw.githubusercontent.com/chamindu20081403/Chaminduimgandsanda/main/PinkQueen.jpg" },
                            caption: "PINk QUEEN MD CONNECTED SUCCESSFULLY ✅"
                        }, { quoted: voiceMsg });

                        await delay(1000); // Add slight delay

                        // ✅ 3. Send Session ID
                        let sessionMessage = await Smd.sendMessage(user, { text: scanID }, { quoted: imageMessage });

                        await delay(1000); // Add slight delay

                        // ✅ 4. Send Final Text Message
                        await Smd.sendMessage(user, { text: MESSAGE }, { quoted: sessionMessage });

                        // 🔹 Clear Session Data
                        await delay(1000);
                        fs.emptyDirSync(__dirname + '/auth_info_baileys');
                    }
                } catch (e) {
                    console.log("Error during file upload or message send: ", e);
                }
            }

            // 🔹 Handle Disconnections
            if (connection === "close") {
                let reason = new Boom(lastDisconnect?.error)?.output.statusCode;
                switch (reason) {
                    case DisconnectReason.connectionClosed:
                        console.log("Connection closed!");
                        break;
                    case DisconnectReason.connectionLost:
                        console.log("Connection Lost from Server!");
                        break;
                    case DisconnectReason.restartRequired:
                        console.log("Restart Required, Restarting...");
                        startWhatsAppConnection(number, res).catch(err => console.log(err));
                        break;
                    case DisconnectReason.timedOut:
                        console.log("Connection TimedOut!");
                        break;
                    default:
                        console.log("Connection closed with bot. Restarting...");
                        exec('pm2 restart qasim');
                        break;
                }
            }
        });

    } catch (err) {
        console.log("Error in startWhatsAppConnection function: ", err);
        exec('pm2 restart qasim');
        console.log("Service restarted due to error");
        startWhatsAppConnection(number, res);
    }
}

// ✅ DEFINE ROUTE FOR WHATSAPP CONNECTION
router.get('/', async (req, res) => {
    let number = req.query.number;
    if (!number) {
        return res.status(400).json({ error: "Please provide a phone number." });
    }
    await startWhatsAppConnection(number, res);
});

module.exports = router;
