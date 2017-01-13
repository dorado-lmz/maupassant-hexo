(function () {
  'use strict';
  hexo.extend.tag.register('example', function (args) {
    var html = '',
        content = "";
        color = "example";
    if(args.length>1)
      color = args[1];
    content+=(args?args[0]:"");
    html += "<blockquote class='blockquote "+color+"'><p>"+content+"</p></blockquote>";
    return html;
  });
})();
