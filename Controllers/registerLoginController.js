const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { SECRET } = require("../config/db");

const {
  validateEmail,
  validateUsername,
  signupSchema,
  loginSchema,
} = require("../Validation/register-login-validation");
const User = require("../Models/User");




router.post("/register", async (req, res) => {
try {
	const MSG = {
  usernameExists: "Username is already taken.",
  emailExists: "Email is already registered.",
  signupSuccess: "You are successfully signed up.",
  signupError: "Unable to create your account.",
};

	console.log('register function');
	console.log(req.body);
    const signupRequest = await signupSchema.validateAsync(req.body);
    console.log(signupRequest);
    // Validate the username
    let usernameNotTaken = await validateUsername(signupRequest.username);
    if (!usernameNotTaken) {
      return res.status(400).json({
        message: MSG.usernameExists,
        success: false,
      });
    }

    // validate the email
    let emailNotRegistered = await validateEmail(signupRequest.email);
    if (!emailNotRegistered) {
      return res.status(400).json({
        message: MSG.emailExists,
        success: false,
      });
    }

    // Get the hashed password
    const password = await bcrypt.hash(signupRequest.password, 12);
    // create a new user
    const newUser = new User({
      ...signupRequest,
      "password":password,
      "role":"customer",
    });
    console.log(newUser);
    await newUser.save();
    return res.status(201).json({
      message: MSG.signupSuccess,
      success: true,
    });
  } catch (err) {
    let errorMsg = MSG.signupError;
    if (err.isJoi === true) {
      err.status = 403;
      errorMsg = err.message;
    }
    return res.status(500).json({
      message: errorMsg,
      success: false,
    });
  }
});


router.post("/login", async (req, res) =>{
 // try {
 	const MSG = {
  usernameNotExist: "Username is not found. Invalid login credentials.",
  wrongRole: "Please make sure this is your identity.",
  loginSuccess: "You are successfully logged in.",
  wrongPassword: "Incorrect password.",
  loginError: "Oops! Something went wrong.",
};
console.log("loginRequest");

    const loginRequest = await loginSchema.validateAsync(req.body);
    let { username, password } = req.body;
    // First Check if the username or email is in the database
    console.log(loginRequest);
    let user;
    if (isEmail(username)) {
      const email = username;
      user = await User.findOne({ email });
    } else {
      user = await User.findOne({ username });
    }

    if (!user) {
      return res.status(404).json({
        reason: "username",
        message: MSG.usernameNotExist,
        success: false,
      });
    }


    // That means user is existing and trying to signin from the right portal
    // Now check for the password
    console.log(user.password);
    let isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
      // Sign in the token and issue it to the user
      let token = jwt.sign(
        {
          user_id: user._id,
          role: user.role,
          username: user.username,
          email: user.email,
        },
        SECRET,
        { expiresIn: "7 days" }
      );

      let result = {
        username: user.username,
        role: user.role,
        email: user.email,
        token: `Bearer ${token}`,
      };

      return res.status(200).json({
        ...result,
        message: MSG.loginSuccess,
        success: true,
      });
    } else {
      return res.status(403).json({
        reason: "password",
        message: MSG.wrongPassword,
        success: false,
      });
    }
  // } catch (err) {
  //   let errorMsg = MSG.loginError;
  //   if (err.isJoi === true) {
  //     err.status = 403;
  //     errorMsg = err.message;
  //   }
  //   return res.status(500).json({
  //     reason: "server",
  //     message: errorMsg,
  //     success: false,
  //   });
  // }
});
function isEmail(email) {
  const re =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}

module.exports = router;