module.exports = (sequelize, DataTypes) => {
    const Run = sequelize.define('runs', {
        weatherDescription: {
            type: DataTypes.STRING,
            unique: false,
            allowNull: true
        },
        temperature: {
            type: DataTypes.FLOAT,
            unique: false,
            allowNull: true
        },
        humidity: {
            type: DataTypes.FLOAT,
            unique: false,
            allowNull: true
        },
        location: {
            type: DataTypes.STRING,
            unique: false,
            allowNull: true
        },
        distance: {
            type: DataTypes.FLOAT,
            unique: false,
            allowNull: true
        }
    }, {
        updatedAt: 'startedAt',
        createdAt: 'finishedAt'
    });

    Run.prototype.updateDistance = function(distance) {
        this.distance += distance;
        //this.updatedAt = new Date();
        this.save();
    }

    Run.associate = (models) => {
        models.runs.hasMany(models.runPoints, { onDelete: 'cascade' });
        models.runs.belongsTo(models.users);
    }

    return Run;
}
