// components/sort-card.js
Component({

  /**
   * 组件的属性列表
   */
  properties: {
    data: {
      type: Object,
      observer(data) {
        if (!data) {
          return;
        }
        this.setData({
          list: data
        });
      },
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    list: []
  },

  /**
   * 组件的方法列表
   */
  methods: {

  }
})