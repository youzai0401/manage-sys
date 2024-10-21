// 小程序开发api接口工具包，https://github.com/gooking/wxapi
var API_BASE_URL = 'http://117.50.221.18:8081/api';
// var API_BASE_URL = 'https://api.bmxt.info/api';
// var API_BASE_URL = 'http://127.0.0.1:8081';
var subDomain = 'api/';
var merchantId = '0';

export async function request(url, method, data) {
  var _url = API_BASE_URL + url;
  if (url.indexOf("http") == 0) {
    _url = url;
  }
  let token = wx.getStorageSync("token")
  if (!token && url !== "/auth/worker/login") {
    await wxLogin();
    token = wx.getStorageSync("token")
  }
  var header = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
  return new Promise(function (resolve, reject) {
    wx.request({
      url: _url,
      method: method,
      data: data,
      header: header,
      success: function success(request) {
        resolve(request.data);
      },
      fail: function fail(error) {
        reject(error);
      },
      complete: function complete(aaa) {
        // 加载完成
      }
    });
  });
};

export function wxLogin() {
  return new Promise((resolve, reject) => {
    wx.login({
      success: res => {
        // 获取到用户的 code 之后：res.code
        console.log("用户的code:" + res.code);
        userLogin(res.code).then(res => {
          console.log(res);
          wx.setStorageSync("userInfo", res.data.user);
          wx.setStorageSync("token", res.data.token);
          resolve(true)
        }).catch((err) => {
          reject(err)
        })
      }
    });
  })

}

/** 获取订单列表 */
export function fetchOrderList(data) {
  return request("/assignments/available", "get", data);
}

export function userLogin(code) {
  return request("/auth/worker/login", "post", {
    code,
  })
}

export function bindPhone(data) {
  return request("/auth/worker/save_phone", "post", data)
}

export function claimOrder(assignment_id, data) {
  return request(`/assignments/${assignment_id}/claim`, "post", data)
}

// 工单列表
export function fetchWorkOrderList(data) {
  return request("/work_orders", "get", data);
}
// 收款记录
export function paymentOrders(data) {
  return request("/payment_orders", "get", data);
}

// 个人排行
export function workerRanking(data) {
  return request("/rankings/worker", "get", data);
}

// 服务点排行
export function serviceRanking(data) {
  return request("/rankings/service_points", "get", data);
}

// 服务点绑定
export function bindServicePoint(data) {
  return request("/auth/worker/bindServicePoint", "post", data);
}

// 保存用户信息
export function saveUserInfo(data) {
  return request("/auth/worker/save_info", "post", data);
}