const createBookmarkElement = (bookmark) => {
	const bookmarkElement = document.createElement("div");
	bookmarkElement.className = "bookmark";
	bookmarkElement.setAttribute("timestamp", bookmark.time);
	bookmarkElement.setAttribute("videoId", bookmark.videoId);

	const bookmarkContentElement = document.createElement("div");
	bookmarkContentElement.className = "bookmark-content";

	const thumbnailElement = document.createElement("img");
	thumbnailElement.className = "bookmark-thumbnail";
	thumbnailElement.src = `https://img.youtube.com/vi/${bookmark.videoId}/default.jpg`;

	const videoTitleElement = document.createElement("div");
	videoTitleElement.className = "bookmark-video-title";
	// title would be like "How To Think Like A Programmer - YouTube", always strip
	// out the " - YouTube" part
	const videoTitle = bookmark.title.replace(" - YouTube", "");
	videoTitleElement.textContent = videoTitle;

	const bookmarkTitleElement = document.createElement("div");
	bookmarkTitleElement.className = "bookmark-title";
	bookmarkTitleElement.textContent = bookmark.desc;

	const controlsElement = document.createElement("div");
	controlsElement.className = "bookmark-controls";

	const playButtonElement = createControlButton("play", onPlay);
	const deleteButtonElement = createControlButton("delete", onDelete);

	controlsElement.appendChild(playButtonElement);
	controlsElement.appendChild(deleteButtonElement);

	bookmarkElement.appendChild(bookmarkContentElement);

	bookmarkElement.appendChild(thumbnailElement);
	bookmarkContentElement.appendChild(videoTitleElement);
	bookmarkContentElement.appendChild(bookmarkTitleElement);
	bookmarkElement.appendChild(controlsElement);

	return bookmarkElement;
};

const createControlButton = (src, eventListener) => {
	const buttonElement = document.createElement("img");
	buttonElement.src = `assets/${src}.png`;
	buttonElement.title = src;
	buttonElement.style = "height:20px; width:20px; cursor:pointer;";
	buttonElement.addEventListener("click", eventListener);
	return buttonElement;
};

const renderBookmarks = (bookmarks) => {
	const bookmarksElement = document.getElementById("bookmarks");
	bookmarksElement.innerHTML = "";

	if (bookmarks.length > 0) {
		bookmarks.forEach((bookmark) => {
			const bookmarkElement = createBookmarkElement(bookmark);
			bookmarksElement.appendChild(bookmarkElement);
		});
	} else {
		bookmarksElement.innerHTML =
			"<p class='description'>There's no time tag to show</p>";
	}
};

const onPlay = (e) => {
	const bookmarkTime = e.target
		.closest(".bookmark")
		.getAttribute("timestamp");
	const videoId = e.target.closest(".bookmark").getAttribute("videoId");

	if (videoId) {
		const videoURL = `https://www.youtube.com/watch?v=${videoId}&t=${Math.floor(
			bookmarkTime
		)}s`;
		chrome.tabs.create({ url: videoURL });
	} else {
		alert("This bookmark is not a valid YouTube video bookmark.");
	}
};

const onDelete = (e) => {
	const bookmarkTime = e.target
		.closest(".bookmark")
		.getAttribute("timestamp");
	const videoId = e.target.closest(".bookmark").getAttribute("videoId");
	const bookmarkElementToDelete = e.target.closest(".bookmark");

	bookmarkElementToDelete.remove();

	chrome.storage.sync.get(["allBookmarks"], (data) => {
		let allBookmarks = data["allBookmarks"]
			? JSON.parse(data["allBookmarks"])
			: [];
		allBookmarks = allBookmarks.filter(
			(b) => !(b.videoId === videoId && b.time == bookmarkTime)
		);
		chrome.storage.sync.set({ allBookmarks: JSON.stringify(allBookmarks) });
	});
};

document.addEventListener("DOMContentLoaded", () => {
	chrome.storage.sync.get(["allBookmarks"], (data) => {
		const allBookmarks = data["allBookmarks"]
			? JSON.parse(data["allBookmarks"])
			: [];
		renderBookmarks(allBookmarks);
	});
});
