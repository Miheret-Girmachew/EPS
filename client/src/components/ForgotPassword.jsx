import React, { useState } from 'react';

const ForgotPassword = ({ setShowForgotPassword }) => {
    const [email, setEmail] = useState("");
    const [secretQuestion, setSecretQuestion] = useState("");
    const [secretAnswer, setSecretAnswer] = useState("");
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
       const secretQuestions = [
        'What was your childhood nickname?',
        'What is the name of your favorite childhood friend?',
        'What is the name of the town where you were born?',
        'What is your favorite book or movie?',
        'What was the name of your first school?'
      ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setMessage("");
        try {
            const response = await fetch("http://localhost:7550/api/users/request-password-reset", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, secretQuestion, secretAnswer }),
            });
            const data = await response.json();
            if (!response.ok) {
                if (data && data.message) {
                    setError(data.message);
                } else {
                    setError(`An error occurred while requesting a password reset. Please try again later!`);
                }
            } else {
                setMessage(data.message);
                 setEmail("");
                setSecretQuestion("");
                setSecretAnswer("");
            }
        } catch (err) {
            console.error("Forgot password error:", err.message);
            setError(`An error occurred while requesting a password reset. Please try again later!`);
        }
    };

     return (
         <div className="forgotPassword flex flex-col items-center justify-center  p-6 rounded-md shadow-md bg-white w-full max-w-md mx-auto mt-16 sm:mt-20">
           <h5 className="text-xl font-semibold mb-4">Reset your password</h5>
             {error && <div className="text-red-500 mb-3 text-center">{error}</div>}
           {message && <div className="text-green-500 mb-3 text-center">{message}</div>}
           <form onSubmit={handleSubmit} className="w-full">
             <div className="form-input mb-4">
                    <input
                        name="email"
                       type="email"
                        placeholder="Email address"
                        value={email}
                       onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:border-blue-500"
                    />
                </div>
              <div className="form-input mb-4">
                      <select
                       name="secretQuestion"
                        value={secretQuestion}
                         onChange={(e)=>setSecretQuestion(e.target.value)}
                         required
                          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:border-blue-500"
                     >
                        <option value="" disabled>Select a secret question</option>
                          {secretQuestions.map((question, index) => (
                        <option key={index} value={question}>{question}</option>
                         ))}
                        </select>
                    </div>
                <div className="form-input mb-4">
                    <input
                        name="secretAnswer"
                        type="text"
                        placeholder="Secret Answer"
                        value={secretAnswer}
                        onChange={(e) => setSecretAnswer(e.target.value)}
                        required
                           className="w-full px-3 py-2 border rounded-md focus:outline-none focus:border-blue-500"
                    />
                    </div>
                <div className="btn-forgot flex justify-center mb-4">
                   <button
                       type="submit"
                       className="px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-200"
                   >
                      Reset Password
                   </button>
               </div>
               <div className="flex justify-center">
                  <span
                    onClick={() => setShowForgotPassword(false)}
                      className="text-blue-500 hover:text-blue-700 cursor-pointer"
                  >
                    Go back to login
                  </span>
              </div>
          </form>
        </div>
     );
};
export default ForgotPassword;