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

  $('.leftArrow').click(function(){
    if ($(this).parent().parent().scrollLeft() <= 0)
      amount = '+=' + $(this).parent().parent().children('.allImagesSlider').width();
    else
      amount = '-=480';
    scrollImageSlider($(this).parent().parent());
  });
  $('.rightArrow').click(function(){
    if ($(this).parent().parent().scrollLeft()
        >= $(this).parent().parent().children('.allImagesSlider').width()
        - $(this).parent().parent().children('.allImagesSlider').children('img').width())
      amount = '-=' + $(this).parent().parent().children('.allImagesSlider').width();
    else
      amount = '+=480';
    scrollImageSlider($(this).parent().parent());
  });
}

function scrollImageSlider(horCont){
  console.log(horCont.scrollLeft());
  horCont.animate({
    scrollLeft: amount
  }, 500, 'linear', function(){});
  amount = '';
};

$(document).ready(projectPagesMain);
