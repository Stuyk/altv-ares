import * as alt from 'alt-server';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const azureURL = process.env.ENDPOINT ? process.env.ENDPOINT : `https://ares.stuyk.com`;
const azureRedirect = encodeURI(`${azureURL}/v1/request/key`);
const url = `https://discord.com/api/oauth2/authorize?client_id=759238336672956426&redirect_uri=${azureRedirect}&prompt=none&response_type=code&scope=identify`;

alt.log(`[Ares] Endpoint for Ares set to: ${azureURL}`);

/**
 * Returns the Azure Public Key from the Azure Web App.
 * @export
 * @return {string}
 */
export async function fetchAzureKey() {
    let azurePubKey;

    const result = await axios.get(`${azureURL}/v1/get/key`).catch(() => {
        return null;
    });

    if (!result || !result.data || !result.data.status) {
        return await fetchAzureKey();
    }

    azurePubKey = result.data.key;
    return azurePubKey;
}

/**
 * Gets the Discord oAuth2 URL.
 * @export
 * @return {string}
 */
export function getDiscordOAuth2URL() {
    return url;
}

export function getAzureURL() {
    return azureURL;
}
