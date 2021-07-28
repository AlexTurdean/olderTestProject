const bcrypt = require('bcrypt');

module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define('users', {
        username: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false
        },
        email: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false
        },
        firstName: {
            type: DataTypes.STRING,
            unique: false,
            allowNull: false
        },
        lastName: {
            type: DataTypes.STRING,
            unique: false,
            allowNull: false
        },
        password: {
            type: DataTypes.STRING,
            unique: false,
            allowNull: false
        },
        role: {
            type: DataTypes.INTEGER,
            unique: false,
            allowNull: false
        },
        token: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false
        }
    }, {
        hooks: {
            beforeCreate: (user) => {
                const salt = bcrypt.genSaltSync();
                user.password = bcrypt.hashSync(user.password, salt);
            }
        }
    });

    User.prototype.updatePassword = function(currentPass, newPass) {
        const salt = bcrypt.genSaltSync();
        this.password = bcrypt.hashSync(newPass, salt);
        this.save();
    }

    User.prototype.validPassword = function (password) {
        return bcrypt.compareSync(password, this.password);
    };

    User.associate = (models) => {
        models.users.hasMany(models.runs, { onDelete: 'cascade' });
        models.users.hasMany(models.reports, { onDelete: 'cascade' });
    }

    return User;
}
