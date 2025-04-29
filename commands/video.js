import axios from 'axios';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import axiosRetry from 'axios-retry';

axiosRetry(axios, { retries: 3, retryDelay: axiosRetry.exponentialDelay });

export async function video(message, client) {
  const remoteJid = message.key.remoteJid;

  const messageBody = (
    message.message?.extendedTextMessage?.text ||
    message.message?.conversation ||
    ''
  ).toLowerCase();

  try {
    // Extract URL from the message
    const url = getArg(messageBody);

    if (!url) {
      await client.sendMessage(remoteJid, { text: '❌ Please provide a valid video URL.' });
      return;
    }

    console.log(`🎯 Processing download for URL: ${url}`);

    await client.sendMessage(remoteJid, { text: `> _*Processing download for URL: ${url}*_`, quoted: message });

    // Call your video downloader API to get the download URL
    const response = await axios.post(
      'https://downloader-api-7mul.onrender.com/api/download',
      { url: url },
      { responseType: 'json' }
    );

    // Get download information from the response
    const downloadLink = response.data.filepath;
    const videoTitle = response.data.title || 'Video';
    const thumbnail = response.data.thumbnail;

    const fileName = `${uuidv4()}.mp4`;
    const filePath = path.resolve('./', fileName);

    console.log(`⬇️ Downloading video from: ${downloadLink}`);

    // Start the API request with retry logic to download the video
    const videoResponse = await axios.get(downloadLink, { responseType: 'stream' });

    // Create a write stream for the video file
    const writer = fs.createWriteStream(filePath);

    // Pipe the video response to the file
    videoResponse.data.pipe(writer);

    // Wait for the download to complete
    await new Promise((resolve, reject) => {
      writer.on('finish', resolve);  // Resolve when download is finished
      writer.on('error', (err) => {
        console.error("❌ Error writing file:", err);
        reject(new Error('Failed to save the video file.'));
      });
    });

    console.log(`✅ Video downloaded: ${filePath}`);

    // Check if the file exists before attempting to send it
    if (!fs.existsSync(filePath)) {
      console.error("❌ File not found:", filePath);
      await client.sendMessage(remoteJid, { text: "❌ Failed to find the downloaded video file." });
      return;
    }

    // Send the thumbnail and message about the download
    await client.sendMessage(remoteJid, {
      image: { url: thumbnail },
      caption: `> 🎥 *${videoTitle}*\n\n> 🔗 ${url}\n\n> 📥 Download complete. Sending video...\n\n> Powered by Senku Tech`,
      quoted: message
    });

    // Send the video file to the user
    await client.sendMessage(remoteJid, {
      video: { url: filePath },
      mimetype: 'video/mp4',
      ptt: false,
      quoted: message
    });

    // Delete the local file after sending
    fs.unlinkSync(filePath);

    console.log(`🧹 Deleted local file: ${filePath}`);

  } catch (err) {
    console.error('❌ Error in download command:', err);
    await client.sendMessage(remoteJid, {
      text: `❌ Failed to download: ${err.message}`,
    });
  }
}

// Utility function to extract the URL from the message body
function getArg(body) {
  const parts = body.trim().split(/\s+/);
  return parts.length > 1 ? parts[1] : null;
}

export default video;
