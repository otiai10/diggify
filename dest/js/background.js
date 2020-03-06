
const appleAffiliateID = '1010lqgL';
const appleSearchAPI = 'https://itunes.apple.com/search';
const itunesIconURL = chrome.extension.getURL("assets/itunes.png");

const getSearchAPIURL = (track, artist, baseURL = appleSearchAPI, affiliateID = appleAffiliateID) => {
    const url = new URL(baseURL);
    url.searchParams.set('entity', 'song');
    url.searchParams.set('at', affiliateID);
    // https://stackoverflow.com/questions/6855624/plus-sign-in-query-string
    const term = `${track} ${artist}`.split(' ').join('+');
    return url.toString() + `&term=${term}`;
};

const getTrackURL = async ({ track, artist }) => {
    const url = getSearchAPIURL(track, artist);
    const res = await (await fetch(url)).json();
    if (res.resultCount < 1) return;
    console.log(`RESULTS: ${track} / ${artist}`, res.results);
    return res.results[0].trackViewUrl;
};

chrome.webRequest.onBeforeRequest.addListener((req) => {
    if (!req.url.match(/\/track-playback\/v1\/devices\/.+\/state$/)) return;
    const raw = req.requestBody.raw.reduce((s, {bytes}) => {
        return s + String.fromCharCode.apply(null, new Uint8Array(bytes));
    }, "");
    let body;
    try {
        body = JSON.parse(raw);
    } catch (e) { return console.error(e); }
    if (body.debug_source !== 'started_playing') return;
    console.log(body.debug_source);
    chrome.tabs.sendMessage(req.tabId, { message: { action: body.debug_source } }, async (res) => {
        console.log(res);
        const trackURL = await getTrackURL(res.message);
        chrome.tabs.sendMessage(req.tabId, { message: { action: 'trackURL', trackURL, itunesIconURL } });
    });
}, {
    urls: [
        // "https://open.spotify.com/*",
        "https://gew-spclient.spotify.com/*"
    ]
}, ["requestBody"])