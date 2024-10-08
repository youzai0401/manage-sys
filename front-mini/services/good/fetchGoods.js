import {
  config
} from '../../config/index';

/** 获取订单列表 */
export function fetchGoodsList(pageIndex = 1, pageSize = 20) {
  // if (config.useMock) {
  //   return mockFetchGoodsList(pageIndex, pageSize);
  // }

  console.log(pageIndex, pageSize);
  return re;
}

/** 获取订单列表 */
// export function fetchGoodsList(pageIndex = 1, pageSize = 20) {
//   return request("/api/assignments/available", "get", {
//     page: pageIndex,
//     page_size: pageSize
//   });
// }