const Sequelize = require('sequelize');
const bcrypt = require('bcrypt');

module.exports = (sequelize) => {
    class User extends Sequelize.Model {};

    User.init ({
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        firstName: {
            type: Sequelize.STRING,
            allowNull: false,
            validate: {
                notNull: {
                    msg: "first name is needed"
                },
                notEmpty: {
                    msg: "first name is needed"
                }
            }
        },
        lastName: {
            type: Sequelize.STRING,
            allowNull: false,
            validate: {
                notNull: {
                    msg: "last name is needed"
                },
                notEmpty: {
                    msg: "last name is needed"
                }
            }
        },
        emailAddress: {
            type: Sequelize.STRING,
            unique: {
                args: true,
                msg: "email already in use"
            },
            allowNull: false,
            validate: {
                isEmail: {
                    msg: "email address needs to be valid"
                },
                notNull: {
                    msg: "email address is needed"
                },
                notEmpty: {
                    msg: "email address is needed"
                }
            }
        },
        password: {
            type: Sequelize.STRING,
            allowNull: false,
            validate: {
                notNull: {
                    msg: "password is needed"
                },
                notEmpty: {
                    msg: "password is needed"
                }
            }
        }
    }, {
        hooks: {
            afterValidate: async (user) => {
              user.password = bcrypt.hashSync(user.password, 10);
            }
        }
        , sequelize
    });

    User.associate = (models) => {
        	User.hasMany(models.Course, {foreignKey: 'userId'});
    };

    return User;
};