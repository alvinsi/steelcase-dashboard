var express = require('express');
var exphbs  = require('express3-handlebars');
var bodyParser = require('body-parser');
var _ = require('underscore');
var db = require('./db.js');

var app = express();
var PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

/**
* Routing and Setting up Handlebars
*/
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');
 
app.get('/', function (req, res) {

	var laserTickets, damagedTickets, totalOrders, healthIdx, crmIdx;

	/**
	* LEGEND:
	*	1. Current Unhandled Damages: Size of tickets/?damaged=true&handled=false
	*	2. Total Damaged Parts: Size of tickets/?damaged=true
	*	3. Total Orders: Size of tickets/
	*	4. Overall Health Index: How well the shipping condition is right now (1-Damaged/Orders)*100%
	*	5. Customer Support Index: How well Customer Service is handling damaged packages right now (Unhandled/Damaged)*100%
	*/
	
	var where = {};
	db.ticket.findAll({where: where}).then(function(tickets){
		totalOrders = tickets.length;
		where.damaged = true;
		
		db.ticket.findAll({where: where}).then(function(damagedTickets){
			damagedTickets = damagedTickets.length;
			where.handled = false;

			db.ticket.findAll({where: where}).then(function(laserTickets){
				laserTickets = laserTickets.length;
				healthIdx = ((1 - (damagedTickets/totalOrders)) * 100).toFixed(2);
				crmIdx = ((1- (laserTickets/damagedTickets)) * 100).toFixed(2);

				res.render('home', {
					title: 'Home',
					laserTickets: laserTickets,
			  	damagedTickets: damagedTickets,
			  	totalOrders: totalOrders,
			  	healthIdx: healthIdx + '%',
			  	crmIdx: crmIdx + '%'
				});
			}, function(e) {
				res.status(500).send();
			});


		}, function(e) {
			res.status(500).send();
		});
	}, function(e) {
		res.status(500).send();
	});


  
});

app.get('/query', function (req, res) {
  res.render('query', {
		title: 'Query',
	});
});

app.get('/order/:id', function (req, res) {
  ticketId = parseInt(req.params.id, 10);

	db.ticket.findById(ticketId).then(function(ticket) {
		if(!!ticket) {
			var result = ticket.toJSON();
			res.render('order', {
				title: 'Order #' + result.id,
		  	trackId: result.id,
		  	source: result.source,
		  	destination: result.destination,
		  	lastSeenLat: result.lastSeenLat,
		  	lastSeenLng: result.lastSeenLng,
		  	lastSeenTime: result.updatedAt,
		  	damaged: result.damaged,
		  	notHandled: !result.handled
		  });
		} else {
			res.status(404).send();
		}
	}, function(e) {
		res.status(500).send();
	});
});

app.use(express.static(__dirname + '/public'));

/**
* GET /tickets
*/
app.get('/tickets', function(req, res) {
	var query = req.query;
	var where = {};

	if (query.hasOwnProperty('damaged') && query.damaged === 'true') {
		where.damaged = true;
	} else if (query.hasOwnProperty('damaged') && query.damaged === 'false') {
		where.damaged = false;
	}

	if (query.hasOwnProperty('handled') && query.handled === 'true') {
		where.handled = true;
	} else if (query.hasOwnProperty('handled') && query.handled === 'false') {
		where.handled = false;
	}
	if (query.hasOwnProperty('q') && query.q.length > 0) {
		where.id = {
			$like: '%' + query.q + '%'
		};
	}

	db.ticket.findAll({where: where}).then(function(tickets){
		res.json(tickets);
	}, function(e) {
		res.status(500).send();
	});
});

/**
* POST /tickets
*/
app.post('/tickets', function(req, res) {
	var body = _.pick(req.body, 'source', 'destination', 'lastSeenLat', 'lastSeenLng', 'damaged', 'handled');

	db.ticket.create(body).then(function (ticket) {
		res.json(ticket.toJSON());
	}, function(e) {
		res.status(400).json(e);
	});
});

