function aboutResizeHeight(){
  $('.aboutpage').each(function(){
    $(this).css('height', $(window).height()+'px');
    $(this).css('width', $(window).width()+'px');
  });
}
$(document).ready(aboutResizeHeight);
