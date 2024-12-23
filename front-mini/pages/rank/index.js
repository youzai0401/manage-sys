import {
  workerRanking,
  serviceRanking
} from '../../services/index';
Page({
  data: {
    personalList: [],
    serviceList: [],
    userInfo: {}
  },

  onShow() {
    this.getTabBar().init();
  },
  onChange() {

  },
  onLoad() {
    let userInfo = wx.getStorageSync("userInfo")
    this.setData({
      userInfo: userInfo
    })
    this.getPersonalRank();
  },
  onTabsChange(event) {
    console.log(`Change tab, tab-panel value is ${event.detail.value}.`);
    if (event.detail.value === '0') {
      this.getPersonalRank()
    } else if (event.detail.value === '1') {
      this.getServiceRank()
    }
  },
  getPersonalRank() {
    workerRanking({
      service_point_id: this.data.userInfo.service_point_id
    }).then(res => {
      if (res.success) {
        // let a = [...res.data.data, ...res.data.data, ...res.data.data, ...res.data.data, ...res.data.data];
        this.setData({
          personalList: res.data.data
        })
      } else {
        wx.showToast({
          title: res.message,
          duration: 3000,
          icon: 'none',
        });
      }
    })
  },

  getServiceRank() {
    serviceRanking({
      // service_point_id: this.data.userInfo.service_point_id
    }).then(res => {
      if (res.success) {
        this.setData({
          serviceList: res.data.data
        })
      } else {
        wx.showToast({
          title: res.message,
          duration: 3000,
          icon: 'none',
        });
      }
    })
  },

  onTabsClick(event) {
    console.log(`Click tab, tab-panel value is ${event.detail.value}.`);
  },
});