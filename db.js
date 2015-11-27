var Sequelize = require('sequelize');
var env = process.env.NODE_ENV || 'development';
var sequelize;

if (env === 'production') {
	sequelize = new Sequelize(process.env.DATABASE_URL, {
		'dialect' : 'postgres',
	});
} else {
	sequelize = new Sequelize(undefined, undefined, undefined, {
		'dialect' : 'sqlite',
		'storage' : __dirname + '/data/dev-steelcase-api.sqlite'
	});
}

var db = {};

db.ticket = sequelize.import(__dirname + '/models/ticket.js');
db.damage = sequelize.import(__dirname + '/models/damage.js');
db.open = sequelize.import(__dirname + '/models/open.js');
db.Sequelize = Sequelize;
db.sequelize = sequelize;

module.exports = db 