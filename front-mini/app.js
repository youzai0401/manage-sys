import updateManager from './common/updateManager';
import {
  userLogin
} from './services/index'
App({
  onLaunch: function () {
    // 用户已经授权过,不需要显示授权页面,所以不需要改变 isHide 的值
    // 根据自己的需求有其他操作再补充
    // 我这里实现的是在用户授权成功后，调用微信的 wx.login 接口，从而获取code
  },
  onShow: function () {
    updateManager();
  },
});