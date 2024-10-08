import {
  bindPhone
} from "../../services/index"
//获取应用实例
const app = getApp()

Page({
  data: {
    //判断小程序的API，回调，参数，组件等是否在当前版本可用。
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    isHide: false,
    userInfo: {}
  },

  onLoad: function () {},
  bindPhoneNumber(e) {
    var detail = e.detail
    console.log({
      detail
    })
    if (e.detail.errMsg == 'getPhoneNumber:fail user deny') { //用户点击拒绝
      wx.showToast({
        title: '请绑定手机号',
        duration: 5000,
        icon: 'none',
      });
      return;
    }
    if (detail.iv) {
      let userInfo = wx.getStorageSync("userInfo")
      const params = {
        code: detail.code,
        worker_id: userInfo.worker_id
      }
      bindPhone(params).then(res => {
        console.log(res);
        if (res.success) {
          // 更新用户信息
          let userInfo = wx.getStorageSync("userInfo")
          userInfo.contact_number = res.data.contact_number;
          wx.setStorageSync("userInfo", userInfo)
          wx.showToast({
            title: "登录成功",
            duration: 5000,
            icon: 'none',
          });
          wx.navigateBack({
            delta: 1
          })
        } else {
          wx.showToast({
            title: res.message,
            duration: 5000,
            icon: 'none',
          });
        }
      })
    }
  },
  bindGetUserInfo: function (e) {
    if (e.detail.userInfo) {
      //用户按了允许授权按钮
      var that = this;
      // 获取到用户的信息了，打印到控制台上看下
      console.log("用户的信息如下：");
      console.log(e.detail.userInfo);
      //授权成功后,通过改变 isHide 的值，让实现页面显示出来，把授权页面隐藏起来
      that.setData({
        isHide: false,
        userInfo: e.detail.userInfo
      });
    } else {
      //用户按了拒绝按钮
      wx.showModal({
        title: '警告',
        content: '您点击了拒绝授权，将无法进入小程序，请授权之后再进入!!!',
        showCancel: false,
        confirmText: '返回授权',
        success: function (res) {
          // 用户没有授权成功，不需要改变 isHide 的值
          if (res.confirm) {
            console.log('用户点击了“返回授权”');
          }
        }
      });
    }
  }
})