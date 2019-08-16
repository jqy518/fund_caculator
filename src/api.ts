// http://91.push2his.eastmoney.com/api/qt/stock/kline/get?secid=1.000905&fields1=f1,f2,f3,f4,f5&fields2=f51,f52,f53,f54,f55,f56,f57&klt=101&fqt=0&beg=20170101&end=20200101&ut=fa5fd1943c7b386f172d6893dbfba10b&cb=cb55827682123744
// http://finance.sina.com.cn/fund/api/xh5Fund/nav/159916.js
import jsonp from 'jsonp'
// import axios from 'axios'
import { zz500 } from './jjdata'
export interface IndexFundQueryParams {
    start:string,
    end:string,
}

export function getIndexFund (fund:string):any {
  return new Promise(function (resolve, reject) {
    jsonp(`http://91.push2his.eastmoney.com/api/qt/stock/kline/get?secid=${fund}&fields1=f1,f2,f3,f4,f5&fields2=f51,f52,f53,f54,f55,f56,f57&klt=101&fqt=0&beg=20050101&end=20200101&ut=fa5fd1943c7b386f172d6893dbfba10b`, {
      param: 'cb'
    }, function (err, data):void {
      if (err) {
        reject(err)
      } else {
        resolve(data)
      }
    })
  })
}
