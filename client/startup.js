/// <reference types="@altv/types-client" />
import * as alt from 'alt-client';

const url = `https://stuyk.github.io/altv-ares-view/`;
let view;
let discordURI;
let isPortless = false;

alt.onServer(`Discord:Open`, handleView);
alt.onServer(`Discord:Close`, handleClose);

async function handleView(oAuthUrl, isRunningPortless = false) {
    isPortless = isRunningPortless;
    discordURI = oAuthUrl;

    alt.log(isPortless);

    if (!view) {
        view = new alt.WebView(url, false);
        view.on('discord:OpenURL', handleOpenURL);
        view.on('discord:FinishAuth', handleFinishAuth);
    }

    view.focus();
    alt.showCursor(true);
}

function handleOpenURL() {
    view.emit('discord:OpenURL', discordURI, isPortless);
}

function handleFinishAuth() {
    alt.emitServer('discord:FinishAuth');
}

function handleClose() {
    if (!view) {
        return;
    }

    view.emit('discord:endWindow'); // Probably not going to be used. idk
    view.destroy();
    view = null;

    alt.showCursor(false);
}
