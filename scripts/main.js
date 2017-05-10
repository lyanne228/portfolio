function resizeWidths(){
  // $('.horizontal-container, .thumbnail-outline-container').each(function(){
  //   var totalWidth = 20;
  //   $(this).children('img').each(function(){
  //     totalWidth += $(this).width()+parseInt($(this).css('margin-left'))+parseInt($(this).css('margin-right'));
  //   });
  //   $(this).css('width',totalWidth+'px');
  // });

  var pageWidth = $(window).width();
  var bannerAR = 1200/1600;
  $('.content').each(function(){
    $(this).css('width', pageWidth+'px');
    $(this).css('height', bannerAR*pageWidth+'px');
  });

}
$(document).ready(resizeWidths);
