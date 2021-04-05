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
    photo1 && photo2 && photo1.getAttribute("src") && photo2.getAttribute("src")
      ? compare()
      : alert("Capture the second image to compare");
  },
  false
);

navigator.getUserMedia =
  navigator.getUserMedia ||
  navigator.webkitGetUserMedia ||
  navigator.mozGetUserMedia ||
  navigator.msGetUserMedia;

const startVideo = () =>
  navigator.getUserMedia(
    { video: {} },
    (stream) => (video.srcObject = stream),
    (err) => console.error(err)
  );

Promise.all([
  faceapi.nets.tinyYolov2.loadFromUri("/models"),
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
        ? alert(
            `Both the faces are the same with Euclidean Distance: ${distance}`
          )
        : alert(`Faces are not same with Euclidean Distance: ${distance}`);
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
  cv.normalize(dst, dst, 0, 255, cv.NORM_MINMAX, -1, new cv.Mat());
  cv.medianBlur(dst, dst, 3);
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
