const AuthStepType = {
  ONE: 1,
  TWO: 2,
  THREE: 3,
};


Component({
  options: {
    multipleSlots: true,
  },
  properties: {
    currAuthStep: {
      type: Number,
      value: AuthStepType.ONE,
    },
    userInfo: {
      type: Object,
      value: {},
    },
    phone: {
      type: String,
      value: "",
    },
    isNeedGetUserInfo: {
      type: Boolean,
      value: true,
    },
  },
  data: {
    defaultAvatarUrl: 'https://cdn-we-retail.ym.tencent.com/miniapp/usercenter/icon-user-center-avatar@2x.png',
    AuthStepType,
  },
  methods: {
    gotoUserEditPage() {
      this.triggerEvent('gotoUserEditPage');
    },
    gotoLogin() {
      this.triggerEvent('gotoLogin');
    }
  },
});