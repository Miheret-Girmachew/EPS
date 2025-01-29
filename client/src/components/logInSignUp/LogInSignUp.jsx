import { useState, useEffect } from "react";
import "./LogInSignUp.css";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { useNavigate } from 'react-router-dom';
import ForgotPassword from "../ForgotPassword";

function LogInSignUp() {
    const [show, setShow] = useState(false);
    const [loading, setLoading] = useState(false);
    const [loginError, setLoginError] = useState("");
    const [registerError, setRegisterError] = useState("");
     const [showForgotPassword, setShowForgotPassword] = useState(false);
    const [formDataLogin, setFormDataLogin] = useState({
        email: "",
        password: "",
    });
    const [formDataRegister, setFormDataRegister] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        secretQuestion: "",
        secretAnswer: "",
        batch: "",
        group: "",
    });
    const [batches, setBatches] = useState([]);
    const [groups, setGroups] = useState([]);
    const navigate = useNavigate();

    const secretQuestions = [
        'What was your childhood nickname?',
        'What is the name of your favorite childhood friend?',
        'What is the name of the town where you were born?',
        'What is your favorite book or movie?',
        'What was the name of your first school?'
    ];

    useEffect(() => {
        const fetchBatches = async () => {
            try {
                const response = await fetch('http://localhost:7550/api/batches/all');
                if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

                const data = await response.json();
                console.log("Fetched Batches Data:", data);

                const updatedBatchesData = data.map(batch => ({
                    ...batch,
                    groups: Array.isArray(batch.groups) ? batch.groups : []
                }));

                setBatches(updatedBatchesData);
            } catch (error) {
                console.error("Error fetching batches:", error);
                setBatches([]);
            }
        };

        fetchBatches();
    }, []);


    useEffect(() => {
        const fetchGroups = async () => {
            if (!formDataRegister.batch) {
                setGroups([]);
                return;
            }

            try {
                const response = await fetch(
                    `http://localhost:7550/api/batches/${formDataRegister.batch}/groups`
                );
                if (!response.ok) throw new Error(`Failed to fetch groups: ${response.status}`);

                const data = await response.json();
                console.log("Fetched Groups Data:", data);

                setGroups(Array.isArray(data) ? data : data.groups || []);
            } catch (error) {
                console.error("Error fetching groups:", error);
                setGroups([]);
            }
        };

        fetchGroups();
    }, [formDataRegister.batch]);



    const handleLoginInputChange = (e) => {
        const { name, value } = e.target;
        setFormDataLogin({ ...formDataLogin, [name]: value });
    };

    const handleRegisterInputChange = (e) => {
        const { name, value } = e.target;
        setFormDataRegister({ ...formDataRegister, [name]: value });
    };

     const handleForgotPasswordClick = () => {
       setShowForgotPassword(true);
      };


    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setLoginError("");

        try {
            const response = await fetch("http://localhost:7550/api/users/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formDataLogin),
            });
            const contentType = response.headers.get("Content-Type");
            if (!response.ok || !contentType || !contentType.includes("application/json")) {
                  const text = await response.text();
                  console.error("Expected JSON but got:", text);
                 throw new Error(`Server error, please try again later!`);
            }
            const data = await response.json();
            localStorage.setItem("token", data.token);
            setFormDataLogin({ email: "", password: "" });
            switch (data.user.role) {
                case '1':
                    navigate('/admin');
                    break;
                case '2':
                    navigate('/instructor');
                    break;
                case '3':
                    navigate('/student');
                    break;
                default:
                    navigate('/dashboard');
            }
        } catch (error) {
             console.error("Login error:", error.message);
            setLoginError(
                error.message || "Invalid email or password, please try again."
             );
        } finally {
            setLoading(false);
        }
    };


    const handleRegisterSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setRegisterError("");

        try {
            const response = await fetch("http://localhost:7550/api/users/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formDataRegister),
            });
             const contentType = response.headers.get("Content-Type");
            if (!response.ok || !contentType || !contentType.includes("application/json")) {
                  const text = await response.text();
                  console.error("Expected JSON but got:", text);
                 throw new Error(`Server error, please try again later!`);
              }

            const data = await response.json();

             if (!response.ok) {
                 if (data && data.errors) {
                     setRegisterError(data.errors.join(". "));
                 } else if (data && data.message) {
                   setRegisterError(data.message);
                 } else {
                     setRegisterError("Registration failed, please try again later!");
                  }
            } else {
                console.log("User registered successfully:", data);
                setFormDataRegister({
                    firstName: "",
                    lastName: "",
                    email: "",
                    password: "",
                    secretQuestion: "",
                    secretAnswer: "",
                    batch: "",
                    group: "",
                });

                if (data.user && data.user.role) {
                    switch (data.user.role) {
                        case '1':
                            navigate('/admin');
                            break;
                        case '2':
                            navigate('/instructor');
                            break;
                        case '3':
                            navigate('/student');
                            break;
                        default:
                            navigate('/dashboard');
                    }
                } else {
                    throw new Error("User data is missing from the response.");
                }
            }
        } catch (error) {
           console.error("Registration error:", error.message);
             setRegisterError(
                error.message || "An error occurred during registration. Please try again."
              );
        } finally {
            setLoading(false);
        }
    };



    return (
        <div className="loginSignUp">
            <div id="carouselExample" className="carousel slide">
                 {showForgotPassword ? (
                   <ForgotPassword setShowForgotPassword={setShowForgotPassword} />
                  ) : (
                   <div className="carousel-inner">
                    <div className="carousel-item active">
                        <div className="login">
                            <h5>Login to your account</h5>
                            {loginError && <div className="error-message">{loginError}</div>}

                            <div>
                                Don’t have an account?{" "}
                                <span
                                    type="button"
                                    data-bs-target="#carouselExample"
                                    data-bs-slide="prev"
                                >
                                    Create a new account
                                </span>
                            </div>
                            <form onSubmit={handleLoginSubmit} className="">
                                <div className="form-input">
                                    <input
                                        name="email"
                                        type="email"
                                        placeholder="Email address"
                                        value={formDataLogin.email}
                                        onChange={handleLoginInputChange}
                                        required
                                    />
                                </div>
                                <div className="form-input password">
                                    <input
                                        name="password"
                                        type={show ? "text" : "password"}
                                        placeholder="Password"
                                        value={formDataLogin.password}
                                        onChange={handleLoginInputChange}
                                        required
                                    />
                                    <span
                                        onClick={() => {
                                            setShow((show) => !show);
                                        }}
                                    >
                                        {show ? <AiOutlineEye /> : <AiOutlineEyeInvisible />}
                                    </span>
                                </div>
                                <div className="forgot">
                                     <span onClick={handleForgotPasswordClick}>Forgot password?</span>
                                </div>
                                <div className="btn-login">
                                    <button
                                        disabled={loading}
                                        className={loading ? "disabled" : ""}
                                        type="submit"
                                    >
                                        Login
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                    <div className="carousel-item ">
                        <div className="register">
                            <h5>Join the network</h5>
                            {registerError && <div className="error-message">{registerError}</div>}
                            <div>
                                Already have an account?{" "}
                                <span
                                    type="button"
                                    data-bs-target="#carouselExample"
                                    data-bs-slide="next"
                                >
                                    Sign in
                                </span>
                            </div>
                            <form onSubmit={handleRegisterSubmit}>

                                <div className="row">
                                    <div className="form-input col-md-6 ">
                                        <input
                                            name="firstName"
                                            className=""
                                            type="text"
                                            placeholder="First name"
                                            value={formDataRegister.firstName}
                                            onChange={handleRegisterInputChange}
                                            required
                                        />
                                    </div>
                                    <div className="form-input col-md-6">
                                        <input
                                            name="lastName"
                                            className=""
                                            type="text"
                                            placeholder="Last name"
                                            value={formDataRegister.lastName}
                                            onChange={handleRegisterInputChange}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="form-input">
                                    <input
                                        name="email"
                                        type="email"
                                        placeholder="Email address"
                                        value={formDataRegister.email}
                                        onChange={handleRegisterInputChange}
                                        required
                                    />
                                </div>
                                <div className="form-input password">
                                    <input
                                        name="password"
                                        type={show ? "text" : "password"}
                                        placeholder="Password"
                                        value={formDataRegister.password}
                                        onChange={handleRegisterInputChange}
                                        required
                                    />
                                    <span
                                        onClick={() => {
                                            setShow((show) => !show);
                                        }}
                                    >
                                        {show ? <AiOutlineEye /> : <AiOutlineEyeInvisible />}
                                    </span>
                                </div>
                                <div className="form-input">
                                    <select
                                        name="secretQuestion"
                                        value={formDataRegister.secretQuestion}
                                        onChange={handleRegisterInputChange}
                                        required
                                    >
                                        <option value="" disabled>Select a secret question</option>
                                        {secretQuestions.map((question, index) => (
                                            <option key={index} value={question}>{question}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-input">
                                    <input
                                        name="secretAnswer"
                                        type="text"
                                        placeholder="Secret Answer"
                                        value={formDataRegister.secretAnswer}
                                        onChange={handleRegisterInputChange}
                                        required
                                    />
                                </div>
                                <div className="form-input">
                                    <select
                                        name="batch"
                                        value={formDataRegister.batch}
                                        onChange={handleRegisterInputChange}
                                        required
                                    >
                                        <option value="" disabled>Select a batch</option>
                                        {batches && batches.map((batch) => (
                                            <option key={batch.batchId} value={batch.batchId}>
                                                {batch.batchName}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-input">
                                    <select
                                        name="group"
                                        value={formDataRegister.group}
                                        onChange={handleRegisterInputChange}
                                        required
                                    >
                                        <option value="" disabled>Select a group</option>
                                        {groups.length > 0 ? (
                                            groups.map((group, index) => (
                                                <option key={index} value={group.groupName}>
                                                    {group.groupName}
                                                </option>
                                            ))
                                        ) : (
                                            <option disabled>No groups available</option>
                                        )}
                                    </select>
                                </div>


                                <div className="privacy">
                                    I agree to the <a href="">privacy policy</a> and{" "}
                                    <a href="">terms of service</a>.
                                </div>
                                <div className="btn-register">
                                    <button
                                        disabled={loading}
                                        className={loading ? "disabled" : ""}
                                        type="submit"
                                    >
                                        Agree and Join
                                    </button>
                                </div>
                                <div>
                                    <span
                                        type="button"
                                        data-bs-target="#carouselExample"
                                        data-bs-slide="next"
                                    >
                                        Already have an account?
                                    </span>
                                </div>
                            </form>
                        </div>
                    </div>
                   </div>
                   )}
            </div>
        </div>
    );
}


export default LogInSignUp;