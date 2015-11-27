var map, queryLen, orderSelected, sourceQuery, destinationQuery, lat, lon, infowindow;

/**
* Initialize Google Autocomplete Service
*/
function initAutocomplete() {
  sourceQuery = new google.maps.places.Autocomplete((document.getElementById('source')),{
    types: ['geocode']
  });
  destinationQuery = new google.maps.places.Autocomplete((document.getElementById('destination')),{
    types: ['geocode']
  });
  sourceQuery.addListener('place_changed', fillInAddressSource);
}

/**
* Fill in Starting Lat, Lon For Source
*/
function fillInAddressSource() {
  var coords = sourceQuery.getPlace().geometry.location;
  lat = coords.lat();
  lon = coords.lng();
}

/**
* Generate Table of Damaged Packages for Homepage
*/
function homeTable() {
	var url = '/tickets/?damaged=true';
	$.ajax({
		url: url,
	  data: {
      format: 'json'
    },
	  dataType: 'json',
	  error: function() {
      alert("Something went wrong! Please try again later");
    },
	  success: function(data) {
      var tbl = document.getElementById('ticketTable');

      for (var i = 0; i < data.length; i++) {
      	var tr = tbl.insertRow();
		    var td = tr.insertCell();
				td.appendChild(document.createTextNode(data[i].id));
				$(td).addClass("id");
				var td = tr.insertCell();
				if (data[i].handled) {
					handledStatus = 'Done';
					td.style.color = "green";
				} else {
					handledStatus = 'Urgent';
					td.style.color = "red";
				}
				td.style.fontWeight = "bold";
				td.appendChild(document.createTextNode(handledStatus));

				$(tr).click(function() {
				  var text = $(this).closest("tr")
           .find(".id")
           .text();

          orderSelected = text;
          window.location.href = "/order/" + text;
				});
      }
    },
   	type: 'GET'
 	});
}

/**
* Generate Table of All Orders
*/
function queryTable() {
	var url = '/tickets/?q=' + document.getElementById("queryBar").value;
	$.ajax({
		url: url,
	  data: {
      format: 'json'
    },
	  dataType: 'json',
	  error: function() {
      alert("Something went wrong! Please try again later");
    },
	  success: function(data) {
      var body = document.body;
      tbl = document.getElementById('queryTable');

      queryLen = data.length;
      for (var i = 0; i < data.length; i++) {
      	var tr = tbl.insertRow();

		    var td = tr.insertCell();
				td.appendChild(document.createTextNode(data[i].id));
      	$(td).addClass("id");
				var td = tr.insertCell();
				if (data[i].damaged) {
					damageStatus = 'Damaged';
					td.style.color = "red";
				} else {
					damageStatus = 'Good';
					td.style.color = "green";
				}	
				td.style.fontWeight = "bold";
				td.appendChild(document.createTextNode(damageStatus));
				var td = tr.insertCell();
				td.appendChild(document.createTextNode(data[i].source));
				var td = tr.insertCell();
				td.appendChild(document.createTextNode(data[i].destination));
				var td = tr.insertCell();
				if (!data[i].damaged) {
					handledStatus = '-';
				} else {
					if (data[i].handled) {
						handledStatus = 'Done';
						td.style.color = "green";
					} else {
						handledStatus = 'Urgent';
						td.style.color = "red";
					}	
				}
				td.style.fontWeight = "bold";
				td.appendChild(document.createTextNode(handledStatus));
      
				$(tr).click(function() {
				  var text = $(this).closest("tr")
           .find(".id")
           .text();

          orderSelected = text;
          window.location.href = "/order/" + text;
				});
      }
    },
   	type: 'GET'
 	});
}

