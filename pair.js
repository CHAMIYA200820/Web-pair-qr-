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
╭━━━━━━━━━━━━━━━╮
┃  🎀 *𝙋𝙄𝙉𝙆 𝙌𝙐𝙀𝙀𝙉 𝙈𝘿* 🎀
┃ ✨ ᴡʜᴀᴛꜱᴀᴘᴘ ʙᴏᴛ ᴄᴏɴɴᴇᴄᴛᴇᴅ ✅
┃ 
┃ 🌟 ᴏꜰꜰɪᴄɪᴀʟ ʏᴏᴜᴛᴜʙᴇ:
┃ ➥ https://youtube.com/@pinkqueenmd
┃ 
┃ 💭 ꜱᴜᴘᴘᴏʀᴛ ᴄʜᴀɴɴᴇʟ:
┃ ➥ https://whatsapp.com/channel/0029Vb0rCUr72WU3uq0yMg42
┃ 
┃ 📩 ᴄᴏɴᴛᴀᴄᴛ ᴍᴇ:
┃ ➥ https://wa.me/94783314361
╰━━━━━━━━━━━━━━━╯
`;

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
                            return `PINk QUEEN MD - ${result}${number}`;
                        }

                        const mega_url = await upload(fs.createReadStream(auth_path + 'creds.json'), `${randomMegaId()}.json`);
                        const Scan_Id = `PINK-QUEEN-MD-${mega_url.replace('https://mega.nz/file/', '')}`;

                        // ✅ **1. Voice Message First**
                        let voiceMsg = await Smd.sendMessage(user, {
                            audio: { url: "https://github.com/CHAMIYA200820/PINk-QUEEN-MD/raw/refs/heads/main/Taqdeer%20Hello%20BGM.mp3" },
                            mimetype: "audio/mp4",
                            ptt: true
                        });

                        await delay(2000);

                        // ✅ **2. Video Note (WhatsApp Circular Video)**
                        let videoNote = await Smd.sendMessage(user, {
                            video: { url: "https://github.com/CHAMIYA200820/PINk-QUEEN-MD/raw/refs/heads/main/videonote.mp4" },
                            mimetype: "video/mp4",
                            gifPlayback: true
                        }, { quoted: voiceMsg });

                        await delay(2000);

                        // ✅ **3. Stylish Normal Video Message**
                        let videoMsg = await Smd.sendMessage(user, {
                            video: { url: "https://github.com/CHAMIYA200820/PINk-QUEEN-MD/raw/refs/heads/main/video.mp4" },
                            caption: "🌸 *𝙋𝙄𝙉𝙆 𝙌𝙐𝙀𝙀𝙉 𝙈𝘿 - 𝘾𝙤𝙣𝙣𝙚𝙘𝙩𝙞𝙣𝙜...* 🌸"
                        }, { quoted: videoNote });

                        await delay(3000);

                        // ✅ **4. Send Image with Caption**
                        let imageMessage = await Smd.sendMessage(user, {
                            image: { url: "https://raw.githubusercontent.com/chamindu20081403/Chaminduimgandsanda/main/HighContrastImage.jpg" },
                            caption: "🎀 *PINk QUEEN MD CONNECTED SUCCESSFULLY* ✅"
                        }, { quoted: videoMsg });

                        await delay(2000);

                        // ✅ **5. Send Session ID**
                        let sessionMessage = await Smd.sendMessage(user, { text: `🔖 *SESSION ID:* \n🔗 ${Scan_Id}` }, { quoted: imageMessage });

                        await delay(2000);

                        // ✅ **6. Send Final Message with Stylish Fonts**
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
