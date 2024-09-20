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
                throw new Error('User not found');
            }
            if (user.password !== password) {
                throw new Error('Password is incorrect');
            }
            const token = jwt.sign({ id: user.id }, this.secret, { expiresIn: '1h' });
            return token;
        } catch (error) {
            console.log({ error })
            throw error
        }
    }
}

module.exports = new AuthService();