//版本号：0.1.0
//最后更新时间：2019-6-1
const ald = require('./utils/ald-stat.js')
App({
  randomWord: function (randomFlag, min, max) {
    var str = "",
      range = min,
      arr = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

    // 随机产生
    if (randomFlag) {
      range = Math.round(Math.random() * (max - min)) + min;
    }
    for (var i = 0; i < range; i++) {
      var pos = Math.round(Math.random() * (arr.length - 1));
      str += arr[pos];
    }
    return str;
  },
  onLaunch: function() {
    var that = this;
    var networkType;
    var randStr;
    const sys = wx.getSystemInfoSync();
    console.log(sys);
    wx.getStorage({
      key: 'randStr',
      success: function (res) {
        console.log('二次打开');
        randStr = res.data;
      },
      fail: function (res) {
        console.log('首次打开');
        randStr = that.randomWord(false, 16)
        wx.setStorage({
          key: 'randStr',
          data: randStr,
        })
      }
    })
    
    wx.getNetworkType({
      success: function(res) {
        networkType = res.networkType;
        console.log("小程序启动，设备网络类型:"+networkType);
      }
    })
  },
  globalData: {
    userInfo: null,
    imgs:'../../img/defaultImg.png'
  }
})