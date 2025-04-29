

import configManager from '../utils/manageConfigs.js'

export async function prem(message, client) {

    const remoteJid = message.key.remoteJid;

    const today = new Date();

    const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    const currentDay = daysOfWeek[today.getDay()];

    const currentDate = today.getDate();

    const currentMonth = today.getMonth() + 1; 

    const currentYear = today.getFullYear();

    const owner = "𓂀 𝕊𝕖𝕟𝕜𝕦𓂀";

    const number = client.user.id.split(':')[0];

    const username = message.pushName || "Unknown";

    const t = ` 
╭─────────────────╮
      ༒ 𝕊𝕖𝕟𝕜𝕦 ༒
╰─────────────────╯
╭─────────────────╮
│ Prefix : ${configManager.config.users[number].prefix}
│ Hello, ${username}  
│ Day : ${currentDay}
│ Date : ${currentDate}/${currentMonth}/${currentYear} 
│ Version : 4.0
│ Plugins : 50
│ Type : X-MD        
╰─────────────────╯

╭─[ ✧ PREMIUM CMD ✧ ]──╮
│      
│ ⬢ connect 237xxxxx
│ ⬢ disconnect 237xxxxx        
╰─────────────────╯        

> Powered By Senku Tech 🥷🏾
    `
;

    await client.sendMessage(remoteJid, {

        image: { url: "menu.jpg" },

        caption: t,

        contextInfo: {

            participant: '0@s.whatsapp.net',

            remoteJid: 'status@broadcast',

            quotedMessage: { conversation:"𝘿𝘼𝙉𝙎𝘾𝙊𝙏 ༒ 𝙎𝙀𝙉𝙆𝙐"}, 

            isForwarded: true,
        },

        quoted: message 


    });
}   

export default prem;
