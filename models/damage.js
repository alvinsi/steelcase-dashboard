module.exports = function (sequelize, DataTypes) {
	return sequelize.define('damage', {
		latitude: {
			type: DataTypes.FLOAT,
			allowNull: false,
			validate:{
				notEmpty: true
			} 
		},
		longitude: {
			type: DataTypes.FLOAT,
			allowNull: false,
			validate:{
				notEmpty: true
			} 
		},
		damageSize: {
			type: DataTypes.INTEGER,
			allowNull: false,
			validate:{
				notEmpty: true
			} 
		},
		ticketId: {
			type: DataTypes.INTEGER,
			allowNull: false,
			validate:{
				notEmpty: true
			} 
		}
	});
}