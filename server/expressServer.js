import * as alt from 'alt-server';
import { decryptData, getPublicKey } from './encryption';
import { getAzureURL } from './getRequests';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

alt.onClient('discord:FinishAuth', handleFinishAuth);

async function handleFinishAuth(player) {
    const player_identifier = player.discordToken;
    if (!player_identifier) {
        return;
    }

    const public_key = await getPublicKey();
    const azureURL = await getAzureURL();

    const options = {
        method: 'POST',
        url: `${azureURL}/v1/post/discord`,
        headers: { 'Content-Type': 'application/json' },
        data: {
            data: {
                player_identifier,
                public_key
            }
        }
    };

    const result = await axios.request(options).catch((err) => {
        alt.emitClient('Discord:Fail', 'Could not communicate with Authorization service.');
        return null;
    });

    if (!result) {
        return;
    }

    const data = await decryptData(JSON.stringify(result.data)).catch((err) => {
        alt.emitClient('Discord:Fail', 'Could not decrypt data from Authorization service.');
        return null;
    });

    if (!data) {
        return;
    }

    alt.emitClient(player, `Discord:Close`);
    alt.emit('Discord:Login', player, JSON.parse(data));
}
