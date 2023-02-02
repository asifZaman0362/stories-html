class PageData {
    constructor(src, type, more) {
        this.src = src;
        this.type = type;
        this.more = more;
    }
}

class StoryPage {
    constructor(page_data) {
        this.data = page_data;
        this.progressBar = createProgressBar();
    }
}

class Story {

    pages = [];
    element = null;
    parent = null;
    image_element = null;
    video_element = null;
    page_index = null;
    buttonPlay = null;
    buttonMute = null;
    muted = false;
    playing = false;

    constructor(pages) {
        let storyParent = document.createElement('div');
        storyParent.className = "story-wrapper";

        let arrow_left = document.createElement('i');
        arrow_left.classList.add('fa-solid', 'fa-chevron-left');
        arrow_left.onclick = prevPage;        

        let arrow_right = document.createElement('i');
        arrow_right.classList.add('fa-solid', 'fa-chevron-right');
        arrow_right.onclick = nextPage;

        let storyElement = document.createElement('div');
        storyElement.className = 'story';

        storyParent.appendChild(arrow_left);
        storyParent.appendChild(storyElement);
        storyParent.appendChild(arrow_right);

        let progressBarContainer = document.createElement('div');
        progressBarContainer.className = "progress-bar-container";
        
        let buttonBar = document.createElement('div');
        buttonBar.className = 'button-bar';
        this.buttonMute = document.createElement('i');
        this.buttonMute.classList.add('fa-solid', 'fa-volume-high');
        this.buttonPlay = document.createElement('i');
        this.buttonPlay.classList.add('fa-solid', 'fa-play');
        buttonBar.appendChild(this.buttonMute);
        buttonBar.appendChild(this.buttonPlay);
        this.buttonPlay.onclick = togglePlayPause;
        this.buttonMute.onclick = toggleMute;

        let mediaWrapper = document.createElement('div');
        mediaWrapper.className = "page-media-container";

        this.video_element = document.createElement('video');
        this.video_element.autoplay = true;
        this.image_element = document.createElement('img');

        let cover = document.createElement('div');
        cover.className = "img-cover";

        mediaWrapper.appendChild(this.image_element);
        mediaWrapper.appendChild(this.video_element);
        mediaWrapper.appendChild(cover);

        storyElement.appendChild(progressBarContainer);
        storyElement.appendChild(buttonBar);
        storyElement.appendChild(mediaWrapper);

        let vid = null;

        for (var page_data of pages) {
            let page = new StoryPage(page_data);
            this.pages.push(page);
            progressBarContainer.appendChild(page.progressBar);
            let timer = page.progressBar;
            if (page_data.type == "video") {
                vid = this.video_element;
                vid.addEventListener('loadedmetadata', () => {
                    timer.max = (vid.duration / (TIMER_DURATION / 1000)) * 100;
                });
            }
        }

        this.element = storyElement;
        this.parent = storyParent;
        this.nextPage();
    }
    
    nextPage() {
        if (this.video_element) {
            this.video_element.pause();
        }
        if (this.page_index == null) {
            this.page_index = 0;
        } else {
            if (this.page_index == this.pages.length - 1) {
                return false;
            }
            this.page_index++;
        }
        let page = this.pages[this.page_index];
        if (page.data.type == "image") {
            this.image_element.classList.remove('hidden');
            this.image_element.src = page.data.src;
            this.video_element.classList.add('hidden');
        } else {
            this.video_element.classList.remove('hidden');
            this.video_element.src = page.data.src;
            this.image_element.classList.add('hidden');
            //this.video_element.play(); // Autoplay takes care of this
        }
        page.progressBar.value = 0;
        this.playing = true;
        return true;
    }

    prevPage() {
        if (this.video_element) this.video_element.pause();
        if (this.page_index == 0) {
            return false;
        } else {
            this.page_index--;
            let page = this.pages[this.page_index];
            if (page.data.type == "image") {
                this.image_element.classList.remove('hidden');
                this.image_element.src = page.data.src;
                this.video_element.classList.add('hidden');
            } else {
                this.video_element.classList.remove('hidden');
                this.video_element.src = page.data.src;
                this.image_element.classList.add('hidden');
            }
            page.progressBar.value = 0;
            return true;
        }
    }
    
