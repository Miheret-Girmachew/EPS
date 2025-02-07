import { useEffect, useState } from "react";
import { Card } from "../ui/Card";
import { Input } from "../ui/input";
import { Button } from "../ui/Button";
import { Search } from "lucide-react";

const StudentList = ({ students, onSelect }) => {
  return (
    <div className="w-1/2 p-4">
      <Input placeholder="Search by keyword or attribute" className="mb-4" />
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b">
            <th className="text-left p-2">Name</th>
            <th className="text-left p-2">Location</th>
            <th className="text-left p-2">Major</th>
            <th className="text-left p-2">Batch</th>
            <th className="text-left p-2">Group</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student) => (
            <tr
              key={student.userId}
              className="border-b cursor-pointer hover:bg-gray-100"
              onClick={() => onSelect(student)}
            >
              <td className="p-2">
                {student.firstName} {student.lastName}
              </td>
              <td className="p-2">{student.email}</td>
              <td className="p-2">Student</td>{" "}
              {/* Replace with actual student data */}
              <td className="p-2">{student.batch}</td>
              <td className="p-2">{student.group}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const StudentDetails = ({ student }) => {
  if (!student)
    return (
      <div className="w-1/2 p-4 text-gray-500">
        Select a student to view details.
      </div>
    );

  return (
    <Card className="w-1/2 p-4">
      <h2 className="text-xl font-bold">
        {student.firstName} {student.lastName}
      </h2>
      <p className="text-gray-600">Email: {student.email}</p>
      <p className="text-gray-600">Batch: {student.batch}</p>
      <p className="text-gray-600">Group: {student.group}</p>
      <div className="mt-4">
        <h3 className="text-lg font-semibold">Notes</h3>
        <p className="text-gray-600">
          This student has shown exceptional skills in their field of study...
        </p>
      </div>
    </Card>
  );
};

export default function Students({ user }) {
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStudents = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          "http://localhost:7550/api/users/students",
          {
            method: "POST", // Or GET, depending on your API
            headers: {
              "Content-Type": "application/json",
              // Add any authorization headers here
            },
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const studentData = await response.json();
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
              console.log(`Batch ${batch.batchName} - Parsed groups:`, groups); // DEBUG
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
              console.log(
                `Batch ${batch.batchName} - Parsed instructorIds:`,
                instructorIds
              ); // DEBUG
            } catch (error) {
              console.error("Error parsing instructorNames:", error);
              return null; // Skip batch on parsing error
            }

            const isInstructorInBatch = instructorIds.includes(user.userId);
            console.log(
              `Batch ${batch.batchName} - isInstructorInBatch:`,
              isInstructorInBatch
            ); // DEBUG
            if (!isInstructorInBatch) return null;

            const filteredGroups = groups.filter(
              (group) =>
                Array.isArray(group.instructors) &&
                group.instructors.includes(user.userId)
            );
            console.log(
              `Batch ${batch.batchName} - filteredGroups:`,
              filteredGroups
            ); // DEBUG

            return filteredGroups.length > 0
              ? { ...batch, groups: filteredGroups }
              : null;
          })
          .filter(Boolean);

        console.log("Filtered batches:", filteredBatches); // DEBUG: Filtered batches

        const studentDataFiltered = studentData.filter((student) => {
          console.log(`Filtering student: ${student.firstName} ${student.lastName}`); // Debug student being filtered
          return filteredBatches.some((batch) => {
            let groups = [];
            try {
              groups = JSON.parse(JSON.parse(batch.groups)); // Correct double parsing
              console.log(`Batch ${batch.batchName} - Parsed groups:`, groups); // DEBUG
            } catch (error) {
              console.error("Error parsing groups:", error);
              return false; // Skip student parsing error
            }

            const batchMatch = batch.batchName === student.batch;
            const groupMatch = groups.some((group) => group.groupName === student.group);

            console.log(`Student ${student.firstName} ${student.lastName} - Batch match: ${batchMatch}, Group match: ${groupMatch}`);

            return (
              batchMatch && groupMatch
            );
          });
        });

        console.log("Filtered studentData:", studentDataFiltered); // DEBUG: Filtered student data
        setStudents(studentDataFiltered);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (user && user.userId) {
      fetchStudents();
    }
  }, [user]);

  if (loading) return <p>Loading students...</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;

  return (
    <div className="flex h-screen p-6">
      <StudentList students={students} onSelect={setSelectedStudent} />
      <StudentDetails student={selectedStudent} />
    </div>
  );
}