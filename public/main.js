const video = document.getElementById("video");

var canvas = null;
var count = 0;

var photo1 = null;
var photo2 = null;
photo1 = document.getElementById("photo1");
photo2 = document.getElementById("photo2");

var startbutton = null;
startbutton = document.getElementById("startbutton");
startbutton.addEventListener(
  "click",
  (event) => {
    event.preventDefault();
    takepicture();
  },
  false
);

var comparebutton = null;
comparebutton = document.getElementById("comparebutton");
comparebutton.addEventListener(
  "click",
  (event) => {
    event.preventDefault();
    compare();
  },
  false
);

const startVideo = () =>
  navigator.getUserMedia(
    { video: {} },
    (stream) => (video.srcObject = stream),
    (err) => console.error(err)
  );

Promise.all([
  faceapi.nets.ssdMobilenetv1.loadFromUri("/models"),
  faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
  faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
]).then(startVideo);

const detectFacial = async (data, element) =>
  await faceapi.fetchImage(data).then(
    async (photo1D) =>
      await faceapi
        .detectAllFaces(photo1D)
        .withFaceLandmarks()
        .then(
          (detections) =>
            detections &&
            detections.length > 0 &&
            extractFaceFromBox(photo1D, detections[0].detection.box, element)
        )
  );

video.addEventListener("play", () => {
  canvas = faceapi.createCanvasFromMedia(video);
  document.body.append(canvas);
});

const compare = async () =>
  Promise.all([
    faceapi.fetchImage(photo1.getAttribute("src")),
    faceapi.fetchImage(photo2.getAttribute("src")),
  ]).then((result) => {
    Promise.all([
      faceapi.computeFaceDescriptor(result[0]),
      faceapi.computeFaceDescriptor(result[1]),
    ]).then((descriptors) => {
      const distance = faceapi.utils.round(
        faceapi.euclideanDistance(descriptors[0], descriptors[1])
      );
      distance < 0.6
        ? alert(`Same with Euclidean Distance: ${distance}`)
        : alert(`Not same with Euclidean Distance: ${distance}`);
    });
  });

// This function extract a face from video frame with giving bounding box and display result into outputimage
const extractFaceFromBox = async (inputImage, box, element) =>
  // Second parameter is the region to extract
  await faceapi
    .extractFaces(inputImage, [
      new faceapi.Rect(box.x, box.y, box.width, box.height),
    ])
    .then((faceImages) =>
      faceImages.length == 0
        ? console.log("Face not found")
        : faceImages.forEach((cnv) => (element.src = cnv.toDataURL()))
    );

const preProcessCanvasImage = () => {
  let mat = cv.imread(canvas);
  let dst = new cv.Mat();
  cv.cvtColor(mat, mat, cv.COLOR_RGBA2GRAY, 0);
  cv.equalizeHist(mat, dst);
  cv.normalize(mat, dst, 0, 255, cv.NORM_MINMAX, -1, new cv.Mat());
  cv.imshow(canvas, mat);
  cv.imshow(canvas, dst);
  mat.delete();
  dst.delete();
  return canvas.toDataURL("image/png");
};

const takepicture = async () => {
  var context = canvas.getContext("2d");
  const width = video.width;
  const height = video.height;
  canvas.width = width;
  canvas.height = height;
  context.drawImage(video, 0, 0, width, height);
  var data = preProcessCanvasImage();
  if (count === 0) {
    photo1.setAttribute("src", data);
    detectFacial(data, photo1);
    count = 1;
  } else if (count === 1) {
    photo2.setAttribute("src", data);
    detectFacial(data, photo2);
    count = 0;
  }
};

// var width = 320; // We will scale the photo width to this
// var height = 300; // This will be computed based on the input stream
// var streaming = false;
// var video = null;
// var photo1Data = null;
// var photo2Data = null;

// var compareButton = null;
// video = document.getElementById("video");
// canvas = document.getElementById("canvas");
// compareButton = document.getElementById("compare");

