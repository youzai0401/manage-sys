import {
  fetchHome
} from '../../services/home/home';
import {
  fetchWorkOrderList
} from '../../services/index';
import Toast from 'tdesign-miniprogram/toast/index';

Page({
  data: {
    userInfo: {},
    imgSrcs: [],
    tabList: [],
    goodsList: [],
    goodsListLoadStatus: 0,
    pageLoading: false,
    current: 1,
    total: 0,
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
    // this.getTabBar().init();
  },

  onLoad() {
    let userInfo = wx.getStorageSync("userInfo")
    this.setData({
      userInfo: userInfo
    })
    this.init();
  },

  onReachBottom() {
    if (this.data.goodsListLoadStatus === 0) {
      this.loadGoodsList();
    }
  },

  onPullDownRefresh() {
    this.init();
  },

  init() {
    this.loadHomePage();
  },

  loadHomePage() {
    wx.stopPullDownRefresh();

    this.setData({
      pageLoading: true,
    });
    fetchHome().then(({
      swiper,
      tabList
    }) => {
      this.setData({
        tabList,
        imgSrcs: swiper,
        pageLoading: false,
      });
      this.loadGoodsList(true);
    });
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
      this.setData({
        total: 0
      })
    }
    if (this.data.total !== 0 && this.data.total <= this.data.goodsList.length) {
      return;
    }
    this.setData({
      goodsListLoadStatus: 1
    });

    const pageSize = this.goodListPagination.num;
    let pageIndex = this.privateData.tabIndex * pageSize + this.goodListPagination.index + 1;
    if (fresh) {
      pageIndex = 0;
    }
    try {
      const nextList = await fetchWorkOrderList({
        page: pageIndex,
        page_size: pageSize,
        worker_id: this.data.userInfo.worker_id
      });
      let listData = nextList.data.data;
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

  goodListClickHandle(e) {
    const {
      index
    } = e.detail;
    const {
      spuId
    } = this.data.goodsList[index];
    // todo 抢单，需要先判断是否已经登录，如果未登录，那么跳转到登录页面
    // wx.navigateTo({
    //   url: `/pages/goods/details/index?spuId=${spuId}`,
    // });
  },

  goodListAddCartHandle() {
    Toast({
      context: this,
      selector: '#t-toast',
      message: '点击加入购物车',
    });
  },

  navToSearchPage() {
    wx.navigateTo({
      url: '/pages/goods/search/index'
    });
  },

  navToActivityDetail({
    detail
  }) {
    const {
      index: promotionID = 0
    } = detail || {};
    wx.navigateTo({
      url: `/pages/promotion-detail/index?promotion_id=${promotionID}`,
    });
  },
});