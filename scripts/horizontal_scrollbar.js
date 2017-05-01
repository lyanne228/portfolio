var amount = '';

function scrolling(){
  shiftScrollBars();
  $('.horScroll').hover(
    function(){
      clearProjHover();
      if(this.className.split(" ")[1] == 'scrollLeft') {
        amount = '-=10';
      } else {
        amount = '+=10';
      }
      scrollRepeat($(this).parent());
    },function(){
      amount = '';
  });

  $('.projects-container').children('.thumbnail-outline-container').children('a').mouseover(function(){
    var boxNum = $(this).parent().children().index($(this)) +1;
    var textbox = $(this).parent().parent().children('.horizontal-container').children('div:nth-of-type('+boxNum+')');
    var increaseDist = $(this).parent().offset().top;
    var increaseHDist = parseInt($(this).offset().left);
    clearProjHover();
    textbox.css('display', 'table');
    textbox.css('top', increaseDist);
    textbox.css('left', increaseHDist);
  });
  $('.thumbnail-outline-container').children().mouseout(clearProjHover());
  $('.projects-container, .thumbnail-outline-container').mouseout(clearProjHover());

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
  $('.projects-container').each(function(){
    var increaseDist = $(this).children(':first-child').height();
    $(this).css('height', '+='+increaseDist);
  });
  $('.horScroll').each(function(){
    var increaseDist = $(this).parent().offset().top;
    $(this).css('top', '+='+increaseDist);
  });
  $('.thumbnail-outline-container').each(function(){
    var increaseDist = $(this).parent().height();
    $(this).css('top', '-='+increaseDist);
  });
  $('.projects-container').each(function(){
    var pageWidth = $(window).width(),
        horCont = $(this).children('.horizontal-container'),
        totalWidth = parseInt(horCont.width()) + parseInt(horCont.css('padding-left')) + parseInt(horCont.css('padding-right')),
        shiftWidth = (totalWidth-pageWidth)/2;
    $(this).scrollLeft(shiftWidth);
    $(this).children('.thumbnail-outline-container').css('width', totalWidth);
  });
}

function clearProjHover(){
  $('div.project-circle').each(function(){
    $(this).css('display', 'none')
  });
}

$(document).ready(scrolling);
