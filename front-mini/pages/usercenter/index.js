import {
  fetchUserCenter
} from '../../services/usercenter/fetchUsercenter';
import Toast from 'tdesign-miniprogram/toast/index';
//获取全局数据
var app = getApp();
var globalData = app.globalData;

const menuData = [
  [{
      title: '工单记录',
      tit: '',
      url: '',
      type: 'orderRecord',
    },
    {
      title: '收款记录',
      tit: '',
      url: '',
      type: 'incomeRecord',
    },
  ],
];

const orderTagInfos = [];

const getDefaultData = () => ({
  showMakePhone: false,
  userInfo: {},
  phone: "",
  menuData,
  orderTagInfos,
  customerServiceInfo: {},
  currAuthStep: 1,
  showKefu: true,
  versionNo: '',
});

Page({
  data: getDefaultData(),

  onLoad() {
    let userInfo = wx.getStorageSync("userInfo");
    this.setData({
      userInfo: userInfo,
      phone: userInfo.contact_number
    })
    this.getVersionInfo();
  },

  onShow() {
    this.getTabBar().init();
    this.init();
  },
  onPullDownRefresh() {
    this.init();
  },

  init() {
    this.fetUseriInfoHandle();
  },
  gotoLogin() {
    wx.navigateTo({
      url: "/pages/login/index",
    });
  },
  gotoUserEditPage() {
    const {
      currAuthStep
    } = this.data;
    if (currAuthStep === 2) {
      wx.navigateTo({
        url: '/pages/usercenter/person-info/index'
      });
    } else {
      this.fetUseriInfoHandle();
    }
  },
  fetUseriInfoHandle() {
    fetchUserCenter().then(
      ({
        orderTagInfos: orderInfo,
      }) => {
        this.setData({
          menuData,
          currAuthStep: 2,
        });
        wx.stopPullDownRefresh();
      },
    );
  },

  onClickCell({
    currentTarget
  }) {
    const {
      type
    } = currentTarget.dataset;
    console.log(type)
    switch (type) {
      case 'orderRecord': {
        wx.navigateTo({
          url: '/pages/orderrecord/index'
        });
        break;
      }
      case 'incomeRecord': {
        wx.navigateTo({
          url: '/pages/incomerecord/index'
        });
        break;
      }

      default: {
        Toast({
          context: this,
          selector: '#t-toast',
          message: '未知跳转',
          icon: '',
          duration: 1000,
        });
        break;
      }
    }
  },

  getVersionInfo() {
    const versionInfo = wx.getAccountInfoSync();
    const {
      version,
      envVersion = __wxConfig
    } = versionInfo.miniProgram;
    this.setData({
      versionNo: envVersion === 'release' ? version : envVersion,
    });
  },
});