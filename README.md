![](https://thumbs.gfycat.com/OrangePoliticalChicken-size_restricted.gif)

# alt:V Ares - 1.0.1

[❤️ Become a Sponsor of my Open Source Work](https://github.com/sponsors/Stuyk/)

[⌨️ Learn how to script for alt:V](https://stuyk.github.io/altv-javascript-guide/)

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
npm install elliptic sjcl express body-parser cors axios public-ip dotenv
```

# Additional Configuration Necessary

Pick one of the following options bellow.

## Not Opening Additional Ports

Create a `.env` file and add the following inside:

```
PORTLESS=true
```

## Opening Port 7790

Depending on whatever system you are on you should open port 7790.

You will need to do this in your windows Firewall as well.

Here's a Windows 10 `.bat` file for opening ports.

```bat
ECHO OFF

echo Opening 7788 for TCP
netsh advfirewall firewall add rule name="alt:V-7788-IN-TCP" dir=in action=allow protocol=TCP localport=7788
netsh advfirewall firewall add rule name="alt:V-7788-OUT-TCP" dir=out action=allow protocol=TCP localport=7788

echo Opening 7788 for UDP
netsh advfirewall firewall add rule name="alt:V-7788-IN-UDP" dir=in action=allow protocol=UDP localport=7788
netsh advfirewall firewall add rule name="alt:V-7788-OUT-UDP" dir=out action=allow protocol=UDP localport=7788

echo Opening 7790 for TCP
netsh advfirewall firewall add rule name="alt:V-7790-IN-TCP" dir=in action=allow protocol=TCP localport=7790
netsh advfirewall firewall add rule name="alt:V-7790-OUT-TCP" dir=out action=allow protocol=TCP localport=7790

echo Opening 7790 for UDP
netsh advfirewall firewall add rule name="alt:V-7790-IN-UDP" dir=in action=allow protocol=UDP localport=7790
netsh advfirewall firewall add rule name="alt:V-7790-OUT-UDP" dir=out action=allow protocol=UDP localport=7790

pause
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
January 12, 2020
+ Added New Portless Discord Authentication
+ Added New Portless Parameters
+ Added 'dotenv' as a dependency

January 3, 2020
+ Updated Ares Endpoint (Deprecated Old Server Provider)
+ Moved to auto-updating URL under https://ares.stuyk.com/
```
