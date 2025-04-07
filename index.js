const express = require("express");
const multer = require("multer");

const fs = require("fs");
const path = require("path");

const app = express();
const upload = multer({ dest: "uploads/" });

app.use(express.json());

pp.post("/voice-changer", upload.single("audio"), (req, res) => {
  if (!req.file)
    return res.status(400).json({ error: "No audio file uploaded" });

  const { voiceType } = req.body;

  // Define pitch based on voiceType
  const pitchMap = {
    robotic: 0.85,
    monster: 0.55,
    angel: 1.75,
  };

  const selectedPitch = pitchMap[voiceType];
  if (!selectedPitch) {
    return res.status(400).json({
      error: "Invalid voiceType. Choose from: robotic, monster, angel",
    });
  }

  const inputPath = req.file.path;
  const outputFilename = `changed-${voiceType}-${Date.now()}.wav`;
  const outputPath = path.join("outputs", outputFilename);

  if (!fs.existsSync("outputs")) fs.mkdirSync("outputs");

  ffmpeg(inputPath)
    .audioFilter(`asetrate=44100*${selectedPitch},aresample=44100`)
    .on("end", () => {
      fs.unlinkSync(inputPath);

      res.download(outputPath, () => {
        fs.unlinkSync(outputPath);
      });
    })
    .on("error", (err) => {
      console.error("FFmpeg error:", err.message);
      res.status(500).json({ error: "Voice changing failed" });
    })
    .save(outputPath);
});

app.listen(3000, () =>
  console.log("🚀 Server running on http://localhost:3000")
);
