const { User } = require('../models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const nodemailer = require('nodemailer');
dotenv.config();

const secretQuestions = [
  'What was your childhood nickname?',
  'What is the name of your favorite childhood friend?',
  'What is the name of the town where you were born?',
  'What is your favorite book or movie?',
  'What was the name of your first school?'
];

const createUser = async (req, res) => {
  // Extract data from the request body
  const { firstName, lastName, email, password, role = '3', secretQuestion, secretAnswer, batch, group } = req.body;
  const errors = [];

  // Conditional validation based on role
  if (role === "1") {
    if (!firstName || !lastName || !email || !password || !secretQuestion || !secretAnswer) {
      errors.push('All fields are required');
    }
  } else {
    if (!firstName || !lastName || !email || !password || !secretQuestion || !secretAnswer || !batch || !group) {
      errors.push('All fields are required, including batch and group');
    }
  }

  // Validate secret question
  if (!secretQuestions.includes(secretQuestion)) {
    errors.push('Invalid secret question');
  }

  // Validate name
  const nameRegex = /^[A-Za-z]+$/;
  if (!nameRegex.test(firstName)) errors.push('First name must contain only letters');
  if (!nameRegex.test(lastName)) errors.push('Last name must contain only letters');

  // Validate email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) errors.push('Invalid email format');

  // Validate password
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  if (!passwordRegex.test(password)) {
    errors.push('Password must contain at least one uppercase letter, one lowercase letter, one special character, and one number');
  }

  // Validate batch and group for non-admins
  if (role !== "1") {
    if (!batch || typeof batch !== 'string') errors.push('Batch is required and must be a string');
    if (!group || typeof group !== 'string') errors.push('Group is required and must be a string');
  }

  // If there are validation errors, return them
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  try {
    // Hash password and secret answer
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);
    const hashAnswer = await bcrypt.hash(secretAnswer, salt);

    // Create the user
    let user;
    if (role === '1') {
      user = await User.create({
        firstName, lastName, email, password: hashPassword, role, visibility: "1", secretQuestion, secretAnswer: hashAnswer
      });
    } else {
      user = await User.create({
        firstName, lastName, email, password: hashPassword, role, visibility: "1", secretQuestion, secretAnswer: hashAnswer, batch, group
      });
    }

    // Generate authentication tokens
    const accessToken = jwt.sign({ user_id: user.userId, email: user.email, role: user.role }, process.env.SECRET_KEY, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ user_id: user.userId, email: user.email, role: user.role }, process.env.REFRESH_SECRET_KEY, { expiresIn: '7d' });

    // Store the refresh token in the user record
    user.refreshToken = refreshToken;
    await user.save();

    // Send JSON response with tokens and user details
    return res.json({
      message: "User created successfully",
      user: { userId: user.userId, role: user.role },
      accessToken,
      refreshToken
    });
  } catch (err) {
    console.error('Error creating user:', err.message);
    return res.status(500).json({ message: 'Internal Server Error', error: err.message });
  }
};




const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
     // Fetch the user by email, but only select necessary columns
    const user = await User.findOne({
        where: { email },
        attributes: ['userId', 'email', 'password', 'role', 'firstName', 'lastName'],
    });
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Create a JWT token including user_id, email, role, firstName, and lastName
    const token = jwt.sign(
      {
        user_id: user.userId,
        email: user.email,
        role: user.role,
        firstName: user.firstName, // Add firstName
        lastName: user.lastName, // Add lastName
      },
      process.env.SECRET_KEY,
      { expiresIn: "3d" }
    );

    console.log("token",token)
    res.setHeader('Authorization', `Bearer ${token}`);
    // Send back token along with user details
    return res.json({
      token,
      user: {
        userId: user.userId,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role
      },
    });
  } catch (err) {
    console.log(err.message);
    res.status(500).end(err.message);
  }
};


const getUserById = async (req, res) => {
  const { id } = req.params;

  try {
    // Check if the requesting user is an instructor or admin
    // if (req.user.role !== "1" &&  req.user.role !== "2") {
    //   return res.status(403).json({ message: 'Access denied' });
    // }

    const user = await User.findOne({ where: { userId: id, visibility: true } });
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found or not visible' });
    }
  } catch (err) {
    console.log(err.message);
    res.status(500).end(err.message);
  }
};

