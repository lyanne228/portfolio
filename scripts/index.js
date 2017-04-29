function main(){
  $('.mouseOver').hover(
    function(){
      var graphicId = '#' + this.className.split(" ")[0];
      $(graphicId).css("display", "inline");
    },function(){
      var graphicId = '#' + this.className.split(" ")[0];
      $(graphicId).css("display", "none");
    });
  };
$(document).ready(main);
