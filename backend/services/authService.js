const passport = require('passport');
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const {User, Role} = require('../database/models'); // Assuming you have a User model
const jwt = require('jsonwebtoken');


const ROLES = {
    administrator: "Administrador",

}

class AuthService {
    
    
    constructor() {
        this.secret = 'your_jwt_secret'; // Use a secure secret
        this.initPassport();

        this.ROLES = [
            { id: 1, name: 'Administrador', createdAt: new Date(), updatedAt: new Date() },
            { id: 2, name: 'Director', createdAt: new Date(), updatedAt: new Date() },
            { id: 3, name: 'Asesor Jurídico', createdAt: new Date(), updatedAt: new Date() },
            { id: 4, name: 'Recaudador', createdAt: new Date(), updatedAt: new Date() },
            { id: 5, name: 'Coordinador', createdAt: new Date(), updatedAt: new Date() },
            { id: 6, name: 'Fiscal', createdAt: new Date(), updatedAt: new Date() },
            { id: 7, name: 'Contribuyente', createdAt: new Date(), updatedAt: new Date() }
        ]
    }

    async getRoles() {
        return this.ROLES
    }

    async existsAdministrator() {
        try {
            const users = await User.findAll({
                include: [
                    {
                        model: Role,
                        as: 'role'
                    }
                ]
            })

            let isThereAndAdmin = users.some( u => u.role.name !== ROLES.administrator)

            return isThereAndAdmin
        } catch (error) {
            throw new Error(error.message)
        }
    }

    initPassport() {
        passport.use(new JwtStrategy({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: this.secret,
        }, async (jwtPayload, done) => {
            console.log({jwtPayload})
            try {
                const user = await User.findByPk(jwtPayload.id, {
                    include: [
                        {
                            model: Role,
                            as: 'role'
                        }
                    ]
                })
                console.log({user})
                return done(null, user.toJSON());
            } catch(error) {
                console.log({error})
                return done(error, false);
            }
        }));
    }

    register(newUserData) {
        // todo: validate user data
        // todo: encrypt passwords 

        const newUser = User.create(newUserData);
        return newUser
    }

    async login(userData) {
        const { username, password } = userData


        try {
            const user = await User.findOne({ where: { username } });
            if (!user) {
                let error = new Error('User not registered')
                error.name = 'UserNotRegistered'
                throw error;
            }
            if (user.password !== password) {
                let error = new Error('Incorrect password');
                error.name = 'IncorrectPassword'
                throw error
            }
            const token = jwt.sign({ id: user.id }, this.secret, { expiresIn: '1h' });

            const role = await user.getRole()

            return {
                token,
                user: {
                    ...user.toJSON(),
                    role: role.toJSON(),
                }
            };
        } catch (error) {
            console.log({ error })
            throw error
        }
    }
}

module.exports = new AuthService();