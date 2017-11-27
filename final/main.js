//var url = 'https://api.edamam.com/search?q=' + searchquery + '&app_id=5e692135&app_key=a0f247649aae63fe5163c516129027ff';

var s1 = $('#one');
var s2 = $('#two');
var s3 = $('#three');

$(document).ready(function() {
    s1.show();
    navbar();
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
        $('#two').find('#resultCount').html("<span class='mdc-typography--title' id='resultCount'>"+response.count+"</span> <span class='mdc-typography--subheading2'>results found</span>");
        $.each(response.hits,function(k,v) {
            console.log(v);
            
            var card = $('#cardTemplate').clone().removeAttr('id');
            var cal = v.recipe.calories.toString().slice(0,4);
            if (cal[cal.length-1] === ".") {
                cal = cal.slice(0,-1);
            }
            card.find('.mdc-card__title').text(v.recipe.label);
            card.find('.mdc-card__subtitle').text(cal + ' calories');
            card.find('.mdc-card__media').css('background-image','url('+v.recipe.image+')');
            
            var chartdiv = card.find('.chartDiv');
            chartdiv.attr('id',v.recipe.label);

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
                var nut = v.recipe.totalNutrients;
                var nutKeys = Object.keys(nut);
                var nutVal = Object.values(nut);
                var data = new google.visualization.DataTable();
                data.addColumn('string', 'Nutrient');
                data.addColumn('number', 'Amount');
                for (var i = 0; i < nutKeys.length ; i++) {
                    data.addRows([
                        [nutVal[i].label,nutVal[i].quantity]
                    ]);   
                }
                var options = {
                       width:'100%',
                       height:200,
                       fontName:'Roboto',
                       pieSliceBorderColor:'transparent',
                       sliceVisibilityThreshold:0.01,
                       chartArea: {'width': '80%', 'height': '80%'},
                       pieSliceText:'none'
                };

                var chart = new google.visualization.PieChart(document.getElementById(v.recipe.label));
                chart.draw(data, options);
            }
        });
        
        var mcdfabToggle = 0;
        
        $('.mdc-fab').on('click',function() {
            var popcontain = $(this).parent().children('.popupContain');
            var textcontain = $(this).parent().children('.mdc-card__supporting-text');
            popcontain.stop().slideToggle();
            textcontain.stop().slideToggle();
            if(mcdfabToggle==1) {
                $(this).find('span').text('expand_more');
                mcdfabToggle = 0;
            }
            else if(mcdfabToggle==0) {
                $(this).find('span').text('expand_less');
                mcdfabToggle = 1;
            }
            console.log(mcdfabToggle);
        });
    });
}

document.getElementById('search').addEventListener('submit', function(evt) {
    evt.preventDefault();
    var searchquery = $('#searchquery').val();
    if(searchquery.length <= 1) {
        alert('Please enter a search query!');
    }
    else {
        s2.find('.mdc-card').not('#cardTemplate').remove();
        search(searchquery); 
        s1.hide();
        s2.show();
    }
});

function navbar() {
     $('#searchNav').on('click',function() {
         s1.show();
         s2.hide();
         s3.hide();
     });
     $('#resultNav').on('click',function() {
         s1.hide();
         s2.show();
         s3.hide();
     });
     $('#mapNav').on('click',function() {
         s1.hide();
         s2.hide();
         s3.show();
         initMap();
     });
}

var map;
var infowindow;
var pos;

function initMap() {

  if (navigator.geolocation) { //GEO LOCATION, FINDS USERS LOCATION
    navigator.geolocation.getCurrentPosition(function(position) {

      pos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      }
      map = new google.maps.Map(document.getElementById('map'), {
        center: myLocation,
        zoom: 13
      });
      map.setCenter(pos);
      var myLocation = pos; //Sets variable to geo location long and lat co-ordinates.

      var service = new google.maps.places.PlacesService(map);
      service.nearbySearch({
        location: myLocation, //Uses geolocation to find the following
        radius: 5000,
        types: ['grocery_or_supermarket']
      }, callback);
    })
  };
}

function callback(results, status) {
  if (status === google.maps.places.PlacesServiceStatus.OK) {
    for (var i = 0; i < results.length; i++) {
      createMarker(results[i]);
    }
  }
  $('#mapresultcount').text(results.length);
}

function createMarker(place) {
  var placeLoc = place.geometry.location;
  var infowindow = new google.maps.InfoWindow();
  var marker = new google.maps.Marker({
    map: map,
    position: place.geometry.location
  });

  google.maps.event.addListener(marker, 'click', function() {
    infowindow.setContent(place.name);
    infowindow.open(map, this);
  });
}