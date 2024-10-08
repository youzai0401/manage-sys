import {
  fetchPerson
} from '../../../services/usercenter/fetchPerson';
import {
  phoneEncryption
} from '../../../utils/util';
import Toast from 'tdesign-miniprogram/toast/index';
//获取全局数据
var app = getApp();
var globalData = app.globalData;
Page({
  data: {
    userInfo: {},
    phone: "",
    showUnbindConfirm: false,
    typeVisible: false,
  },
  onLoad() {
    this.init();
  },
  init() {
    let userInfo = wx.getStorageSync("userInfo");
    console.log(userInfo);
    this.setData({
      userInfo: userInfo,
      phone: userInfo.contact_number
    })
    // this.fetchData();
  },
  async onChooseAvatar(e) {
    console.log(e);
    const avatarUrl = e.detail.avatarUrl
    return;
    let res = await WXAPI.uploadFileV2(wx.getStorageSync('token'), avatarUrl)
    if (res.code != 0) {
      wx.showToast({
        title: res.msg,
        icon: 'none'
      })
      return
    }
    res = await WXAPI.modifyUserInfo({
      token: wx.getStorageSync('token'),
      avatarUrl: res.data.url,
    })
    if (res.code != 0) {
      wx.showToast({
        title: res.msg,
        icon: 'none'
      })
      return
    }
    wx.showToast({
      title: '设置成功',
    })
    this.getUserApiInfo()
  },
  onClickCell({
    currentTarget
  }) {
    const {
      dataset
    } = currentTarget;
    const {
      name
    } = this.data.userInfo;

    switch (dataset.type) {
      case 'name':
        wx.navigateTo({
          url: `/pages/usercenter/name-edit/index?name=${name}`,
        });
        break;
      case 'phoneNumber':
        wx.showToast({
          icon: 'none',
          title: '暂不支持修改已绑定的手机号'
        });
        break;
      case 'avatarUrl':
        wx.showToast({
          icon: 'none',
          title: '暂不支持修改头像'
        });
        // this.toModifyAvatar();
        break;
      default: {
        break;
      }
    }
  },
  onClose() {
    this.setData({
      typeVisible: false,
    });
  },
  onConfirm(e) {
    const {
      value
    } = e.detail;
    this.setData({
        typeVisible: false,
        'personInfo.gender': value,
      },
      () => {
        Toast({
          context: this,
          selector: '#t-toast',
          message: '设置成功',
          theme: 'success',
        });
      },
    );
  },
  async toModifyAvatar() {
    try {
      const tempFilePath = await new Promise((resolve, reject) => {
        wx.chooseImage({
          count: 1,
          sizeType: ['compressed'],
          sourceType: ['album', 'camera'],
          success: (res) => {
            const {
              path,
              size
            } = res.tempFiles[0];
            if (size <= 10485760) {
              resolve(path);
            } else {
              reject({
                errMsg: '图片大小超出限制，请重新上传'
              });
            }
          },
          fail: (err) => reject(err),
        });
      });
      const tempUrlArr = tempFilePath.split('/');
      const tempFileName = tempUrlArr[tempUrlArr.length - 1];
      Toast({
        context: this,
        selector: '#t-toast',
        message: `已选择图片-${tempFileName}`,
        theme: 'success',
      });
    } catch (error) {
      if (error.errMsg === 'chooseImage:fail cancel') return;
      Toast({
        context: this,
        selector: '#t-toast',
        message: error.errMsg || error.msg || '修改头像出错了',
        theme: 'error',
      });
    }
  },
});