/**
* GET /tickets/:id
*/
app.get('/tickets/:id', function(req, res) {
	var ticketId = parseInt(req.params.id, 10);
	
	db.ticket.findById(ticketId).then(function(ticket) {
		if(!!ticket) {
			res.json(ticket.toJSON());
		} else {
			res.status(404).send();
		}
	}, function(e) {
		res.status(500).send();
	});
});

/**
* DELETE /tickets/:id
*/
app.delete('/tickets/:id', function(req, res) {
	var ticketId = parseInt(req.params.id, 10);
	
	db.ticket.destroy({
		where: {
			id: ticketId
		}
	}).then(function(rowsDeleted) {
		if (rowsDeleted === 0) {
			res.status(404).json({
				error: 'No ticket with id'
			});
		} else {
			res.status(204).send();
		}
	}, function() {
		res.status(500).send();
	});
});

/**
* PUT /tickets/:id
*/
app.put('/tickets/:id', function(req, res) {
	var ticketId = parseInt(req.params.id, 10);
	var body = _.pick(req.body, 'handled', 'damaged', 'lastSeenLat', 'lastSeenLng');
	var attributes = {};

	if (body.hasOwnProperty('handled')) {
		attributes.handled = body.handled;
	}

	if (body.hasOwnProperty('damaged')) {
		attributes.damaged = body.damaged;
	}

	if (body.hasOwnProperty('lastSeenLat')) {
		attributes.lastSeenLat = body.lastSeenLat;
	}

	if (body.hasOwnProperty('lastSeenLng')) {
		attributes.lastSeenLng = body.lastSeenLng;
	}

	db.ticket.findById(ticketId).then(function(ticket){
		if(ticket) {
			ticket.update(attributes).then(function(ticket) {
				res.json(ticket.toJSON());
			}, function(e) {
				res.status(400).json(e);
			});
		} else {
			res.status(404).send();
		}
	}, function () {
		res.status(500).send()
	});
});

/**
* GET /damages
*/
app.get('/damages', function(req, res) {
	var where = {};

	db.damage.findAll({where: where}).then(function(damages){
		res.json(damages);
	}, function(e) {
		res.status(500).send();
	});
});

/**
* GET /damages/:ticketId
*/
app.get('/damages/:id', function(req, res) {
	var ticketId = parseInt(req.params.id, 10);
	var where = {
		ticketId: ticketId
	};

	db.damage.findAll({where: where}).then(function(damages){
		res.json(damages);
	}, function(e) {
		res.status(500).send();
	});
});

/**
* POST /damages
*/
app.post('/damages', function(req, res) {
	var body = _.pick(req.body, 'latitude', 'longitude', 'ticketId', 'damageSize');
	var attributes = {};

	attributes.damaged = "true";

	db.damage.create(body).then(function (damage) {
		db.ticket.findById(body.ticketId).then(function(ticket){
			if(ticket) {
				ticket.update(attributes).then(function(ticket) {
					var where = {};

					where.damaged = true;
					where.handled = false;

					db.ticket.findAll({where: where}).then(function(tickets){
						var body = {
							"open": tickets.length
						}

						db.open.create(body).then(function (open) {
							res.json(damage.toJSON());
						}, function(e) {
							res.status(400).json(e);
						});
					}, function(e) {
						res.status(500).send();
					});
				}, function(e) {
					res.status(400).json(e);
				});
			} else {
				res.status(404).send();
			}
		}, function () {
			res.status(500).send()
		});
	}, function(e) {
		res.status(400).json(e);
	});
});

/**
* GET /opens
*/ 
app.get('/opens', function(req, res) {
	var where = {};

	db.open.findAll({where: where}).then(function(opens){
		res.json(opens);
	}, function(e) {
		res.status(500).send();
	});
});


db.sequelize.sync().then(function() {
	app.listen(PORT, function() {
		console.log('Express listening on port: ' + PORT);
	});
});

