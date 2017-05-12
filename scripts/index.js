function main(){

  $('.bannerMouseOvers').children().children().children('td').each(function(){
    var animID = '', subtitleText = '';
    if ($(this).parent().children().index(this) == 0) {
      animID = '#designAnimation';
      subtitleText = 'I design.';
    } else {
      animID = '#codeAnimation';
      subtitleText = 'I code.';
    }
    $(this).hover(function(){
      $(animID).css('background-image', $(animID).css('background-image').replace('.png', '_anim.gif'));
      $('#indexSubTitle').html(subtitleText);
    }, function(){
      $(animID).css('background-image', $(animID).css('background-image').replace('_anim.gif', '.png'));
      $('#indexSubTitle').html('');
    });
  });
}

$(document).ready(main);
