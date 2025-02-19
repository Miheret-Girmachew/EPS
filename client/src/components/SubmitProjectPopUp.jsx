import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {jwtDecode} from 'jwt-decode';

const SubmitProjectPopUp = ({ setShowSubmitProjectPopUp }) => {
    console.log("SubmitProjectPopUp component is rendered");
    const [projects, setProjects] = useState([]);
    const [selectedProject, setSelectedProject] = useState('');
    const [githubLink, setGithubLink] = useState("");
    const [deploymentLink, setDeploymentLink] = useState("");
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const token = localStorage.getItem("token");
    const decodedToken = token ? jwtDecode(token) : null;
    const userId = decodedToken?.userId;
    const [batchId, setBatchId] = useState(null);
    const [userGroup, setUserGroup] = useState(null);

    useEffect(() => {
        console.log("useEffect triggered"); // Add this line
        console.log("UserId:", userId);
        console.log("BatchId:", batchId);
        console.log("UserGroup:", userGroup);

        const fetchProjects = async (batchId) => {
            console.log(`fetchProjects called with batchId: ${batchId}`);
            try {
                const response = await axios.get(`http://localhost:7550/api/projects/batch/${batchId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                console.log("Fetched projects:", response.data);
                setProjects(response.data);
            } catch (error) {
                console.error("Failed to fetch projects", error);
                setError("Error fetching projects");
            }
        };
    
        const fetchUserDetails = async () => {
            try {
                console.log("Fetching user details for userId:", userId);
                const response = await axios.get(`http://localhost:7550/api/users/${userId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                console.log("User details fetched:", response.data);
                console.log("Response Data Batch:", response.data.batch); // Log batch
                console.log("Response Data Group:", response.data.group); // Log group
    
                if (response.data.batch && response.data.group) {
                    setBatchId(response.data.batch);
                    setUserGroup(response.data.group);
                    fetchProjects(response.data.batch);
                } else {
                    setError("Error fetching user details");
                }
            } catch (error) {
                console.error("Failed to fetch user details", error);
                setError("Error fetching user details");
            }
        };
    
        if (userId && !batchId && !userGroup) {
            fetchUserDetails();
        }
    }, [userId, token, batchId, userGroup]);
    
    

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setMessage("");
        setLoading(true);


        console.log("selectedProject:", selectedProject);
    console.log("githubLink:", githubLink);
    console.log("deploymentLink:", deploymentLink);
    console.log("userGroup:", userGroup);
    console.log("batchId:", batchId);
    
        if (!selectedProject || !githubLink || !deploymentLink || !userGroup || !batchId) {
            setError("Please fill all the required fields!");
            setLoading(false);
            return;
        }
    
        const payload = {
            user_id: userId,
            batch_id: batchId,  // ✅ Added batch_id
            project_id: selectedProject,
            github_link: githubLink,
            deployment_link: deploymentLink,
            group: userGroup,
        };
    
        console.log("Submitting payload:", payload);  // Debugging log
    
        try {
            const response = await axios.post(
                "http://localhost:7550/api/project-submissions/create",
                payload,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
    
            if (response.data && response.status === 201) {
                setMessage("Project submitted successfully");
                setGithubLink("");
                setDeploymentLink("");
                setSelectedProject("");
            } else {
                setError(response.data?.message || "An error occurred during submission.");
            }
        } catch (err) {
            console.error("Error submitting project:", err);
            setError(err.response?.data?.message || "An error occurred while submitting a project. Please try again later!");
        } finally {
            setLoading(false);
        }
    };
    

    return (
        <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-60 z-50">
            <div className="bg-white p-8 rounded-lg shadow-2xl relative w-full max-w-md mx-auto">
                <button
                    onClick={() => setShowSubmitProjectPopUp(false)}
                    className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 focus:outline-none transition duration-300 ease-in-out"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
                <h2 className="text-2xl font-bold mb-4 text-center text-[#ff8500]">Submit Project</h2>
                {error && <div className="text-red-500 mb-3 text-center">{error}</div>}
                {message && <div className="text-green-500 mb-3 text-center">{message}</div>}
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    {loading && <p className="text-center">Loading...</p>}
                    <div className="form-input mb-4">
                        <select
                            name="project"
                            value={selectedProject}
                            onChange={(e) => setSelectedProject(e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg text-black focus:outline-none focus:border-blue-500 transition duration-200 ease-in-out"
                            required
                        >
                            <option value="" disabled hidden className="text-black">Select a project</option>
                            {projects && projects.map((project) => (
                                <option key={project.projectId} value={project.projectId} className="text-black">
                                    {project.projectName}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="form-input">
                        <input
                            type="text"
                            placeholder="Github Link"
                            value={githubLink}
                            onChange={(e) => setGithubLink(e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg text-black focus:outline-none focus:border-blue-500 transition duration-200 ease-in-out"
                            required
                        />
                    </div>
                    <div className="form-input">
                        <input
                            type="text"
                            placeholder="Deployment Link"
                            value={deploymentLink}
                            onChange={(e) => setDeploymentLink(e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg text-black focus:outline-none focus:border-blue-500 transition duration-200 ease-in-out"
                            required
                        />
                    </div>
                    <button
                        disabled={loading}
                        type="submit"
                        className="px-4 py-2 rounded-lg text-white bg-[#ff8500] hover:bg-[#e67e22] transition duration-300 ease-in-out disabled:bg-gray-400 focus:outline-none"
                    >
                        Submit Project
                    </button>
                </form>
            </div>
        </div>
    );
};

export default SubmitProjectPopUp;