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
  res.render('home', {
		title: 'Home',
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
	var body = _.pick(req.body, 'handled', 'damaged');
	var attributes = {};

	if (body.hasOwnProperty('handled')) {
		attributes.handled = body.handled;
	}

	if (body.hasOwnProperty('damaged')) {
		attributes.damaged = body.damaged;
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

// GET /damages/:ticketId
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

// POST /damages/
app.post('/damages', function(req, res) {
	var body = _.pick(req.body, 'latitude', 'longitude', 'ticketId', 'damageSize');
	var attributes = {};

	attributes.damaged = "true";

	db.damage.create(body).then(function (damage) {
		db.ticket.findById(body.ticketId).then(function(ticket){
			if(ticket) {
				ticket.update(attributes).then(function(ticket) {
					res.json(damage.toJSON());
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

db.sequelize.sync().then(function() {
	app.listen(PORT, function() {
		console.log('Express listening on port: ' + PORT);
	});
});
