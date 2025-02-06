const { User } = require('../models');
const { Batch } = require("../models"); // Adjust the path based on your project structure
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
  const { firstName, lastName, email, password, role = '3', secretQuestion, secretAnswer, batch, group } = req.body;
  const errors = [];

  if (!firstName || !lastName || !email || !password || !secretQuestion || !secretAnswer) {
    errors.push('All fields are required');
  }

  if (role !== '1' && role !== '2') {
    if (!batch || !group) {
      errors.push('Batch and group are required for non-admin and non-instructor roles');
    }
  }

  if (!secretQuestions.includes(secretQuestion)) {
    errors.push('Invalid secret question');
  }

  const nameRegex = /^[A-Za-z]+$/;
  if (!nameRegex.test(firstName)) errors.push('First name must contain only letters');
  if (!nameRegex.test(lastName)) errors.push('Last name must contain only letters');

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) errors.push('Invalid email format');

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  if (!passwordRegex.test(password)) {
    errors.push('Password must contain at least one uppercase letter, one lowercase letter, one special character, and one number');
  }

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  try {
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);
    const hashAnswer = await bcrypt.hash(secretAnswer, salt);

    const user = await User.create({
      firstName,
      lastName,
      email,
      password: hashPassword,
      role,
      visibility: "1",
      secretQuestion,
      secretAnswer: hashAnswer,
      ...(role !== '1' && role !== '2' ? { batch, group } : {})
    });

    const accessToken = jwt.sign({ user_id: user.userId, email: user.email, role: user.role }, process.env.SECRET_KEY, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ user_id: user.userId, email: user.email, role: user.role }, process.env.REFRESH_SECRET_KEY, { expiresIn: '7d' });

    user.refreshToken = refreshToken;
    await user.save();

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

    const token = jwt.sign(
      {
        userId: user.userId,
        email: user.email,
        role: user.role,
        firstName: user.firstName, 
        lastName: user.lastName,
      },
      process.env.SECRET_KEY,
      { expiresIn: "3d" }
    );

    res.setHeader('Authorization', `Bearer ${token}`);
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
  const { password, secretQuestion, secretAnswer } = req.body;

  try {
    const user = await User.findOne({ where: { userId: id } });
    if (user) {
      if (password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
      }

      if (secretQuestion && secretAnswer) {
        if (secretQuestions.includes(secretQuestion)) {
          const salt = await bcrypt.genSalt(10);
          user.secretQuestion = secretQuestion;
          user.secretAnswer = await bcrypt.hash(secretAnswer, salt);
        } else {
          return res.status(400).json({ message: 'Invalid secret question' });
        }
      }

      await user.save();
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (err) {
    console.error('Error updating user:', err.message);
    res.status(500).end(err.message);
  }
};

const updateUserVisibilityByAdmin = async (req, res) => {
  const { id } = req.params;
  const { visibility } = req.body; 

  try {
    if (req.user.role !== "1") {
      return res.status(403).json({ message: "Only admins can update user visibility" });
    }

    let user = await User.findOne({ where: { userId: id } });

    if (user) {
      if (visibility !== undefined) {
        if (["0", "1", "2"].includes(visibility)) {
          user.visibility = visibility;
        } else {
          return res.status(400).json({ message: "Invalid visibility value" });
        }
      } else {
        return res.status(400).json({ message: "Visibility value is required" });
      }

      // Save the updated user details
      await user.save();
      await user.reload();

      res.status(200).json({ message: "User visibility updated successfully", user });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (err) {
    console.log('Error updating user visibility:', err.message);
    res.status(500).json({ message: "Internal server error", error: err.message });
  }
};

const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    const user = await User.findOne({ where: { userId: decoded.id } });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
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

const getAllStudents = async (req, res) => {
  try {
    const students = await User.findAll({ where: { role: '3', visibility: true } });

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
    const instructors = await User.findAll({ where: { role: '2', visibility: true } });

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
  updateStudentSubmissionStatus

};
