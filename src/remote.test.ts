import '@pefish/js-node-assist'
import assert from 'assert'
import EosRemoteHelper from './remote'
import { Remote } from 'src';


describe('EosRemoteHelper', () => {

  let helper: Remote

  before(async () => {
    helper = new EosRemoteHelper(`https://eos.greymass.com`)
    global[`logger`] = console
  })

  it('getInfo', async () => {
    try {
      const result = await helper.getInfo()
      // console.error('result', result)
      assert.strictEqual(result['chain_id'], 'aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906')
    } catch (err) {
      console.error(err)
      assert.throws(() => {}, err)
    }
  })

  it('getChainId', async () => {
    try {
      const result = await helper.getChainId()
      // logger.error('result', result)
      assert.strictEqual(result, 'aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906')
    } catch (err) {
      console.error(err)
      assert.throws(() => {}, err)
    }
  })

  it('getTransaction', async () => {
    try {
      const result = await helper.getTransaction('9c323cdf299bda9b76a294dd72fc5498e7a07054da6e47c79390ebc2a669e181')
      // logger.error('result', JSON.stringify(result))
      assert.strictEqual(result['id'], '9c323cdf299bda9b76a294dd72fc5498e7a07054da6e47c79390ebc2a669e181')
    } catch (err) {
      console.error(err)
      assert.throws(() => {}, err)
    }
  })

  it('getActions', async () => {
    try {
      const result = await helper.getActions('laijiyong123', -1, 0)
      // console.error('result', JSON.stringify(result))
      assert.strictEqual(result['actions'].length, 0)
    } catch (err) {
      console.error(err)
      assert.throws(() => {}, err)
    }
  })

  it('getActionsV2', async () => {
    try {
      const result = await helper.getActionsV2('https://api.eossweden.org', {
        account: `laijiyong123`,
      })
      // console.error('result', JSON.stringify(result))
      assert.strictEqual(result.actions.length > 0, true)
    } catch (err) {
      console.error(err)
      assert.throws(() => {}, err)
    }
  })

  it('getCurrencyStats', async () => {
    try {
      const result = await helper.getCurrencyStats('eosio.token', 'EOS')
      // console.error('result', result)
      assert.strictEqual(result['issuer'], 'eosio')
    } catch (err) {
      console.error(err)
      assert.throws(() => {}, err)
    }
  })

  it('getLatestHeight', async () => {
    try {
      const result = await helper.getLatestHeight()
      // console.error('result', result)
      assert.strictEqual(result.toString().gt_(0), true)
    } catch (err) {
      console.error(err)
      assert.throws(() => {}, err)
    }
  })

  it('getBlock', async () => {
    try {
      const result = await helper.getBlock(1000)
      // logger.error('result', result)
      assert.strictEqual(result['transactions'] instanceof Array, true)
    } catch (err) {
      console.error(err)
      assert.throws(() => {}, err)
    }
  })

  it('getAccount', async () => {
    try {
      const result = await helper.getAccount('laijiyong123')
      // logger.error('result', result)
      assert.strictEqual(result['account_name'], 'laijiyong123')
    } catch (err) {
      console.error(err)
      assert.throws(() => {}, err)
    }
  })

  it('getAbi', async () => {
    try {
      const result = await helper.getAbi('eosio.token')
      // logger.error('result', result)
      assert.strictEqual(result['account_name'], 'eosio.token')
    } catch (err) {
      console.error(err)
      assert.throws(() => {}, err)
    }
  })

  it('getCurrencyBalance', async () => {
    try {
      const result = await helper.getCurrencyBalance('eosio.token', 'laijiyong123')
      // logger.error('result', result)
      assert.strictEqual(result.add_(1).gt_(0), true)
    } catch (err) {
      console.error(err)
      assert.throws(() => {}, err)
    }
  })

  it('getTableRows', async () => {
    try {
      const result = await helper.getTableRows(
        'eosio.token',
        'laijiyong123',
        'accounts',
        true,
      )
      // console.error('result', result)
      assert.strictEqual(result[`rows`].length > 0, true)
    } catch (err) {
      console.error(err)
      assert.throws(() => {}, err)
    }
  })

  it('getTokenBalance', async () => {
    try {
      const result = await helper.getTokenBalance(
        'htyhty111222',
        'zgeosdeposit',
        'RSC',
      )
      console.error('result', result)
      assert.strictEqual(result.gt_(0), true)
    } catch (err) {
      console.error(err)
      assert.throws(() => {}, err)
    }
  })
})

