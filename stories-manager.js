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
    image_element = null;
    video_element = null;
    page_index = null;

    constructor(pages) {
        let storyWrapper = document.createElement('div');
        storyWrapper.className = 'story';
        let progressBarContainer = document.createElement('div');
        progressBarContainer.className = "progress-bar-container";
        let mediaWrapper = document.createElement('div');
        mediaWrapper.className = "page-media-container";
        this.video_element = document.createElement('video');
        this.image_element = document.createElement('img');
        let cover = document.createElement('div');
        cover.className = "img-cover";
        mediaWrapper.appendChild(this.image_element);
        mediaWrapper.appendChild(this.video_element);
        mediaWrapper.appendChild(cover);
        storyWrapper.appendChild(progressBarContainer);
        storyWrapper.appendChild(mediaWrapper);
        for (var page_data of pages) {
            let page = new StoryPage(page_data);
            this.pages.push(page);
            progressBarContainer.appendChild(page.progressBar);
        }
        this.element = storyWrapper;
        this.nextPage();
    }
    
    nextPage() {
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
        }
        page.progressBar.value = 0;
        return true;
    }
    
    tick() {
        let progressBar = this.pages[this.page_index].progressBar;
        if (Math.ceil(progressBar.value) >= progressBar.max) {
            return this.nextPage();
        } else {
            progressBar.value++;
            return true;
        }
    }

}

let carousel = null;
let story_elements = [];
let started = false;
let ended = false;
let focused_story = null;
let timer = null;

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
    carousel = document.createElement('div');
    carousel.className = "stories-carousel";
    document.body.appendChild(carousel);
}

function init() {
    generateDom();
    createStories(story_data);
}

function createStories(stories_data) {
    for (var pages of stories_data) {
        let story = new Story(pages);
        story_elements.push(story);
        carousel.appendChild(story.element);
    }
    start();
}

function nextStory() {
    if (focused_story == null) {
        console.log('start');
        focused_story = 0;
        story_elements[focused_story].element.classList.add("focused");
        return;
    }
    else {
        if (focused_story == story_elements.length - 1) {
            ended = true;
        } else {
            story_elements[focused_story].element.classList.remove("focused");
            focused_story++;
            story_elements[focused_story].element.classList.add("focused");
        }
    }
}

function tick() {
    if (story_elements[focused_story]) {
        if (!story_elements[focused_story].tick()) {
            nextStory();
        }
    }
}

function restartInterval() {
    timer = setInterval(tick, TIMER_DURATION / 100);
}

function stopInterval() {
    clearInterval(timer);
}

function start() {
    started = true;
    nextStory();
    restartInterval();
}

window.addEventListener('load', init);