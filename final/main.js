//var url = 'https://api.edamam.com/search?q=' + searchquery + '&app_id=5e692135&app_key=a0f247649aae63fe5163c516129027ff';

var s1 = $('#one');
var s2 = $('#two');
var s3 = $('#three');

$(document).ready(function() {
    s1.show();
    //badge();
});

function badge(){
    var badge = $('.badge');
    badge.each(function() {
        var spanWid = $(this).children('span').width();
        badge.width(spanWid);
    });
}

function search(query) {
    $.get('https://api.edamam.com/search?q=' + query + '&app_id=5e692135&app_key=a0f247649aae63fe5163c516129027ff',function(response) {
        $.each(response.hits,function(k,v) {
            var calories = v.recipe.calories;
            console.log(v);
            
            var card = $('#cardTemplate').clone().removeAttr('id');
            card.find('.mdc-card__title').text(v.recipe.label);
            card.find('.mdc-card__subtitle').text(v.recipe.calories.toString().slice(0,4) + ' calories');
            card.find('.mdc-card__media').css('background-image','url('+v.recipe.image+')');

            $.each(v.recipe.dietLabels, function(i,w) {
                var badge = $('#badgeTemplate').clone().removeAttr('id');
                badge.addClass('dietlabel');
                badge.text(w);
                card.find('.badgeContainer').append(badge);
            });
            
            $.each(v.recipe.healthLabels, function(j,x) {
                var badge = $('#badgeTemplate').clone().removeAttr('id');
                badge.addClass('healthlabel');
                badge.text(x);
                card.find('.badgeContainer').append(badge);
            });
            
            $.each(v.recipe.ingredientLines, function(l,y) {
                var ingredient = $('#ingredientTemplate').clone().removeAttr('id');
                ingredient.text(y);
                card.find('.ingredients').append(ingredient);
            });
            
            card.appendTo('#two main');
            
            var nutrients = v.recipe.totalNutrients;
            
            google.charts.load('current', {'packages':['corechart']});
                google.charts.setOnLoadCallback(drawChart);
            
                function drawChart() {
                    var data = new google.visualization.DataTable();
                    data.addColumn('string', 'Topping');
                    data.addColumn('number', 'Slices');
                    data.addRows([
                      [nutrients.CA.label, nutrients.CA.quantity],
                      [nutrients.CHOCDF.label, nutrients.CHOCDF.quantity],
                      [nutrients.CHOLE.label, nutrients.CHOLE.quantity],
                      [nutrients.FAT.label, nutrients.FAT.quantity],
                      [nutrients.FE.label, nutrients.FE.quantity],
                      [nutrients.FIBTG.label, nutrients.FIBTG.quantity],
                      [nutrients.K.label, nutrients.K.quantity],
                      [nutrients.MG.label, nutrients.MG.quantity],
                      [nutrients.NA.label, nutrients.NA.quantity],
                      [nutrients.PROCNT.label, nutrients.PROCNT.quantity],
                      [nutrients.SUGAR.label, nutrients.SUGAR.quantity],
                    ]);
            
                    // Set chart options
                    var options = {'title':'How Much Pizza I Ate Last Night',
                                   'width':400,
                                   'height':300};
            
                    // Instantiate and draw our chart, passing in some options.
                    var chart = new google.visualization.PieChart(document.getElementsByClassName('chart_div'));
                    chart.draw(data, options);
            }

        });
    });
}

document.getElementById('search').addEventListener('submit', function(evt) {
    evt.preventDefault();
    var searchquery = $('#searchquery').val();
    search(searchquery); 
    s1.hide();
    s2.show();
});

$('.mdc-fab__icon').on('click',function() {
    s2.hide();
    s3.show();
});