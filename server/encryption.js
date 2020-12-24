/// <reference types="@altv/types-server" />
import alt from 'alt-server';
import sjcl from 'sjcl';
import ecc from 'elliptic'
import { fetchAzureKey } from './getRequests';

const elliptic = new ecc.ec('curve25519');

let privateKey;
let publicKey;
let azurePubKey;
let secretKey;

/**
 * Hash a string of data into a persistent SHA256 hash.
 *
 * @param  {string} data
 * @returns string
 */
export function sha256(data) {
    const hashBits = sjcl.hash.sha256.hash(data);
    return sjcl.codec.hex.fromBits(hashBits);
}

/**
 * Hash a string of data into a random SHA256 hash.
 *
 * @param  {string} data
 * @returns {string}
 */
export function sha256Random(data) {
    return sha256(`${data} + ${Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)}`);
}

/**
 * Generate and private and public key.
 * Stores the data in memory for additional usage.
 * @export
 * @return {string} 
 */
export async function getPublicKey() {
    if (!privateKey) {
        privateKey = elliptic.genKeyPair().getPrivate().toString(16);
        alt.log(`[Auth] Generated Private Key`);
    }

    if (!publicKey) {
        publicKey = elliptic.keyFromPrivate(privateKey, 'hex').getPublic().encode('hex', true);
        alt.log(`[Auth] Generated Public Key`);
    }

    if (!azurePubKey) {
        azurePubKey = await fetchAzureKey();
        alt.log(`[Auth] Fetched Azure Public Key`)
    }

    if (!secretKey) {
        secretKey = await getSharedSecret();
        alt.log(`[Auth] Shared Secret Generated`);
    }

    return publicKey;
}

/**
 * Gets our Private Key.
 * @return {string}
 */
export function getPrivateKey() {
    if (!privateKey) {
        privateKey = elliptic.genKeyPair().getPrivate().toString(16);
    }

    return privateKey;
}

/**
 * Encrypts data based on the shared key.
 * @export
 * @param {string} jsonData
 * @return {Promise<string>} 
 */
export async function encryptData(jsonData) {
    const sharedSecret = await getSharedSecret();

    try {
        const partialEncryption = sjcl.encrypt(sharedSecret, jsonData, { mode: 'gcm' });
        const safeEncryption = partialEncryption.replace(/\+/g, '_'); // Discord oAuth2 does something funky to `+` signs.
        return safeEncryption;
    } catch (err) {
        return null;
    }
}

/**
 * Decrypts data based on the shared key.
 * @export
 * @param {string} jsonData
 * @return {Promise<string>} 
 */
export async function decryptData(jsonData) {
    const sharedSecret = await getSharedSecret();

    try {
        const cleanedEncryption = jsonData.replace(/\_/g, '+'); // Discord oAuth2 does something funky to `+` signs.
        return sjcl.decrypt(sharedSecret, cleanedEncryption, { mode: 'gcm' });
    } catch (err) {
        return null;
    }
}

/**
 * Returns a shared secret for encryption between the Azure Server and Ourselves.
 * @export
 * @return {Promise<string>} 
 */
export async function getSharedSecret() {
    try {
        const ecPrivateKey = elliptic.keyFromPrivate(getPrivateKey(), 'hex');
        const ecPublicKey = elliptic.keyFromPublic(azurePubKey, 'hex');
        const sharedKey = ecPrivateKey.derive(ecPublicKey.getPublic()).toString(16);
        return sharedKey;
    } catch (err) {
      console.error(err);
      return false
    }
}

/**
 * Uses a get request to get the Azure Key to create the Diffie Helman Exchange.
 * @export
 * @return { string }
 */
export async function getAzureKey() {
    if (!azurePubKey) {
        azurePubKey = await fetchAzureKey();
    }

    return azurePubKey;
}
  