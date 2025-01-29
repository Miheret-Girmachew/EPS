import { useState, useEffect } from "react";
import "./LogInSignUp.css";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { useNavigate } from 'react-router-dom';


function LogInSignUp() {
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [registerError, setRegisterError] = useState("");
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
            if (!response.ok) {
              const message = `HTTP error! Status: ${response.status}`;
              console.error(message);
              try {
                const errorData = await response.json();
                console.error("Response Body: ", errorData);
              } catch (jsonError) {
                console.error("Failed to parse JSON error body", jsonError);
              }
              throw new Error(message);
            }
            const data = await response.json();
            const batchesData = Array.isArray(data) ? data : (data.batches || []);
            console.log("Fetched Batches:", batchesData);
            setBatches(batchesData);
          } catch (error) {
            console.error("Error fetching batches:", error);
            setBatches([]);
          }
        };
      
        fetchBatches();
      }, []); // Only runs once when the component mounts
      
      useEffect(() => {
        const fetchGroups = async () => {
          if (formDataRegister.batch) {
            try {
              // Fetch groups for the selected batch
              const response = await fetch(`http://localhost:7550/api/batches/${formDataRegister.batch}/groups`);
      
              if (!response.ok) {
                throw new Error(`Failed to fetch groups: ${response.status}`);
              }
      
              const contentType = response.headers.get("Content-Type");
      
              // Check if the response is JSON
              if (contentType && contentType.includes("application/json")) {
                const data = await response.json();
      
                // Parse groups if they are in a stringified JSON format
                const groups = Array.isArray(data.groups) ? data.groups : JSON.parse(data.groups);
      
                // Update the state with the groups for the selected batch
                setGroups(groups);
              } else {
                // If not JSON, log the response body (or handle accordingly)
                const text = await response.text();
                console.error("Expected JSON, but got:", text);
                setGroups([]); // Set groups to empty if the response is not in expected format
              }
            } catch (error) {
              console.error("Error fetching groups:", error);
              setGroups([]); // Set groups to empty on error
            }
          } else {
            // Reset groups when no batch is selected
            setGroups([]);
          }
        };
      
        fetchGroups();
      }, [formDataRegister.batch]); // Dependency on selected batch
      


  const handleLoginInputChange = (e) => {
    const { name, value } = e.target;
    setFormDataLogin({ ...formDataLogin, [name]: value });
  };
  const handleRegisterInputChange = (e) => {
    const { name, value } = e.target;
    setFormDataRegister({ ...formDataRegister, [name]: value });
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

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to login with status ${response.status}`);
      }

      const data = await response.json();
      localStorage.setItem("token", data.token);
      setFormDataLogin({email:"",password:""});
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
      setLoginError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setRegisterError("");

    try {
        const response = await fetch("http://localhost:7550/api/register", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(formDataRegister),
          });
      if (!response.ok) {
        const errorData = await response.json();
          if (errorData.errors) {
          setRegisterError(errorData.errors.join(". ")) 
            
        } else {
          throw new Error(errorData.message || `Failed to register user with status ${response.status}`);
        }
        
        }else {
        const data = await response.json();
        console.log(data);
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
      }
      
    } catch (error) {
      setRegisterError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="loginSignUp">
      <div id="carouselExample" className="carousel slide">
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
                  <a href="">Forgot password?</a>
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
                      {groups && groups.map((group,index) => (
                        <option key={index} value={group.groupName}>
                         {group.groupName}
                         </option>
                      ))}
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
      </div>
    </div>
  );
}


export default LogInSignUp;