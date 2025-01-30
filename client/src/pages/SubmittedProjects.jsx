import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {jwtDecode} from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const SubmittedProjects = () => {
    const [projects, setProjects] = useState([]);
    const [projectNames, setProjectNames] = useState({});
    const [selectedProject, setSelectedProject] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [githubLink, setGithubLink] = useState('');
    const [deploymentLink, setDeploymentLink] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const token = localStorage.getItem("token");
    const decodedToken = token ? jwtDecode(token) : null;
    const userId = decodedToken?.user_id;
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const response = await axios.get(`http://localhost:7550/api/project-submissions/all`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    params: { userId },
                });
                if (response.data) {
                    setProjects(response.data);
                    const projectIds = response.data.map(project => project.project_id);
                    fetchProjectNames(projectIds);
                }
            } catch (error) {
                console.error('Failed to fetch projects', error);
            }
        };

        const fetchProjectNames = async (projectIds) => {
            try {
                const response = await axios.get(`http://localhost:7550/api/projects/batch/932c956e-c5ca-4182-9628-85a9c78d419c`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                if (response.data) {
                    const names = {};
                    response.data.forEach(project => {
                        names[project.projectId] = project.projectName;
                    });
                    setProjectNames(names);
                }
            } catch (error) {
                console.error('Failed to fetch project names', error);
            }
        };

        fetchProjects();
    }, [token, userId]);

    const handleEditClick = (project) => {
        setSelectedProject(project);
        setGithubLink(project.github_link);
        setDeploymentLink(project.deployment_link);
        setShowEditModal(true);
    };

   const handleEditSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
     const confirmation = window.confirm("Are you sure you want to save these changes?");
    if (!confirmation) {
        return;
    }
    try {
        const response = await axios.patch(
            `http://localhost:7550/api/project-submissions/update/${selectedProject.psi_id}`,
            {
                projectName: projectNames[selectedProject.project_id],
                github_link: githubLink,
                deployment_link: deploymentLink,
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        if (response.data) {
            toast.success("Project updated successfully!", {
                position: "top-center",
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "dark",
            });

            // Redirect back to the Submitted Projects page after a short delay
            setTimeout(() => {
                navigate("/submitted-projects"); // 👈 Navigates back
            }, 2000); // Wait for toast to display before navigating
        }
    } catch (error) {
        setError('Failed to update project');
        console.error('Error updating project:', error);
    }
};


    const handleBackClick = () => {
        navigate('/student');
     };

    return (
        <div className="min-h-screen relative bg-cover bg-center" style={{ backgroundImage: `url('/background.jpg')` }}>
            <ToastContainer />
            <div className="absolute inset-0 bg-black"></div>
            <div className="relative p-8 text-white z-10">
                <div className="container mx-auto">
                    <div className="flex justify-between items-center mb-6">
                        <button onClick={handleBackClick}
                            className="px-4 py-2 bg-[#ff8500] text-white rounded-lg shadow hover:bg-[#e67e22] transition duration-300"
                        >
                            Back
                        </button>
                        <h2 className="text-3xl font-bold text-center text-[#ff8500]">Your Submitted Projects</h2>
                        <div></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {projects.map((project) => (
                            <div key={project.psi_id}
                                className="bg-gray-800 p-6 rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-300">
                                <h3 className="text-xl font-semibold mb-2">{projectNames[project.project_id]}</h3>
                                <p className="text-gray-300 mb-2">
                                    GitHub: <a href={project.github_link} target="_blank" rel="noopener noreferrer"
                                        className="text-blue-400 hover:underline">{project.github_link}</a>
                                </p>
                                <p className="text-gray-300 mb-2">
                                    Deployment: <a href={project.deployment_link} target="_blank" rel="noopener noreferrer"
                                        className="text-blue-400 hover:underline">{project.deployment_link}</a>
                                </p>
                                <p className="text-gray-300 mb-2">Edit Chances Left: {2 - project.edit_count}/2</p>
                                {project.edit_count >= 2 && (
                                    <p className="text-red-500 mb-4">No more editing chances left</p>
                                )}
                                <button onClick={() => handleEditClick(project)}
                                    className="px-4 py-2 bg-[#ff8500] text-white rounded-lg shadow hover:bg-[#e67e22] transition duration-300"
                                    disabled={project.edit_count >= 2}
                                >
                                    Edit
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
                {showEditModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
                        <div className="bg-gray-800 p-8 rounded-lg shadow-2xl w-full max-w-md mx-auto relative">
                            <button onClick={() => setShowEditModal(false)}
                                className="absolute top-2 right-2 text-gray-300 hover:text-gray-500 focus:outline-none transition duration-300 ease-in-out">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                        d="M6 18L18 6M6 6l12 12"></path>
                                </svg>
                            </button>
                            <h3 className="text-2xl font-bold mb-4 text-center text-[#ff8500]">Edit Project</h3>
                            {error && <div className="text-red-500 mb-3 text-center">{error}</div>}
                            {message && <div className="text-green-500 mb-3 text-center">{message}</div>}
                            <form onSubmit={handleEditSubmit} className="flex flex-col gap-4">
                                <div className="form-input">
                                    <input type="text" placeholder="Github Link" value={githubLink}
                                        onChange={(e) => setGithubLink(e.target.value)}
                                        className="w-full px-3 py-2 border rounded-lg text-black focus:outline-none focus:border-blue-500 transition duration-200 ease-in-out"
                                        required />
                                </div>
                                <div className="form-input">
                                    <input type="text" placeholder="Deployment Link" value={deploymentLink}
                                        onChange={(e) => setDeploymentLink(e.target.value)}
                                        className="w-full px-3 py-2 border rounded-lg text-black focus:outline-none focus:border-blue-500 transition duration-200 ease-in-out"
                                        required />
                                </div>
                                <div className="flex justify-between">
                                    <button type="button" onClick={() => setShowEditModal(false)}
                                        className="px-4 py-2 rounded-lg text-white bg-gray-500 hover:bg-gray-700 transition duration-300 ease-in-out focus:outline-none"
                                    >
                                        Cancel
                                    </button>
                                    <button type="submit"
                                        className="px-4 py-2 rounded-lg text-white bg-[#ff8500] hover:bg-[#e67e22] transition duration-300 ease-in-out disabled:bg-gray-400 focus:outline-none"
                                    >
                                        Save Changes
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SubmittedProjects;