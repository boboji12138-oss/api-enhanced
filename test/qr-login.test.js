const assert = require('power-assert')
const checkQr = require('../module/login_qr_check')

// 扫码模块离线回归：上游业务状态、确认 Cookie 和失败分支。
describe('QR login poll response', () => {
  for (const code of [800, 801, 802, 803]) {
    it(`preserves upstream code ${code}`, async () => {
      const result = await checkQr({ key: 'test-key' }, async () => ({
        body: { code },
        cookie: code === 803 ? ['MUSIC_U=test-session'] : [],
      }))
      assert.equal(result.body.code, code)
      assert.equal(
        result.body.cookie,
        code === 803 ? 'MUSIC_U=test-session' : '',
      )
    })
  }
  it('returns a retryable network error instead of a ReferenceError', async () => {
    const result = await checkQr({ key: 'test-key' }, async () => {
      throw new Error('read ECONNRESET')
    })
    assert.equal(result.body.code, 502)
    assert.equal(result.body.msg, 'read ECONNRESET')
    assert.equal(result.body.transient, true)
    assert.deepEqual(result.cookie, [])
  })
  it('preserves upstream business failures', async () => {
    const result = await checkQr({ key: 'test-key' }, async () => {
      throw { body: { code: 8821, msg: '验证请求' } }
    })
    assert.equal(result.body.code, 8821)
  })
})
