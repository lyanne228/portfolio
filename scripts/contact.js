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

function submitForm(){
  $.ajax({
    url: "https://script.google.com/macros/s/AKfycbx9ocoGqg5P6Dfpap2XRHZ6AQC-kKLHt-MEr7r7BXPEG4mIeOZ2/exec",
    type: "POST",
    data: {
      name: $('#name').val(),
      email: $('#email').val(),
      message: $('#message').val(),
    },
    success: function() {
      console.log("hello");
      window.location = "http://lyanneloh.com";
    },
    fail: function() {
      console.log("byebye");
      window.location = "http://lyanneloh.com";
    }
  });
}


$(document).ready(contactMain);
