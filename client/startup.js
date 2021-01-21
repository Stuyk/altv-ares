/// <reference types="@altv/types-client" />
import * as alt from 'alt-client';

const url = `https://stuyk.github.io/altv-ares-view/`;
let view;
let discordURI;

alt.onServer(`Discord:Open`, handleView);
alt.onServer(`Discord:Close`, handleClose);
alt.onServer('Discord:Fail', handleFail);

async function handleView(oAuthUrl) {
    discordURI = oAuthUrl;

    if (!view) {
        view = new alt.WebView(url, false);
        view.on('discord:OpenURL', handleOpenURL);
        view.on('discord:FinishAuth', handleFinishAuth);
    }

    view.focus();
    alt.showCursor(true);
}

function handleFail(message) {
    if (!view) {
        return;
    }

    view.emit('discord:Fail', message);
}

function handleOpenURL() {
    if (!view) {
        return;
    }

    view.emit('discord:OpenURL', discordURI, true);
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
