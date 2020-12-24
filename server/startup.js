/// <reference types="@altv/types-server" />
import alt from 'alt-server';
import { encryptData, getPublicKey, sha256Random } from './encryption';
import { fetchPublicIP, getDiscordOAuth2URL } from './getRequests';
import './expressServer';

alt.on('playerConnect', handlePlayerConnect);

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
    // Used to identify the player when the information is sent back.   
    const uniquePlayerData = JSON.stringify(player.ip + player.hwidHash + player.hwidExHash);
    player.discordToken = sha256Random(uniquePlayerData);

    // Used as the main data format for talking to the Azure Web App.
    const server_ip = await fetchPublicIP();
    const encryptionFormatObject = {
        sub_key: '...', // Eventually will use an API Key to use the service.
        player_identifier: player.discordToken,
        server_ip, // Make a Fetch Request to get own IP.
        server_port: 7790
    };

    // Setup Parseable Format for Azure
    const public_key = await getPublicKey();
    const encryptedData = await encryptData(JSON.stringify(encryptionFormatObject));
    const senderFormat = {
        public_key,
        data: encryptedData
    }

    const encryptedDataJSON = JSON.stringify(senderFormat);
    const discordOAuth2URL = getDiscordOAuth2URL();

    alt.emit(`Discord:Opened`, player);
    alt.emitClient(player, 'Discord:Open', `${discordOAuth2URL}&state=${encryptedDataJSON}`)
}

