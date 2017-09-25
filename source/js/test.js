jsonp = {
    jsonpCallback: function jsonpCallback(json) {
        console.log(json)
    }
}
$('#lmz').click(function(){
    // $.ajax({
    //     type: "get",
    //     url: "/blog/js/data.js",
    //     dataType: 'jsonp',
    //     jsonp: 'abc',
    //     success:function(json){
    //         console.log(json)
    //     }  ,
    //     error: function(err){
    //         console.log('[err]', err);
    //     }
    // });

    var JSONP=document.createElement("script");
    JSONP.type="text/javascript";
    JSONP.src="/blog/js/data.js";
    document.getElementsByTagName("head")[0].appendChild(JSONP);
});