    tick() {
        let progressBar = this.pages[this.page_index].progressBar;
        if (progressBar.value >= Math.floor(progressBar.max)) {
            return this.nextPage();
        } else {
            progressBar.value++;
            return true;
        }
    }
    
    toggleMute() {
        if (this.video_element && this.pages[this.page_index].data.type == "video") {
            if (this.muted) {
                this.video_element.volume = 1;
                this.buttonMute.classList.replace('fa-volume-xmark', 'fa-volume-high')
            }
            else {
                this.video_element.volume = 0;
                this.buttonMute.classList.replace('fa-volume-high', 'fa-volume-xmark')
            }
            this.muted = !this.muted;
        }
    }
    
    stop() {
        if (this.video_element && this.pages[this.page_index].data.type == "video") {
            this.video_element.pause();
        }
        this.buttonPlay.classList.replace('fa-play', 'fa-pause');
        pause();
        this.playing = false;
    }

    togglePlaying() {
        if (this.playing) {
            if (this.video_element && this.pages[this.page_index].data.type == "video") {
                this.video_element.pause();
            }
            this.buttonPlay.classList.replace('fa-play', 'fa-pause');
            pause();
        } else {
            if (this.video_element && this.pages[this.page_index].data.type == "video") {
                this.video_element.play();
            }
            this.buttonPlay.classList.replace('fa-pause', 'fa-play');
            resume();
        }
        this.playing = !this.playing;
    }
}

let carousel = null;
let story_elements = [];
let started = false;
let ended = false;
let focused_story = null;
let timer = null;
let main_element = null;

function createProgressBar() {
    let progressBar = document.createElement('input');
    progressBar.type = "range";
    progressBar.min = 0;
    progressBar.max = 100;
    progressBar.value = 0;
    progressBar.className = "story-page-progress-bar";
    return progressBar;
}

function generateDom() {
    let background = document.createElement('div');
    background.className = "transparent-background-carousel";
    main_element = background;

    carousel = document.createElement('div');
    carousel.className = "stories-carousel";
    background.appendChild(carousel);
    document.body.appendChild(background);

    let closeButton = document.createElement('i');
    closeButton.classList.add('fa-solid', 'fa-xmark', 'close-button');
    closeButton.onclick = closeCarousel;
    background.appendChild(closeButton);

}

function init() {
    generateDom();
    createStories(story_data);
    closeCarousel();
    createGallery(story_data);
}

function createStories(stories_data) {
    for (var pages of stories_data) {
        let story = new Story(pages);
        story_elements.push(story);
        carousel.appendChild(story.parent);
    }
    //start();
}

function getVideoCover(file, seekTo = 1.0) {
    console.log("getting video cover for file: ", file);
    return new Promise((resolve, reject) => {
        // load the file to a video player
        const videoPlayer = document.createElement('video');
        videoPlayer.setAttribute('src', file);
        videoPlayer.load();
        videoPlayer.addEventListener('error', (ex) => {
            reject("error when loading video file", ex);
        });
        // load metadata of the video to get video duration and dimensions
        videoPlayer.addEventListener('loadedmetadata', () => {
            // seek to user defined timestamp (in seconds) if possible
            if (videoPlayer.duration < seekTo) {
                reject("video is too short.");
                return;
            }
            // delay seeking or else 'seeked' event won't fire on Safari
            setTimeout(() => {
              videoPlayer.currentTime = seekTo;
            }, 200);
            // extract video thumbnail once seeking is complete
            videoPlayer.addEventListener('seeked', () => {
                console.log('video is now paused at %ss.', seekTo);
                // define a canvas to have the same dimension as the video
                const canvas = document.createElement("canvas");
                canvas.width = videoPlayer.videoWidth;
                canvas.height = videoPlayer.videoHeight;
                // draw the video frame to canvas
                const ctx = canvas.getContext("2d");
                ctx.drawImage(videoPlayer, 0, 0);
                resolve(ctx.canvas);
            });
        });
    });
}

