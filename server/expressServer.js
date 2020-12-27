import * as alt from 'alt-server';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { decryptData } from './encryption';

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

app.listen(7790, () => {
    alt.log(`Express Server Started on 7790. Open TCP/UDP Ports for 7790.`);
});
