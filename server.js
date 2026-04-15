import express from "express";
import { exec } from "child_process";
import fs from "fs";
import https from "https";

const app = express();
app.use(express.json());

// TEST ROUTE
app.get("/", (req, res) => {
  res.send("API is running ✅");
});

// DOWNLOAD FILE
function download(url, path) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(path);
    https.get(url, (response) => {
      response.pipe(file);
      file.on("finish", () => file.close(resolve));
    }).on("error", reject);
  });
}

// RENDER VIDEO
app.post("/render", async (req, res) => {
  try {
    const { image, audio } = req.body;

    await download(image, "/tmp/image.png");
    await download(audio, "/tmp/audio.mp3");

    exec(
      `ffmpeg -y -loop 1 -i /tmp/image.png -i /tmp/audio.mp3 -shortest -c:v libx264 -c:a aac /tmp/output.mp4`,
      (err) => {
        if (err) return res.status(500).send(err);

        res.json({
          video: "/tmp/output.mp4"
        });
      }
    );
  } catch (e) {
    res.status(500).send(e);
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Server running");
});
