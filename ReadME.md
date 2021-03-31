# Browser Based FaceSimilarity

## Run

```
npm i
node app.js
```

Open localhost:3000

## Limiations

- JS/Browser based availability of algorithms providing better techniques.

### Facial Recogntion
- Vulnerable to head movements
- Vulernable to faces with part of the face lying outside the canvas


### Face Similarity Matching
- Low accuracy. However, works with less complexity of input images.

## Future Work
- Train a face recogntion model with various head poses and pyramids of sample images.
- Replace face similarity algorithms that uses better facial extraction method such as Siamese Network for Face Similarity or OpenFACE.
- Homomorphic Filtering before facial recognition.
- Image smoothing before facial recognition.


## Alternatives
- Python server for facial recogntion and facial matching techniques providing better accuracy.
