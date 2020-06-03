const Sequelize = require('sequelize');

module.exports = (sequelize) => {
    class Course extends Sequelize.Model {};

    Course.init({
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        title: {
            type: Sequelize.STRING, 
            unique: {
                args: true,
                msg: "enter unique title"
            },
            allowNull: false,
            validate: {
                notEmpty: {
                    msg: "title needs to be added"
                },
                notNull: {
                    msg: "title needs to be added"
                }
            }
        },
        description: {
            type: Sequelize.TEXT,
            allowNull: false,
            validate: {
                notEmpty: {
                    msg: "description needs to be added"
                },
                notNull: {
                    msg: "description needs to be added"
                }
            }
        },
        estimatedTime: {
            type: Sequelize.STRING,
            allowNull: true
        },
        materialsNeeded: {
            type: Sequelize.STRING,
            allowNull: true
        },
        userId: {
            type: Sequelize.INTEGER,
            foreignKey: true,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id'
            },
            validate: {
                notEmpty: {
                    msg: "userId needs to be added"
                },
                notNull: {
                    msg: "userId needs to be added"
                }
            }
        }
    },{ sequelize });
    
    Course.associate = (models) => {
        Course.belongsTo(models.User, {foreignKey: 'userId'});
    }

    return Course;
};