import * as alt from 'alt-server';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { decryptData, getAzureKey, getPublicKey } from './encryption';
import dotenv from 'dotenv';
import axios from 'axios';
import { getAzureURL } from './getRequests';

dotenv.config();

if (!process.env.PORTLESS) {
    const targetPort = process.env.PORT ? process.env.PORT : 7790;

    const app = express();

    app.use(cors());
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.json());
    app.post('/authenticate', handleAuthenticate);

    async function handleAuthenticate(req, res) {
        if (!req.body || !req.body.data) {
            res.json({ status: false });
            return;
        }

        const queryData = JSON.parse(req.body.data); // Need to try and catch this garbage;
        const discordDataJSON = await decryptData(queryData);
        const discordData = JSON.parse(discordDataJSON);

        // id, username, avatar, discriminator, public_flags, flags, locale, mfa_enabled
        const player = alt.Player.all.find((player) => {
            const playerExt = player;
            return playerExt.discordToken === discordData.player_identifier;
        });

        if (!player || !player.valid) {
            res.json({ status: false, message: 'Failed to find matching player.' });
            return;
        }

        alt.emit('Discord:Login', player, discordData);
        alt.emitClient(player, `Discord:Close`);
        res.json({ status: true });
    }

    app.listen(targetPort, () => {
        alt.log(`Express Server Started on 7790. Open TCP/UDP Ports for 7790.`);
    });
} else {
    alt.onClient('discord:FinishAuth', handleFinishAuth);

    async function handleFinishAuth(player) {
        const player_identifier = player.discordToken;
        if (!player_identifier) {
            return;
        }

        console.log('finishing auth');

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
            console.log(err);
            return null;
        });

        if (!result) {
            return;
        }

        const data = await decryptData(JSON.stringify(result.data));
        if (!data) {
            return;
        }

        alt.emit('Discord:Login', player, JSON.parse(data));
        alt.emitClient(player, `Discord:Close`);
    }
}
