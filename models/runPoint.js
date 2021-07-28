module.exports = (sequelize, DataTypes) => {
    const RunPoint = sequelize.define('runPoints', {
        lat: {
            type: DataTypes.DOUBLE,
            unique: false,
            allowNull: false
        },
        lon: {
            type: DataTypes.DOUBLE,
            unique: false,
            allowNull: false
        }
    });

    RunPoint.associate = (models) => {
        models.runPoints.belongsTo(models.runs);
    }

    return RunPoint;
}
