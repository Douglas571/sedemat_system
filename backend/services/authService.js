const passport = require('passport');
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const {User, Role, Person} = require('../database/models'); // Assuming you have a User model
const userService = require('./userService');
const jwt = require('jsonwebtoken');

const bcrypt = require('bcryptjs');

// const ROLES = {
//     administrator: "Administrador",
// }

const ROLES = require('../utils/auth/roles')

// config variables
let expiresIn = '1d';


let JWT_SECRET = process.env.JWT_SECRET || 'top_secret'
let BCRYPT_SALT = process.env.BCRYPT_SALT

if (!BCRYPT_SALT) {
    throw new Error('Missing BCRYPT_SALT environment variable')
}

class AuthService {
    constructor() {
        this.secret = JWT_SECRET; // Use a secure secret
        this.initPassport();
    }

    async getRoles() {
        return await Role.findAll()
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

            console.log({users: users.map( u => u.toJSON())})

            let isThereAndAdmin = users.some( u => u.role.id === ROLES.ADMIN)
        
            console.log({isThereAndAdmin})

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

    // Deprecated function
    async register(newUserData, user) {
        if (!user || user.roleId !== ROLES.ADMIN) {
            let error = new Error('User not authorized')
            error.name = 'UserNotAuthorized'
            throw error
        }
        // todo: validate user data
        // todo: encrypt passwords 

        let hashedPassword = bcrypt.hashSync(newUserData.password, BCRYPT_SALT)

        //console.log("hashed password: ", hashedPassword)

        newUserData.password = hashedPassword

        const newUser = User.create(newUserData);

        return newUser
    }

    async registerAdmin(newUserData) {
        // todo: validate user data
        console.log({newUserData})
        newUserData.roleId = 1 // administration role id

        const newAdmin = await userService.createUser(newUserData)

        const token = jwt.sign({ id: newAdmin.id }, this.secret, { expiresIn });

        return {
            user: newAdmin,
            token 
        }
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
            if (user.password !== bcrypt.hashSync(password, BCRYPT_SALT)) {
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

    // TODO: Implement a function to update password 
}

module.exports = new AuthService();