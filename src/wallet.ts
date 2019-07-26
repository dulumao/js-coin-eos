/** @module */
import '@pefish/js-node-assist'
import BaseEosLike from './base/base_eos'
import { Api, JsonRpc, Serialize } from 'pefish-eosjs'
import eosEcc from 'pefish-eosjs-ecc'
import { JsSignatureProvider } from 'pefish-eosjs/dist/eosjs-jssig'
import { TextDecoder, TextEncoder } from 'text-encoding'
import crypto from 'crypto'
import EosRemoteHelper from './remote'
import ErrorHelper from '@pefish/js-error';

export default class EosWalletHelper extends BaseEosLike {

  privateKey: string
  remoteClient: EosRemoteHelper
  sigProvider: JsSignatureProvider
  api: Api
  chainId: string

  constructor (chainId: string = `aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906`) {
    super()
    this.chainId = chainId
  }

  initRemoteClient (url: string): void {
    this.remoteClient = new EosRemoteHelper(url)
    this.api = new Api({
      chainId: this.chainId,
      rpc: this.remoteClient.rpc,
      signatureProvider: null,
      textDecoder: new TextDecoder(),
      textEncoder: new TextEncoder()
    })
  }

  installPrivateKey (privateKey: string): void {
    if (!this.remoteClient) {
      throw new ErrorHelper(`please init remote client first`)
    }

    this.privateKey = privateKey
    this.sigProvider = new JsSignatureProvider([privateKey])
    this.api = new Api({
      chainId: this.chainId,
      rpc: this.remoteClient.rpc,
      signatureProvider: this.sigProvider,
      textDecoder: new TextDecoder(),
      textEncoder: new TextEncoder()
    })
  }

  /**
   * 对交易进行签名
   * @param txObj {object} action被编码后的明文交易
   * @returns {Promise<*>}
   */
  async signTxObjForSig(txObj: any): Promise<string> {
    if (!this.api) {
      throw new ErrorHelper(`please install private key first`)
    }

    const data = await this.sigProvider.sign({
      chainId: this.chainId,
      requiredKeys: [this.getPubkeyFromWif(this.privateKey)],
      serializedTransaction: this.api.serializeTransaction(txObj),
      abis: null,
    })
    return data[`signatures`][0]
  }

  isPublicKey (str: string): boolean {
    return eosEcc.isValidPublic(str)
  }

  getAllBySeedAndIndex(seed: string, index: number): any {
    const privateKeyObj = eosEcc.PrivateKey.fromSeed(seed + index)
    return {
      seed,
      index,
      privateKey: privateKeyObj.toString(),
      publicKey: privateKeyObj.toPublic().toString(),
      wif: privateKeyObj.toWif()
    }
  }

  getPubkeyFromWif(wif: string): string {
    const privateKeyObj = eosEcc.PrivateKey.fromString(wif)
    return privateKeyObj.toPublic().toString()
  }

  decryptMemo (toWif: string, fromPKey: string, encryptedMemo: string, nonce: number): string {
    return eosEcc.Aes.decryptWithoutChecksum(
      toWif,
      fromPKey,
      nonce,
      encryptedMemo.hexToBuffer_()
    ).toString()
  }

  /**
   * 加密memo
   * @param fromWif
   * @param toPKey
   * @param memo {string}
   * @param nonce {number}
   * @returns {{nonce, message: *, checksum}}
   */
  encryptMemo (fromWif: string, toPKey: string, memo: string, nonce: number = null): any {
    const result = eosEcc.Aes.encrypt(
      fromWif,
      toPKey,
      memo,
      nonce === null ? undefined : nonce
    )
    return {
      nonce: result['nonce'].toString(),
      message: result['message'].toHexString_(false),
      checksum: result['checksum']
    }
  }

  /**
   * 解码actions
   * @param actions {array} 编码后的action数组
   * @returns {Promise<Promise<Action[]> | *>}
   */
  async decodeActions (actions: Array<any>): Promise<any> {
    return this.api.deserializeActions(actions)
  }

  async encodeActions (actions: Array<any>): Promise<any> {
    return await this.api.serializeActions(actions)
  }

  getHexFromTxObj (txObj: any): string {
    const serializedTransaction = this.api.serializeTransaction(txObj)
    return Serialize.arrayToHex(serializedTransaction)
  }

  getTxObjFromHex (hex: string): any {
    const serializedTransaction = Serialize.hexToUint8Array(hex)
    return this.api.deserializeTransaction(serializedTransaction)
  }

  async buildTransaction(actions: Array<any>, expirationSecond: number = 300, sign: boolean = false, broadcast: boolean = false): Promise<any> {
    if (!this.api && sign === true) {
      throw new ErrorHelper(`please install private key first`)
    }
    const trx = await this.api.transact({
      actions
    }, {
      blocksBehind: 3,
      expireSeconds: expirationSecond,
      broadcast,
      sign
    })
    const txHex = Serialize.arrayToHex(trx[`serializedTransaction`])
    return {
      signatures: trx[`signatures`],
      txId: crypto.createHash('sha256').update(Buffer.from(txHex, 'hex')).digest().toString('hex'),
      txObj: this.api.deserializeTransaction(trx[`serializedTransaction`]), // action被编码的交易
      txHex,
      tx: await this.api.deserializeTransactionWithActions(trx[`serializedTransaction`])  // action没有被编码的交易
    }
  }

  serializeTransaction (txObj: object): any {
    return this.api.serializeTransaction(txObj)
  }
}

