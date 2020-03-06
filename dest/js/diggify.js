
chrome.runtime.onMessage.addListener((req, sender, res) => {
    switch (req.message.action) {
    case 'started_playing':
        const diggify = document.querySelector('div.diggify-itunes');
        if (diggify) diggify.remove();
        const [_, track, artist] = document.querySelectorAll('div.now-playing[role=contentinfo] a');
        console.log(`PLAYING: ${track.innerText} / ${artist.innerText}`);
        res({ message: { track: track.innerText, artist: artist.innerText } });
        break;
    case 'trackURL':
        const { trackURL, itunesIconURL } = req.message;
        if (!trackURL) return;
        const img = document.createElement('img');
        img.src = itunesIconURL;
        document.body.appendChild(img);
        const parent = document.querySelector('div.now-playing');
        const wrapper = document.createElement('div');
        wrapper.setAttribute('class', 'diggify-itunes');
        wrapper.innerHTML = `<button class="picture-in-picture-button control-button">
            <div class="icon NavBar__icon">
                <img src="${itunesIconURL}" width="22px" height="22px" />
            </div>
        </button>`;
        wrapper.addEventListener('click', () => window.open(trackURL, '_blank'));
        parent.appendChild(wrapper);
        break;
    }
});
