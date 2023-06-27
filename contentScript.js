(() => {
	const getTime = (t) => {
		var date = new Date(0);
		date.setSeconds(t);
		return date.toISOString().substr(11, 8);
	};

	let youtubeControls, youtubePlayer;
	let currentVideo = "";
	//storage all current video bookmarks
	let currentVideoBookmarks = [];

	const fetchBookmarks = async () => {
		return new Promise((resolve) => {
			chrome.storage.sync.get([currentVideo], (obj) => {
				resolve(obj[currentVideo] ? JSON.parse(obj[currentVideo]) : []);
			});
		});
	};

	const createBookmarkBtn = () => {
		const bookmarkBtn = document.createElement("img");

		bookmarkBtn.src = chrome.runtime.getURL("assets/timetag.png");
		bookmarkBtn.className = "ytp-button " + "bookmark-btn";
		bookmarkBtn.title = "Click to bookmark current timestamp";
		bookmarkBtn.style = "height:30px; width:30px; margin:auto";

		return bookmarkBtn;
	};

	const addNewBookmarkEventHandler = async (e) => {
		const currentTime = youtubePlayer.currentTime;
		const videoTitle = document.title; // Get the title of the video
		const newBookmark = {
			time: currentTime,
			desc: getTime(currentTime),
			title: videoTitle, // Add the title to the bookmark
			videoId: currentVideo, // Add the video id to the bookmark
		};
		// Fetch all bookmarks
		chrome.storage.sync.get(["allBookmarks"], (data) => {
			let allBookmarks = data["allBookmarks"]
				? JSON.parse(data["allBookmarks"])
				: [];
			allBookmarks.push(newBookmark); // Add the new bookmark to the list of all bookmarks
			// Store all bookmarks
			chrome.storage.sync.set({
				allBookmarks: JSON.stringify(allBookmarks),
			});
		});

		// Create a new div element to display the message
		let messageDiv = document.createElement("div");
		messageDiv.textContent = "Video has been bookmarked!";
		messageDiv.style = `
			position: fixed;
			z-index: 1000;
			background-color: #4CAF50; /* Green background */
			color: white; /* White text color */
			padding: 15px; /* Some padding */
			bottom: 30px; /* Place it at the top */
			right: 30px; /* Place it at the right */
			transition: opacity 1s; /* Fade out after 1 second */
			opacity: 1; /* Fully opaque initially */
		`;
		// Append the message div to the body
		document.body.appendChild(messageDiv);
		// After 3 seconds, start fading out the message
		setTimeout(() => {
			messageDiv.style.opacity = "0";
		}, 3000);
		// After 4 seconds, remove the message div from the body
		setTimeout(() => {
			document.body.removeChild(messageDiv);
		}, 4000);
	};

	const setupYoutubeControlsAndPlayer = () => {
		youtubeControls = document.getElementsByClassName(
			"ytp-chrome-controls"
		)[0];
		youtubeControls.style.display = "flex";
		youtubePlayer = document.getElementsByClassName("video-stream")[0];
	};

	const newVideoLoaded = async () => {
		const bookmarkBtnExists =
			document.getElementsByClassName("bookmark-btn")[0];

		// Setup YouTube controls and player
		setupYoutubeControlsAndPlayer();

		// Fetch bookmarks
		currentVideoBookmarks = await fetchBookmarks();

		if (!bookmarkBtnExists && youtubeControls) {
			const bookmarkBtn = createBookmarkBtn();

			// Add control in YouTube
			youtubeControls.appendChild(bookmarkBtn);
			bookmarkBtn.addEventListener("click", addNewBookmarkEventHandler);
		}
	};

	chrome.runtime.onMessage.addListener((obj, sender, response) => {
		const { type, value, videoId } = obj;

		if (type === "NEW") {
			currentVideo = videoId;
			newVideoLoaded();
		} else if (type === "PLAY") {
			// Read this message and play controls
			youtubePlayer.currentTime = value;
		} else if (type === "DELETE") {
			// Delete controls
			currentVideoBookmarks = currentVideoBookmarks.filter(
				(b) => b.time != value
			);
			chrome.storage.sync.set({
				[currentVideo]: JSON.stringify(currentVideoBookmarks),
			});

			response(currentVideoBookmarks);
		}
	});
})();
