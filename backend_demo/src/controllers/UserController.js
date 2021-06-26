const UserRepository = require('../repositories/UserRepository');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const jwtConfig = require('../config/jwt');
const hash = require('../utils/hash');
require('dotenv').config();
function generateJwtToken(user){
    const { _id } = user;
    return jwt.sign({
        _id,
    }, jwtConfig.secret);
}


class UserController {

    async create(req, res) {
        try {
            const { name, username, password } = req.body;
        
            console.log(req.body);
            if (!name || !username || !password) {
                return res.json({
                    error: true,
                    errorMessage: "Invalid fields.",
                })
            }
            const user = {
                name,
                username,
                password,
            }
            const userExists = (await UserRepository.findByUsername(user.username)) != null;
            
            if (userExists) {
                return res.json({
                    error: true,
                    errorMessage: "Username already registered",
                })
            }
            await UserRepository.create(user);
            const newUser = await UserRepository.findByUsername(user.username);
            const token = generateJwtToken(newUser);
            user.password = undefined;
            return res.json({
                user: newUser,
                token
            })

        } catch (err) {
            console.log(err.message)
            return res.json({
                error: true,
                errorMessage: "An error has occurred. Retry!.",
                err
                
            })
        }
    }

    async login(req, res){
        try {
            const { username, password } = req.body;
            if (!username || !password) {
                return res.json({ error: true, errorMessage: "Invalid fields." })
            }
            const user = await UserRepository.findByUsername(username);
            if (!user){
                return res.json({ error: true, errorMessage: "Invalid username" });
            }
            if (!await bcrypt.compare(password, user.password)){
                console.log(password);
                console.log(user.password);
                return res.json({ error: true, errorMessage: "Invalid password" });
            }
            const token = generateJwtToken(user);
            user.password = undefined;
            return res.json({
                user,
                token
            });
        } catch (err){
            return res.json({
                error: true,
                errorMessage: err
            })
        }
    }

    async getUsers(req, res) {
        try {
            const myId = req._id;
            const name = req.query.name;
            if (name) {
                let user = await UserRepository.getUserByName(myId, name);
                const lowerUserId = myId < user._id ? myId : user._id;
                const higherUserId = myId > user._id ? myId : user._id;
                user.chatId = hash(lowerUserId, higherUserId);
                return res.json({
                    user
                })
            }
            let users = await UserRepository.getUsersWhereNot(myId);
            users = users.map((user) => {
                const lowerUserId = myId < user._id ? myId : user._id;
                const higherUserId = myId > user._id ? myId : user._id;
                user.chatId = hash(lowerUserId, higherUserId);
                return user;
            });
            return res.json({
                users
            });
        } catch (err) {
            return res.json({
                error: true,
                errorMessage: err
            })
        }
    }

    async saveFcmToken(req, res) {
        try {
            const { fcmToken } = req.body;
            console.log("fcmToken = ", fcmToken);
            const myId = req._id;
            console.log("myId", myId);
            const myUser = await UserRepository.saveUserFcmToken(myId, fcmToken);
            return res.json({
                user: myUser
            })
        } catch (err) {
            return res.json({
                error: true,
                errorMessage: err
            })
        }
    }


}

module.exports = new UserController();