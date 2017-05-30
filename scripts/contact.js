function contactMain(){
  $('#emailMe').hover(function(){
    $(this).append('<p><a href="mailto:lyanne228@gmail.com">lyanne228@gmail.com</a></p>');
  }, function(){
    $(this).children('p').remove();
  });
  $('#resume').hover(function(){
    $(this).append('<p><a href="resume.pdf" target="_blank">LyanneResume.pdf</a></p>');
  }, function(){
    $(this).children('p').remove();
  });
  $('#github').hover(function(){
    $(this).append('<p><a href="https://github.com/lyanne228">github.com/lyanne228</a></p>');
  }, function(){
    $(this).children('p').remove();
  });
}

$(document).ready(contactMain);