///////////////////////////////// TODO /////////////////////////////////////
/// 1. Current Unhandled Damages: Size of tickets/?damaged=true&handled=false
/// 2. Total Damaged Parts: Size of tickets/?damaged=true
/// 3. Total Orders: Size of tickets/
/// 4. Overall Health Index: How well the shipping condition is right now (1-Damaged/Orders)*100%
/// 5. Customer Support Index: How well Customer Service is handling damaged packages right now (Unhandled/Damaged)*100%
/// 6. Graph: Use current unhandled as value. Use separate table, everytime POST request to damaged table is executed, update count and time stamp. Use this to plot graph
/// 	 https://developers.google.com/chart/interactive/docs/datesandtimes

/**
* Plotting Graph on Homepage
*/
google.load('visualization', '1', {packages: ['corechart', 'line']});

function drawBasic() {
  var data = new google.visualization.DataTable();
  data.addColumn('number', 'X');
  data.addColumn('number', 'Parts Damaged');

  data.addRows([
    [0, 0],   [1, 10],  [2, 23],  [3, 17],  [4, 18],  [5, 9],
    [6, 11],  [7, 27],  [8, 33],  [9, 40],  [10, 32], [11, 35],
    [12, 30], [13, 40], [14, 42], [15, 47], [16, 44], [17, 48],
    [18, 52], [19, 54], [20, 42], [21, 55], [22, 56], [23, 57],
    [24, 60], [25, 50], [26, 52], [27, 51], [28, 49], [29, 53],
    [30, 55], [31, 60], [32, 61], [33, 59], [34, 62], [35, 65],
    [36, 62], [37, 58], [38, 55], [39, 61], [40, 64], [41, 65],
    [42, 63], [43, 66], [44, 67], [45, 69], [46, 69], [47, 70],
    [48, 72], [49, 68], [50, 66], [51, 65], [52, 67], [53, 70],
    [54, 71], [55, 72], [56, 73], [57, 75], [58, 70], [59, 68],
    [60, 64], [61, 60], [62, 65], [63, 67], [64, 68], [65, 69],
    [66, 70], [67, 72], [68, 75], [69, 80]
  ]);

  var options = {
    hAxis: {
      title: 'Time',
      textStyle: {
        fontName: 'Arial',
        fontSize: 14,
        italic: false
      },
      titleTextStyle: {
        fontName: 'Arial',
        bold: true,
        fontSize: 14,
        italic: false
      }
    },
    vAxis: {
      title: 'Parts Damaged',
      textStyle: {
        fontName: 'Arial',
        fontSize: 14,
        italic: false
      },
      titleTextStyle: {
        fontName: 'Arial',
        bold: true,
        fontSize: 14,
        italic: false
      }
    },
    backgroundColor: '#f8f8f8',
    legend: { 
      position: 'none'
    }
  };

  var chart = new google.visualization.LineChart(document.getElementById('chart_div'));
  chart.draw(data, options);
}
///////////////////////////////// TODO /////////////////////////////////////

/**
* Initialize the Map on Each Order
*/
function initMap() {
	var pathName = location.pathname;
	var url = '/tickets/' + pathName.substr(7);
	$.ajax({
		url: url,
	  data: {
      format: 'json'
    },
	  dataType: 'json',
	  error: function() {
      alert("Something went wrong! Please try again later");
    },
	  success: function(data) {
	  	var currentLatLng = {
				lat: data.lastSeenLat,
				lng: data.lastSeenLng
			};

      map = new google.maps.Map(document.getElementById('map'), {
		    center: currentLatLng,
		    zoom: 12
		  });
		  
		  var marker = addMarker(currentLatLng, map, 'Current Location');
		  populateDamageCircles(pathName.substr(7));
    },
   	type: 'GET'
 	});
}

/**
 * Creates a Google Maps marker on the map
 */
 function addMarker(currentLatLng, map, title) {
 	var marker = new google.maps.Marker({
 		position: currentLatLng,
 		map: map,
 		title: title
 	});
 	return marker;
 }

/**
 * Add Circles of Damages to Map
 */
