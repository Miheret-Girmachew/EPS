// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import jwtDecode from 'jwt-decode';

// const SubmitProjectPopUp = ({ setShowSubmitProjectPopUp }) => {
//     const [projects, setProjects] = useState([]);
//     const [selectedProject, setSelectedProject] = useState('');
//     const [githubLink, setGithubLink] = useState("");
//     const [deploymentLink, setDeploymentLink] = useState("");
//     const [error, setError] = useState("");
//     const [message, setMessage] = useState("");
//     const [loading, setLoading] = useState(false);
//     const token = localStorage.getItem("token");
//     const decodedToken = token ? jwtDecode(token) : null;
//     const userId = decodedToken?.user_id;

//     useEffect(() => {
//         const fetchProjects = async () => {
//             try {
//                 const response = await axios.get(`http://localhost:7550/api/projects`, {
//                     headers: {
//                         Authorization: `Bearer ${token}`,
//                     },
//                 });
//                 if (response.data) {
//                     setProjects(response.data);
//                 } else {
//                     setError("Error fetching projects");
//                 }
//             } catch (error) {
//                 console.error("Failed to fetch projects", error);
//                 setError("Error fetching projects");
//             }
//         };
//         fetchProjects();
//     }, [token]);

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         setError("");
//         setMessage("");
//         setLoading(true);

//         if (!selectedProject || !githubLink || !deploymentLink) {
//             setError("Please fill all the required fields!");
//             setLoading(false);
//             return;
//         }

//         try {
//             const response = await axios.post(
//                 "http://localhost:7550/api/project-submissions/create",
//                 {
//                     project_id: selectedProject,
//                     github_link: githubLink,
//                     deployment_link: deploymentLink,
//                 },
//                 {
//                     headers: {
//                         Authorization: `Bearer ${token}`,
//                     },
//                 }
//             );
//             if (response.data && response.status === 201) {
//                 setMessage("Project submitted successfully");
//                 setGithubLink("");
//                 setDeploymentLink("");
//                 setSelectedProject("");
//             } else {
//                 setError(
//                     response.data.message ||
//                     "An error occurred during the submission. Please try again!"
//                 );
//             }
//         } catch (err) {
//             console.error("Error submitting project:", err);
//             if (err.response && err.response.data && err.response.data.message) {
//                 setError(err.response.data.message);
//             } else {
//                 setError("An error occurred while submitting a project. Please try again later!");
//             }
//         } finally {
//             setLoading(false);
//         }
//     };

//     return (
//         <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-60 z-50">
//             <div className="bg-white p-8 rounded-lg shadow-2xl relative w-full max-w-md mx-auto">
//                 <button
//                     onClick={() => setShowSubmitProjectPopUp(false)}
//                     className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 focus:outline-none"
//                 >
//                     X
//                 </button>
//                 <h2 className="text-2xl font-bold mb-4 text-center text-[#ff8500]">Submit Project</h2>
//                 {error && <div className="text-red-500 mb-3 text-center">{error}</div>}
//                 {message && <div className="text-green-500 mb-3 text-center">{message}</div>}
//                 <form onSubmit={handleSubmit} className="flex flex-col gap-4">
//                     {loading && <p className="text-center">Loading...</p>}
//                     <div className="form-input mb-4">
//                         <select
//                             name="project"
//                             value={selectedProject}
//                             onChange={(e) => setSelectedProject(e.target.value)}
//                             className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500 transition duration-200 ease-in-out"
//                             required
//                         >
//                             <option value="" disabled>Select a project</option>
//                             {projects && projects.map((project) => (
//                                 <option key={project.projectId} value={project.projectId}>
//                                     {project.projectName}
//                                 </option>
//                             ))}
//                         </select>
//                     </div>
//                     <div className="form-input">
//                         <input
//                             type="text"
//                             placeholder="Github Link"
//                             value={githubLink}
//                             onChange={(e) => setGithubLink(e.target.value)}
//                             className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500 transition duration-200 ease-in-out"
//                             required
//                         />
//                     </div>
//                     <div className="form-input">
//                         <input
//                             type="text"
//                             placeholder="Deployment Link"
//                             value={deploymentLink}
//                             onChange={(e) => setDeploymentLink(e.target.value)}
//                             className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500 transition duration-200 ease-in-out"
//                             required
//                         />
//                     </div>
//                     <button
//                         disabled={loading}
//                         type="submit"
//                         className="px-4 py-2 rounded-lg text-white bg-[#ff8500] hover:bg-[#e67e22] transition duration-300 ease-in-out disabled:bg-gray-400 focus:outline-none"
//                     >
//                         Submit Project
//                     </button>
//                 </form>
//             </div>
//         </div>
//     );
// };

// export default SubmitProjectPopUp;
