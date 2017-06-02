var amount = '';

function projectPagesMain() {
  $('.allImagesSlider').each(function(){
    var totalWidth = 0;
    $(this).children().each(function(){
      totalWidth += $(this).width();
    });
    $(this).width(totalWidth);
  });
  $('.imageSliderControls').each(function(){
    $(this).css('top', '+=' + $(this).parent().offset().top);
    $(this).css('left', '+=' + $(this).parent().offset().left);
  });
  $('.rightArrow').each(function(){
    $(this).css('left', '+=' + ($(this).parent().width()-67));
  });

  $('.leftArrow').click(function(){
    if ($(this).parent().scrollLeft() <= 0)
      amount = '+=' + $(this).parent().children('.allImagesSlider').width();
    else
      amount = '-=480';
    scrollImageSlider($(this).parent());
  });
  $('.rightArrow').click(function(){
    if ($(this).parent().scrollLeft()
        >= $(this).parent().children('.allImagesSlider').width()
        - $(this).parent().children('.allImagesSlider').children('.singleImage').width())
      amount = '-=' + $(this).parent().children('.allImagesSlider').width();
    else
      amount = '+=480';
    scrollImageSlider($(this).parent());
  });
}

function scrollImageSlider(horCont){
  horCont.animate({
    scrollLeft: amount
  }, 500, 'linear', function(){});
  amount = '';
};

$(document).ready(projectPagesMain);
