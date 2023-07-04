// Declare class names at the top
const YTP_CHROME_CONTROLS_CLASS = "ytp-chrome-controls";
const VIDEO_STREAM_CLASS = "video-stream";
const BOOKMARK_BTN_CLASS = "bookmark-btn";

let youtubeControls;
let youtubePlayer;
let currentVideo = "";
let currentVideoBookmarks = [];

const getTime = (t) => new Date(t * 1e3).toISOString().substr(11, 8);

const fetchBookmarks = async () =>
	new Promise((resolve) =>
		chrome.storage.sync.get([currentVideo], ({ [currentVideo]: current }) =>
			resolve(current ? JSON.parse(current) : [])
		)
	);

const showMessage = (message, time, style) => {
	let messageDiv = document.createElement("div");
	messageDiv.textContent = message;
	messageDiv.style = style;
	document.body.appendChild(messageDiv);
	setTimeout(() => (messageDiv.style.opacity = "0"), time * 0.75);
	setTimeout(() => document.body.removeChild(messageDiv), time);
};

const createBookmarkBtn = () => {
	const bookmarkBtn = document.createElement("img");
	bookmarkBtn.src = chrome.runtime.getURL("assets/timetag.png");
	bookmarkBtn.className = `${YTP_CHROME_CONTROLS_CLASS} ${BOOKMARK_BTN_CLASS}`;
	bookmarkBtn.title = "Click to add a time tag";
	bookmarkBtn.style = "height:30px; width:30px; margin:auto; cursor:pointer;";
	return bookmarkBtn;
};

const setupYoutubeControlsAndPlayer = () => {
	youtubeControls = document.getElementsByClassName(
		YTP_CHROME_CONTROLS_CLASS
	)[0];
	youtubeControls.style.display = "flex";
	youtubePlayer = document.getElementsByClassName(VIDEO_STREAM_CLASS)[0];
};

// const newVideoLoaded = async () => {
// 	const bookmarkBtnExists =
// 		document.getElementsByClassName(BOOKMARK_BTN_CLASS)[0];
// 	setupYoutubeControlsAndPlayer();
// 	currentVideoBookmarks = await fetchBookmarks();
// 	if (!bookmarkBtnExists && youtubeControls) {
// 		const bookmarkBtn = createBookmarkBtn();
// 		youtubeControls.appendChild(bookmarkBtn);
// 		bookmarkBtn.addEventListener("click", addNewBookmarkEventHandler);
// 	}
// };

const newVideoLoaded = async () => {
	setupYoutubeControlsAndPlayer();
	currentVideoBookmarks = await fetchBookmarks();

	// Check if the bookmark button exists after setting up youtubeControls
	const bookmarkBtnExists = youtubeControls.querySelector(
		`.${BOOKMARK_BTN_CLASS}`
	);

	if (!bookmarkBtnExists && youtubeControls) {
		const bookmarkBtn = createBookmarkBtn();
		youtubeControls.appendChild(bookmarkBtn);
		bookmarkBtn.addEventListener("click", addNewBookmarkEventHandler);
	}
};

const addNewBookmarkEventHandler = async () => {
	const currentTime = youtubePlayer.currentTime;
	const videoTitle = document.title;
	const newBookmark = {
		time: currentTime,
		desc: getTime(currentTime),
		title: videoTitle,
		videoId: currentVideo,
	};
	chrome.storage.sync.get(["allBookmarks"], ({ allBookmarks: all }) => {
		let allBookmarks = all ? JSON.parse(all) : [];
		allBookmarks.push(newBookmark);
		chrome.storage.sync.set({ allBookmarks: JSON.stringify(allBookmarks) });
	});
	showMessage(
		"Video time tag added!",
		4000,
		`font-size: 1.5rem; position: fixed; z-index: 1000; background-color: #4CAF50; border-radius: 0.5rem; color: white; padding: 15px; bottom: 30px; right: 30px; transition: opacity 1s; opacity: 1;`
	);
};

chrome.runtime.onMessage.addListener((message, sender, response) => {
	const { type, value, videoId } = message;
	if (type === "NEW") {
		currentVideo = videoId;
		newVideoLoaded();
	} else if (type === "PLAY") {
		youtubePlayer.currentTime = value;
	} else if (type === "DELETE") {
		currentVideoBookmarks = currentVideoBookmarks.filter(
			(bookmark) => bookmark.time != value
		);
		chrome.storage.sync.set({
			[currentVideo]: JSON.stringify(currentVideoBookmarks),
		});
		response(currentVideoBookmarks);
	}
});
