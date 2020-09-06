var picSize = 1000;
Page({
  
  /**
   * 页面的初始数据
   */
  data: {
    image:'../img/add.png',
    shateImg:null,
    picID:1,
    userNum:null,
    picNum: null,
    windowWidth: wx.getSystemInfoSync().windowWidth
  },


  /**
   * 选择图片
   */
/*  choosePic: function(e){
    var that = this;
    console.log("--选择图片--");
    wx.chooseImage({
      count: 1,
      success: function(res) {
        console.log("用户选择的图片：" + res.tempFilePaths[0]);
        // tempFilePath可以作为img标签的src属性显示图片
       
        that.setData({
          image: res.tempFilePaths[0]
        })
      },
    })
  }, */
  
  chooseKuang: function(e){
    var that = e.currentTarget.id;
	var kuang = this;
    console.log("--选择了头像框"+that);  
	kuang.setData({
		picID:that,
		image1: "../img/head/"+that+".png"
	})   
  },

    eportrait: function () {
        wx.chooseImage({
            count: 1,
            sizeType: ['compressed'],
            success: function (res) {
                wx.navigateTo({ url: '/pages/imgcut?imgpage=' + res.tempFilePaths[0] });
            }
        });
    },
	eimgcutcb: function (image) {
	  console.log(image)
	    this.setData({
	        image: image
	    });
	},
  /**
   * 保存图片
   */
  savePic: function(e){
    wx.showToast({
      title: '保存中',
      icon: 'loading'
    })
    var that = this;
    const ctx = wx.createCanvasContext('shareImg');//选择画布
    console.log("--保存图片--");

    ctx.clearRect(0, 0, 1000, 1000);//清空画布
    ctx.draw();
    ctx.drawImage(this.data.image, 0, 0, 1000, 1000);//画用户上传的图片
    //ctx.drawImage('../img/white.png', 0, 0, 1000, 1000);//画白边
    ctx.drawImage('../img/head/'+that.data.picID+'.png', 0, 0, picSize, picSize);//画头像框
    ctx.draw(
      true,
      //画布导出为临时图片
      setTimeout(function(){
        wx.canvasToTempFilePath({
          x: 0,
          y: 0,
          width: picSize,
          height: picSize,
          destWidth: picSize,
          destHeight: picSize,
          canvasId: 'shareImg',
          success(res) {
            console.log('生成的临时文件：' + res.tempFilePath)
            that.setData({
              shateImg: res.tempFilePath
            })
          }
        })
      },100)
      
    );
    
    //保存图片
    setTimeout(function(){
      var thar = this;
      var randStr = wx.getStorageSync('randStr');
      wx.saveImageToPhotosAlbum({
        filePath: that.data.shateImg,
        success(res) {
          console.log("保存图片-成功");
          wx.showToast({
            title: '保存成功'
          })
          console.log(res)
        },
        fail(res) {
          console.log("保存图片-失败" + that.data.shateImg);
          console.log(res);
          if (res.errMsg == "saveImageToPhotosAlbum:fail:auth denied"){
            wx.showModal({
              title: '我们需要将图片保存到相册',
              content: '我们需要相册写入权限来将图片保存到相册',
              success: function(e){
                console.log(e);
                if (e.confirm == true){
                  console.log("用户授权了相册");
                  wx.openSetting({});
                }
              }
            })
          }else{
            wx.showToast({
              title: '保存失败',
              icon: 'none'
            })
          }
        }
      })
    },1000)
  },



  

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
  },
  onShareAppMessage: function () {
      return {
        title: '燕大百年校庆定制头像',
        desc: '快来定制你的专属校庆头像吧',
        path: '/pages/index',
		imageUrl:'/img/share.jpg'
      }
    },
})