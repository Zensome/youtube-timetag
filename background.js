const YOUTUBE_WATCH_URL = "youtube.com/watch";

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
	if (isTabLoaded(tab) && isYoutubeWatchURL(tab)) {
		const videoId = getVideoIdFromTabURL(tab);
		sendMessageToTab(tabId, "NEW", videoId);
	}
});

function isTabLoaded(tab) {
	return tab?.status === "complete";
}

function isYoutubeWatchURL(tab) {
	return tab?.url.includes(YOUTUBE_WATCH_URL);
}

function getVideoIdFromTabURL(tab) {
	const queryParameters = tab.url.split("?")[1];
	const urlParameters = new URLSearchParams(queryParameters);
	return urlParameters.get("v");
}

function sendMessageToTab(tabId, type, videoId) {
	chrome.tabs.sendMessage(tabId, {
		type,
		videoId,
	});
}
