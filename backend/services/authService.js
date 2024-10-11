const passport = require('passport');
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const {User, Role, Person} = require('../database/models'); // Assuming you have a User model
const jwt = require('jsonwebtoken');

const bcrypt = require('bcryptjs');

// const ROLES = {
//     administrator: "Administrador",
// }

const ROLES = {
    administrator: 1,
    director: 2,
    asesorJuridico: 3,
    recaudador: 4,
    coordinador: 5,
    fiscal: 6,
    contribuyente: 7,
    liquidador: 8
}

// config variables
let expiresIn = '1d';

let BCRYPT_SALT = process.env.BCRYPT_SALT

if (!BCRYPT_SALT) {
    throw new Error('Missing BCRYPT_SALT environment variable')
}

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

            console.log({users: users.map( u => u.toJSON())})

            let isThereAndAdmin = users.some( u => u.role.id !== ROLES.administrator)

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

    async register(newUserData) {
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

        let hashedPassword = bcrypt.hashSync(newUserData.password, BCRYPT_SALT)
        

        //console.log("hashed password: ", hashedPassword)

        newUserData.password = hashedPassword

        const newAdmin = await User.create(newUserData);

        const token = jwt.sign({ id: newAdmin.id }, this.secret, { expiresIn });
        let role = await newAdmin.getRole()

        return { user: {
            ...newAdmin.toJSON(),
            role: role.toJSON(),
            }, 
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
}

module.exports = new AuthService();