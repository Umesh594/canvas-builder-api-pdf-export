# Canvas-Builder-API-PDF-Export
An interactive web application that allows users to draw,add shapes,text and images on a canvas and export as a PDF which is built using HTML,CSS,JavaScript,Node.js and Express.js.

# Features
# Canvas Functionality
   Initialize Canvas with custom width and height.
   Adding Rectangle with color,position and size.
   Adding Circle with color,position and radius.
   Adding Text with font size,color and positioning.
   Add Image via URL or Upload Image from local.
   Freehand Drawing and saving the strokes.
   Export as PDF with size compression if required.

# Backend Functionality
-  API endpoints to:
-  Initialize canvas
-  Add rectangle,circle,text,images
-  Save freehand strokes
-  Export current canvas as PDF

# Tech Stack Used
   Frontend: HTML,CSS,JavaScript
   Backend: Node.js,Express.js
   PDF Export: canvas&pdfkit libraries
   File Uploads: multer
   Image Processing: canvas.loadImage

# Final Notes Before Deployment
  Put both frontend and backend in the same repo.
  Push to GitHub using terminal commands above.
  Use Vercel to deploy backend & frontend separately.
  Update API_BASE_URL in frontend to point to your deployed backend.
