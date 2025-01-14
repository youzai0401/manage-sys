import axios from 'axios'
import { MessageBox, Message } from 'element-ui'
// import store from '@/store'
import { getToken, removeToken } from '@/utils/auth'
import router from '@/router'
let noToken = false
// create an axios instance
const service = axios.create({
  baseURL: process.env.VUE_APP_BASE_API, // url = base url + request url
  withCredentials: true, // send cookies when cross-domain requests
  timeout: 10000 // request timeout
})

// request interceptor
service.interceptors.request.use(
  config => {
    // do something before request is sent
    // if (store.getters.token) {
    // let each request carry token
    // ['X-Token'] is a custom headers key
    // please modify it according to the actual situation
    config.headers['Authorization'] = `Bearer ${getToken()}`
    // }
    return config
  },
  error => {
    // do something with request error
    console.log(error) // for debug
    return Promise.reject(error)
  }
)

// response interceptor
service.interceptors.response.use(
  /**
   * If you want to get http information such as headers or status
   * Please return  response => response
  */

  /**
   * Determine the request status by custom code
   * Here is just an example
   * You can also judge the status by HTTP Status Code
   */
  response => {
    const res = response.data

    // if the custom code is not 20000, it is judged as an error.
    // if (res.code !== 10000) {
    //   if (res.code !== 405) {
    //     Message({
    //       message: res?.msg || 'Error',
    //       type: 'error',
    //       duration: 5 * 1000
    //     })
    //   }
    //
    //   // 50008: Illegal token; 50012: Other clients logged in; 50014: Token expired;
    // console.log(res)
    // debugger
    // if (res.code === 401) {
    //   if (noToken) {
    //     return res
    //   }
    //   // to re-login
    //   noToken = true
    //   MessageBox.confirm('用户未登录或者登录已失效，请重新登录', {
    //     confirmButtonText: '确定',
    //     cancelButtonText: '取消',
    //     type: 'warning'
    //   }).then(() => {
    //     //  跳转到登录页面
    //     router.replace({ path: '/login' })
    //     noToken = false
    //   })
    // }
    // return Promise.reject(new Error(res.message || 'Error'))
    // } else {
    return res
    // }
  },
  error => {
    if (error.response.status === 401) {
      if (noToken) {
        return Promise.reject(error.response)
      }
      // to re-login
      noToken = true
      MessageBox.confirm('用户未登录或者登录已失效，请重新登录', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        removeToken() // must remove  token  first
        sessionStorage.removeItem('userInfo')
        //  跳转到登录页面
        router.replace({ path: '/login' })
        noToken = false
      }).catch(() => {
        noToken = false
      })
      return
    }
    // console.log('err' + error.response.status) // for debug
    Message({
      message: error.message,
      type: 'error',
      duration: 5 * 1000
    })
    return Promise.reject(error)
  }
)

export default service