async function createGallery(stories_data) {
    let gallery_target = document.getElementById("stories-gallery");
    let index = 0;
    for (var data of stories_data) {
        let image = null;
        if (data[0].type == "video") {
            let canvas = await getVideoCover(data[0].src);
            gallery_target.appendChild(canvas);
            continue;
        } else {
            image = document.createElement('img');
            image.src = data[0].src;
        }
        image.className = 'stories-gallery-image';
        //image.setAttribute('index', index++);
        gallery_target.appendChild(image);
    }
}

function nextPage() {
    if (focused_story == null) {
        alert("not running!");
    } else {
        if (!story_elements[focused_story].nextPage()) {
            nextStory();
        }
    }
}

function prevPage() {
    if (focused_story == null) {
        alert("not running!");
    } else {
        if (!story_elements[focused_story].prevPage()) {
            prevStory();
        }
    }
    ended = false;
}

function updateScroll() {
    if (!started || ended) {
        return;
    }
    if (carousel.clientWidth < document.body.clientWidth) {
        carousel.style.left = ((document.body.clientWidth - carousel.clientWidth) / 2) + "px";
    } else {
        let distanceToFocused = story_elements[focused_story].element.parentElement.offsetLeft;
        let elementSize = story_elements[focused_story].element.parentElement.clientWidth;
        let scroll = (-distanceToFocused + ((document.body.clientWidth - elementSize) / 2)) + "px";
        carousel.style.left = scroll;
    }
}

function nextStory() {
    if (focused_story == null) {
        focused_story = 0;
        story_elements[focused_story].element.classList.add("focused");
        story_elements[focused_story].parent.classList.add("focused");
        return;
    }
    else {
        if (focused_story == story_elements.length - 1) {
            ended = true;
        } else {
            story_elements[focused_story].element.classList.remove("focused");
            story_elements[focused_story].parent.classList.remove("focused");
            focused_story++;
            story_elements[focused_story].element.classList.add("focused");
            story_elements[focused_story].parent.classList.add("focused");
        }
    }
}

function prevStory() {
    if (focused_story == 0) {
        alert("reached beginning!");
    } else {
        story_elements[focused_story].element.classList.remove("focused");
        story_elements[focused_story].parent.classList.remove("focused");
        focused_story--;
        let story = story_elements[focused_story];
        story.element.classList.add("focused");
        story.parent.classList.add("focused");
        story.pages[story.pages.length - 1].progressBar.value = 0;
    }
    ended = false;
}

// don't call this manually, only story objects are meant to call this function
function pause() {
    if (!timer) return;
    clearInterval(timer);
    timer = null;
}

// don't call this manually, only story objects are meant to call this function
function resume() {
    if (timer == null)
        restartInterval();
}

function toggleMute() {
    if (focused_story != null && focused_story < story_elements.length) {
        story_elements[focused_story].toggleMute();
    }
}

function togglePlayPause() {
    if (focused_story != null && focused_story < story_elements.length) {
        story_elements[focused_story].togglePlaying();
    }
}

function tick() {
    if (story_elements[focused_story]) {
        if (!story_elements[focused_story].tick()) {
            nextStory();
        }
    }
    updateScroll();
}

function restartInterval() {
    timer = setInterval(tick, TIMER_DURATION / 100);
}

function stopInterval() {
    clearInterval(timer);
}

function halt() {
    clearInterval(timer);
    timer = null;
    if (focused_story != undefined && story_elements.length > focused_story) {
        story_elements[focused_story].stop();
    }
}

function closeCarousel() {
    halt();
    main_element.classList.add('behind');
}

function start() {
    started = true;
    nextStory();
    restartInterval();
}

function keyListener(event) {
    switch (event.keyCode) {
        case 37: {
            prevPage();
            break;
        } case 39: {
            nextPage();
            break;
        } case 32: {
            togglePlayPause();
            break;
        } 
    }
}

window.addEventListener('load', init);
window.addEventListener('keydown', keyListener);