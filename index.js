const express = require("express");
const multer = require("multer");
const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");

const app = express();
const upload = multer({ dest: "uploads/" });

app.post("/convert", upload.single("file"), async (req, res) => {
  try {
    const inputPath = path.resolve(req.file.path);
    const outputDir = path.resolve("outputs");

    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

    const command = `libreoffice --headless --convert-to pdf "${inputPath}" --outdir "${outputDir}"`;
    exec(command, (error) => {
      if (error) {
        console.error(error);
        return res.status(500).send("Conversion failed");
      }

      // Sau khi chạy libreoffice xong:
      const pdfFileName = fs
        .readdirSync(outputDir)
        .find((f) => f.endsWith(".pdf"));
      const pdfPath = path.join(outputDir, pdfFileName);

      res.download(pdfPath, pdfFileName, (err) => {
        // Xóa file gốc, và chỉ xóa PDF nếu tồn tại
        try {
          if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
          if (fs.existsSync(pdfPath)) fs.unlinkSync(pdfPath);
        } catch (e) {
          console.error("Cleanup error:", e.message);
        }
      });
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal error");
  }
});

app.listen(3000, () => console.log("🚀 LibreOffice API running on port 3000"));
