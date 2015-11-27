module.exports = function (sequelize, DataTypes) {
	return sequelize.define('open', {
		open: {
			type: DataTypes.INTEGER,
			allowNull: false,
			validate:{
				notEmpty: true
			} 
		}
	});
}