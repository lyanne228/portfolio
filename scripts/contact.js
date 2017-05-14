function contactMain(){
  $('#emailMe').hover(function(){
    $(this).append('<p><a href="mailto:lyanne228@gmail.com">lyanne228@gmail.com</a></p>');
    $(this).css('width', '+=150px');
  }, function(){
    $(this).children('p').remove();
    $(this).css('width', '-=150px');
  });
  $('#resume').hover(function(){
    $(this).append('<p>LyanneResume.pdf</p>');
    $(this).css('width', '+=150px');
  }, function(){
    $(this).children('p').remove();
    $(this).css('width', '-=150px');
  });
  $('#github').hover(function(){
    $(this).append('<p><a href="https://github.com/lyanne228">github.com/lyanne228</a></p>');
    $(this).css('width', '+=150px');
  }, function(){
    $(this).children('p').remove();
    $(this).css('width', '-=150px');
  });
}

$(document).ready(contactMain);