// faceapi.env.monkeyPatch({
//   Canvas: HTMLCanvasElement,
//   Image: HTMLImageElement,
//   ImageData: ImageData,
//   Video: HTMLVideoElement,
//   createCanvasElement: () => document.createElement("canvas"),
//   createImageElement: () => document.createElement("img"),
//   readFile: () => fs.readFile("/"),
// });
// compareButton.addEventListener(
//   "click",
//   async function () {
//     await faceapi.loadSsdMobilenetv1Model("/");
//     await faceapi.loadFaceLandmarkModel("/");
//     await faceapi.loadFaceRecognitionModel("/");
//     await faceapi.nets.ssdMobilenetv1.loadFromDisk("/");
//     await faceapi.loadFaceRecognitionModel();

//     var photo1D = await faceapi.fetchImage(photo1Data);
//     var photo2D = await faceapi.fetchImage(photo2Data);

//     var desc1 = await faceapi.computeFaceDescriptor(photo1D);
//     var desc2 = await faceapi.computeFaceDescriptor(photo2D);
//     const distance = faceapi.utils.round(
//       faceapi.euclideanDistance(desc1, desc2)
//     );
//     let fullFaceDescriptions = await faceapi
//       .detectAllFaces(photo1D)
//       .withFaceLandmarks()
//       .withFaceDescriptors();
//     faceapi.draw.drawDetections(canvas, fullFaceDescriptions);

//     console.log("Distance");
//     if (distance > 0.6) {
//       alert("same");
//     } else {
//       alert("not");
//     }
//   },
//   false
// );

// video.addEventListener(
//   "canplay",
//   async function (ev) {
//     if (!streaming) {
//       const width = 640;
//       const height = 480;
//       video.setAttribute("width", width);
//       video.setAttribute("height", height);
//       canvas.setAttribute("width", width);
//       canvas.setAttribute("height", height);
//       streaming = true;
//     }
//   },
//   false
// );

// let outputImage = document.getElementById("outputImage");

// // This function extract a face from video frame with giving bounding box and display result into outputimage
// async function extractFaceFromBox(inputImage, box) {
//   const regionsToExtract = [
//     new faceapi.Rect(box.x, box.y, box.width, box.height),
//   ];

//   let faceImages = await faceapi.extractFaces(inputImage, regionsToExtract);

//   if (faceImages.length == 0) {
//     console.log("Face not found");
//   } else {
//     faceImages.forEach((cnv) => {
//       outputImage.src = cnv.toDataURL();
//     });
//   }
// }

// const startup = () => {
//   navigator.mediaDevices
//     .getUserMedia({ video: true, audio: false })
//     .then(async (stream) => {
//       await faceapi.loadSsdMobilenetv1Model("/");
//       await faceapi.loadFaceLandmarkModel("/");
//       await faceapi.loadFaceRecognitionModel("/");
//       // await faceapi.nets.ssdMobilenetv1.load("/");

//       video.srcObject = stream;
//       video.play();
//     })
//     .catch((err) => {
//       console.log("An error occurred: " + err);
//     });

//   clearphoto();
// };

// const clearphoto = () => {
//   var context = canvas.getContext("2d");
//   context.fillStyle = "#AAA";
//   context.fillRect(0, 0, canvas.width, canvas.height);
//   var data = canvas.toDataURL("image/png");
//   photo1.setAttribute("src", data);
// };

// const recognizeFace = async (img) => {
//   canvas = faceapi.createCanvasFromMedia(video);
//   document.body.append(canvas);
//   const displaySize = { width: video.width, height: video.height };
//   console.log("Display size: ", displaySize);
//   faceapi.matchDimensions(canvas, displaySize);
//   let detections = await faceapi
//     .detectAllFaces(photo1)
//     .withFaceLandmarks()
//     .withFaceDescriptors();

//   console.log("detections: ", detections);
//   //Call this function to extract and display face
//   extractFaceFromBox(img, detections[0].detection.box);

//   const resizedDetections = faceapi.resizeResults(detections, displaySize);
//   console.log("resized: ", resizedDetections);
//   return resizedDetections;
//   // canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
//   // faceapi.draw.drawDetections(canvas, resizedDetections);
// };

// startup();
