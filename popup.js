//adding a new bookmark row to the popup
const addNewBookmark = (bookmarks, bookmark) => {
	/*one element for title and second element for whole bookmarks that contain the play, delete buttons*/
	const bookmarkTitleElement = document.createElement("div");
	const newBookmarkElement = document.createElement("div");
	const bookmarkVideoElement = document.createElement("div"); // Create a new element to display the video title
	const bookmarkThumbnailElement = document.createElement("img"); // Create a new img element for the thumbnail

	//add bookmark controls (play button)
	const controlsElement = document.createElement("div");

	//hold all buttons element
	bookmarkTitleElement.textContent = bookmark.desc;
	bookmarkVideoElement.textContent = bookmark.title; // Set the video title
	bookmarkThumbnailElement.src = `https://img.youtube.com/vi/${bookmark.videoId}/default.jpg`; // Set the thumbnail source
	bookmarkThumbnailElement.className = "bookmark-thumbnail"; // Add a class name for potential styling
	bookmarkVideoElement.className = "bookmark-video-title"; // Add a class name for potential styling
	bookmarkTitleElement.className = "bookmark-title";
	//bookmark styling
	controlsElement.className = "bookmark-controls";

	//set bookmarks attribute element
	setBookmarkAttributes("play", onPlay, controlsElement);
	setBookmarkAttributes("delete", onDelete, controlsElement);

	newBookmarkElement.id =
		"bookmark-" + bookmark.videoId + "-" + bookmark.time;

	newBookmarkElement.className = "bookmark";
	newBookmarkElement.setAttribute("timestamp", bookmark.time);
	newBookmarkElement.setAttribute("videoId", bookmark.videoId); // Add the video id to the bookmark

	//append bookmarks element
	newBookmarkElement.appendChild(bookmarkThumbnailElement); // Append the thumbnail before the video title
	newBookmarkElement.appendChild(bookmarkVideoElement);
	newBookmarkElement.appendChild(bookmarkTitleElement);
	newBookmarkElement.appendChild(controlsElement);

	bookmarks.appendChild(newBookmarkElement);
};

const viewBookmarks = (currentBookmarks = []) => {
	const bookmarksElement = document.getElementById("bookmarks");
	bookmarksElement.innerHTML = "";

	if (currentBookmarks.length > 0) {
		for (let i = 0; i < currentBookmarks.length; i++) {
			const bookmark = currentBookmarks[i];
			addNewBookmark(bookmarksElement, bookmark);
		}
	} else {
		/*if there is no bookmarks to show meaning currentBookmarks is empty*/
		bookmarksElement.innerHTML =
			"<p class='description'>There's no time tag to show</p>";
	}

	return;
};

const onPlay = async (e) => {
	const bookmarkTime =
		e.target.parentNode.parentNode.getAttribute("timestamp");
	const videoId = e.target.parentNode.parentNode.getAttribute("videoId");

	if (videoId) {
		// Open the YouTube video with the appropriate timestamp.
		const videoURL = `https://www.youtube.com/watch?v=${videoId}&t=${Math.floor(
			bookmarkTime
		)}s`;

		chrome.tabs.create({ url: videoURL });
	} else {
		alert("This bookmark is not a valid YouTube video bookmark.");
	}
};

const onDelete = async (e) => {
	const bookmarkTime =
		e.target.parentNode.parentNode.getAttribute("timestamp");
	const videoId = e.target.parentNode.parentNode.getAttribute("videoId");
	const bookmarkElementToDelete = document.getElementById(
		"bookmark-" + videoId + "-" + bookmarkTime
	);

	bookmarkElementToDelete.parentNode.removeChild(bookmarkElementToDelete);

	// Fetch all bookmarks, remove the deleted one, and store the updated list
	chrome.storage.sync.get(["allBookmarks"], (data) => {
		let allBookmarks = data["allBookmarks"]
			? JSON.parse(data["allBookmarks"])
			: [];
		allBookmarks = allBookmarks.filter(
			(b) => !(b.videoId === videoId && b.time == bookmarkTime)
		);
		chrome.storage.sync.set({
			allBookmarks: JSON.stringify(allBookmarks),
		});
	});
};

const setBookmarkAttributes = (src, eventListener, controlParentElement) => {
	const controlElement = document.createElement("img");

	controlElement.src = "assets/" + src + ".png";
	//play.png
	controlElement.title = src;
	controlElement.addEventListener("click", eventListener);
	controlParentElement.appendChild(controlElement);
};

document.addEventListener("DOMContentLoaded", async () => {
	chrome.storage.sync.get(["allBookmarks"], (data) => {
		const allBookmarks = data["allBookmarks"]
			? JSON.parse(data["allBookmarks"])
			: [];
		// Call viewBookmarks function with all bookmarks
		viewBookmarks(allBookmarks);
	});
});
