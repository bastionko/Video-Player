let playPauseBtn = document.querySelector(".play-pause-btn");
let miniPlayerBtn = document.querySelector(".mini-player-btn");
let theaterBtn = document.querySelector(".theater-btn");
let fullScreenBtn = document.querySelector(".full-screen-btn");
let mutedBtn = document.querySelector('.mute-btn');
let captionsBtn = document.querySelector('.captions-btn');
let currentTimeElement = document.querySelector('.current-time');
let totalTimeElement = document.querySelector('.total-time');
let volumeSlider = document.querySelector('.volume-slider');
let videoContainer = document.querySelector('.video-container');
let video = document.querySelector('video');
let videoControls = document.querySelector('.video-controls-container')
let timeline = document.querySelector('.timeline');
let container = document.querySelector('container')
let monitor = document.querySelector('#monitor')


function handleFile(file) {
    const videoURL = URL.createObjectURL(file);
    const trackElement = document.querySelector('track');
    videoContainer.classList.remove('captions')
    videoContainer.classList.add("paused");
    if (trackElement) {
        video.removeChild(trackElement);
    }
    video.src = videoURL;
    video.load();
}

function handleSubtitleFile(file) {
    const subtitleURL = URL.createObjectURL(file);
    const oldTrack = document.querySelector('track');
    oldTrack ? oldTrack.remove() : null
    const newTrack = document.createElement('track');
    newTrack.src = subtitleURL;
    newTrack.kind = 'subtitles';
    newTrack.srclang = 'en';
    newTrack.label = 'English';
    newTrack.default = true;
    video.appendChild(newTrack);
    const captions = video.textTracks[0];
    captions.mode = "hidden";
}

let captions = video.textTracks[0];
if (captions) captions.mode = "hidden";

captionsBtn.addEventListener('click', toggleCaptions);

function toggleCaptions(){
    let captions = video.textTracks[0];
    if (captions) {
        let isHidden = captions.mode === "hidden";
        captions.mode = isHidden ? "showing" : "hidden";
        videoContainer.classList.toggle("captions", isHidden);
    }
}

document.addEventListener('keydown', e => {
    let tagName = document.activeElement.tagName.toLowerCase();

    if (tagName === "input") return;
    switch (e.key.toLowerCase()) {
        case " ":
            if (tagName === "button") return;
        case "k":
            togglePlay()
            break
        case "f":
            toggleFullScreenMode()
            break
        case "t":
            toggleTheaterMode()
            break
        case "i":
            toggleMiniPlayerMode()
            break
        case "m":
            toggleMute()
            break
        case "arrowleft":
        case "j":
            skip(-5)
            break
        case "arrowright":
        case "l":
            skip(5)
            break
        case "c":
            toggleCaptions()
            break
    }
})

video.addEventListener("loadeddata", () => {
    totalTimeElement.textContent = formatDuration(video.duration);
    const timelineElements = Math.floor(video.duration);
    timeline.innerHTML = '';
    for (let i = 0; i < video.duration; i++) {
        const timelineElement = document.createElement('div');
        timelineElement.classList.add('timeline-element');
        timeline.appendChild(timelineElement);
    }
});

video.addEventListener('timeupdate', () => {
    currentTimeElement.textContent = formatDuration(video.currentTime);
    const timelineElements = timeline.querySelectorAll('.timeline-element');
    timelineElements.forEach(function(element, index) {
        if (index <= video.currentTime) {
            element.style.width = '100%';
            element.style.background = "red";
        } else {
            element.style.width = '100%';
            element.style.background = "grey";

        }
    });
})

timeline.addEventListener('click', (event) => {
    const timelineRect = timeline.getBoundingClientRect();
    const clickX = event.clientX - timelineRect.left;
    const timelineWidth = timelineRect.width;
    video.currentTime = (clickX / timelineWidth) * video.duration;
});

function formatDuration(time){
    let seconds = Math.floor(time % 60);
    let minutes = Math.floor(time / 60) % 60;
    let hours = Math.floor(time / 3600);

    seconds = seconds < 10 ? `0${seconds}` : seconds;
    minutes = minutes < 10 ? `0${minutes}` : minutes;
    hours = hours < 10 ? `0${hours}` : hours;

    if (hours == 0){
        return `${minutes}:${seconds}`;
    } else{
        return `${hours}:${minutes}:${seconds}`
    }
}

function skip(duration){
    video.currentTime += duration;
}

mutedBtn.addEventListener('click', toggleMute);
volumeSlider.addEventListener('input', e => {
    video.volume = e.target.value;
    video.muted = e.target.value === 0;
})

function toggleMute(){
    video.muted = !video.muted;
}

window.onload = () => {
    if (localStorage.getItem("videoPlayerVolume") != null) {
        volumeSlider.value = localStorage.getItem("videoPlayerVolume")
        video.volume = volumeSlider.value
    }
}

function setVolume() {
        localStorage.setItem("videoPlayerVolume", volumeSlider.value)
}

video.addEventListener('volumechange', () => {
    volumeSlider.value = video.volume;
    let volumeLevel;
    if (video.muted || video.volume === 0){
        volumeSlider.value = 0;
        volumeLevel = "muted";
    } else if(video.volume >= .5){
        volumeLevel = "high";
    } else{
        volumeLevel = "low";
    }

    videoContainer.dataset.volumeLevel = volumeLevel;
})

theaterBtn.addEventListener('click', toggleTheaterMode);
fullScreenBtn.addEventListener('click', toggleFullScreenMode);
miniPlayerBtn.addEventListener('click', toggleMiniPlayerMode);

function toggleTheaterMode(){
    container.classList.toggle("theater");
    monitor.classList.toggle("theater-mode");
}


function toggleFullScreenMode(){

    if (!document.fullscreenElement){
        videoContainer.requestFullscreen();
    } else{
        document.exitFullscreen();
    }
}

function toggleMiniPlayerMode(){
    if (videoContainer.classList.contains("mini-player")){
        document.exitPictureInPicture();
    } else{
        video.requestPictureInPicture();
    }
}

document.addEventListener('fullscreenchange', () => {
    videoContainer.classList.toggle("full-screen", document.fullscreenElement);
});

video.addEventListener("enterpictureinpicture", () => {
    videoContainer.classList.add("mini-player")
})

video.addEventListener("leavepictureinpicture", () => {
    videoContainer.classList.remove("mini-player")
})

// Play/Pause
playPauseBtn.addEventListener('click', togglePlay);
video.addEventListener('click', togglePlay);

let hideControlsTimeout;

function hideControls() {
    clearTimeout(hideControlsTimeout);
    hideControlsTimeout = setTimeout(() => {
        videoControls.style.opacity = "0";
        videoContainer.style.cursor = "none";
    }, 3000);
}

function showControls() {
    videoControls.style.opacity = "1";
    videoContainer.style.cursor = "default";
}

function togglePlay() {

   if (video.paused){
       video.play()
       videoContainer.addEventListener('mousemove', hideControls);
       videoContainer.addEventListener('mousemove', showControls);
   } else{
       video.pause()
       videoContainer.removeEventListener('mousemove', hideControls);
       videoContainer.removeEventListener('mousemove', showControls);
       clearTimeout(hideControlsTimeout)
   }
}

video.addEventListener('play', () => {
    videoContainer.classList.remove("paused");
})

video.addEventListener('pause', () => {
    videoContainer.classList.add("paused");
})