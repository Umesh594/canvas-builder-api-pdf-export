document.addEventListener('DOMContentLoaded', function () {
    const initCanvasBtn = document.getElementById('initCanvas');
    const addRectangleBtn = document.getElementById('addRectangle');
    const addCircleBtn = document.getElementById('addCircle');
    const addTextBtn = document.getElementById('addText');
    const addImageUrlBtn = document.getElementById('addImageUrl');
    const addImageUploadBtn = document.getElementById('addImageUpload');
    const exportPdfBtn = document.getElementById('exportPdf');
    const saveStrokesBtn = document.getElementById('saveStrokes');
    const previewCanvas = document.getElementById('previewCanvas');
    const ctx = previewCanvas.getContext('2d');
    const API_BASE_URL = 'https://canvas-builder-api-pdf-export-production-95d3.up.railway.app/api';
    let freehandStrokes = [];
    let isDrawing = false;
    let lastX = 0, lastY = 0;
    let currentStroke = [];
    previewCanvas.addEventListener('mousedown', (e) => {
        isDrawing = true;
        [lastX, lastY] = [e.offsetX, e.offsetY];
        currentStroke = [[lastX, lastY]];
    });
    previewCanvas.addEventListener('mousemove', (e) => {
        if (!isDrawing) return;
        const [newX, newY] = [e.offsetX, e.offsetY];
        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(newX, newY);
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.stroke();
        currentStroke.push([newX, newY]);
        [lastX, lastY] = [newX, newY];
    });
    previewCanvas.addEventListener('mouseup', () => {
        isDrawing = false;
        if (currentStroke.length > 1) {
            freehandStrokes.push(currentStroke);
        }
    });
    previewCanvas.addEventListener('mouseout', () => isDrawing = false);
    initCanvasBtn.addEventListener('click', async () => {
        const width = document.getElementById('canvasWidth').value;
        const height = document.getElementById('canvasHeight').value;
        const response = await fetch(`${API_BASE_URL}/canvas/init`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ width, height })
        });
        const data = await response.json();
        updatePreviewCanvas(data.canvasData);
        alert('Canvas initialized');
    });
    addRectangleBtn.addEventListener('click', async () => {
    const x = document.getElementById('rectX').value;
    const y = document.getElementById('rectY').value;
    const width = document.getElementById('rectWidth').value;
    const height = document.getElementById('rectHeight').value;
    const color = document.getElementById('rectColor').value;
    try {
        const response = await fetch(`${API_BASE_URL}/canvas/add/rectangle`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ x, y, width, height, color })
        });
        const data = await response.json();
        alert('Rectangle added successfully!');
        updatePreviewCanvas(data.canvasData);
    } catch (err) {
        console.error('Error adding rectangle:', err);
        alert('Failed to add rectangle');
    }
});
    addCircleBtn.addEventListener('click', async () => {
    const x = document.getElementById('circleX').value;
    const y = document.getElementById('circleY').value;
    const radius = document.getElementById('circleRadius').value;
    const color = document.getElementById('circleColor').value;
    try {
        const response = await fetch(`${API_BASE_URL}/canvas/add/circle`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ x, y, radius, color })
        });
        const data = await response.json();
        alert('Circle added successfully!');
        updatePreviewCanvas(data.canvasData);
    } catch (err) {
        console.error('Error adding circle:', err);
        alert('Failed to add circle');
    }
});
   addTextBtn.addEventListener('click', async () => {
    const x = document.getElementById('textX').value;
    const y = document.getElementById('textY').value;
    const text = document.getElementById('textContent').value;
    const color = document.getElementById('textColor').value;
    const fontSize = document.getElementById('textSize').value;
    try {
        const response = await fetch(`${API_BASE_URL}/canvas/add/text`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ x, y, text, color, fontSize })
        });
        const data = await response.json();
        alert('Text added successfully!');
        updatePreviewCanvas(data.canvasData);
    } catch (err) {
        console.error('Error adding text:', err);
        alert('Failed to add text');
    }
});
    addImageUrlBtn.addEventListener('click', async () => {
    const x = document.getElementById('imageUrlX').value;
    const y = document.getElementById('imageUrlY').value;
    const width = document.getElementById('imageUrlWidth').value;
    const height = document.getElementById('imageUrlHeight').value;
    const imageUrl = document.getElementById('imageUrl').value;
    try {
        const response = await fetch(`${API_BASE_URL}/canvas/add/image-url`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ x, y, width, height, imageUrl })
        });
        const data = await response.json();
        alert('Image (from URL) added successfully!');
        updatePreviewCanvas(data.canvasData);
    } catch (err) {
        console.error('Error adding image from URL:', err);
        alert('Failed to add image from URL');
    }
});
    addImageUploadBtn.addEventListener('click', async () => {
    const x = document.getElementById('imageUploadX').value;
    const y = document.getElementById('imageUploadY').value;
    const width = document.getElementById('imageUploadWidth').value;
    const height = document.getElementById('imageUploadHeight').value;
    const imageFile = document.getElementById('imageFile').files[0];

    if (!imageFile) {
        alert('Please select an image file');
        return;
    }
    const formData = new FormData();
    formData.append('x', x);
    formData.append('y', y);
    formData.append('width', width);
    formData.append('height', height);
    formData.append('image', imageFile);
    try {
        const response = await fetch(`${API_BASE_URL}/canvas/add/image-upload`, {
            method: 'POST',
            body: formData
        });
        const data = await response.json();
        alert('Image uploaded and added successfully!');
        updatePreviewCanvas(data.canvasData);
    } catch (err) {
        console.error('Error uploading image:', err);
        alert('Failed to upload image');
    }
});
    saveStrokesBtn.addEventListener('click', async () => {
    if (freehandStrokes.length === 0) return alert("No freehand strokes yet.");

    const response = await fetch(`${API_BASE_URL}/canvas/add/freehand`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ strokes: freehandStrokes })
    });
    const data = await response.json();
    updatePreviewCanvas(data.canvasData);
    alert("Freehand strokes saved.");
    freehandStrokes = [];
});
    exportPdfBtn.addEventListener('click', async () => {
    try {
        if (freehandStrokes.length > 0) {
            const response = await fetch(`${API_BASE_URL}/canvas/add/freehand`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ strokes: freehandStrokes })
            });
            const data = await response.json();
            updatePreviewCanvas(data.canvasData);
            freehandStrokes = [];  
        }
    } catch (e) {
        console.warn("Couldn't sync strokes before export.", e);
    }
    const compress = document.getElementById('compressPdf')?.checked;
    window.open(`${API_BASE_URL}/canvas/export/pdf${compress ? '?compress=true' : ''}`, '_blank');
});
    async function fetchCanvasState() {
        const response = await fetch(`${API_BASE_URL}/canvas`);
        const data = await response.json();
        updatePreviewCanvas(data);
    }
    function updatePreviewCanvas(canvasData) {
        previewCanvas.width = canvasData.width;
        previewCanvas.height = canvasData.height;
        ctx.clearRect(0, 0, canvasData.width, canvasData.height);
        canvasData.elements.forEach(el => {
            switch (el.type) {
                case 'rectangle':
                    ctx.fillStyle = el.color;
                    ctx.fillRect(el.x, el.y, el.width, el.height);
                    break;
                case 'circle':
                    ctx.fillStyle = el.color;
                    ctx.beginPath();
                    ctx.arc(el.x, el.y, el.radius, 0, Math.PI * 2);
                    ctx.fill();
                    break;
                case 'text':
                    ctx.fillStyle = el.color;
                    ctx.font = `${el.fontSize}px Arial`;
                    ctx.fillText(el.text, el.x + 10, el.y + 10);
                    break;
                case 'stroke':
                    ctx.strokeStyle = el.color || '#000';
                    ctx.lineWidth = el.lineWidth || 2;
                    ctx.beginPath();
                    ctx.moveTo(el.fromX, el.fromY);
                    ctx.lineTo(el.toX, el.toY);
                    ctx.stroke();
                    break;
                case 'image-url':
                case 'image-upload':
                    ctx.fillStyle = '#ccc';
                    ctx.fillRect(el.x, el.y, el.width, el.height);
                    ctx.strokeRect(el.x, el.y, el.width, el.height);
                    ctx.fillStyle = '#555';
                    ctx.fillText('Image Placeholder', el.x + 5, el.y + 20);
                    break;
            }
        });
    }
    fetchCanvasState();
});
