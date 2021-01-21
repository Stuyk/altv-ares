/// <reference types="@altv/types-server" />
import alt from 'alt-server';
import dotenv from 'dotenv';

import { encryptData, getPublicKey, sha256Random } from './encryption';
import { fetchPublicIP, getDiscordOAuth2URL } from './getRequests';
import './expressServer';

dotenv.config();

alt.on('playerConnect', handlePlayerConnect);

if (process.env.PORTLESS) {
    alt.log(`[Ares] Running in Portless Authentication Mode.`);
    alt.log(`[Ares] Requires users to click one additional button after authentication.`);
}

/**
 * How does this work?
 * There is an azure web app that this module connects to.
 * It has a public key that is accessible by anyone.
 * That url is: https://altv-athena-discord.azurewebsites.net/v1/request/key
 * The module fetches the public key from the azure web app.
 * This module then uses that public key to generate a shared secret through a Diffie Helman Exchange with our private and their public.
 * Once the secret is generated we can encrypt data to send to the web app.
 * We send our module's generated public key and player information to the azure web app.
 * The player is then tasked to open an external url for a Discord oAuth2 Login.
 * The azure web app will automatically re-direct the page if the authorization is successful.
 * Then port the information through an event inside of this module.
 * The information ported through the express server is encrypted which helps us verify it's a real request.
 */

async function handlePlayerConnect(player) {
    if (!player || !player.valid) {
        return;
    }

    // Used to identify the player when the information is sent back.
    const uniquePlayerData = JSON.stringify(player.ip + player.hwidHash + player.hwidExHash);
    player.discordToken = sha256Random(uniquePlayerData);

    // Used as the main data format for talking to the Azure Web App.
    const encryptionFormatObject = {
        player_identifier: player.discordToken,
        server_ip: process.env['PORTLESS'] ? null : await fetchPublicIP(), // Make a Fetch Request to get own IP.
        server_port: 7790,
        no_ports: process.env.PORTLESS ? true : false
    };

    // Setup Parseable Format for Azure
    const public_key = await getPublicKey();
    const encryptedData = await encryptData(JSON.stringify(encryptionFormatObject));
    const senderFormat = {
        public_key,
        data: encryptedData
    };

    const encryptedDataJSON = JSON.stringify(senderFormat);
    const discordOAuth2URL = getDiscordOAuth2URL();

    alt.emit(`Discord:Opened`, player);
    alt.emitClient(
        player,
        'Discord:Open',
        `${discordOAuth2URL}&state=${encryptedDataJSON}`,
        encryptionFormatObject.no_ports
    );
}
