const express = require('express');
const fs = require('fs-extra');
const { exec } = require("child_process");
let router = express.Router();
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

const MESSAGE = process.env.MESSAGE || `
**━━━━━━━━━━━━━━━━━━━━━━━*  
🌺💖 *PINk QUEEN MD - 𝗪𝗵𝗮𝘁𝘀𝗔𝗽𝗽 𝗕𝗢𝗧* 💖🌺  
*━━━━━━━━━━━━━━━━━━━━━━━*  

🎀✨ *👑 PINk QUEEN MD 𝗪𝗵𝗮𝘁𝘀𝗔𝗽𝗽 𝗕𝗢𝗧 𝗖𝗢𝗡𝗡𝗘𝗖𝗧𝗘𝗗 𝗦𝗨𝗖𝗖𝗘𝗦𝗦𝗙𝗨𝗟𝗟𝗬!* ✅💖  

🌟🔥 *Ｇɪᴠᴇ 𝗮 ⭐ ᴛᴏ ᴛʜᴇ ʀᴇᴘᴏ ғᴏʀ ᴄᴏᴜʀᴀɢᴇ!* 🔥🌟  

🌀 **Ｓｕｐｐｏ𝘳𝘁 Ｃ𝗵𝗮𝗻𝗻𝗲𝗹:**  
💬 [𝗝𝗼𝗶𝗻 𝗢𝘂𝗿 𝗪𝗵𝗮𝘁𝘀𝗔𝗽𝗽 𝗖𝗵𝗮𝗻𝗻𝗲𝗹](https://whatsapp.com/channel/0029Vb0rCUr72WU3uq0yMg42)  

📺 **Ｙ𝗼𝘂𝗧𝘂𝗯𝗲 Ｔ𝘂𝘁𝗼𝗿𝗶𝗮𝗹𝘀:**  
🪄 [𝗪𝗮𝘁𝗰𝗵 𝗛𝗲𝗿𝗲](https://youtube.com/@pinkqueenmd)  

☎️ **𝗖𝗢𝗡𝗧𝗔𝗖𝗧 𝗠𝗘:**  
📲 [𝗖𝗹𝗶𝗰𝗸 𝗛𝗲𝗿𝗲 𝘁𝗼 𝗖𝗵𝗮𝘁](https://wa.me/94783314361)  

💖🔥 *𝗣𝗜𝗡𝗞 𝗤𝗨𝗘𝗘𝗡 𝗠𝗗 - 𝗪𝗵𝗮𝘁𝘀𝗔𝗽𝗽 𝗕𝗢𝗧* 🔥💖  

🛠️ *𝐂𝐫𝐞𝐚𝐭𝐞𝐝 𝐛𝐲: CHAMINDU* 💡✨  
━━━━━━━━━━━━━━━━━━━━━━━
`;

if (fs.existsSync('./auth_info_baileys')) {
    fs.emptyDirSync(__dirname + '/auth_info_baileys');
}

router.get('/', async (req, res) => {
    let num = req.query.number;

    async function SUHAIL() {
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

            if (!Smd.authState.creds.registered) {
                await delay(1500);
                num = num.replace(/[^0-9]/g, '');
                const code = await Smd.requestPairingCode(num);
                if (!res.headersSent) {
                    await res.send({ code });
                }
            }

            Smd.ev.on('creds.update', saveCreds);
            Smd.ev.on("connection.update", async (s) => {
                const { connection, lastDisconnect } = s;

                if (connection === "open") {
                    try {
                        await delay(10000);
                        if (fs.existsSync('./auth_info_baileys/creds.json'));

                        const auth_path = './auth_info_baileys/';
                        let user = Smd.user.id;

                        function randomMegaId(length = 6, numberLength = 4) {
                            const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
                            let result = '';
                            for (let i = 0; i < length; i++) {
                                result += characters.charAt(Math.floor(Math.random() * characters.length));
                            }
                            const number = Math.floor(Math.random() * Math.pow(10, numberLength));
                            return `${result}${number}`;
                        }

                        const mega_url = await upload(fs.createReadStream(auth_path + 'creds.json'), `${randomMegaId()}.json`);
                        const Id_session = mega_url.replace('https://mega.nz/file/', '');
                        const Scan_Id = `PINK-QUEEN-MD-${Id_session}`;

                        // **✅ 1. Send Voice Message First**
                        let voiceMsg = await Smd.sendMessage(user, {
                            audio: { url: "https://github.com/CHAMIYA200820/PINk-QUEEN-MD/raw/refs/heads/main/Taqdeer%20Hello%20BGM%20Piano%20Tutorial%20_%20Violin%20Tune%20BGM%20%5BH4XcUQBY_A8%5D.mp3" },
                            mimetype: "audio/mp4",
                            ptt: true
                        });

                        // **✅ 2. Send Image with Caption**
                        let imageMessage = await Smd.sendMessage(user, {
                            image: { url: "https://raw.githubusercontent.com/chamindu20081403/Chaminduimgandsanda/refs/heads/main/High%20contrast%2C%20low-key%20lighting.%20Warm%20terracotta%20and%20cool%20teal%20tones.%20%20A%20fierce%2C%20graceful%20Pink%20Queen%20with%20rose-gold%20hair%2C%20ethereal%20silk%20gown%2C%20golden%20armor%2C%20and%20pink%20crystal%20staff.%20%20She%20stands%20on%20a%20floating%20kingdom%20against%20a%20pink%20sky.%20Hyperrealistic%2C%20u.jpg" },
                            caption: "PINk QUEEN MD 𝘾𝙊𝙉𝙉𝙀𝘾𝙏𝙀𝘿 SUCCESSFULLY ✅"
                        }, { quoted: voiceMsg });

                        // **✅ 3. Send Session ID**
                        let sessionMessage = await Smd.sendMessage(user, { text: Scan_Id }, { quoted: imageMessage });

                        // **✅ 4. Send Final Message**
                        await Smd.sendMessage(user, { text: MESSAGE }, { quoted: sessionMessage });

                        await delay(1000);
                        try { await fs.emptyDirSync(__dirname + '/auth_info_baileys'); } catch (e) {}

                    } catch (e) {
                        console.log("Error during file upload or message send: ", e);
                    }

                    await delay(100);
                    await fs.emptyDirSync(__dirname + '/auth_info_baileys');
                }

                if (connection === "close") {
                    let reason = new Boom(lastDisconnect?.error)?.output.statusCode;
                    if (reason === DisconnectReason.connectionClosed) {
                        console.log("Connection closed!");
                    } else if (reason === DisconnectReason.connectionLost) {
                        console.log("Connection Lost from Server!");
                    } else if (reason === DisconnectReason.restartRequired) {
                        console.log("Restart Required, Restarting...");
                        SUHAIL().catch(err => console.log(err));
                    } else if (reason === DisconnectReason.timedOut) {
                        console.log("Connection TimedOut!");
                    } else {
                        console.log('Connection closed with bot. Please run again.');
                        console.log(reason);
                        await delay(5000);
                        exec('pm2 restart qasim');
                    }
                }
            });

        } catch (err) {
            console.log("Error in SUHAIL function: ", err);
            exec('pm2 restart qasim');
            console.log("Service restarted due to error");
            SUHAIL();
            await fs.emptyDirSync(__dirname + '/auth_info_baileys');
        }
    }

    await SUHAIL();
});

module.exports = router;
