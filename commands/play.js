import axios from 'axios';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import axiosRetry from 'axios-retry';

axiosRetry(axios, { retries: 3, retryDelay: axiosRetry.exponentialDelay });

export async function play(message, client) {

  const remoteJid = message.key.remoteJid;

  const messageBody = (

    message.message?.extendedTextMessage?.text ||

    message.message?.conversation ||
    ''
  ).toLowerCase();

  try {

    const title = getArg(messageBody);

    if (!title) {

      await client.sendMessage(remoteJid, { text: '❌ Please provide a video title.' });

      return;
    }

    console.log(`🎯 Searching YouTube for: ${title}`);

    await client.sendMessage(remoteJid, {text:`> _*Processing download on a video with title : ${title}*_`, quoted:message})

    const video = await searchYouTube(title);

    if (!video) {

      throw new Error('No video found with that title.');
    }

    const videoUrl = `https://www.youtube.com/watch?v=${video.id}`;

    const thumbnail = video.thumbnail;

    const fileName = `${uuidv4()}.mp3`;

    const filePath = path.resolve('./', fileName);

    console.log(`⬇️ Downloading audio via your API: ${videoUrl}`);

    // Start the API request with retry logic
    const response = await axios.post(

      'https://raw.githubusercontent.com/Danscot/senku-xmd/refs/heads/main/api.txt',

      { url: videoUrl },

      { responseType: 'stream' }

    );

    // Create a write stream for the audio file
    const writer = fs.createWriteStream(filePath);

    // Pipe the API response to the file
    response.data.pipe(writer);

    // Wait for the download to complete
    await new Promise((resolve, reject) => {

      writer.on('finish', resolve);  // Resolve when download is finished

      writer.on('error', (err) => {

        console.error("❌ Error writing file:", err);

        reject(new Error('Failed to save the audio file.'));

      });

    });

    console.log(`✅ Audio downloaded: ${filePath}`);

    // Check if the file exists before attempting to send it
    if (!fs.existsSync(filePath)) {

      console.error("❌ File not found:", filePath);

      await client.sendMessage(remoteJid, { text: "❌ Failed to find the downloaded audio file." });

      return;

    }

    // Send the thumbnail and message about the download
    await client.sendMessage(remoteJid, {

      image: { url: thumbnail },

      caption: `> 🎵 *${video.title}*\n\n> 🔗 ${videoUrl}\n\n> 📥 Download complete. Sending audio...\n\n> Powered By Senku Tech`,

      quoted: message

    });

    // Send the audio file to the user
    await client.sendMessage(remoteJid, {

      audio: { url: filePath },

      mimetype: 'audio/mp4',

      ptt: false,

      quoted: message

    });

    // Delete the local file after sending
    fs.unlinkSync(filePath);

    console.log(`🧹 Deleted local file: ${filePath}`);

  } catch (err) {

    console.error('❌ Error in play command:', err);

    await client.sendMessage(remoteJid, {

      text: `❌ Failed to play: ${err.message}`,

    });

  }

}

// Utility function to extract the title from the message body
function getArg(body) {

  const parts = body.trim().split(/\s+/);

  return parts.length > 1 ? parts.slice(1).join(' ') : null;

}

// Function to search YouTube for the video based on the title
async function searchYouTube(query) {

  const API_KEY = 'AIzaSyDV11sdmCCdyyToNU-XRFMbKgAA4IEDOS0'; // Replace this with your key

  const URL = 'https://www.googleapis.com/youtube/v3/search';

  try {

    const res = await axios.get(URL, {

      params: {

        part: 'snippet',

        q: query,

        type: 'video',

        maxResults: 1,

        key: API_KEY,

      },

    });

    const item = res.data.items[0];

    if (!item) return null;

    return {

      id: item.id.videoId,

      title: item.snippet.title,

      thumbnail: item.snippet.thumbnails.high.url,

    };

  } catch (err) {

    console.error('❌ YouTube search failed:', err);

    throw new Error('YouTube search failed.');

  }

}

export default play;
