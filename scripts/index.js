function main(){
  updateImageSize();
  $(document).on('resize', updateImageSize);

  var bgImgHeight = $(window).width()/4*3,
      topMargin = ($(window).height() - bgImgHeight )/2;
  console.log(topMargin);
  $('.index1').css('top', '+='+topMargin+'px');

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
      $(animID).attr('src', $(animID).attr('src').replace('.png', '_anim.gif'));
      $('#indexSubTitle').html(subtitleText);
    }, function(){
      $(animID).attr('src', $(animID).attr('src').replace('_anim.gif', '.png'));
      $('#indexSubTitle').html('');
    });
  });
}

function updateImageSize() {
  $('.index1').attr('width', '100vw');
};

$(document).ready(main).bind('resize',updateImageSize);
