module.exports = (sequelize, DataTypes) => {
    const Report = sequelize.define('reports', {
        averageSpeed: {
            type: DataTypes.FLOAT,
            unique: false,
            allowNull: false
        },
        distance: {
            type: DataTypes.FLOAT,
            unique: false,
            allowNull: false
        }
    });

    Report.associate = (models) => {
        models.reports.belongsTo(models.users);
    }

    return Report;
}
