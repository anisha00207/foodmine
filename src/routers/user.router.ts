// import {Router} from 'express';
// import { sample_users } from '../data';
// import jwt from 'jsonwebtoken';
// import asyncHandler from 'express-async-handler';
// import { User, UserModel } from '../models/user.model';
// import { HTTP_BAD_REQUEST } from '../constants/http_status';
// import bcrypt from 'bcryptjs';
// const router = Router();

// router.get("/seed", asyncHandler(
//   async (req, res) => {
//      const usersCount = await UserModel.countDocuments();
//      if(usersCount> 0){
//        res.send("Seed is already done!");
//        return;
//      }
 
//      await UserModel.create(sample_users);
//      res.send("Seed Is Done!");
//  }
//  ))

//  router.get(
//    '/',
//    asyncHandler(async (req, res) => {
//      const user = await UserModel.find();
//      res.send(user);
//    })
//  );

// router.post("/login", asyncHandler(
//   async (req, res) => {
//     const {email, password} = req.body;
//     const user = await UserModel.findOne({email});
  
//      if(user && (await bcrypt.compare(password,user.password))) {
//       res.send(generateTokenReponse(user));
//      }
//      else{
//        res.status(HTTP_BAD_REQUEST).send("Username or password is invalid!");
//      }
  
//   }
// ))
  
// router.post('/register', asyncHandler(
//   async (req, res) => {
//     const {name, email, password, address} = req.body;
//     const user = await UserModel.findOne({email});
//     if(user){
//       res.status(HTTP_BAD_REQUEST)
//       .send('User is already exist, please login!');
//       return;
//     }

//     const encryptedPassword = await bcrypt.hash(password, 10);

//     const newUser:User = {
//       id:'',
//       name,
//       email: email.toLowerCase(),
//       password: encryptedPassword,
//       address,
//       isAdmin: false
//     }

//     const dbUser = await UserModel.create(newUser);
//     res.send(generateTokenReponse(dbUser));
//   }
// ))

//   const generateTokenReponse = (user : User) => {
//     const token = jwt.sign({
//       id: user.id, email:user.email, isAdmin: user.isAdmin
//     },process.env.JWT_SECRET || 'jwtSecretKey',{
//       expiresIn:"30d"
//     });
  
//     return {
//       id: user.id,
//       email: user.email,
//       name: user.name,
//       address: user.address,
//       isAdmin: user.isAdmin,
//       token: token
//     };
//   }
  

//   export default router;

import { Router } from 'express';
import { sample_users } from '../data';
import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import { UserModel } from '../models/user.model';
import { HTTP_BAD_REQUEST } from '../constants/http_status';
import bcrypt from 'bcryptjs';

const router = Router();

/**
 * Seed Users
 */
router.get('/seed', asyncHandler(async (req, res) => {
    const usersCount = await UserModel.countDocuments();
    if (usersCount > 0) {
        res.send("Seed is already done!");
        return;
    }

    // Hash passwords before inserting sample users
    const hashedUsers = sample_users.map(user => ({
        ...user,
        password: bcrypt.hashSync(user.password, 10)
    }));

    await UserModel.create(hashedUsers);
    res.send("Seed Is Done!");
}));

/**
 * Get All Users
 */
router.get('/', asyncHandler(async (req, res) => {
    const users = await UserModel.find();
    res.send(users);
}));

/**
 * User Login
 */
router.post('/login', asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const user = await UserModel.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
        res.send(generateTokenResponse(user));
    } else {
        res.status(HTTP_BAD_REQUEST).send("Username or password is invalid!");
    }
}));

/**
 * User Registration
 */
router.post('/register', asyncHandler(async (req, res) => {
    const { name, email, password, address } = req.body;
    const existingUser = await UserModel.findOne({ email });

    if (existingUser) {
        res.status(HTTP_BAD_REQUEST).send('User already exists, please login!');
        return;
    }

    const encryptedPassword = await bcrypt.hash(password, 10);

    const newUser = new UserModel({
        name,
        email: email.toLowerCase(),
        password: encryptedPassword,
        address,
        isAdmin: false
    });

    const savedUser = await newUser.save();
    res.send(generateTokenResponse(savedUser));
}));

/**
 * Generate JWT Token Response
 */
const generateTokenResponse = (user: any) => {
    const token = jwt.sign(
        { id: user._id, email: user.email, isAdmin: user.isAdmin },
        process.env.JWT_SECRET || 'jwtSecretKey',
        { expiresIn: "30d" }
    );

    return {
        id: user._id,
        email: user.email,
        name: user.name,
        address: user.address,
        isAdmin: user.isAdmin,
        token
    };
};

export default router;
