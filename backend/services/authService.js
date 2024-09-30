const passport = require('passport');
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const {User, Role, Person} = require('../database/models'); // Assuming you have a User model
const jwt = require('jsonwebtoken');


// const ROLES = {
//     administrator: "Administrador",
// }

// config variables
let expiresIn = '1d';


class AuthService {
    constructor() {
        this.secret = 'your_jwt_secret'; // Use a secure secret
        this.initPassport();

        Role.findAll().then(roles => {
            this.ROLES = roles
        })

        console.log({roles: this.ROLES})
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
                        },
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
            const user = await User.findOne({ where: { username }});
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
            const token = jwt.sign({ id: user.id }, this.secret, { expiresIn });

            const role = await user.getRole()
            const person = await user.getPerson()

            return {
                token,
                user: {
                    ...user.toJSON(),
                    role: role.toJSON(),
                    person: person?.toJSON(),
                }
            };
        } catch (error) {
            console.log({ error })
            throw error
        }
    }
}

module.exports = new AuthService();