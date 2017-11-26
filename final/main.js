url = 'https://api.edamam.com/search?q=chicken&app_id=5e692135&app_key=a0f247649aae63fe5163c516129027ff';
$.get(url,function(response) {
    $.each(category,function(k,v) {
	    var li = $('#test').clone().removeAttr('id');
	    li.text(v);
	    li.appendTo('#category')
    });
});