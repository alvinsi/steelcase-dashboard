module.exports = function (sequelize, DataTypes) {
	return sequelize.define('ticket', {
		source: {
			type: DataTypes.STRING,
			allowNull: false,
			validate:{
				notEmpty: true
			} 
		},
		destination: { 
			type: DataTypes.STRING,
			allowNull: false,
			validate:{
				notEmpty: true
			} 
		},
		lastSeenLat: {
			type: DataTypes.FLOAT,
			allowNull: false,
			validate:{
				notEmpty: true
			} 
		},
		lastSeenLng: {
			type: DataTypes.FLOAT,
			allowNull: false,
			validate:{
				notEmpty: true
			} 
		},
		damaged: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
			defaultValue: false
		},
		handled: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
			defaultValue: false
		}
	});
}