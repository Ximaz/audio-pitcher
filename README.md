# Audio Pitcher

Vanillia Javascript Client-side application enabling to upload an MP3 file,
change it's pitch, play the newer version and export it, if good enough, to a
WAV file format.

# How to use ?

You need to create a small web server in order to use this project as it tries
to import Javascript modules as is, and even though it's all local files, it
causes trouble with CORS ebcause of ES6 syntax.

```bash
# Clone the project
git clone git@github.com:Ximaz/audio-pitcher

# Go to the project folder
cd audio-pitcher

# Start a small HTTP server using Python
python3 -m http.server

# Access the http://localhost:8000/ URL in your web browser.
firefox http://localhost:8000/
```
