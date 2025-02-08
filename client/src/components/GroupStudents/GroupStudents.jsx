import { useEffect, useState } from "react";
import { Card } from "../ui/Card";
import { Input } from "../ui/input";
import { Button } from "../ui/Button";
import { Search, X, CheckCircle } from "lucide-react"; // Import X icon
import { useNavigate, Link, useParams } from "react-router-dom"; // Import useParams

const calculateStatusColor = (student) => {
    const hasPendingOverdue = student.projects.some(
        (project) =>
            project.submission &&
            project.submission.status === "pending" &&
            new Date(project.projectDeadline) < new Date()
    );

    const hasPending = student.projects.some(
        (project) => project.submission && project.submission.status === "pending"
    );

    if (hasPendingOverdue) {
        return "text-red-500";
    } else if (hasPending) {
        return "text-blue-500";
    } else {
        return "text-green-500";
    }
};

const StudentList = ({
                         students,
                         onSelect,
                         onIssueCertificate,
                         selectedStudents,
                         toggleSelectedStudent,
                         calculateStatusColor
                     }) => {


    return (
        <div className="w-full p-4 bg-white rounded-lg shadow-md">
            <div className="px-6 py-4 bg-gray-100 border-b flex items-center justify-between">
                <Input
                    placeholder="Search by keyword or attribute"
                    className="w-1/2 border rounded-md px-4 py-2 focus:outline-none focus:ring focus:ring-blue-300"
                />
                <Button
                    variant="outline"
                    className="ml-4 border-2 border-green-500 text-green-500 hover:bg-green-500 hover:text-white transition-colors"
                    onClick={() => onIssueCertificate(selectedStudents)}
                >
                    Issue Certificates to Selected
                </Button>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full leading-normal">
                    <thead className="bg-gray-50">
                    <tr>
                        <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Name
                        </th>
                        <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Email
                        </th>
                        <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Batch
                        </th>
                        <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Group
                        </th>
                        <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Completed
                        </th>
                        <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Select
                        </th>
                    </tr>
                    </thead>
                    <tbody>
                    {students.map((student) => (
                        <tr
                            key={student.userId}
                            className="hover:bg-gray-100 cursor-pointer"
                            onClick={() => onSelect(student)}
                        >
                            <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                <p className="text-gray-900 whitespace-no-wrap">
                                    {student.firstName} {student.lastName}
                                </p>
                            </td>
                            <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                <p className="text-gray-900 whitespace-no-wrap">{student.email}</p>
                            </td>
                            <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                <p className="text-gray-900 whitespace-no-wrap">{student.batch}</p>
                            </td>
                            <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                <p className="text-gray-900 whitespace-no-wrap">{student.group}</p>
                            </td>
                            <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                <p
                                    className={`text-gray-900 whitespace-no-wrap ${calculateStatusColor(
                                        student
                                    )}`}
                                >
                                    {student.completedProjects} / {student.projects.length}
                                </p>
                            </td>
                            <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                <input
                                    type="checkbox"
                                    className="form-checkbox h-5 w-5 text-green-600 rounded focus:ring-green-500"
                                    checked={selectedStudents.includes(student.userId)}
                                    onChange={() => toggleSelectedStudent(student.userId)}
                                />
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const StudentDetails = ({ student, onClose }) => {
    if (!student) return null;

    return (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-xl shadow-2xl p-8 relative max-w-2xl w-full mx-auto">
                <Button
                    variant="ghost"
                    className="absolute top-2 right-2 text-gray-600 hover:text-gray-900 transition-colors"
                    onClick={onClose}
                >
                    <X size={24} />
                </Button>
                <h2 className="text-3xl font-extrabold text-gray-900 mb-4">
                    {student.firstName} {student.lastName}
                </h2>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-gray-700 font-medium">Email:</p>
                        <p className="text-gray-600">{student.email}</p>
                    </div>
                    <div>
                        <p className="text-gray-700 font-medium">Batch:</p>
                        <p className="text-gray-600">{student.batch}</p>
                    </div>
                    <div>
                        <p className="text-gray-700 font-medium">Group:</p>
                        <p className="text-gray-600">{student.group}</p>
                    </div>
                </div>
                <div className="mt-6">
                    <h3 className="text-2xl font-semibold text-gray-800 mb-3">Projects:</h3>
                    <ul className="list-disc pl-5">
                        {student.projects.map((project) => (
                            <li key={project.projectId} className="text-gray-600 mb-2">
                                <span className="font-semibold">{project.projectName}</span> - Status:{" "}
                                <span className={project.submission?.status === 'well done' ? 'text-green-500' : project.submission?.status === 'has problems' ? 'text-red-500' : 'text-gray-500'}>
                  {project.submission ? project.submission.status : "Not Submitted"}
                </span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

const GroupStudents = ({ user }) => {
    const [students, setStudents] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedStudents, setSelectedStudents] = useState([]); // Track selected student IDs

    const navigate = useNavigate();
    const { batchName, groupName } = useParams(); // Get URL parameters

    useEffect(() => {
        const fetchStudents = async () => {
            setLoading(true);
            setError(null);
            try {
                // Fetch student and project and batch data from API
                const studentResponse = await fetch(
                    "http://localhost:7550/api/users/students",
                    {
                        method: "POST", // Or GET, depending on your API
                        headers: {
                            "Content-Type": "application/json",
                        },
                    }
                );

                if (!studentResponse.ok) {
                    throw new Error(`HTTP error! Status: ${studentResponse.status}`);
                }

                const studentData = await studentResponse.json();
                console.log("Raw studentData:", studentData); // DEBUG: Raw student data

                // Fetch batches and filter students
                const batchesResponse = await fetch(
                    "http://localhost:7550/api/batches/all"
                );
                if (!batchesResponse.ok) {
                    throw new Error(
                        `HTTP error fetching batches! Status: ${batchesResponse.status}`
                    );
                }

                const batchesData = await batchesResponse.json();
                console.log("Raw batchesData:", batchesData); // DEBUG: Raw batches data

                const filteredBatches = batchesData
                    .map((batch) => {
                        let groups = [];
                        try {
                            groups = JSON.parse(JSON.parse(batch.groups)); // Correct double parsing
                        } catch (error) {
                            console.error("Error parsing groups:", error);
                            return null; // Skip batch on parsing error
                        }

                        let instructorIds = [];
                        try {
                            instructorIds = JSON.parse(
                                JSON.parse(batch.instructorNames || "[]")
                            );
                            if (!Array.isArray(instructorIds)) {
                                console.warn(
                                    "instructorNames is not an array, skipping batch",
                                    batch
                                );
                                return null;
                            }
                        } catch (error) {
                            console.error("Error parsing instructorNames:", error);
                            return null; // Skip batch on parsing error
                        }

                        const isInstructorInBatch = instructorIds.includes(user.userId);
                        if (!isInstructorInBatch) return null;

                        //Check if groups is an array before applying any of the filter conditions
                        let filteredGroups = []
                        try {
                            filteredGroups = Array.isArray(groups)
                                ? groups.filter(
                                    (group) =>
                                        Array.isArray(group.instructors) &&
                                        group.instructors.includes(user.userId)
                                )
                                : null;
                        } catch (error) {
                            console.error("Error applying the group filters:", error)
                            return null
                        }

                        return filteredGroups?.length > 0
                            ? { ...batch, groups: filteredGroups }
                            : null;
                    })
                    .filter(Boolean);

                console.log("Filtered batches:", filteredBatches);

                // Filter student based on what the instructor can teach
                const studentDataFiltered = studentData.filter((student) => {
                    console.log(
                        `Filtering student: ${student.firstName} ${student.lastName}`
                    ); // Debug student being filtered
                    return filteredBatches.some((batch) => {
                        let groups = [];
                        try {
                            groups = batch.groups; //Groups do not need to be parsed here

                        } catch (error) {
                            console.error("Error parsing groups:", error);
                            return false; // Skip student parsing error
                        }

                        const batchMatch = batch.batchName === student.batch;
                        //const groupMatch = groups.some( (group) => group.groupName === student.group  );
                        const groupMatch = Array.isArray(groups)
                            ? groups.some((group) => group.groupName === student.group)
                            : false;

                        console.log(
                            `Student ${student.firstName} ${student.lastName} - Batch match: ${batchMatch}, Group match: ${groupMatch}`
                        );

                        return batchMatch && groupMatch;
                    });
                });
                console.log("studentDataFiltered", studentDataFiltered);
                // Find what you are looking for in  "router.get('/batch/:id', getProjects);"

                const currentBatch = filteredBatches.find(
                    (element) => element.batchName === batchName
                );
                console.log("THIS IS THE CURRRRRRRRRRRRRRRRRRR", currentBatch);
                // Check before accessing batchId
                const batchId = currentBatch ? currentBatch.batchId : null;

                if (!batchId) {
                    console.warn(`Batch with name ${batchName} not found among filtered batches`);
                    return;
                }
                // Ensure batchId is not null or undefined before fetching projects
                // Fetch all the project from route:   "router.get('/batch/:id', getProjects);"
                const allProjectsResponse = await fetch(
                    `http://localhost:7550/api/projects/batch/${batchId}`
                );

                if (!allProjectsResponse.ok) {
                    throw new Error(
                        `HTTP error fetching allProjects! Status: ${allProjectsResponse.status}`
                    );
                }

                const allProjectsData = await allProjectsResponse.json();

                const enrichedStudents = studentDataFiltered.map((student) => {
                    const studentProjects = allProjectsData.filter(
                        (project) => project.batchId === student.batch
                    );

                    const completedProjects = studentProjects.filter(
                        (project) =>
                            project.submission && project.submission.status === "well done"
                    ).length;

                    return {
                        ...student,
                        projects: studentProjects,
                        completedProjects: completedProjects,
                    };
                });
                
                      // Function to sort students based on the calculateStatusColor
        const statusOrder = {
            "text-green-500": 1,
            "text-blue-500": 2,
            "text-red-500": 3,
        };
        
                // Sort the students array
                const sortedStudents = [...enrichedStudents].sort(
                    (a, b) => statusOrder[calculateStatusColor(a)] - statusOrder[calculateStatusColor(b)]
                );
                setStudents(sortedStudents);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchStudents();
    }, [batchName, groupName, user.userId]);

    const handleSelectStudent = (student) => {
        setSelectedStudent(student);
    };

    const handleCloseModal = () => {
        setSelectedStudent(null);
    };

    const toggleSelectedStudent = (studentId) => {
        setSelectedStudents((prevSelected) =>
            prevSelected.includes(studentId)
                ? prevSelected.filter((id) => id !== studentId)
                : [...prevSelected, studentId]
        );
    };

    const handleIssueCertificate = async (studentIds) => {
        if (window.confirm("Are you sure you want to issue certificates to these students?")) {
            for (const studentId of studentIds) {
                try {
                    // API call to backend
                    const response = await fetch(
                        `http://localhost:7550/api/certificate/add`,
                        {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify({studentId: studentId}), // ID to send to the backend
                        }
                    );
                    if (!response.ok) {
                        // Check for bad status
                        throw new Error(`HTTP error! Status: ${response.status}`);
                    }
                    const data = await response.json();
                    console.log("Certificate status: ", data); // Success
                    alert(`Certificate issued to student ${studentId}: ${data.message}`);
                } catch (error) {
                    console.error("Error creating certificate", error);
                    setError(error.message);
                    alert(`Error issuing certificate to student ${studentId}: ${error.message}`);
                }
            }
            // Clear selected students after issuing
            setSelectedStudents([]);
        }
    };


    if (loading) return <p>Loading students...</p>;
    if (error) return <p className="text-red-500">Error: {error}</p>;

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 py-6">
            <div className="container mx-auto px-4">
                <Link to="/instructor"
                      className="inline-flex items-center mb-8 text-gray-700 hover:text-gray-900 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"
                         className="w-5 h-5 mr-2">
                        <path fillRule="evenodd"
                              d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z"
                              clipRule="evenodd"/>
                    </svg>
                    Back to Dashboard
                </Link>
                <div className="grid grid-cols-1 gap-6">
                    <StudentList
                        students={students}
                        onSelect={handleSelectStudent}
                        onIssueCertificate={handleIssueCertificate}
                        selectedStudents={selectedStudents}
                        toggleSelectedStudent={toggleSelectedStudent}
                        calculateStatusColor = {calculateStatusColor}
                    />
                    {selectedStudent && (
                        <StudentDetails student={selectedStudent} onClose={handleCloseModal}/>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GroupStudents;