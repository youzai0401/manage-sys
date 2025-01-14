import {
  fetchOrderList,
  claimOrder,
  wxLogin,
  bindServicePoint
} from "../../services/index"
import dayjs from "dayjs"

import Toast from 'tdesign-miniprogram/toast/index';
//获取全局数据
var app = getApp();
var globalData = app.globalData;
Page({
  data: {
    currentOrder: {},
    showWithInput: false,
    claimValue: 0,
    total: 0,
    imgSrcs: [],
    tabList: [],
    goodsList: [],
    goodsListLoadStatus: 0,
    pageLoading: false,
    current: 1,
    autoplay: true,
    duration: '500',
    interval: 5000,
    navigation: {
      type: 'dots'
    },
    swiperImageProps: {
      mode: 'scaleToFill'
    },
  },

  goodListPagination: {
    index: 0,
    num: 20,
  },

  privateData: {
    tabIndex: 0,
  },

  onShow() {
    this.getTabBar().init();
    // this.init();
  },

  async onLoad(options) {
    await wxLogin()
    const scene = decodeURIComponent(options.scene)
    let sceneParams = {}
    if (scene) {
      let paramArr = scene.split("&");
      paramArr.forEach((item, index) => {
        let key = item.split('=')[0];
        let value = item.split('=')[1];
        sceneParams[key] = value;
      })
    }
    if (options.service_point_id || sceneParams.service_point_id) {
      await this.handleBindServicePoint(options.service_point_id || sceneParams.service_point_id)
    }
    this.init();
  },

  onReachBottom() {
    if (this.data.total !== 0 && this.data.total <= this.data.goodsList.length) {
      return;
    }
    if (this.data.goodsListLoadStatus === 0) {
      this.loadGoodsList();
    }
  },
  handleBindServicePoint(service_point_id) {
    return new Promise((resolve, reject) => {
      wx.login({
        success: res => {
          // 获取到用户的 code 之后：res.code
          bindServicePoint({
            code: res.code,
            service_point_id: service_point_id
          }).then(res => {
            if (res.success) {
              // 更新用户信息
              let userInfo = wx.getStorageSync("userInfo")
              userInfo.service_point_id = service_point_id;
              wx.setStorageSync("userInfo", userInfo)
              wx.showToast({
                title: "绑定服务点成功",
                duration: 3000,
                icon: 'none',
              });
              resolve(true)
            } else {
              wx.showToast({
                title: res.message,
                duration: 3000,
                icon: 'none',
              });
              resolve(false)
            }

          }).catch((err) => {
            reject(err)
          })
        }
      });
    })


  },
  onPullDownRefresh() {
    this.init();
  },

  init() {
    wx.stopPullDownRefresh();
    this.loadGoodsList(true);
  },

  tabChangeHandle(e) {
    this.privateData.tabIndex = e.detail;
    this.loadGoodsList(true);
  },

  onReTry() {
    this.loadGoodsList();
  },

  async loadGoodsList(fresh = false) {
    if (fresh) {
      wx.pageScrollTo({
        scrollTop: 0,
      });
    }

    this.setData({
      goodsListLoadStatus: 1
    });

    const pageSize = this.goodListPagination.num;
    let pageIndex = this.privateData.tabIndex * pageSize + this.goodListPagination.index + 1;
    if (fresh) {
      pageIndex = 0;
      this.setData({
        total: 0
      })
    }

    if (this.data.total !== 0 && this.data.total <= this.data.goodsList.length) {
      return;
    }
    try {
      let userInfo = wx.getStorageSync("userInfo")
      if (!userInfo.service_point_id) {
        this.setData({
          goodsListLoadStatus: 3
        });
        return;
      }
      const nextList = await fetchOrderList({
        page: pageIndex,
        page_size: pageSize,
        service_point_id: userInfo.service_point_id
      });

      let listData = nextList.data.data.map(item => {
        item.estimated_pay_date = dayjs(item.estimated_pay_date).format("YYYY-MM-DD");
        return item;
      });
      this.setData({
        goodsList: fresh ? listData : this.data.goodsList.concat(listData),
        goodsListLoadStatus: 0,
        total: nextList.data.total
      });

      this.goodListPagination.index = pageIndex;
      this.goodListPagination.num = pageSize;
    } catch (err) {
      this.setData({
        goodsListLoadStatus: 3
      });
    }
  },
  closeDialog() {
    this.setData({
      showWithInput: false,
      claimValue: 0
    })
  },
  handleClaimOrder() {
    if (this.data.claimValue == 0 || !this.data.claimValue) {
      wx.showToast({
        title: '单量不能为0',
        duration: 3000,
        icon: 'none',
      });
      return;
    }
    // 判断必须为100的整数倍
    if (this.data.claimValue % 10 !== 0) {
      wx.showToast({
        title: '领取单量必须是10的倍数，如：100、1100、1200',
        duration: 3000,
        icon: 'none',
      });
      return;
    }
    let userInfo = wx.getStorageSync("userInfo")
    claimOrder(this.data.currentOrder.assignment_id, {
      worker_id: userInfo.worker_id,
      quantity: this.data.claimValue
    }).then(res => {
      if (res.success) {
        wx.showToast({
          title: "抢单成功",
          duration: 3000,
          icon: 'none',
        });
        this.loadGoodsList(true);
        this.closeDialog();
      } else {
        wx.showToast({
          title: res.message,
          duration: 3000,
          icon: 'none',
        });
      }
    })
  },
  handleClaimValueChange(e) {
    const {
      value
    } = e.detail;

    console.log(value);
    this.setData({
      claimValue: value,
    });
  },
  goodListClickHandle(e) {
    let userInfo = wx.getStorageSync("userInfo")

    const {
      index
    } = e.detail;
    const item = this.data.goodsList[index];
    this.setData({
      currentOrder: item
    })
    // todo 抢单，需要先判断是否已经登录，如果未登录，那么跳转到登录页面
    if (!userInfo.service_point_id) {
      wx.showToast({
        title: "请扫描对应服务点二维码绑定服务点后重新进入小程序",
        duration: 3000,
        icon: 'none',
      });
    } else if (userInfo.contact_number) {
      // todo 正常逻辑
      this.setData({
        showWithInput: true
      })
    } else {
      wx.navigateTo({
        url: "/pages/login/index",
      });
    }
  },
})