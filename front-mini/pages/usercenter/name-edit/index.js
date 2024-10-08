import {
  saveUserInfo
} from '../../../services/index';

Page({
  data: {
    nameValue: '',
    userInfo: {},
  },
  onLoad(options) {
    let userInfo = wx.getStorageSync("userInfo")

    const {
      name
    } = options;
    this.setData({
      nameValue: name,
      userInfo: userInfo
    });
  },
  onSubmit() {
    saveUserInfo({
      worker_id: this.data.userInfo.worker_id,
      service_point_id: this.data.userInfo.service_point_id,
      name: this.data.nameValue
    }).then(res => {
      if (res.success) {
        let userInfo = wx.getStorageSync("userInfo")
        userInfo.name = this.data.nameValue;
        wx.setStorageSync("userInfo", userInfo)
        wx.navigateBack({
          backRefresh: true
        });
      } else {
        wx.showToast({
          title: res.msg,
          icon: 'none'
        })
      }
    })

  },
  clearContent() {
    this.setData({
      nameValue: '',
    });
  },
});