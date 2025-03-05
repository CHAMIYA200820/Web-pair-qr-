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

// 🔥 Fancy Text Generator Function
const fancyText = (text) => {
    const fonts = {
        A: "𝐀", B: "𝐁", C: "𝐂", D: "𝐃", E: "𝐄", F: "𝐅", G: "𝐆",
        H: "𝐇", I: "𝐈", J: "𝐉", K: "𝐊", L: "𝐋", M: "𝐌", N: "𝐍",
        O: "𝐎", P: "𝐏", Q: "𝐐", R: "𝐑", S: "𝐒", T: "𝐓", U: "𝐔",
        V: "𝐕", W: "𝐖", X: "𝐗", Y: "𝐘", Z: "𝐙",
        a: "𝑎", b: "𝑏", c: "𝑐", d: "𝑑", e: "𝑒", f: "𝑓", g: "𝑔",
        h: "ℎ", i: "𝑖", j: "𝑗", k: "𝑘", l: "𝑙", m: "𝑚", n: "𝑛",
        o: "𝑜", p: "𝑝", q: "𝑞", r: "𝑟", s: "𝑠", t: "𝑡", u: "𝑢",
        v: "𝑣", w: "𝑤", x: "𝑥", y: "𝑦", z: "𝑧"
    };
    return text.split("").map(char => fonts[char] || char).join("");
};

// 🎉 Fancy Welcome Message
const MESSAGE = `
⭐ ${fancyText("PINK QUEEN MD WHATSAPP BOT CONNECTED SUCCESSFULLY")} ✅

💖 ${fancyText("Give a Star to Repo for Courage")} 🌟  
💭 ${fancyText("Support Channel")}: https://whatsapp.com/channel/0029Vb0rCUr72WU3uq0yMg42  
🪄 ${fancyText("YouTube Tutorials")}: https://youtube.com/@pinkqueenmd  
📞 ${fancyText("CONTACT ME")}: https://wa.me/94783314361  
🥀 *𝗣𝗜𝗡𝗞 𝗤𝗨𝗘𝗘𝗡 𝗠𝗗-WHATTSAPP-BOT* 🥀
`;

if (fs.existsSync('./auth_info_baileys')) {
    fs.emptyDirSync(__dirname + '/auth_info_baileys');
}

router.get('/', async (req, res) => {
    let num = req.query.number.replace(/[^0-9]/g, '');
    if (!num.startsWith("94")) num = "94" + num; // ✅ Number format fix

    async function startBot() {
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
                const code = await Smd.requestPairingCode(num);
                if (!res.headersSent) await res.send({ code });
            }

            Smd.ev.on('creds.update', saveCreds);
            Smd.ev.on("connection.update", async (s) => {
                console.log("Connection Update:", s); // Debugging 🔥

                const { connection, lastDisconnect } = s;
                if (connection === "open") {
                    console.log("✅ Bot Connected!");
                    await delay(5000);

                    const auth_path = './auth_info_baileys/';
                    let user = Smd.user.id;
                    const mega_url = await upload(fs.createReadStream(auth_path + 'creds.json'), `Session.json`);
                    const Scan_Id = `${fancyText("PINK-QUEEN-MD")}-${mega_url.replace('https://mega.nz/file/', '')}`;

                    // 🎵 Send Voice Message
                    let voiceMsg = await Smd.sendMessage(user, {
                        audio: { url: "https://github.com/CHAMIYA200820/PINk-QUEEN-MD/raw/main/Taqdeer_Hello_BGM.mp3" },
                        mimetype: "audio/mp4",
                        ptt: true
                    });

                    // 🖼️ Send Image with Caption
                    let imageMessage = await Smd.sendMessage(user, {
                        image: { url: "https://raw.githubusercontent.com/chamindu20081403/Chaminduimgandsanda/main/PinkQueen.jpg" },
                        caption: `${fancyText("PINK QUEEN MD CONNECTED SUCCESSFULLY")} ✅`
                    }, { quoted: voiceMsg });

                    // 📜 Send Session ID
                    let sessionMessage = await Smd.sendMessage(user, { text: Scan_Id }, { quoted: imageMessage });

                    // 📝 Send Final Message
                    await Smd.sendMessage(user, { text: MESSAGE }, { quoted: sessionMessage });

                    await delay(1000);
                    fs.emptyDirSync(__dirname + '/auth_info_baileys');
                }

                if (connection === "close") {
                    let reason = new Boom(lastDisconnect?.error)?.output.statusCode;
                    if (reason === DisconnectReason.connectionClosed) console.log("🚨 Connection Closed!");
                    else if (reason === DisconnectReason.connectionLost) console.log("🔌 Connection Lost!");
                    else if (reason === DisconnectReason.restartRequired) {
                        console.log("♻ Restarting...");
                        startBot().catch(err => console.log(err));
                    } else if (reason === DisconnectReason.timedOut) console.log("⏳ Connection Timed Out!");
                    else {
                        console.log("❌ Unknown Disconnect, Restarting...");
                        exec('pm2 restart bot');
                    }
                }
            });

        } catch (err) {
            console.log("🚨 Error:", err);
            exec('pm2 restart bot');
            startBot();
            fs.emptyDirSync(__dirname + '/auth_info_baileys');
        }
    }

    await startBot();
});

module.exports = router;