const updateUserById = async (req, res) => {
  const { id } = req.params;
  const { firstName, lastName } = req.body; // Only allowing firstName and lastName to be updated

  try {
    const user = await User.findOne({ where: { userId: id } });
    if (user) {
      user.firstName = firstName || user.firstName;
      user.lastName = lastName || user.lastName;

      await user.save();
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (err) {
    console.log(err.message);
    res.status(500).end(err.message);
  }
};

const updateUserVisibilityByAdmin = async (req, res) => {
  const { id } = req.params;
  const { visibility, role } = req.body; // Destructure role from the request body

  try {
    // Check if the logged-in user is an admin
    if (req.user.role !== "1") {
      return res.status(403).json({ message: 'Only admins can update user visibility and role' });
    }

    let user = await User.findOne({ where: { userId: id } });

    if (user) {
      // Update visibility if provided
      if (visibility !== undefined) {
        if (visibility === "0" || visibility === "1" || visibility === "2") {
          user.visibility = visibility;
        } else {
          return res.status(400).json({ message: 'Invalid visibility value' });
        }
      }

      // Update role if provided
      if (role !== undefined) {
        if (role === "1" || role === "2" || role === "3") {
          user.role = role; // Assuming 1: Admin, 2: Instructor, 3: Student
        } else {
          return res.status(400).json({ message: 'Invalid role value' });
        }
      }

      // Save the updated user details
      await user.save();
      await user.reload(); // Reload to get updated values

      res.status(200).json({ message: 'User visibility and/or role updated successfully', user });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (err) {
    console.log(err.message);
    res.status(500).end(err.message);
  }
};


const requestPasswordReset = async (req, res) => {
  const { email, secretQuestion, secretAnswer } = req.body;

  try {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if the secret question matches
    if (user.secretQuestion !== secretQuestion) {
      console.log(`Secret Question mismatch. Stored: ${user.secretQuestion}, Provided: ${secretQuestion}`);
      return res.status(400).json({ message: 'Invalid secret question' });
    }

    // Ensure the secretAnswer is compared correctly
    const isAnswerMatch = await bcrypt.compare(secretAnswer, user.secretAnswer);
    if (!isAnswerMatch) {
      return res.status(400).json({ message: 'Secret answer is incorrect' });
    }

    // Generate a reset token
    const resetToken = jwt.sign({ id: user.userId }, process.env.SECRET_KEY, { expiresIn: '1h' });

    // Send the password reset email
    const sendEmail = () => {
      const updateLink = `http://localhost:5173/reset-password/${resetToken}`;
       let mailSender = nodemailer.createTransport({
         service: 'gmail',
         port: 465,
           auth: {
               user: process.env.EMAIL_USER,
               pass: process.env.EMAIL_PASS,
         },
      });

         console.log("Email configuration:", {
             service: 'gmail',
             port: 465,
           auth: {
               user: process.env.EMAIL_USER,
               pass: process.env.EMAIL_PASS,
           },
         });

         let details = {
            from: process.env.EMAIL_USER,
            to: user.email,
           subject: 'Password Reset Request',
           html: `
                <!DOCTYPE html>
                <html lang="en">
                 <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                     <title>Update Password</title>
                       <style>
                         body {
                              font-family: Arial, sans-serif;
                              background-color: #f6f6f6;
                             margin: 0;
                             padding: 0;
                         }
                         .container {
                               max-width: 600px;
                               margin: 0 auto;
                                background-color: #ffffff;
                               padding: 20px;
                               borderRadius: 8px;
                               box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                              border: 1px solid #cccccc;
                           }
                         .content {
                             text-align: center;
                           padding: 20px;
                       }
                       .cta-button {
                           display: inline-block;
                           padding: 15px 25px;
                             margin: 20px 0;
                             background-color: #d3d3d3;
                             color: #ffffff;
                            font-weight: bold;
                             text-decoration: none;
                             border-radius: 5px;
                           }
                     </style>
                 </head>
                 <body>
                       <div class="container">
                           <div class="content">
                               <h1>Update your password</h1>
                                  <p>Click the button below to update your password.</p>
                                <a href="${updateLink}" class="cta-button">Update Password</a>
                           </div>
                      </div>
                 </body>
              </html>
            `
           };


           mailSender.sendMail(details, (err, info) => {
            if (err) {
               console.log('Error sending email:', err);
              console.log('Email sending error details:', {
                details,
               processEnv: { ...process.env }, // Include the env variable for debugging purposes
                  });
            res.status(500).json({ message: 'Error sending email' });
            } else {
               console.log('Email sent:', info.response);
                res.status(200).json({ message: 'Password reset email sent' });
             }
          });
       };

       sendEmail();
  } catch (err) {
    console.error('Error in requestPasswordReset:', err);
    res.status(500).json({ message: 'Internal Server Error', error: err.message });
  }
};

const sendTestEmail = (req, res) => {
  let mailSender = nodemailer.createTransport({
    service: 'gmail',
    port: 465,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
  console.log("Email test configuration:", {
         service: 'gmail',
         port: 465,
         auth: {
           user: process.env.EMAIL_USER,
           pass: process.env.EMAIL_PASS,
         },
     });

  let details = {
    from: process.env.EMAIL_USER,
    to: 'test@example.com', // Use your email for testing
    subject: 'Test Email',
    text: 'This is a test email.',
  };

    mailSender.sendMail(details, (err, info) => {
        if (err) {
           console.log('Error sending test email:', err);
            console.log('Test Email sending error details:', {
              details,
             processEnv: { ...process.env }, // Include the env variable for debugging purposes
              });
              res.status(500).json({ message: 'Error sending test email' });
        } else {
            console.log('Test email sent:', info.response);
             res.status(200).json({ message: 'Test email sent successfully!' });
        }
    });
};

const getAllStudents = async (req, res) => {
  try {
    // Only allow admins or instructors to fetch all students
    // if (req.user.role !== '1') {
    //   return res.status(403).json({ message: 'Access denied' });
    // }

    // Fetch all users with role 3 (assuming '3' is the role for students)
    const students = await User.findAll({ where: { role: '3', visibility: true } });

    // Check if students are found
    if (students.length > 0) {
      return res.status(200).json(students);
    } else {
      return res.status(404).json({ message: 'No students found' });
    }
  } catch (err) {
    console.error('Error fetching students:', err.message);
    res.status(500).json({ message: 'Internal Server Error', error: err.message });
  }
};


const getAllInstructors = async (req, res) => {
  try {
    // Only allow admins or instructors to fetch all instructors
    // if (req.user.role !== '1') {
    //   return res.status(403).json({ message: 'Access denied' });
    // }

    // Fetch all users with role 2 (assuming '2' is the role for instructors)
    const instructors = await User.findAll({ where: { role: '2', visibility: true } });

    // Check if instructors are found
    if (instructors.length > 0) {
      return res.status(200).json(instructors);
    } else {
      return res.status(404).json({ message: 'No instructors found' });
    }
  } catch (err) {
    console.error('Error fetching instructors:', err.message);
    res.status(500).json({ message: 'Internal Server Error', error: err.message });
  }
};

// Function to reset the password
const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    const user = await User.findOne({ where: { userId: decoded.id } });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Hash the new password and save it
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(newPassword, salt);
    user.password = hashPassword;
    await user.save();

    res.status(200).json({ message: 'Password reset successfully' });
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};


const updateStudentSubmissionStatus = async (req, res) => {
  try {
    const { studentId } = req.params; // The student whose submissions we are checking
    const { batchId } = req.query; // Batch ID if needed for filtering projects

    // Fetch all projects related to the student
    const projects = await Project.findAll({ where: { batch_id: batchId } });

    if (projects.length === 0) {
      return res.status(404).json({ message: 'No projects found for this batch' });
    }

    // Fetch all submissions by the student
    const submissions = await ProjectSubmission.findAll({ 
      where: { user_id: studentId, batch_id: batchId },
    });

    // Check if all projects have been submitted
    const submittedProjectIds = new Set(submissions.map(sub => sub.project_id));
    const requiredProjectIds = new Set(projects.map(proj => proj.project_id));

    if (requiredProjectIds.size === submittedProjectIds.size && 
        [...requiredProjectIds].every(id => submittedProjectIds.has(id))) {
      // All required submissions are present
      await ProjectSubmission.update(
        { visibility: 2 }, // Mark as completed
        { where: { user_id: studentId, batch_id: batchId } }
      );
      return res.status(200).json({ message: 'All projects submitted. Visibility updated to completed.' });
    } else {
      return res.status(400).json({ message: 'Not all required projects have been submitted' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed to update submission status', error });
  }
};



module.exports = {
  createUser,
  loginUser,
  getUserById,
  updateUserById,
  requestPasswordReset,
  resetPassword,
  getAllStudents,
  getAllInstructors,
  updateUserVisibilityByAdmin,
  updateStudentSubmissionStatus,

};
