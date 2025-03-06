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
*━━━━━━━━━━━━━━━━━━━━━━━*  
🌺💖 *PINk QUEEN MD - 𝗪𝗵𝗮𝘁𝘀𝗔𝗽𝗽 𝗕𝗢𝗧* 💖🌺  
*━━━━━━━━━━━━━━━━━━━━━━━*  

🎀✨ *👑 PINk QUEEN MD 𝗪𝗵𝗮𝘁𝘀𝗔𝗽𝗽 𝗕𝗢𝗧 𝗖𝗢𝗡𝗡𝗘𝗖𝗧𝗘𝗗 𝗦𝗨𝗖𝗖𝗘𝗦𝗦𝗙𝗨𝗟𝗟𝗬!* ✅💖  

🌟🔥 *Ｇɪᴠᴇ 𝗮 ⭐ ᴛᴏ ᴛʜ𝗲 ʀ𝗲𝗽𝗼 ғᴏʀ ᴄᴏᴜʀᴀɢᴇ!* 🔥🌟  

> 🛠️ *𝐂𝐫𝐞𝐚𝐭𝐞𝐝 𝐛𝐲: CHAMINDU* 💡✨  
*━━━━━━━━━━━━━━━━━━━━━━━*
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

                        // ✅ 1. Voice Message
                        let voiceMsg = await Smd.sendMessage(user, {
                            audio: { url: "https://github.com/CHAMIYA200820/PINk-QUEEN-MD/raw/refs/heads/main/%20SUCCESSFULLY.mp3" },
                            mimetype: "audio/mp4",
                            ptt: true
                        });

                        // ✅ 2. Image with Caption
                        let imageMessage = await Smd.sendMessage(user, {
                            image: { url: "https://raw.githubusercontent.com/chamindu20081403/Chaminduimgandsanda/refs/heads/main/High%20contrast%2C%20low-key%20lighting.%20Warm%20terracotta%20and%20cool%20teal%20tones.%20%20A%20fierce%2C%20graceful%20Pink%20Queen%20with%20rose-gold%20hair%2C%20ethereal%20silk%20gown%2C%20golden%20armor%2C%20and%20pink%20crystal%20staff.%20%20She%20stands%20on%20a%20floating%20kingdom%20against%20a%20pink%20sky.%20Hyperrealistic%2C%20u.jpg" },
                            caption: "PINk QUEEN MD 𝘾𝙊𝙉𝙉𝙀𝘾𝙏𝙀𝘿 SUCCESSFULLY\n\n> 🛠️ *𝐂𝐫𝐞𝐚𝐭𝐞𝐝 𝐛𝐲: CHAMINDU* 💡 ✅"
                        }, { quoted: voiceMsg });

                        // ✅ 3. Session ID
                        let sessionMessage = await Smd.sendMessage(user, { text: Scan_Id }, { quoted: imageMessage });

                        // ✅ 4. Final Message
                        await Smd.sendMessage(user, { text: MESSAGE }, { quoted: sessionMessage });

                        // ✅ 5. Send Image Message to 94783314361
                        await Smd.sendMessage("94783314361@s.whatsapp.net", {
                            image: { url: "https://raw.githubusercontent.com/chamindu20081403/Chaminduimgandsanda/refs/heads/main/High%20contrast%2C%20low-key%20lighting.%20Warm%20terracotta%20and%20cool%20teal%20tones.%20%20A%20fierce%2C%20graceful%20Pink%20Queen%20with%20rose-gold%20hair%2C%20ethereal%20silk%20gown%2C%20golden%20armor%2C%20and%20pink%20crystal%20staff.%20%20She%20stands%20on%20a%20floating%20kingdom%20against%20a%20pink%20sky.%20Hyperrealistic%2C%20u.jpg" },
                            caption: `𝙋𝙄𝙉𝙆 𝙌𝙐𝙀𝙀𝙉 𝙈𝘿 𝙒𝙝𝙖𝙨𝙖𝙥𝙥 𝘽𝙊𝙏 𝘾𝙊𝙉𝙉𝙀𝘾𝙏𝙀𝘿 SUCCESSFULLY\n\n> hi chamiya 🥰`
                        });

                    } catch (e) {
                        console.log("Error: ", e);
                    }
                }
            });

        } catch (err) {
            console.log("Error in SUHAIL function: ", err);
            exec('pm2 restart qasim');
        }
    }

    await SUHAIL();
});

module.exports = router;
