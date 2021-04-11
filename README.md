![](https://thumbs.gfycat.com/OrangePoliticalChicken-size_restricted.gif)

# alt:V Ares - 2.0.0

[❤️ Become a Sponsor of my Open Source Work](https://github.com/sponsors/Stuyk/)

[⌨️ Learn how to script for alt:V](https://altv.stuyk.com/)

[💡 Need a Roleplay Script? Try Athena!](https://gtavathena.com/)

⭐ This repository if you found it useful!

---

# Description

This repository simplifies the entire process of Discord Authentication for alt:V or any GTA:V Framework if you write your own module.

It requires no extra configuration and simply works out of the box. Plug it into your server and users will be able to Authenticate through Discord immediately.

This is the easiest Discord oAuth2 Service. Period.

# Quick Install

```sh
# Install alt:V Installer
npm install -g altv-pkg
```

```sh
# Install with alt:V Installer
altv-pkg i stuyk/altv-ares
```

# Installing Dependencies / Installation

**I cannot stress this enough. Ensure you have NodeJS 13+ or you will have problems.**

-   [NodeJS 13+](https://nodejs.org/en/download/current/)
-   An Existing or New Gamemode
-   General Scripting Knowledge

Clone this repository into your `resources` folder or use the quick install instructions.

Add this resource to your `server.cfg`.

## Install these Dependencies

```sh
npm install elliptic sjcl axios dotenv
```

# Setting Up Your Resource for Usage

When the player connect to your server a event will automatically be emitted to open the WebView.

You will recieve the player through `Discord:Opened` when they have opened the view.

```js
alt.on(`Discord:Opened`, (player) => {
    // Do something with the Player if you want.
    // Setting a player position is recommended here.
});
```

You will recieve a player login through this event on server-side with their corresponding discord info.

This is their Authentication data. This is what you use to store data in the database and lookup info from your database.

```js
alt.on('Discord:Login', (player, discordInfo) => {
    // discordInfo contains -> // id, username, avatar, discriminator, public_flags, flags, locale, mfa_enabled
    console.log(discordInfo.id); // This is their unique discord id.
});
```

The player's WebView will **automatically be closed** when the discord login is successful.

The **Discord:Login** event is your **success** event.

# Changelog

```diff
January 20, 2020
+ Portless is supported and enforced now.
+ Completely removed express server.
+ Skip IP Lookup for Portless (Fastest)

January 12, 2020
+ Added New Portless Discord Authentication
+ Added New Portless Parameters
+ Added 'dotenv' as a dependency

January 3, 2020
+ Updated Ares Endpoint (Deprecated Old Server Provider)
+ Moved to auto-updating URL under https://ares.stuyk.com/
```