function populateDamageCircles(ticketId) {

	var url = '/damages/' + ticketId;
	$.ajax({
		url: url,
	  data: {
      format: 'json'
    },
	  dataType: 'json',
	  error: function() {
      alert("Something went wrong! Please try again later");
    },
	  success: function(data) {
	  	for (idx in data) {
	  		var damageLat = data[idx].latitude;
	  		var damageLon = data[idx].longitude;
	  		var damageSize = data[idx].damageSize;
	  		var time = data[idx].createdAt;

	  		damageCircle = new google.maps.Circle({
					strokeColor: '#FF0000',
					strokeOpacity: 0.8,
					strokeWeight: 2,
					fillColor: '#FF0000',
					fillOpacity: 0.35,
					map: map,			  		
					center: {
						lat: damageLat,
						lng: damageLon
					},
					radius: damageSize * 200
				});

				var contentString = 
					'<div class="container iw-container">' +
						'<div class="iw-content">' +
							'<div class="blurbBody">' +
			    			'<p class="blurbHeader">' + 
			  					'Location' +
			  				'</p>' +
			    			'<p class="blurbContent">' +
			  					damageLat + 
			  					', ' + 
			  					damageLon + 
			  				'</p>' +
			  				'<p class="blurbHeader">' + 
			  					'Time' +
			  				'</p>' +
			  				'<p class="blurbContent">' +
			    				time +
			    			'</p>' +
							'</div>'
						'</div>'+
					'</div>';

				damageCircle.info = new google.maps.InfoWindow({
						content: contentString,
						maxWidth: 450,
						position: {
							lat: damageLat, 
							lng: damageLon
						}
					});

				google.maps.event.addListener(damageCircle, 'mouseover', function() {
					if (infowindow) infowindow.close();
					infowindow = this.info;
					this.info.open(map, this);
				});

				google.maps.Map.prototype.clearMarkers = function() {
					if(infowindow) {
						infowindow.close();
					}

					for(var i = 0; i < this.markers.length; i++) {
						this.markers[i].set_map(null);
					}
				};
	  	}
    },
   	type: 'GET'
 	});
}

/**
* Master Initialize Function
*/
function initialize() {
	initAutocomplete();
	if (location.pathname === "/") {
		homeTable();
		drawBasic();
	} else if (location.pathname === "/query") {
		queryTable();
	} else {
		initMap();
	}

	$("#add").click(function() {
		var source = $("#source").val();
		var destination = $("#destination").val();

		$.ajax({
	    url: '/tickets',
	    type: 'post',
	    dataType: 'json',
	    success: function (data) {
	    	alert("Order Successfully Added");
	    	window.location.href = '/query';
	    },
	    error: function(e) {
		    alert("Oops! Something Went Wrong, Please Try Again!")
		  },
	    data: JSON.stringify({
		    "source": source,
		    "destination": destination,
		    "lastSeenLng": lon,
		    "lastSeenLat": lat,
		    "damaged": "false",
		    "handled": "false"
	  	}),
	  	contentType: "application/json"
	  });
	});

	$(window).resize(function(){
	  drawBasic();
	});

	$("#queryBar").change(function() {
		for (var i = 0; i < queryLen; i++) {
			document.getElementById('queryTable').deleteRow(2);
		}
		queryTable();
	});

	$(".navTabs").hover(function() {
		$(this).toggleClass("active");
	})

	$("#deleteOrder").click(function() {
		var pathName = location.pathname;
		var url = '/tickets/' + pathName.substr(7);

		$.ajax({
	    url: url,
	    type: 'DELETE',
	    success: function(result) {
	      alert("Order Successfully Deleted");
	      window.location.href = "/query";
	    }
		});
	});

	$("#handledOrder").click(function() {
		var pathName = location.pathname;
		var url = '/tickets/' + pathName.substr(7);

		$.ajax({
	    url: url,
	    type: 'PUT',
	    dataType: 'json',
	    success: function (data) {
	    	alert("Order Successfully Updated");
	    	window.location.href = '/query';
	    },
	    error: function(e) {
		    alert("Oops! Something Went Wrong, Please Try Again!")
		  },
	    data: JSON.stringify({
		    "handled": "true"
	  	}),
	  	contentType: "application/json"
	  });
	});
}