Page({
    data: {
        ht: 250,
        wd: 250,
        mpoint: {
            pageX: 0, pageY: 0
        },
        angles: 0
    },
    onLoad: function (options) {
        if (options) {
            this.setData({
                ht: options.ht || 250,
                wd: options.wd || 250,
                hasimg: !!options.imgpage
            });
        }
        if (options.imgpage) {
            this.imginit(options.imgpage);
        }
        var pages = getCurrentPages();
      console.log(pages)
        this.backpage = pages[pages.length - 2];
    },
    onReady: function () {
        this.ctx = wx.createCanvasContext('imgcanvas');
    },
    imginit: function (path) {
        var self = this;
        wx.getImageInfo({
            src: path,
            success: function (res) {
                var dev = wx.getSystemInfoSync();
                var zoomMin = self.getScale(self.data.wd, self.data.ht, res.width, res.height);
                var zoomMax = Math.max(1.8, zoomMin);
                var zoomStart = Math.min(zoomMax, self.getScale(dev.windowWidth, dev.windowHeight, res.width, res.height));
                var minX = self.data.wd - res.width * zoomStart;
                var minY = self.data.ht - res.height * zoomStart;
                var posX = parseInt(minX * .5);
                var posY = parseInt(minY * .5);
                self.setData({
                    maxX: 0,
                    maxY: 0,
                    minX: minX,
                    minY: minY,
                    posX: posX,
                    posY: posY,
                    zoomStart: zoomStart,
                    zoomMin: zoomMin,
                    zoomMax: zoomMax,
                    oldimg: res.path,
                    oldht: res.height,
                    oldwd: res.width
                });
                setTimeout(function () {
                    self.setData({
                        tleft: 1
                    });
                },
                    100);
            }
        });
    },
    getScale: function (w1, h1, w2, h2) {
        var sx = w1 / w2;
        var sy = h1 / h2;
        return sx > sy ? sx : sy;
    },
    getDis: function (touches) {
        var x = touches[0].pageX - touches[1].pageX;
        var y = touches[0].pageY - touches[1].pageY;
        return Math.sqrt(x * x + y * y);
    },
    eimg: function () {
        var self = this;
        wx.chooseImage({
            count: 1,
            sizeType: ['compressed'],
            success: function (res) {
                self.imginit(res.tempFilePaths[0]);
            }
        });
    },
    eok: function () {
        var self = this;
        this.ctx.clearRect(0, 0, this.data.wd, this.data.ht);
        this.ctx.save();
        this.ctx.rotate(this.data.angles * Math.PI / 180);
        this.ctx.drawImage(this.data.oldimg, this.data.posX, this.data.posY, this.data.oldwd * this.data.zoomStart, this.data.oldht * this.data.zoomStart);
        this.ctx.draw();
      setTimeout(function () {
        wx.canvasToTempFilePath({
            canvasId: 'imgcanvas',
            success: function (res) {
                console.log(res)
                self.backpage.eimgcutcb(res.tempFilePath);
                delete this.mangles;
                wx.navigateBack({
                    delta: 1
                });
            }
        });
      },500);
    },
    etouchstart: function (e) {
        if (!this.data.oldimg) return;
        this.move = e.touches.length == 1;
        this.zoom = e.touches.length >= 2;
        this.sttouches = e.touches;
        this.touches = e.touches;
        if (this.touches.length == 2) {
            this.mangles = [this.angles(this.touches)];
        }
    },
    etouchmove: function (e) {
        if (!this.data.oldimg) return;
        if (this.move) {
            var x = e.touches[0].pageX - this.touches[0].pageX;
            var y = e.touches[0].pageY - this.touches[0].pageY;
            this.touches = e.touches;
            this.setData({
                time: 0,
                posX: this.data.posX + x,
                posY: this.data.posY + y
            });
        }
        if (this.zoom) {
            if (this.touches.length >= 2 && e.touches.length >= 2) {
                var dis1 = this.getDis(this.touches);
                var dis2 = this.getDis(e.touches);
                var scale = 0.004 * (dis2 - dis1);
                var zoomStart = this.data.zoomStart + scale;
                if (zoomStart > this.data.zoomMax) zoomStart = this.data.zoomMax;
                if (zoomStart < this.data.zoomMin) zoomStart = this.data.zoomMin;
                var minX = this.data.wd - this.data.oldwd * this.data.zoomStart;
                var minY = this.data.ht - this.data.oldht * this.data.zoomStart;
                var posX = this.data.posX + this.data.wd * (this.data.zoomStart - zoomStart);
                var posY = this.data.posY + this.data.ht * (this.data.zoomStart - zoomStart);
                this.setData({
                    zoomStart: zoomStart,
                    minX: minX,
                    minY: minY,
                    posX: parseInt(posX),
                    posY: parseInt(posY)
                });
            }
            this.touches = e.touches;
            if (this.touches.length == 2) {
                this.mangles.push(this.angles(this.touches));
                //console.log(this.angles(this.touches));
            }
        }
    },
    //计算旋转后两直线的交点
    segmentsIntr: function (a, b, c, d) {
        var areaAbc = (a.pageX - c.pageX) * (b.pageY - c.pageY) - (a.pageY - c.pageY) * (b.pageX - c.pageX);
        var areaAbd = (a.pageX - d.pageX) * (b.pageY - d.pageY) - (a.pageY - d.pageY) * (b.pageX - d.pageX);
        if (areaAbc * areaAbd >= 0) {
            return false;
        }
        var areaCda = (c.pageX - a.pageX) * (d.pageY - a.pageY) - (c.pageY - a.pageY) * (d.pageX - a.pageX);
        var areaCdb = areaCda + areaAbc - areaAbd;
        if (areaCda * areaCdb >= 0) {
            return false;
        }
        var t = areaCda / (areaAbd - areaAbc);
        var dx = t * (b.pageX - a.pageX),
            dy = t * (b.pageY - a.pageY);
        return { pageX: a.pageX + dx, pageY: a.pageY + dy };
    },
    //计算直线与x轴正方向的角度
    angles: function (touch) {
        var x = Math.abs(touch[0].pageX - touch[1].pageX),
            y = Math.abs(touch[0].pageY - touch[1].pageY);
        var ag = Math.atan(y / x) * 180 / Math.PI;
        if (touch[1].pageY > touch[0].pageY && touch[1].pageX < touch[0].pageX ||
            touch[0].pageY > touch[1].pageY && touch[0].pageX < touch[1].pageX) return 180 - ag;
        return ag;
    },
    //计算旋转后两直线的角度和旋转点坐标，顺时针为正
    getAngles: function () {
        var angle = this.mangles[this.mangles.length - 1] - this.mangles[0];
        if (this.mangles[this.mangles.length - 1] < this.mangles[0] && (this.mangles.length > 3 && this.mangles[3] > this.mangles[0] || this.mangles.length > 2 && this.mangles[2] > this.mangles[0] || this.mangles[1] > this.mangles[0])) {
            angle = 180 - this.mangles[0] + this.mangles[this.mangles.length - 1];
        }
        if (this.mangles[this.mangles.length - 1] > this.mangles[0] && (this.mangles.length > 3 && this.mangles[3] < this.mangles[0] || this.mangles.length > 2 && this.mangles[2] < this.mangles[0] || this.mangles[1] < this.mangles[0])) {
            angle = this.mangles[this.mangles.length - 1] - this.mangles[0] - 180;
        }
        angle = angle > 30 ? 90 : angle < -30 ? -90 : 0;
        // var point = this.segmentsIntr(this.sttouches[0], this.sttouches[1], this.touches[0], this.touches[1]) || { pageX: 0, pageY: 0 };
        //采用截图方框对角线交点体验更好
        var point = {
            pageX: this.data.wd / 2, pageY: this.data.ht / 2
        }
        return { angle: angle, point: point };
    },
    etouchend: function () {
        if (!this.data.oldimg) return;
        //if (this.sttouches.length == 2 && this.touches.length == 2) {
        //    var angle = this.getAngles();
        //    if (angle != 0) {
        //        angle.point.pageX = (angle.point.pageX - this.data.posX) / this.data.zoomStart;
        //        angle.point.pageY = (angle.point.pageY - this.data.posY) / this.data.zoomStart;
        //        this.data.angles += angle.angle;
        //        this.setData({
        //            mpoint: angle.point,
        //            minX: this.data.minX + this.data.wd / 2 / this.data.zoomStart,
        //            minY: this.data.minY - this.data.ht / 2 / this.data.zoomStart,
        //            maxX: this.data.maxX - this.data.wd / 2 / this.data.zoomStart,
        //            maxY: this.data.maxY + this.data.ht / 2 / this.data.zoomStart,
        //            mtime: 600,
        //            angles: this.data.angles,
        //            time: 600
        //        });
        //        console.log(angle);
        //        return;
        //    }
        //}
        if (this.data.posX > this.data.maxX) {
            this.data.posX = this.data.maxX;
        } else if (this.data.posX < this.data.minX) {
            this.data.posX = this.data.minX;
        }
        if (this.data.posY > this.data.maxY) {
            this.data.posY = this.data.maxY;
        } else if (this.data.posY < this.data.minY) {
            this.data.posY = this.data.minY;
        }
        this.setData({
            posX: this.data.posX,
            posY: this.data.posY,
            angles: this.data.angles,
            time: 600
        });
    }
})