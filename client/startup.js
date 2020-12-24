/// <reference types="@altv/types-client" />
import * as alt from 'alt-client';

const url = `https://stuyk.github.io/altv-ares-view/`;
let view;
let discordURI;

alt.onServer(`Discord:Open`, handleView);
alt.onServer(`Discord:Close`, handleClose);

async function handleView(oAuthUrl) {
    discordURI = oAuthUrl;

    if (!view) {
        view = new alt.WebView(url, false);
        view.on('discord:OpenURL', handleOpenURL);
        
    }

    view.focus();
    alt.showCursor(true);
}

function handleOpenURL() {
    view.emit('discord:OpenURL', discordURI);
}

function handleClose() {
    if (!view) {
        return;
    }

    view.emit('discord:FadeToBlack'); // Probably not going to be used. idk
    view.destroy();
    view = null;

    alt.showCursor(false);
}
