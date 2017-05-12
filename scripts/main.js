function main() {
  $(window).scroll(function() {
    if(Math.ceil($(window).scrollTop() + $(window).height()) == $(document).height()) {
      $('.upDownArrows').css('background-image', $('.upDownArrows').css('background-image').replace('down', 'up'));
    } else {
      $('.upDownArrows').css('background-image', $('.upDownArrows').css('background-image').replace('up', 'down'));
    }
  });
  $('.upDownArrows').click(function(){
    if (~$(this).css('background-image').indexOf('down')){
      window.location.href = "#design";
    } else {
      window.location.href = "#";
    }
  });
}

$(document).ready(main);
