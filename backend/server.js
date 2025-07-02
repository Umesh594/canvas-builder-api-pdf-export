require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createCanvas, loadImage } = require('canvas');
const PDFDocument = require('pdfkit');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 5000;
const allowedOrigins = ['http://localhost:5500', 'http://127.0.0.1:5500'];
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const upload = multer({ dest: 'uploads/' });
let canvasData = {
  width: 800,
  height: 600,
  elements: []
};
app.post('/api/canvas/add/freehand', (req, res) => {
  const { strokes } = req.body;
  if (!Array.isArray(strokes)) {
    return res.status(400).json({ error: 'Invalid strokes' });
  }
  if (!canvasData || !canvasData.elements) {
    return res.status(500).json({ error: 'Canvas not initialized' });
  }
  strokes.forEach(stroke => {
    for (let i = 1; i < stroke.length; i++) {
      canvasData.elements.push({
        type: 'stroke',
        fromX: stroke[i - 1][0],
        fromY: stroke[i - 1][1],
        toX: stroke[i][0],
        toY: stroke[i][1],
        color: '#000',
        lineWidth: 2
      });
    }
  });
  res.json({ message: 'Strokes added', canvasData });
});
app.post('/api/canvas/init', (req, res) => {
  const { width, height } = req.body;
  if (!width || !height) {
    return res.status(400).json({ error: 'Width and height are required' });
  }
  canvasData = {
    width: parseInt(width),
    height: parseInt(height),
    elements: []
  };
  res.json({ message: 'Canvas initialized', canvasData });
});
app.post('/api/canvas/add/rectangle', (req, res) => {
  const { x, y, width, height, color } = req.body;
  if (!x || !y || !width || !height || !color) {
    return res.status(400).json({ error: 'All rectangle properties are required' });
  }
  canvasData.elements.push({
    type: 'rectangle',
    x: parseInt(x),
    y: parseInt(y),
    width: parseInt(width),
    height: parseInt(height),
    color
  });
  res.json({ message: 'Rectangle added', canvasData });
});
app.post('/api/canvas/add/circle', (req, res) => {
  const { x, y, radius, color } = req.body;
  if (!x || !y || !radius || !color) {
    return res.status(400).json({ error: 'All circle properties are required' });
  }
  canvasData.elements.push({
    type: 'circle',
    x: parseInt(x),
    y: parseInt(y),
    radius: parseInt(radius),
    color
  });
  res.json({ message: 'Circle added', canvasData });
});
app.post('/api/canvas/add/text', (req, res) => {
  let { x, y, text, color, fontSize } = req.body;
  x = isNaN(parseInt(x)) || x === '' ? 50 : parseInt(x);
  y = isNaN(parseInt(y)) || y === '' ? 300 : parseInt(y);
  if (!text || !color || !fontSize) {
    return res.status(400).json({ error: 'Text, color, and fontSize are required' });
  }
  canvasData.elements.push({
    type: 'text',
    x,
    y,
    text,
    color,
    fontSize: parseInt(fontSize)
  });
  res.json({ message: 'Text added', canvasData });
});
app.post('/api/canvas/add/image-url', async (req, res) => {
  try {
    const { x, y, width, height, imageUrl } = req.body;
    if (!x || !y || !width || !height || !imageUrl) {
      return res.status(400).json({ error: 'All image properties are required' });
    }
    await axios.get(imageUrl, { responseType: 'arraybuffer' });
    canvasData.elements.push({
      type: 'image-url',
      x: parseInt(x),
      y: parseInt(y),
      width: parseInt(width),
      height: parseInt(height),
      imageUrl
    });
    res.json({ message: 'Image added', canvasData });
  } catch (error) {
    res.status(400).json({ error: 'Failed to fetch image from URL' });
  }
});
app.post('/api/canvas/add/image-upload', upload.single('image'), (req, res) => {
  const { x, y, width, height } = req.body;
  const imageFile = req.file;
  if (!x || !y || !width || !height || !imageFile) {
    return res.status(400).json({ error: 'All image properties are required' });
  }
  canvasData.elements.push({
    type: 'image-upload',
    x: parseInt(x),
    y: parseInt(y),
    width: parseInt(width),
    height: parseInt(height),
    imagePath: imageFile.path
  });
  res.json({ message: 'Image uploaded and added', canvasData });
});
app.get('/api/canvas/export/pdf', async (req, res) => {
  try {
    const shouldCompress = req.query.compress === 'true';
    const canvas = createCanvas(canvasData.width, canvasData.height);
    const ctx = canvas.getContext('2d');
     ctx.fillStyle = '#ffffff';
ctx.fillRect(0, 0, canvas.width, canvas.height);
    for (const element of canvasData.elements) {
      switch (element.type) {
        case 'rectangle':
          ctx.fillStyle = element.color;
          ctx.fillRect(element.x, element.y, element.width, element.height);
          break;
        case 'circle':
          ctx.fillStyle = element.color;
          ctx.beginPath();
          ctx.arc(element.x, element.y, element.radius, 0, Math.PI * 2);
          ctx.fill();
          break;
        case 'text':
          ctx.fillStyle = element.color;
          ctx.font = `${element.fontSize}px Arial`;
          ctx.fillText(element.text, element.x + 10, element.y + 10);
          break;
        case 'image-url':
          try {
            const img = await loadImage(element.imageUrl);
            ctx.drawImage(img, element.x, element.y, element.width, element.height);
          } catch (error) {
            console.error('Error loading image from URL:', error);
          }
          break;
        case 'image-upload':
          try {
            const img = await loadImage(element.imagePath);
            ctx.drawImage(img, element.x, element.y, element.width, element.height);
            
          } catch (error) {
            console.error('Error loading uploaded image:', error);
          }
          break;
        case 'stroke':
          ctx.strokeStyle = element.color || '#000';
          ctx.lineWidth = element.lineWidth || 2;
          ctx.beginPath();
          ctx.moveTo(element.fromX, element.fromY);
          ctx.lineTo(element.toX, element.toY);
          ctx.stroke();
          break;
      }
    }
    const doc = new PDFDocument({
      size: [canvasData.width, canvasData.height],
      compress: shouldCompress,
      margin: 0
    });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=canvas-export.pdf');
    doc.pipe(res);
    const buffer = shouldCompress
  ? canvas.toBuffer('image/jpeg', { quality: 0.5 }) 
  : canvas.toBuffer('image/png'); 
doc.image(buffer, 0, 0, {
  width: canvasData.width,
  height: canvasData.height
});
    doc.end();
  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({ error: 'Failed to generate PDF' });
  }
});
app.get('/api/canvas', (req, res) => {
  res.json(canvasData);
});
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
