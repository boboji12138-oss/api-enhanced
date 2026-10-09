const createOption = require('../util/option.js')
module.exports = async (query, request) => {
  const data = {
    key: query.key,
    type: 3,
  }
  try {
    let result = await request(
      `/api/login/qrcode/client/login`,
      data,
      createOption(query),
    )
    result = {
      status: 200,
      body: {
        ...result.body,
        cookie: (result.cookie || []).join(';'),
      },
      cookie: result.cookie,
    }
    return result
  } catch (error) {
    // 保留上游业务错误；网络异常作为可重试失败返回，不能引用 try 内的 result。
    const body = error?.body || {
      code: 502,
      msg: error?.message || 'NetEase upstream network request failed',
      transient: true,
    }
    return {
      status: 200,
      body,
      cookie: [],
    }
  }
}
