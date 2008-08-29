// Copyright (c) 2008 Jorge Bernal <jbernal@warp.es>
// 
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
// 
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
// 
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

var BorderImageRules = Class.create({
  initialize: function(hash) {
    this.left = parseInt(hash.get('left'));
    this.right = parseInt(hash.get('right'));
    this.top = parseInt(hash.get('top'));
    this.bottom = parseInt(hash.get('bottom'));
    this.image = hash.get('image');
  }
});

var BorderImage = Class.create({
  initialize: function(elm, rule) {
    // TODO: Find rules in CSS
    if (elm.style.webkitBorderImage !== undefined) {
      // Safari doesn't need this
      return false;
    }
    var borderRule = rule;
    var matches = borderRule.match(/^url\(([^)]+)\) (\d+) (\d+) (\d+) (\d+)/)
    this.rules = new BorderImageRules($H({
      image: matches[1],
      top: matches[2],
      right: matches[3],
      bottom: matches[4],
      left: matches[5]
    }));
    this.width = parseInt(this.getStyleProp(elm, 'width'));
    this.height = parseInt(this.getStyleProp(elm, 'height'));
    this.left = elm.offsetLeft;
    this.top = elm.offsetTop;
    this.divs = $H();
        
    var left = document.createElement('div');
    left.style.height = (this.height - this.rules.top - this.rules.bottom) + 'px';
    left.style.width = this.rules.left + 'px';
    left.style.position = 'absolute';
    left.style.top = (this.top + this.rules.top) + 'px';
    left.style.left = (this.left) + 'px';
    left.style.margin = '0';
    left.id = '__jsbi_div_l';
    new Insertion.Before(elm, left);
    this.divs['l'] = left;

    var central = document.createElement('div');
    central.style.height = (this.height - this.rules.top - this.rules.bottom) + 'px';
    central.style.width = (this.width - this.rules.left - this.rules.right) + 'px';
    central.style.textAlign = 'center';
    central.style.overflow = 'hidden';
    central.style.position = 'absolute';
    central.style.top = (this.top + this.rules.top) + 'px';
    central.style.left = (this.left + this.rules.left) + 'px';
    central.style.margin = '0';
    central.id = '__jsbi_div_c';
    new Insertion.Before(elm, central);
    this.divs['c'] = central;

    var right = document.createElement('div');
    right.style.height = (this.height - this.rules.top - this.rules.bottom) + 'px';
    right.style.width = this.rules.right + 'px';
    right.style.position = 'absolute';
    right.style.top = (this.top + this.rules.top) + 'px';
    right.style.left = (this.left + this.width - this.rules.right) + 'px';
    right.style.margin = '0';
    right.id = '__jsbi_div_r';
    new Insertion.Before(elm, right);
    this.divs['r'] = right;
    
    elm.style.position = 'relative';
    elm.style.zIndex = parseInt(0);
    
    this.preloadImage();
  },
  
  sliceImage: function(img) {
    this.image_width = this.template_image.width;
    this.image_height = this.template_image.height;
        
    this.images = $H();
    var div = document.createElement('div');
    div.style.background = 'url(' + this.rules.image + ') no-repeat center center';
    div.style.width = this.image_width - this.rules.left - this.rules.right + 'px';
    div.style.height = this.image_height - this.rules.top - this.rules.bottom + 'px';
    div.style.overflow = 'hidden';
    div.style.zIndex = parseInt(-9);
    div.style.position = 'absolute';
    div.style.top = '0';
    this.images['c'] = div;

    var div = document.createElement('div');
    div.style.background = 'url(' + this.rules.image + ') no-repeat center left';
    div.style.width = this.rules.left + 'px';
    div.style.height = this.image_height - this.rules.top - this.rules.bottom + 'px';
    div.style.overflow = 'hidden';
    div.style.zIndex = parseInt(-9);
    div.style.position = 'absolute';
    div.style.top = '0';
    div.style.left = '0';
    this.images['l'] = div;
    
    var div = document.createElement('div');
    div.style.background = 'url(' + this.rules.image + ') no-repeat center right';
    div.style.width = this.rules.right + 'px';
    div.style.height = this.image_height - this.rules.top - this.rules.bottom + 'px';
    div.style.overflow = 'hidden';
    div.style.zIndex = parseInt(-9);
    div.style.position = 'absolute';
    div.style.top = '0';
    div.style.left = '0';
    this.images['r'] = div;

    this.placeDivs();
  },
  
  placeDivs: function() {
    // Center div
    var div = this.divs['c'];
    var base_image = this.images['c'];
    var image = base_image;
    var cols = parseFloat(div.style.width) / (parseFloat(base_image.style.width));
    cols = Math.ceil(cols);
    
    for (var col = 0; col < cols; col++) {
      image = base_image.cloneNode(true);
      image.style.left = (col * parseFloat(base_image.style.width)) + 'px';
      $('__jsbi_div_c').insert(image);      
    }
    
    // Left div
    div = this.divs['l'];
    image = this.images['l'].cloneNode(true);
    $('__jsbi_div_l').insert(image);      

    // Right div
    div = this.divs['r'];
    image = this.images['r'].cloneNode(true);
    $('__jsbi_div_r').insert(image);      
    
  },
  
  preloadImage: function() {
    var img = document.createElement('img');
    img.id = '__jsbi_base_image';
    img.src = this.rules.image;
    this.template_image = img;
    
    Event.observe(img, 'load', this.sliceImage.bindAsEventListener(this), false);
  },
  
  getStyleProp: function(x,prop){
    if(x.currentStyle)
        return(x.currentStyle[prop]);
    if(document.defaultView.getComputedStyle)
        return(document.defaultView.getComputedStyle(x,'')[prop]);
    return(null);
  },
  
  findCssRules: function() {
    // TODO: findCssRules
  }
})

window.addEventListener("load", function() {new BorderImage($('test'), 'url(blueButton.png) 0 14 0 14');}, null);