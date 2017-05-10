var amount = '';

function scrolling(){
  shiftScrollBars();
  $('.horContent-scroll').hover(
    function(){
      // clearProjHover();
      if((this.className).split(' ')[1] == 'leftScroll') {
        amount = '-=10';
      } else {
        amount = '+=10';
      }
      scrollRepeat($(this).parent().children('.horContent-container'));
    },function(){
      amount = '';
  });

  $('.descriptionHover').children('a').hover(function(){
    $(this).children('.projectTile').css('opacity', 1);
  }, function(){
    $(this).children('.projectTile').css('opacity', 0);
  });

};

function scrollRepeat(horCont){
  horCont.animate({
    scrollLeft: amount
  }, 30, 'linear', function() {
    if(amount != '')
      scrollRepeat(horCont);
  })
};

function shiftScrollBars(){
  $('.horContent').each(function(){
    var totalWidth = 0;
    var totalHeight = 0;
    $(this).children().each(function(){
      totalWidth += $(this).width() + parseInt($(this).css('margin-left')) + parseInt($(this).css('margin-right'));
      if ($(this).height() > totalHeight)
        totalHeight = $(this).height();
    });
    $(this).css('width', totalWidth+'px');
    $(this).css('height', totalHeight+'px');
  });
  $('.horContent-scroll').each(function(){
    var newHeight = $(this).parent().children('.horContent-container').height();
    var newWidth = $(this).parent().children('.horContent-container').width();
    var newOffsetTop = $(this).parent().children('.horContent-container').offset().top;
    var newOffsetLeft = newWidth - $(this).width();
    $(this).css('height', newHeight);
    $(this).css('top', '+=' + newOffsetTop);
    if ((this.className).split(' ')[1] == 'rightScroll')
      $(this).css('left', newOffsetLeft+'px');
  });
}


$(document).ready(scrolling);
